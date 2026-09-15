/**
 * MediKiosk AI Assistant Service
 * ------------------------------------------------------------------
 * Handles conversational queries, intent detection, voice navigation,
 * and integration with the backend LLM route (/api/assistant/chat).
 * 
 * Includes a robust multilingual fallback knowledge base for offline
 * or disconnected kiosk scenarios.
 */

export type AssistantRole = "bot" | "user";

export interface AssistantAction {
  type: "navigate" | "emergency" | "language" | "none";
  target?: string;
  label?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: AssistantRole;
  text: string;
  action?: AssistantAction;
  timestamp?: number;
}

export interface AssistantRequestPayload {
  message: string;
  history: Array<{ role: AssistantRole; text: string }>;
  language: string;
  currentRoute?: string;
}

export interface AssistantResponsePayload {
  reply: string;
  action?: AssistantAction;
  isAiGenerated?: boolean;
}

// --------------------------------------------------------------------
// Navigation & Intent Detection Patterns
// --------------------------------------------------------------------
interface IntentPattern {
  regex: RegExp;
  action: AssistantAction;
  replies: Record<string, string>;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Emergency Intent
  {
    regex: /(emergency|urgent|chest pain|breath|attack|heart attack|behosh|severe bleeding|आपातकाल|छाती में दर्द|सांस फूलना|मदत|मदद)/i,
    action: {
      type: "emergency",
      label: {
        en: "Emergency Assistance",
        hi: "आपातकालीन सहायता",
        mr: "तातडीची मदत",
        gu: "કટોકટી સહાય",
        bn: "জরুরি সহায়তা",
        ta: "அவசர உதவி",
      },
    },
    replies: {
      en: "⚠️ If you or the patient is facing an emergency (severe chest pain, breathing difficulty, or unconsciousness), please alert hospital staff immediately or press the red Emergency Help button at the top!",
      hi: "⚠️ यदि कोई गंभीर आपात स्थिति है (छाती में तेज दर्द, सांस लेने में तकलीफ, या बेहोशी), तो तुरंत अस्पताल स्टाफ को सूचित करें या ऊपर लाल 'आपातकालीन सहायता' बटन दबाएं!",
      mr: "⚠️ जर तातडीची परिस्थिती असेल (छातीत तीव्र वेदना, श्वास घेण्यास त्रास), तर कृपया लगेच हॉस्पिटल कर्मचाऱ्यांना कळवा किंवा वरील लाल आपत्कालीन बटण दाबा!",
      gu: "⚠️ જો કોઈ ગંભીર કટોકટી હોય (છાતીમાં દુખાવો, શ્વાસ લેવામાં તકલીફ), તો તરત જ હોસ્પિટલ સ્ટાફને જાણ કરો અથવા લાલ ઇમરજન્સી બટન દબાવો!",
      bn: "⚠️ যদি কোনো গুরুতর জরুরি অবস্থা থাকে (বুকে তীব্র ব্যথা, শ্বাসকষ্ট), অবিলম্বে হাসপাতাল কর্মীদের জানান বা জরুরি বোতাম টিপুন!",
      ta: "⚠️ அவசர நிலை என்றால் (கடுமையான நெஞ்சு வலி, மூச்சுத் திணறல்), உடனடியாக மருத்துவமனை ஊழியர்களைத் தொடர்பு கொள்ளவும்!",
    },
  },

  // Change Language Intent
  {
    regex: /(change language|select language|bhasha|language|भाषा|tamil|hindi|english|marathi|gujarati|bengali)/i,
    action: {
      type: "navigate",
      target: "/language",
      label: {
        en: "Go to Language Screen",
        hi: "भाषा स्क्रीन पर जाएं",
        mr: "भाषा स्क्रीनवर जा",
        gu: "ભાષા સ્ક્રીન પર જાઓ",
        bn: "ভাষা স্ক্রিনে যান",
        ta: "மொழி திரைக்குச் செல்லவும்",
      },
    },
    replies: {
      en: "You can change your language anytime. Tap the button below or use the language selector in the top bar.",
      hi: "आप कभी भी अपनी भाषा बदल सकते हैं। नीचे दिए गए बटन पर टैप करें या ऊपर भाषा मेनू का उपयोग करें।",
      mr: "तुम्ही तुमची भाषा कधीही बदलू शकता. खालील बटणावर टॅप करा किंवा वरील भाषा मेनू वापरा.",
      gu: "તમે ગમે ત્યારે તમારી ભાષા બદલી શકો છો. નીચેના બટન પર ટેપ કરો.",
      bn: "আপনি যে কোনো সময় ভাষা পরিবর্তন করতে পারেন। নিচের বোতামে ট্যাপ করুন।",
      ta: "நீங்கள் எப்போது வேண்டுமானாலும் மொழியை மாற்றலாம். கீழே உள்ள பொத்தானைத் தட்டவும்.",
    },
  },

  // Complaints / Symptoms Intent
  {
    regex: /(complaint|symptom|pain|dard|taklif|sir dard|pet dard|fever|bukhar|problem|बीमारी|दर्द|तकलीफ|लक्षण)/i,
    action: {
      type: "navigate",
      target: "/complaint",
      label: {
        en: "Go to Chief Complaints",
        hi: "मुख्य समस्या स्क्रीन पर जाएं",
        mr: "मुख्य तक्रारी स्क्रीनवर जा",
        gu: "મુખ્ય સમસ્યાઓ સ્ક્રીન પર જાઓ",
        bn: "প্রধান লক্ষণ স্ক্রিনে যান",
        ta: "முக்கிய பிரச்சனை திரைக்குச் செல்லவும்",
      },
    },
    replies: {
      en: "To record what is troubling you, tap where it hurts on our guided screen or describe your symptoms by speaking.",
      hi: "अपनी समस्या या दर्द दर्ज करने के लिए नीचे दिए गए बटन से 'मुख्य समस्या' स्क्रीन पर जाएं और बोलकर या छूकर बताएं।",
      mr: "तुमची लक्षणे किंवा वेदना नोंदवण्यासाठी खालील बटणावरून 'मुख्य तक्रारी' स्क्रीनवर जा.",
      gu: "તમારી સમસ્યા નોંધવા માટે નીચેના બટન પરથી 'મુખ્ય ફરિયાદ' સ્ક્રીન પર જાઓ.",
      bn: "আপনার সমস্যা নথিভুক্ত করতে নিচের বোতাম থেকে 'প্রধান লক্ষণ' স্ক্রিনে যান।",
      ta: "உங்கள் பிரச்சனையைப் பதிவு செய்ய கீழே உள்ள பொத்தானைப் பயன்படுத்தவும்.",
    },
  },

  // Documents / Reports Scanning Intent
  {
    regex: /(document|report|prescription|scan|upload|paper|photo|file|दस्तावेज|रिपोर्ट|पर्चा|कागज़)/i,
    action: {
      type: "navigate",
      target: "/document",
      label: {
        en: "Go to Document Scan",
        hi: "दस्तावेज़ स्कैन स्क्रीन पर जाएं",
        mr: "दस्तऐवज स्कॅनवर जा",
        gu: "દસ્તાવેજ સ્કેન પર જાઓ",
        bn: "ডকুমেন্ট স্ক্যানে যান",
        ta: "ஆவண ஸ்கேனிற்குச் செல்லவும்",
      },
    },
    replies: {
      en: "You can photograph past prescriptions and lab reports using the kiosk camera. Our AI will automatically extract medicine and lab details.",
      hi: "आप कियोस्क कैमरे से अपने पुराने पर्चे और लैब रिपोर्ट की फोटो ले सकते हैं। हमारा सिस्टम दवाओं और जांचों को खुद पहचान लेगा।",
      mr: "तुम्ही कियोस्क कॅमेऱ्याने जुनी प्रिस्क्रिप्शन आणि रिपोर्ट्स स्कॅन करू शकता. आमचे एआय आपोआप औषधे ओळखेल.",
      gu: "તમે કિયોસ્ક કેમેરા વડે તમારા જૂના રિપોર્ટ્સ સ્કેન કરી શકો છો.",
      bn: "আপনি কিওস্ক ক্যামেরা দিয়ে পুরনো প্রেসক্রিপশন ও রিপোর্ট স্ক্যান করতে পারেন।",
      ta: "கியோஸ்க் கேமராவைப் பயன்படுத்தி உங்கள் பழைய அறிக்கைகளை ஸ்கேன் செய்யலாம்.",
    },
  },

  // Token & Queue / Summary Intent
  {
    regex: /(token|queue|wait|doctor|appointment|receipt|summary|नंबर|टोकन|कतार|वेटिंग)/i,
    action: {
      type: "navigate",
      target: "/summary",
      label: {
        en: "View Summary & Token",
        hi: "सारांश और टोकन देखें",
        mr: "तपशील आणि टोकन पहा",
        gu: "સારાંશ અને ટોકન જુઓ",
        bn: "সারাংশ ও টোকেন দেখুন",
        ta: "சுருக்கம் மற்றும் டோக்கனைக் காண்க",
      },
    },
    replies: {
      en: "Once your intake is submitted, you will receive a digital token number and estimated wait time for the OPD consultation.",
      hi: "पंजीकरण पूरा होने पर आपको डिजिटल टोकन नंबर और ओपीडी कक्ष का विवरण मिलेगा। डॉक्टर आपको जल्द बुलाएंगे।",
      mr: "नोंदणी पूर्ण झाल्यावर तुम्हाला डिजिटल टोकन क्रमांक आणि ओपीडी खोलीचा तपशील मिळेल.",
      gu: "નોંધણી પૂર્ણ થયા પછી તમને ડિજિટલ ટોકન નંબર મળશે.",
      bn: "নিবন্ধন সম্পন্ন হলে আপনি একটি টোকেন নম্বর পাবেন।",
      ta: "பதிவு முடிந்ததும் உங்களுக்கு டோக்கன் எண் வழங்கப்படும்.",
    },
  },

  // ABHA / Login Intent
  {
    regex: /(abha|login|identity|aadhaar|card|आभा|लॉगिन|पहचान)/i,
    action: {
      type: "navigate",
      target: "/login",
      label: {
        en: "Go to ABHA Login",
        hi: "आभा लॉगिन पर जाएं",
        mr: "आभा लॉगिनवर जा",
        gu: "આભા લોગિન પર જાઓ",
        bn: "আভা লগইনে যান",
        ta: "ஆபா உள்நுழைவுக்குச் செல்லவும்",
      },
    },
    replies: {
      en: "You can scan your ABHA QR card, type your 14-digit ABHA number, or continue as a new patient without an ID.",
      hi: "आप अपना आभा कार्ड क्यूआर स्कैन कर सकते हैं, 14 अंकों का आभा नंबर दर्ज कर सकते हैं, या 'नया मरीज' चुनकर आगे बढ़ सकते हैं।",
      mr: "तुम्ही आभा क्यूआर स्कॅन करू शकता किंवा नवीन रुग्ण म्हणून पुढे जाऊ शकता.",
      gu: "તમે તમારું આભા કાર્ડ સ્કેન કરી શકો છો અથવા નવું દર્દી પસંદ કરી શકો છો.",
      bn: "আপনি আভা কার্ড স্ক্যান করতে পারেন বা নতুন রোগী হিসেবে এগিয়ে যেতে পারেন।",
      ta: "உங்கள் ஆபா கார்டை ஸ்கேன் செய்யலாம் அல்லது புதிய நோயாளியாக தொடரலாம்.",
    },
  },
];

// Fallback responses when no specific intent triggers
const GENERAL_FALLBACK: Record<string, string> = {
  en: "I'm here to help you navigate MediKiosk! You can ask about changing language, describing symptoms, scanning medical records, or finding your OPD token.",
  hi: "मैं मेडीकियोस्क में आपकी सहायता के लिए हूँ! आप भाषा बदलने, लक्षण बताने, पुरानी रिपोर्ट स्कैन करने या ओपीडी टोकन के बारे में पूछ सकते हैं।",
  mr: "मी मेडीकियोस्कवर तुम्हाला मदत करण्यासाठी येथे आहे! तुम्ही भाषा बदलणे, लक्षणे सांगणे किंवा अहवाल स्कॅन करण्याबाबत विचारू शकता.",
  gu: "હું તમને મેડીકિયોસ્ક પર મદદ કરવા માટે અહીં છું! તમે ભાષા બદલવા, લક્ષણો જણાવવા અથવા રિપોર્ટ સ્કેન કરવા વિશે પૂછી શકો છો.",
  bn: "আমি আপনাকে মেডিকিয়স্কে সাহায্য করতে এখানে আছি! আপনি ভাষা পরিবর্তন, লক্ষণ বলা বা রিপোর্ট স্ক্যান বিষয়ে জানতে পারেন।",
  ta: "மெடிகியோஸ்கில் உங்களுக்கு உதவ நான் இங்கு இருக்கிறேன்! மொழி மாற்றம், அறிகுறிகள் பதிவு செய்தல் அல்லது டோக்கன் பற்றி கேட்கலாம்.",
};

export class AssistantService {
  /**
   * Matches intent locally first to provide instant actions (like voice navigation buttons).
   */
  public static matchLocalIntent(
    text: string,
    lang: string = "en"
  ): { reply: string; action?: AssistantAction } | null {
    const cleanText = text.trim();
    if (!cleanText) return null;

    for (const item of INTENT_PATTERNS) {
      if (item.regex.test(cleanText)) {
        const reply = item.replies[lang] || item.replies["en"] || item.replies["hi"];
        return { reply, action: item.action };
      }
    }
    return null;
  }

  /**
   * Sends user query to the backend LLM route (/api/assistant/chat),
   * seamlessly falling back to the local knowledge base if offline or unconfigured.
   */
  public static async queryAssistant(
    payload: AssistantRequestPayload
  ): Promise<AssistantResponsePayload> {
    const lang = payload.language || "en";

    // 1. Check if intent matches a high-priority navigation/emergency intent directly
    const localMatch = this.matchLocalIntent(payload.message, lang);

    try {
      // 2. Call backend API route
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          return {
            reply: data.reply,
            action: localMatch?.action || data.action,
            isAiGenerated: true,
          };
        }
      }
    } catch {
      // Backend not running or offline, proceed to fallback gracefully
    }

    // 3. Fallback logic
    if (localMatch) {
      return {
        reply: localMatch.reply,
        action: localMatch.action,
        isAiGenerated: false,
      };
    }

    return {
      reply: GENERAL_FALLBACK[lang] || GENERAL_FALLBACK["en"],
      action: undefined,
      isAiGenerated: false,
    };
  }
}
