"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ConversationalHistoryEngine } from "@/modules/history-engine/engine";
import { VoiceService } from "@/services/voice/voiceService";
import { NormalizedSpeechResult } from "@/services/voice/speechNormalizer";
import { 
  Sparkles, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Mic,
  MicOff,
  Check,
  RefreshCw,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ControlledClinicalHistory } from "@/modules/history-engine/types";

interface Props {
  complaintId: string;
  onHistoryUpdate?: (history: ControlledClinicalHistory, summaryText: string) => void;
}

export default function AdaptiveClinicalInquiry({ complaintId, onHistoryUpdate }: Props) {
  const pathwayKey = useMemo(() => {
    switch (complaintId) {
      case "chest_heart_lungs": return "chest_pain";
      case "stomach_abdomen": return "abdominal_pain";
      case "head_brain": return "headache";
      case "fever_vitals": return "fever";
      case "throat_neck": return "cough";
      case "spine_back": return "back_pain";
      default: return "abdominal_pain";
    }
  }, [complaintId]);

  const [engine, setEngine] = useState(() => new ConversationalHistoryEngine(pathwayKey));
  const [engineState, setEngineState] = useState(() => engine.getState());
  
  // Voice interaction states
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [pendingSpeechResult, setPendingSpeechResult] = useState<NormalizedSpeechResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [customText, setCustomText] = useState("");
  const [voiceError, setVoiceError] = useState<{ error: string; message: string } | null>(null);

  const questionRef = useRef<HTMLDivElement>(null);

  // Sync pathway when complaint changes
  useEffect(() => {
    const newEngine = new ConversationalHistoryEngine(pathwayKey);
    setEngine(newEngine);
    const st = newEngine.getState();
    setEngineState(st);
    setPendingSpeechResult(null);
    setInterimTranscript("");
    setVoiceError(null);
    if (onHistoryUpdate) {
      onHistoryUpdate(st.history, st.summaryDraft || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathwayKey]);

  const currentQ = engineState.currentQuestion;

  // Speak question aloud using Text-to-Speech
  const speakCurrentQuestion = (text?: string) => {
    const speechText = text || currentQ?.promptHi || "";
    if (!speechText) return;
    setIsSpeaking(true);
    VoiceService.speak(speechText, "hi-IN", () => setIsSpeaking(false));
  };

  // Start speech recognition flow
  const handleStartVoice = (isDemoTrigger: boolean = false) => {
    VoiceService.stopSpeaking();
    setIsListening(true);
    setInterimTranscript("");
    setPendingSpeechResult(null);
    setIsEditingText(false);
    setVoiceError(null);

    // Provide relevant vernacular demo phrase based on current question for instant testing
    let samplePhrase = "Mujhe teen din se pet mein dard hai";
    if (currentQ?.field === "radiation") samplePhrase = "Dard baayein haath aur jabde mein jaata hai";
    else if (currentQ?.field === "character") samplePhrase = "Dabaav aur jakdan jaisa dard hai";
    else if (currentQ?.field === "associatedSymptoms") samplePhrase = "Saans lene mein takleef aur thanda pasina aa raha hai";
    else if (pathwayKey === "chest_pain") samplePhrase = "Mere chest mein kal se pain ho raha hai";

    VoiceService.startListening({
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onResult: (result) => {
        setIsListening(false);
        setInterimTranscript("");
        setPendingSpeechResult(result);
        setCustomText(result.normalizedText);
      },
      onError: (errCode, friendlyMsg) => {
        setIsListening(false);
        setVoiceError({
          error: errCode,
          message: friendlyMsg || "We could not hear you clearly. (हम आपकी आवाज़ स्पष्ट रूप से नहीं सुन सके)"
        });
      },
      onEnd: () => {
        setIsListening(false);
      }
    }, "hi-IN", samplePhrase, isDemoTrigger);
  };

  const handleCancelVoice = () => {
    VoiceService.stopListening();
    setIsListening(false);
    setInterimTranscript("");
    setPendingSpeechResult(null);
    setVoiceError(null);
  };

  // Confirm patient spoken/edited answer and feed into engine
  const handleConfirmSpeech = () => {
    if (!pendingSpeechResult && !customText) return;
    const textToSubmit = customText || pendingSpeechResult?.normalizedText || "";

    engine.answerNaturalText(textToSubmit);
    const updated = engine.getState();
    setEngineState(updated);
    setPendingSpeechResult(null);
    setIsEditingText(false);
    setCustomText("");

    if (onHistoryUpdate) {
      onHistoryUpdate(updated.history, updated.summaryDraft || "");
    }

    // Read the next question aloud automatically where supported!
    if (updated.currentQuestion) {
      setTimeout(() => {
        speakCurrentQuestion(updated.currentQuestion?.promptHi);
      }, 350);
    }
  };

  // Choice button tap handler
  const handleChoiceSelect = (choiceId: string) => {
    engine.answerChoice(choiceId);
    const updated = engine.getState();
    setEngineState(updated);
    setVoiceError(null);
    if (onHistoryUpdate) {
      onHistoryUpdate(updated.history, updated.summaryDraft || "");
    }

    // Read next question aloud
    if (updated.currentQuestion) {
      setTimeout(() => {
        speakCurrentQuestion(updated.currentQuestion?.promptHi);
      }, 350);
    }
  };

  const handleReset = () => {
    VoiceService.stopSpeaking();
    VoiceService.stopListening();
    const fresh = new ConversationalHistoryEngine(pathwayKey);
    setEngine(fresh);
    const st = fresh.getState();
    setEngineState(st);
    setPendingSpeechResult(null);
    setInterimTranscript("");
    setVoiceError(null);
    if (onHistoryUpdate) {
      onHistoryUpdate(st.history, st.summaryDraft || "");
    }
  };

  const activeRedFlag = engineState.detectedRedFlags[0];

  return (
    <div ref={questionRef} className="w-full bg-surface-card border-2 border-primary/20 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text text-base sm:text-lg">
                बोलकर या छूकर बताएं (Voice & Touch Clinical Intake)
              </h3>
              <span className="text-[10px] font-bold bg-teal-light text-teal px-2 py-0.5 rounded-full border border-teal/20">
                AIIA Multilingual Engine
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Supports Hindi, English & Hinglish (उदा. &quot;Mujhe teen din se pet mein dard hai&quot;)
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-text-muted hover:text-primary flex items-center gap-1 self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Start Again (पुनः शुरू करें)
        </button>
      </div>

      {/* Red-Flag Emergency Banner if triggered */}
      {activeRedFlag && (
        <div className="bg-alert/15 border-2 border-alert rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-alert">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-7 h-7 shrink-0 text-alert animate-bounce mt-0.5" />
            <div>
              <h4 className="font-extrabold text-base sm:text-lg text-alert leading-tight">
                ⚠️ Please contact hospital staff immediately.
              </h4>
              <p className="text-sm font-bold text-alert mt-0.5">
                ⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें।
              </p>
              <div className="mt-1 text-xs text-text-muted space-y-0.5">
                <p><strong>Triggering symptoms:</strong> <span className="font-semibold text-alert">{activeRedFlag.condition}</span></p>
                <p><strong>Reason for priority:</strong> <span className="font-semibold text-text">Potential emergency symptoms reported — urgent clinical assessment recommended.</span></p>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold uppercase bg-alert text-white px-3.5 py-1.5 rounded-xl shrink-0 shadow-sm">
            Emergency Triage Alert
          </span>
        </div>
      )}

      {/* Main Active Question & Voice Flow */}
      {!engineState.isComplete && currentQ ? (
        <div className="space-y-5">
          {/* Question Title & Speaker Button */}
          <div className="flex items-start justify-between gap-3 bg-surface p-4 rounded-2xl border border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Eliciting: {currentQ.field.toUpperCase()}
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-text mt-1 leading-snug">
                {currentQ.promptHi}
              </h4>
              <p className="text-sm text-text-muted mt-0.5 font-medium">
                {currentQ.promptEn}
              </p>
            </div>

            <button
              onClick={() => speakCurrentQuestion()}
              className={cn(
                "p-3 rounded-2xl border-2 transition-all shrink-0 animate-press",
                isSpeaking 
                  ? "bg-teal text-white border-teal ring-4 ring-teal/20" 
                  : "bg-surface-card border-border text-teal hover:border-teal/50"
              )}
              aria-label="Play question audio"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Voice Error Fallback Banner if microphone failed */}
          {voiceError && (
            <div className="bg-alert/10 border-2 border-alert/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-alert">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-alert">{voiceError.message}</h5>
                  <p className="text-xs text-text-muted mt-0.5">
                    No clinical information was generated. Please choose how you would like to proceed:
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleStartVoice(false)}
                  className="bg-alert text-white font-bold text-xs py-2 px-3.5 rounded-xl hover:bg-alert/90 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again (पुनः प्रयास करें)
                </button>
                <button
                  onClick={() => {
                    setVoiceError(null);
                    setIsEditingText(true);
                    setPendingSpeechResult({
                      rawText: "",
                      normalizedText: "",
                      extractedEntities: {},
                      confidence: 1.0,
                      needsConfirmation: false,
                      confirmationMessageHi: "",
                      confirmationMessageEn: ""
                    });
                  }}
                  className="bg-surface border border-border text-text font-bold text-xs py-2 px-3.5 rounded-xl hover:bg-surface-sunk flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" /> Type Instead (लिखकर दर्ज करें)
                </button>
                <button
                  onClick={() => setVoiceError(null)}
                  className="bg-surface border border-border text-text-muted font-bold text-xs py-2 px-3.5 rounded-xl hover:text-text"
                >
                  Select by Touch (छूकर चुनें)
                </button>
              </div>
            </div>
          )}

          {/* Voice Input Section (Bolkar Batayein) */}
          <div className="w-full bg-gradient-to-r from-teal-light/40 to-primary-light/40 border-2 border-teal/40 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
            {!isListening && !pendingSpeechResult ? (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <span className="font-bold text-text text-base flex items-center gap-2">
                    <Mic className="w-5 h-5 text-teal" />
                    Bol Kar Batayein (Answer by Speaking)
                  </span>
                  <p className="text-xs text-text-muted mt-0.5">
                    Speak naturally in Hindi, English, or Hinglish
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleStartVoice(false)}
                    className="flex-1 sm:flex-none bg-teal text-white font-bold text-base px-5 py-3 rounded-xl shadow-md hover:bg-teal-bright animate-press flex items-center justify-center gap-2 shrink-0"
                  >
                    <Mic className="w-5 h-5 animate-pulse" />
                    <span>🎙️ Speak Now</span>
                  </button>

                  <button
                    onClick={() => handleStartVoice(true)}
                    className="bg-surface border border-teal/40 text-teal font-bold text-xs px-3 py-3 rounded-xl hover:bg-teal-light/50 flex items-center gap-1 shrink-0"
                    title="Simulate speech for demonstration"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Demo Voice</span>
                  </button>
                </div>
              </div>
            ) : isListening ? (
              /* Active Recording / Listening State */
              <div className="w-full py-2 flex flex-col items-center space-y-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-alert/20 animate-ping" />
                  <div className="w-14 h-14 rounded-full bg-alert text-white flex items-center justify-center shadow-lg">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-text text-base sm:text-lg">
                    Sun rahe hain... Bolte rahiye (Listening to your voice...)
                  </h5>
                  <p className="text-xs text-text-muted mt-0.5">
                    {interimTranscript || "Speak your answer clearly into the microphone..."}
                  </p>
                </div>

                <button
                  onClick={handleCancelVoice}
                  className="text-xs text-alert font-bold flex items-center gap-1 hover:underline pt-1"
                >
                  <MicOff className="w-3.5 h-3.5" /> Cancel Recording (रद्द करें)
                </button>
              </div>
            ) : pendingSpeechResult ? (
              /* Speech Confirmation State: "Did we understand you correctly?" */
              <div className="w-full text-left space-y-3 bg-surface-card p-4 rounded-xl border-2 border-teal">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Voice Recognized (पहचानी गई आवाज)
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-teal-light text-teal px-2 py-0.5 rounded">
                    Confidence: {Math.round(pendingSpeechResult.confidence * 100)}%
                  </span>
                </div>

                {/* Recognized Text Display & Edit Box */}
                {!isEditingText ? (
                  <div className="bg-surface p-3.5 rounded-xl border border-border text-base font-bold text-text">
                    &quot;{customText || pendingSpeechResult.normalizedText}&quot;
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-surface p-3 rounded-xl border-2 border-primary text-base font-bold text-text focus:outline-none"
                    autoFocus
                  />
                )}

                {/* Uncertainty confirmation prompt */}
                <div className="text-xs text-text-muted font-medium">
                  {pendingSpeechResult.needsConfirmation ? (
                    <span className="text-warning font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Did we understand you correctly? (कृपया पुष्टि करें कि क्या यह सही है?)
                    </span>
                  ) : (
                    <span>Tap confirm to update your clinical record and hear the next question.</span>
                  )}
                </div>

                {/* Action Confirmation Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    onClick={handleConfirmSpeech}
                    className="flex-1 min-w-[140px] bg-primary text-white font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-primary-dark animate-press flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Haan, Sahi Hai (Yes, Continue)
                  </button>

                  <button
                    onClick={() => handleStartVoice(false)}
                    className="bg-surface border border-border text-text font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-surface-sunk animate-press flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 text-primary" />
                    Phir Se Bolein (Speak Again)
                  </button>

                  <button
                    onClick={() => setIsEditingText(!isEditingText)}
                    className="bg-surface border border-border text-text-muted font-semibold text-xs py-2.5 px-3 rounded-xl hover:text-text animate-press flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingText ? "Done" : "Badlein (Edit)"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>


          {/* Or Tap One of the Choices Below */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
              Ya Chhoo Kar Chunein (Or Tap An Option Below):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice.id)}
                  className="flex flex-col items-start p-4 rounded-2xl border-2 border-border bg-surface hover:border-primary hover:bg-primary-light transition-all text-left group animate-press min-h-[76px] justify-center"
                >
                  <span className="font-bold text-text text-base leading-tight group-hover:text-primary">
                    {choice.labelHi}
                  </span>
                  <span className="text-xs text-text-muted font-medium mt-1">
                    {choice.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Completed State */
        <div className="bg-success-light/40 border border-success/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-success font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            Information Collected Successfully (जानकारी दर्ज कर ली गई है)
          </div>
          <p className="text-xs text-text-muted">
            All clinical history parameters have been elicited and structured into the physician draft summary.
          </p>

          <div className="bg-surface rounded-xl p-3.5 border border-border text-xs text-text font-mono whitespace-pre-wrap leading-relaxed">
            {engineState.summaryDraft}
          </div>
        </div>
      )}
    </div>
  );
}
