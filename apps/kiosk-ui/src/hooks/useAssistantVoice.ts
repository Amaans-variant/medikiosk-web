"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const LANG_TO_BCP47: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  ta: "ta-IN",
};

interface UseAssistantVoiceProps {
  language: string;
  onTranscriptComplete: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
}

interface IWindowSpeechRecognition {
  new (): ISpeechRecognitionInstance;
}

interface ISpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function useAssistantVoice({
  language,
  onTranscriptComplete,
  onInterimTranscript,
}: UseAssistantVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Keep latest callbacks in refs to prevent stale closure issues
  const onInterimRef = useRef(onInterimTranscript);
  const onCompleteRef = useRef(onTranscriptComplete);
  const hasReceivedTranscriptRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");

  useEffect(() => {
    onInterimRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    onCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  const bcp47Lang = LANG_TO_BCP47[language] || "hi-IN";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSpeechSupported("speechSynthesis" in window);
      const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const w = window as unknown as {
        SpeechRecognition?: IWindowSpeechRecognition;
        webkitSpeechRecognition?: IWindowSpeechRecognition;
      };
      const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      // Supported if either Web Speech API exists OR MediaDevices (for fallback recording) exists
      setRecognitionSupported(!!SpeechRecognition || hasMedia);
    }
  }, []);

  // Audio level meter helper
  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn("Audio meter setup error:", err);
    }
  };

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Convert blob to base64 and transcribe with Gemini fallback endpoint
  const transcribeFallbackAudio = async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size < 1000) {
      // Less than 1KB is likely silence or empty
      return;
    }

    try {
      setIsTranscribing(true);
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const base64Data = await base64Promise;

      const res = await fetch("/api/assistant/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: audioBlob.type || "audio/webm",
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.transcript?.trim();
        if (text) {
          accumulatedTranscriptRef.current = text;
          onInterimRef.current?.(text);
          onCompleteRef.current?.(text);
        }
      }
    } catch (err) {
      console.warn("Fallback transcription error:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // ------------------------------------------------------------------
  // Speech Recognition (Voice Input)
  // ------------------------------------------------------------------
  const startListening = useCallback(async () => {
    if (typeof window === "undefined") return;

    setVoiceError(null);
    hasReceivedTranscriptRef.current = false;
    accumulatedTranscriptRef.current = "";
    audioChunksRef.current = [];

    // Stop speech synthesis if speaking
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }

    // 1. Explicitly acquire microphone access
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        setupAudioMeter(stream);

        // Start MediaRecorder for Gemini transcription fallback
        try {
          const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
          const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";
          const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.start(250); // Collect slice every 250ms
        } catch (recErr) {
          console.warn("MediaRecorder init failed:", recErr);
        }
      }
    } catch (err: any) {
      console.error("Microphone access denied or error:", err);
      const isDenied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      setVoiceError(
        isDenied
          ? "Microphone access was blocked. Please allow microphone permissions in your browser settings."
          : "Could not access microphone hardware. Please check your audio settings."
      );
      setIsListening(false);
      cleanupAudio();
      return;
    }

    setIsListening(true);

    // 2. Initialize browser SpeechRecognition if available
    const w = window as unknown as {
      SpeechRecognition?: IWindowSpeechRecognition;
      webkitSpeechRecognition?: IWindowSpeechRecognition;
    };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser lacks Web Speech API (e.g. Firefox) -> MediaRecorder is running and will transcribe via Gemini
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = bcp47Lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + " ";
          } else {
            interim += res[0].transcript;
          }
        }

        const fullText = (final + interim).trim();
        if (fullText) {
          hasReceivedTranscriptRef.current = true;
          accumulatedTranscriptRef.current = fullText;
          if (onInterimRef.current) {
            onInterimRef.current(fullText);
          }
        }
      };

      recognition.onerror = (event: { error: string }) => {
        console.warn("Voice recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceError("Microphone access blocked or restricted by browser settings.");
        }
        // Don't kill listening on transient network/no-speech errors, fallback recorder continues
      };

      recognition.onend = () => {
        // Recognition completed or timed out
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Web Speech API start failed, using fallback audio capture:", err);
    }
  }, [bcp47Lang, language]);

  const stopListening = useCallback(() => {
    setIsListening(false);

    // Stop Web Speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder and trigger fallback transcription if needed
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.onstop = () => {
          const mime = mediaRecorderRef.current?.mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mime });
          cleanupAudio();

          // If Web Speech API did not yield any text (e.g., Linux Chromium network error or silent fail), transcribe recorded audio with Gemini!
          if (!hasReceivedTranscriptRef.current || !accumulatedTranscriptRef.current.trim()) {
            transcribeFallbackAudio(blob);
          } else {
            onCompleteRef.current?.(accumulatedTranscriptRef.current);
          }
        };
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Error stopping media recorder:", err);
        cleanupAudio();
      }
    } else {
      cleanupAudio();
      if (accumulatedTranscriptRef.current.trim()) {
        onCompleteRef.current?.(accumulatedTranscriptRef.current);
      }
    }
  }, [language]);

  // ------------------------------------------------------------------
  // Speech Synthesis (Text-to-Speech Output)
  // ------------------------------------------------------------------
  const speak = useCallback(
    (text: string, messageId?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      try {
        window.speechSynthesis.cancel();

        if (isSpeaking && speakingMessageId === messageId) {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          return;
        }

        const cleanText = text.replace(/[*_#~`]/g, "").trim();
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = bcp47Lang;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          if (messageId) setSpeakingMessageId(messageId);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech synthesis failed:", err);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
    },
    [bcp47Lang, isSpeaking, speakingMessageId]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      cleanupAudio();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
    isTranscribing,
    audioLevel,
    voiceError,
    clearVoiceError: () => setVoiceError(null),
    isSpeaking,
    speakingMessageId,
    speechSupported,
    recognitionSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
