import { SpeechNormalizer, NormalizedSpeechResult } from "./speechNormalizer";

export interface RecognitionCallbacks {
  onStart?: () => void;
  onInterim?: (interimText: string) => void;
  onResult: (result: NormalizedSpeechResult) => void;
  onError?: (error: string, friendlyMessage?: string) => void;
  onEnd?: () => void;
}

interface IWindowSpeech {
  SpeechRecognition?: new () => ISpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => ISpeechRecognitionInstance;
}

interface ISpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: {
        transcript: string;
        confidence?: number;
      };
    };
  };
}

export class VoiceService {
  private static isSpeaking: boolean = false;
  private static activeRecognition: ISpeechRecognitionInstance | null = null;

  public static speak(text: string, lang: string = "hi-IN", onEnd?: () => void): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\*#_]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => { VoiceService.isSpeaking = true; };
      utterance.onend = () => { 
        VoiceService.isSpeaking = false; 
        onEnd?.();
      };
      utterance.onerror = () => { 
        VoiceService.isSpeaking = false; 
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }

  public static stop(): void {
    VoiceService.stopSpeaking();
    VoiceService.stopListening();
  }

  public static stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      VoiceService.isSpeaking = false;
    }
  }

  public static startListening(
    callbacks: RecognitionCallbacks,
    lang: string = "hi-IN",
    simulatedFallbackPhrase?: string,
    demoMode: boolean = false
  ): void {
    if (demoMode) {
      VoiceService.runSimulatedSpeech(callbacks, simulatedFallbackPhrase);
      return;
    }

    const win = (typeof window !== "undefined" ? window : {}) as unknown as IWindowSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onError?.("not-supported", "Voice recognition is not supported in this browser. Please use Google Chrome, or use the 'Type Instead' option.");
      return;
    }

    try {
      if (VoiceService.activeRecognition) {
        VoiceService.activeRecognition.abort();
      }

      const recognition = new SpeechRecognition();
      VoiceService.activeRecognition = recognition;

      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        callbacks.onStart?.();
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interim = "";
        let finalTranscript = "";
        let confidence = 0.85;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
            if (item[0].confidence) confidence = item[0].confidence;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          callbacks.onInterim?.(interim);
        }

        if (finalTranscript) {
          const normalized = SpeechNormalizer.normalize(finalTranscript);
          normalized.confidence = Math.min(normalized.confidence, confidence);
          if (normalized.confidence < 0.78) {
            normalized.needsConfirmation = true;
          }
          callbacks.onResult(normalized);
        }
      };

      recognition.onerror = (event: { error: string }) => {
        let friendlyMessage = "We could not hear you clearly. (हम आपकी आवाज़ स्पष्ट रूप से नहीं सुन सके)";
        
        if (event.error === 'not-allowed') {
          friendlyMessage = "Microphone access denied. Please allow microphone permissions in your browser.";
        } else if (event.error === 'network') {
          friendlyMessage = "Network error. Speech recognition requires an active internet connection.";
        } else if (event.error === 'no-speech') {
          friendlyMessage = "No speech was detected. Please try speaking closer to the microphone.";
        }
        
        console.error("[VoiceService] Speech recognition error:", event.error);
        callbacks.onError?.(event.error, friendlyMessage);
      };

      recognition.onend = () => {
        callbacks.onEnd?.();
        VoiceService.activeRecognition = null;
      };

      recognition.start();
    } catch (err: any) {
      console.error("[VoiceService] Exception starting recognition:", err);
      callbacks.onError?.("exception", "Speech recognition failed to start. (Exception: " + (err?.message || "Unknown") + ")");
    }
  }

  public static stopListening(): void {
    if (VoiceService.activeRecognition) {
      try {
        VoiceService.activeRecognition.stop();
      } catch {
        // ignore
      }
      VoiceService.activeRecognition = null;
    }
  }

  public static runSimulatedSpeech(callbacks: RecognitionCallbacks, fallbackPhrase?: string): void {
    callbacks.onStart?.();
    const defaultPhrase = fallbackPhrase || "Mujhe teen din se pet mein dard hai";
    
    setTimeout(() => {
      callbacks.onInterim?.("Sun rahe hain: Mujhe...");
    }, 400);

    setTimeout(() => {
      callbacks.onInterim?.(`Sun rahe hain: "${defaultPhrase}"`);
    }, 900);

    setTimeout(() => {
      const normalized = SpeechNormalizer.normalize(defaultPhrase);
      callbacks.onResult(normalized);
      callbacks.onEnd?.();
    }, 1400);
  }
}

