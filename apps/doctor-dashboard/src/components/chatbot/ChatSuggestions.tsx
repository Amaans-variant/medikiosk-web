"use client";

import React from "react";
import { Sparkles, Globe, Ticket, FileText, ShieldAlert } from "lucide-react";

interface SuggestionItem {
  id: string;
  icon: React.ReactNode;
  labels: Record<string, string>;
  queryText: Record<string, string>;
}

const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "queue",
    icon: <Ticket className="w-3.5 h-3.5 text-primary" />,
    labels: {
      en: "🎫 Token & Queue",
      hi: "🎫 टोकन और कतार",
      mr: "🎫 टोकन आणि रांग",
      gu: "🎫 ટોકન અને કતાર",
      bn: "🎫 টোকেন ও লাইন",
      ta: "🎫 டோக்கன் & வரிசை",
    },
    queryText: {
      en: "Where do I find my OPD token number?",
      hi: "मुझे अपना ओपीडी टोकन नंबर कहाँ मिलेगा?",
      mr: "मला माझा ओपीडी टोकन नंबर कुठे मिळेल?",
      gu: "મને મારો ઓપીડી ટોકન નંબર ક્યાં મળશે?",
      bn: "আমি আমার ওপিডি টোকেন নম্বর কোথায় পাব?",
      ta: "எனது ஓபிடி டோக்கன் எண்ணை எங்கே பெறுவது?",
    },
  },
  {
    id: "language",
    icon: <Globe className="w-3.5 h-3.5 text-teal" />,
    labels: {
      en: "🌐 Change Language",
      hi: "🌐 भाषा बदलें",
      mr: "🌐 भाषा बदला",
      gu: "🌐 ભાષા બદલો",
      bn: "🌐 ভাষা পরিবর্তন",
      ta: "🌐 மொழி மாற்றம்",
    },
    queryText: {
      en: "How do I change the language?",
      hi: "मैं भाषा कैसे बदल सकता हूँ?",
      mr: "मी भाषा कशी बदलू शकतो?",
      gu: "હું ભાષા કેવી રીતે બદલી શકું?",
      bn: "আমি কিভাবে ভাষা পরিবর্তন করতে পারি?",
      ta: "மொழியை எப்படி மாற்றுவது?",
    },
  },
  {
    id: "documents",
    icon: <FileText className="w-3.5 h-3.5 text-warning" />,
    labels: {
      en: "📄 Scan Reports",
      hi: "📄 रिपोर्ट स्कैन करें",
      mr: "📄 अहवाल स्कॅन करा",
      gu: "📄 રિપોર્ટ સ્કેન કરો",
      bn: "📄 রিপোর্ট স্ক্যান",
      ta: "📄 அறிக்கை ஸ்கேன்",
    },
    queryText: {
      en: "How do I photograph my old prescriptions?",
      hi: "मैं अपने पुराने पर्चे कैसे स्कैन करूँ?",
      mr: "मी माझी जुनी प्रिस्क्रिप्शन कशी स्कॅन करू?",
      gu: "હું મારા જૂના પ્રિસ્ક્રિપ્શન્સ કેવી રીતે સ્કેન કરું?",
      bn: "আমি কিভাবে পুরনো প্রেসক্রিপশন স্ক্যান করব?",
      ta: "எனது பழைய மருந்துச்சீட்டுகளை எப்படி ஸ்கேன் செய்வது?",
    },
  },
  {
    id: "emergency",
    icon: <ShieldAlert className="w-3.5 h-3.5 text-alert" />,
    labels: {
      en: "🚨 Emergency",
      hi: "🚨 आपातकाल",
      mr: "🚨 आणीबाणी",
      gu: "🚨 કટોકટી",
      bn: "🚨 জরুরি সাহায্য",
      ta: "🚨 அவசரம்",
    },
    queryText: {
      en: "I need urgent medical help right now",
      hi: "मुझे तुरंत आपातकालीन चिकित्सा सहायता चाहिए",
      mr: "मला त्वरित वैद्यकीय मदतीची गरज आहे",
      gu: "મને તાત્કાલિક તબીબી સહાયની જરૂર છે",
      bn: "আমার এখনই জরুরি চিকিৎসা সহায়তা প্রয়োজন",
      ta: "எனக்கு உடனடியாக அவசர உதவி தேவை",
    },
  },
];

interface ChatSuggestionsProps {
  language: string;
  onSelect: (text: string) => void;
}

export default function ChatSuggestions({ language, onSelect }: ChatSuggestionsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 px-3.5 no-scrollbar shrink-0">
      <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted shrink-0 pr-1">
        <Sparkles className="w-3 h-3 text-primary" />
      </div>
      {SUGGESTIONS.map((item) => {
        const label = item.labels[language] || item.labels["en"];
        const query = item.queryText[language] || item.queryText["en"];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(query)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface-card hover:bg-primary-light hover:border-primary/40 text-xs font-medium text-text transition-all active:scale-95 shadow-xs"
          >
            {item.icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
