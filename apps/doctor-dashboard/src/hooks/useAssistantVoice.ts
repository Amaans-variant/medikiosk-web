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
}

export function useAssistantVoice({ language, onTranscriptComplete }: UseAssistantVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const bcp47Lang = LANG_TO_BCP47[language] || "hi-IN";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSpeechSupported("speechSynthesis" in window);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setRecognitionSupported(!!SpeechRecognition);
    }
  }, []);

  // ------------------------------------------------------------------
  // Speech Recognition (Voice Input)
  // ------------------------------------------------------------------
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    try {
      // Stop any existing recognition instance
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      // Stop speech synthesis if speaking
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }

      const recognition = new SpeechRecognition();
      recognition.lang = bcp47Lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult[0]) {
          const transcript = lastResult[0].transcript.trim();
          if (transcript) {
            onTranscriptComplete(transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Voice recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
    }
  }, [bcp47Lang, onTranscriptComplete]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Speech Synthesis (Text-to-Speech Output)
  // ------------------------------------------------------------------
  const speak = useCallback(
    (text: string, messageId?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      try {
        window.speechSynthesis.cancel();

        // If clicking speaker on currently playing message, stop it
        if (isSpeaking && speakingMessageId === messageId) {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          return;
        }

        const cleanText = text.replace(/[*_#~`]/g, "").trim();
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = bcp47Lang;
        utterance.rate = 0.95; // Slightly measured pace for hospital kiosk clarity
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
        recognitionRef.current.abort();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
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
