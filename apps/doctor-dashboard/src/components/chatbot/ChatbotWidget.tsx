"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Persistent AI Chatbot widget.
 * ------------------------------------------------------------------
 * Mounted once, globally, in <AppShell /> — so it survives client-side
 * route changes (login, patient intake, doctor console, admin
 * analytics) instead of being re-created per page.
 *
 * This is a NAVIGATION / HELP assistant only — it intentionally does
 * NOT generate clinical or diagnostic content. The canned responses
 * below are a placeholder; wire `getAssistantReply()` up to a real
 * backend endpoint (e.g. POST /api/assistant/message) when one
 * exists. Keep any clinical-content generation on the
 * `services/ai/geminiService.ts` path instead, which already carries
 * the `isAiDraft` / physician-review guardrails this app relies on —
 * don't reuse this widget for that.
 */

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
}

function getAssistantReply(userText: string, t: (key: any) => string): string {
  const lower = userText.toLowerCase();
  if (/(emergency|urgent|chest pain|breath)/i.test(lower)) {
    return "For anything urgent, please use the red Emergency Help button in the top bar right now — this chat is not monitored for emergencies.";
  }
  if (/(language|भाषा)/i.test(lower)) {
    return "You can change your display and voice language anytime from the language selector in the top bar or on the Select Language screen.";
  }
  if (/(doctor|appointment|queue)/i.test(lower)) {
    return "Once your intake is complete, you'll be added to the OPD queue automatically — your token number and estimated wait time will show on the confirmation screen.";
  }
  return "Thanks for your message! This is a demo assistant for navigation and check-in help. A live support agent or LLM-backed assistant can be connected here later.";
}

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
      setMessages([{ id: "greeting", role: "bot", text: t("chatbotGreeting") }]);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated latency — replace with a real fetch() to your assistant endpoint.
    setTimeout(() => {
      const reply = getAssistantReply(text, t);
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: "bot", text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
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
            "mb-3 flex flex-col overflow-hidden rounded-3xl border border-border bg-surface-card shadow-lg animate-fadeIn",
            // Mobile: near-full-width/height bottom sheet. Desktop: fixed floating panel.
            "w-[calc(100vw-1.5rem)] sm:w-96",
            "h-[min(70vh,32rem)] sm:h-[30rem]"
          )}
          role="dialog"
          aria-label={t("chatbotTitle")}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 shrink-0">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-[18px] h-[18px]" />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-sm">{t("chatbotTitle")}</p>
                <p className="text-[11px] text-white/80">{t("chatbotSubtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t("close")}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5 bg-surface">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-surface-card border border-border text-text rounded-bl-md"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-2.5 flex items-center gap-2 bg-surface-card">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatbotPlaceholder")}
              className="flex-1 min-w-0 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label={t("send")}
              className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-colors"
            >
              <Send className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        aria-label={t("chatbotTitle")}
        aria-expanded={isOpen}
        className={cn(
          "relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all animate-press",
          "bg-primary text-white hover:bg-primary-dark",
          !hasOpenedOnce && !isOpen && "animate-pulse"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!hasOpenedOnce && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-bright border-2 border-surface flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </button>
    </div>
  );
}
