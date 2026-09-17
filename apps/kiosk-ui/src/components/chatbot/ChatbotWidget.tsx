"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAssistantVoice, MULTILINGUAL_VOICE_LANGS } from "@/hooks/useAssistantVoice";
import {
  AssistantService,
  ChatMessage,
  AssistantAction,
} from "@/services/ai/assistantService";
import ChatSuggestions from "./ChatSuggestions";

export default function ChatbotWidget() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [input, setInput] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("auto");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------------------------------
  // Voice Input & Synthesis Hook
  // ------------------------------------------------------------------
  const sendMessageRef = useRef<(text: string) => Promise<void>>(() => Promise.resolve());

  const handleVoiceTranscript = useCallback((transcriptText: string) => {
    if (!transcriptText.trim()) return;
    setInput(transcriptText);
  }, []);

  const handleInterimTranscript = useCallback((interimText: string) => {
    setInput(interimText);
  }, []);

  const {
    isListening,
    isTranscribing,
    audioLevel,
    voiceError,
    clearVoiceError,
    isSpeaking,
    speakingMessageId,
    speechSupported,
    recognitionSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useAssistantVoice({
    language,
    selectedVoiceLang: voiceLanguage,
    onTranscriptComplete: handleVoiceTranscript,
    onInterimTranscript: handleInterimTranscript,
  });

  // Auto-scroll on new messages or typing state
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Keyboard shortcut (Alt + H) to toggle assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
      setMessages([
        {
          id: "greeting",
          role: "bot",
          text: t("chatbotGreeting"),
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    stopListening();
    stopSpeaking();
  };

  // ------------------------------------------------------------------
  // Message Dispatch & Assistant Query
  // ------------------------------------------------------------------
  const sendMessage = useCallback(
    async (textToSend: string) => {
      const query = textToSend.trim();
      if (!query) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: query,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const history = messages.slice(-5).map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await AssistantService.queryAssistant({
          message: query,
          history,
          language,
          currentRoute: pathname,
        });

        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: res.reply,
          action: res.action,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error("Assistant query failed:", err);
        const errorMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: t("chatbotGreeting"),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, language, pathname, t]
  );

  sendMessageRef.current = sendMessage;

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClearChat = () => {
    stopSpeaking();
    stopListening();
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        role: "bot",
        text: t("chatbotGreeting"),
        timestamp: Date.now(),
      },
    ]);
  };

  // Handle action buttons (navigation / emergency)
  const handleActionClick = (action: AssistantAction) => {
    if (action.type === "navigate" && action.target) {
      router.push(action.target);
    } else if (action.type === "emergency") {
      // Find emergency button on top bar or route to complaint
      const emergencyBtn = document.querySelector<HTMLButtonElement>(
        '[aria-label*="Emergency"], button:has(.lucide-alert-triangle)'
      );
      if (emergencyBtn) {
        emergencyBtn.click();
      } else {
        router.push("/complaint");
      }
    }
  };

  return (
    <div
      className="fixed right-3 sm:right-6 z-[70] flex flex-col items-end"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {/* Expanded Panel */}
      {isOpen && (
        <div
          className={cn(
            "mb-3 flex flex-col overflow-hidden rounded-3xl border border-border bg-surface-card shadow-2xl animate-fadeIn",
            // Mobile: near-full-width bottom sheet; Desktop: floating 24rem panel
            "w-[calc(100vw-1.5rem)] sm:w-[25rem]",
            "h-[min(75vh,35rem)] sm:h-[34rem]"
          )}
          role="dialog"
          aria-label={t("chatbotTitle")}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 shrink-0 select-none">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm tracking-tight">{t("chatbotTitle")}</p>
                  <span className="w-2 h-2 rounded-full bg-teal-bright animate-pulse" />
                </div>
                <p className="text-[11px] text-white/80 line-clamp-1">{t("chatbotSubtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title={t("chatbotClearChat")}
                aria-label={t("chatbotClearChat")}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClose}
                aria-label={t("close")}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Error Banner */}
          {voiceError && (
            <div className="bg-alert-light border-b border-alert/30 px-3.5 py-2 flex items-center justify-between text-alert text-xs animate-fadeIn shrink-0">
              <div className="flex items-center gap-1.5 font-medium min-w-0 pr-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-alert" />
                <span className="truncate">{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={clearVoiceError}
                aria-label="Dismiss error"
                className="p-1 rounded hover:bg-alert/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fallback Transcribing State */}
          {isTranscribing && (
            <div className="bg-primary-light border-b border-primary/20 px-3.5 py-1.5 flex items-center gap-2 text-primary text-xs animate-fadeIn shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span className="font-medium">Converting voice to text with AI...</span>
            </div>
          )}

          {/* Listening Banner if Speech Recognition or Microphone is active */}
          {isListening && (
            <div className="bg-alert-light border-b border-alert/20 px-3.5 py-2 flex items-center justify-between text-alert text-xs animate-fadeIn shrink-0">
              <div className="flex items-center gap-2 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-alert"></span>
                </span>
                <span>
                  {t("chatbotListening")}{" "}
                  <span className="text-[11px] font-normal opacity-90">
                    ({MULTILINGUAL_VOICE_LANGS.find((v) => v.code === voiceLanguage)?.label || "Any Language"})
                  </span>
                </span>

                {/* Dynamic live audio level wave bars */}
                <div className="flex items-center gap-0.5 h-3.5 ml-1.5">
                  {[0.15, 0.35, 0.55, 0.75, 0.95].map((factor, i) => {
                    const barHeight = Math.max(3, Math.min(14, Math.round((audioLevel / 100) * 14 * factor + 3)));
                    return (
                      <span
                        key={i}
                        className={cn(
                          "w-1 rounded-full transition-all duration-75",
                          audioLevel > 5 ? "bg-alert" : "bg-alert/40"
                        )}
                        style={{ height: `${barHeight}px` }}
                      />
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-alert font-bold hover:underline"
              >
                {t("chatbotStopListening")}
              </button>
            </div>
          )}

          {/* Message Stream */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 bg-surface"
          >
            {messages.map((m) => {
              const isBot = m.role === "bot";
              const isPlayingThis = isSpeaking && speakingMessageId === m.id;

              return (
                <div
                  key={m.id}
                  className={cn("flex flex-col", isBot ? "items-start" : "items-end")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative group",
                      isBot
                        ? "bg-surface-card border border-border text-text rounded-bl-sm shadow-xs"
                        : "bg-primary text-white rounded-br-sm shadow-xs"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {isBot && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider text-teal bg-teal-light px-1.5 py-0.5 rounded border border-teal/30 uppercase">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Assistant
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Bot Controls (Speak aloud / TTS) */}
                    {isBot && speechSupported && (
                      <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => speak(m.text, m.id)}
                          title={isPlayingThis ? t("chatbotStopSpeaking") : t("chatbotSpeakMessage")}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors",
                            isPlayingThis
                              ? "bg-teal-light text-teal border border-teal/30 font-semibold"
                              : "text-text-muted hover:text-text hover:bg-surface"
                          )}
                        >
                          {isPlayingThis ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-teal" />
                              <span>{t("chatbotStopSpeaking")}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{t("chatbotSpeakMessage")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Button (e.g., Navigate to /language, /complaint, etc.) */}
                  {isBot && m.action && m.action.type !== "none" && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(m.action!)}
                      className={cn(
                        "mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95",
                        m.action.type === "emergency"
                          ? "bg-alert text-white hover:bg-alert/90"
                          : "bg-primary-light text-primary hover:bg-primary/20 border border-primary/30"
                      )}
                    >
                      {m.action.type === "emergency" ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {m.action.label?.[language] ||
                          m.action.label?.["en"] ||
                          (m.action.type === "emergency" ? "Emergency" : "Go to Screen")}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <ChatSuggestions language={language} onSelect={sendMessage} />

          {/* Input & Voice Controls */}
          <div className="shrink-0 border-t border-border p-2.5 flex items-center gap-2 bg-surface-card">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? `Listening (${MULTILINGUAL_VOICE_LANGS.find((v) => v.code === voiceLanguage)?.flag || "🌐"} Speak now)...`
                  : isTranscribing
                  ? "Transcribing your voice with AI..."
                  : t("chatbotPlaceholder")
              }
              className={cn(
                "flex-1 min-w-0 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary transition-colors",
                isListening && "border-alert/60 ring-2 ring-alert/15 bg-alert-light/10"
              )}
            />

            {/* Multilingual Voice Language Quick Selector */}
            <div className="shrink-0 flex items-center">
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                title="Choose speech language (Auto / Any Language works for all languages)"
                aria-label="Voice input language"
                className="h-10 px-2 bg-surface border border-border rounded-xl text-xs font-semibold text-text hover:border-primary/50 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-xs max-w-[5.5rem] sm:max-w-[7.5rem] truncate"
              >
                {MULTILINGUAL_VOICE_LANGS.map((vl) => (
                  <option key={vl.code} value={vl.code}>
                    {vl.flag} {vl.code === "auto" ? "Any Lang" : vl.label.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Input (STT) Button */}
            {recognitionSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isTranscribing}
                aria-label={
                  isTranscribing
                    ? "Transcribing..."
                    : isListening
                    ? t("chatbotStopListening")
                    : t("chatbotVoiceInput")
                }
                title={
                  isTranscribing
                    ? "Transcribing..."
                    : isListening
                    ? t("chatbotStopListening")
                    : t("chatbotVoiceInput")
                }
                className={cn(
                  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isTranscribing
                    ? "bg-primary-light text-primary animate-pulse border border-primary/30"
                    : isListening
                    ? "bg-alert text-white animate-pulse shadow-md"
                    : "bg-surface border border-border text-text hover:bg-primary-light hover:text-primary hover:border-primary/40"
                )}
              >
                {isTranscribing ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin text-primary" />
                ) : isListening ? (
                  <MicOff className="w-[18px] h-[18px]" />
                ) : (
                  <Mic className="w-[18px] h-[18px]" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label={t("send")}
              className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-colors shadow-xs"
            >
              <Send className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Widget Trigger Button */}
      <button
        type="button"
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        aria-label={t("chatbotTitle")}
        aria-expanded={isOpen}
        className={cn(
          "relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95",
          "bg-primary text-white hover:bg-primary-dark",
          !hasOpenedOnce && !isOpen && "animate-bounce"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!hasOpenedOnce && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-bright border-2 border-surface flex items-center justify-center shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </button>
    </div>
  );
}
