/**
 * Central translation dictionary.
 * ------------------------------------------------------------------
 * This is the fix for the "language selector only changes voice, not
 * on-screen text" bug: every string here is looked up through
 * `useTranslation()` (see ./useTranslation.ts) instead of being
 * hardcoded inline in JSX.
 *
 * COVERAGE: the app shell (top bar, mode switcher, accessibility
 * toggles, dark-mode toggle), the new role login page, the language
 * picker, the ABHA/mobile identity screen, and the chatbot widget are
 * fully wired to this dictionary. The clinical intake screens
 * (complaint, consultation-type, document, summary, physician
 * console, analytics) still contain hardcoded copy — see
 * contents/frontend-integration.md for the exact, low-risk pattern to
 * extend this file and swap those screens over incrementally.
 *
 * Add a new language by adding its code to `SupportedLanguage` and a
 * column to every key below. Add a new string by adding one key here
 * and calling `t('yourKey')` wherever you need it.
 */

export const SUPPORTED_LANGUAGES = [
  { code: "hi", nativeName: "हिन्दी", enName: "Hindi" },
  { code: "en", nativeName: "English", enName: "English" },
  { code: "mr", nativeName: "मराठी", enName: "Marathi" },
  { code: "gu", nativeName: "ગુજરાતી", enName: "Gujarati" },
  { code: "bn", nativeName: "বাংলা", enName: "Bengali" },
  { code: "ta", nativeName: "தமிழ்", enName: "Tamil" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: SupportedLanguage = "hi";

type TranslationTable = Record<SupportedLanguage, string>;

export const translations = {
  // ---- Brand / shell -------------------------------------------------
  appName: { hi: "मेडीकियोस्क", en: "MediKiosk", mr: "मेडीकियोस्क", gu: "મેડીકિયોસ્ક", bn: "মেডিকিয়স্ক", ta: "மெடிகியோஸ்க்" },
  appTagline: {
    hi: "एआई-सहायित क्लिनिकल इनटेक व आयुष ट्राइएज",
    en: "AI-assisted clinical intake & AYUSH triage",
    mr: "एआय-सहाय्यित क्लिनिकल इनटेक व आयुष त्रिआज",
    gu: "એઆઈ-સહાયિત ક્લિનિકલ ઇનટેક અને આયુષ ટ્રાયેજ",
    bn: "এআই-সহায়ক ক্লিনিকাল ইনটেক ও আয়ুষ ট্রায়াজ",
    ta: "AI-உதவி மருத்துவ உள்ளீடு & ஆயுஷ் திரியாஜ்",
  },
  demoEnvironment: { hi: "डेमो वातावरण", en: "Demo Environment", mr: "डेमो वातावरण", gu: "ડેમો પર્યાવરણ", bn: "ডেমো পরিবেশ", ta: "டெமோ சூழல்" },

  // ---- Top bar / mode switcher ---------------------------------------
  navPatientIntake: { hi: "मरीज़ पंजीकरण", en: "Patient Intake", mr: "रुग्ण नोंदणी", gu: "દર્દી પ્રવેશ", bn: "রোগী ভর্তি", ta: "நோயாளி சேர்க்கை" },
  navDoctorConsole: { hi: "डॉक्टर कंसोल", en: "Doctor Console", mr: "डॉक्टर कन्सोल", gu: "ડોક્ટર કન્સોલ", bn: "ডাক্তার কনসোল", ta: "மருத்துவர் பணியகம்" },
  navHospitalAnalytics: { hi: "अस्पताल विश्लेषण", en: "Hospital Analytics", mr: "रुग्णालय विश्लेषण", gu: "હોસ્પિટલ એનાલિટિક્સ", bn: "হাসপাতাল বিশ্লেষণ", ta: "மருத்துவமனை பகுப்பாய்வு" },
  easyView: { hi: "आसान दृश्य", en: "Easy View", mr: "सोपे दृश्य", gu: "સરળ દૃશ્ય", bn: "সহজ ভিউ", ta: "எளிய பார்வை" },
  contrast: { hi: "कंट्रास्ट", en: "Contrast", mr: "कॉन्ट्रास्ट", gu: "કોન્ટ્રાસ્ટ", bn: "কনট্রাস্ট", ta: "மாறுபாடு" },
  emergencyHelp: { hi: "आपातकालीन सहायता", en: "Emergency Help", mr: "आपत्कालीन मदत", gu: "કટોકટી સહાય", bn: "জরুরি সহায়তা", ta: "அவசர உதவி" },
  darkMode: { hi: "डार्क मोड", en: "Dark Mode", mr: "डार्क मोड", gu: "ડાર્ક મોડ", bn: "ডার্ক মোড", ta: "இருள் பயன்முறை" },
  lightMode: { hi: "लाइट मोड", en: "Light Mode", mr: "लाइट मोड", gu: "લાઇટ મોડ", bn: "লাইট মোড", ta: "ஒளி பயன்முறை" },
  logout: { hi: "लॉग आउट", en: "Log Out", mr: "लॉग आउट", gu: "લોગ આઉટ", bn: "লগ আউট", ta: "வெளியேறு" },
  signedInAs: { hi: "इस रूप में साइन इन:", en: "Signed in as", mr: "यांच्या रूपात साइन इन:", gu: "આ રીતે સાઇન ઇન:", bn: "যেভাবে সাইন ইন করা হয়েছে:", ta: "இதுவாக உள்நுழைந்துள்ளீர்கள்:" },

  // ---- Role login page -------------------------------------------------
  loginTitle: { hi: "साइन इन करें", en: "Sign In", mr: "साइन इन करा", gu: "સાઇન ઇન કરો", bn: "সাইন ইন করুন", ta: "உள்நுழைக" },
  loginSubtitle: {
    hi: "जारी रखने के लिए अपनी भूमिका चुनें",
    en: "Choose your role to continue",
    mr: "पुढे जाण्यासाठी तुमची भूमिका निवडा",
    gu: "ચાલુ રાખવા માટે તમારી ભૂમિકા પસંદ કરો",
    bn: "চালিয়ে যেতে আপনার ভূমিকা নির্বাচন করুন",
    ta: "தொடர உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்",
  },
  roleAdmin: { hi: "प्रशासक", en: "Admin", mr: "प्रशासक", gu: "એડમિન", bn: "অ্যাডমিন", ta: "நிர்வாகி" },
  roleDoctor: { hi: "डॉक्टर", en: "Doctor", mr: "डॉक्टर", gu: "ડોક્ટર", bn: "ডাক্তার", ta: "மருத்துவர்" },
  rolePatient: { hi: "मरीज़", en: "Patient", mr: "रुग्ण", gu: "દર્દી", bn: "রোগী", ta: "நோயாளி" },
  roleAdminDesc: { hi: "अस्पताल विश्लेषण व सिस्टम प्रबंधन", en: "Hospital analytics & system oversight", mr: "रुग्णालय विश्लेषण व व्यवस्थापन", gu: "હોસ્પિટલ એનાલિટિક્સ અને દેખરેખ", bn: "হাসপাতাল বিশ্লেষণ ও তত্ত্বাবধান", ta: "மருத்துவமனை பகுப்பாய்வு & மேற்பார்வை" },
  roleDoctorDesc: { hi: "ओपीडी कतार व मरीज़ सारांश देखें", en: "Review OPD queue & patient summaries", mr: "ओपीडी रांग व रुग्ण सारांश पहा", gu: "OPD કતાર અને દર્દી સારાંશ જુઓ", bn: "OPD সারি ও রোগীর সারাংশ দেখুন", ta: "OPD வரிசை & நோயாளி சுருக்கத்தைப் பார்க்கவும்" },
  rolePatientDesc: { hi: "क्लिनिकल इनटेक शुरू करें", en: "Start your clinical intake", mr: "क्लिनिकल इनटेक सुरू करा", gu: "તમારું ક્લિનિકલ ઇનટેક શરૂ કરો", bn: "আপনার ক্লিনিকাল ইনটেক শুরু করুন", ta: "உங்கள் மருத்துவ உள்ளீட்டைத் தொடங்குங்கள்" },
  loginIdLabelStaff: { hi: "स्टाफ आईडी", en: "Staff ID", mr: "स्टाफ आयडी", gu: "સ્ટાફ આઈડી", bn: "স্টাফ আইডি", ta: "பணியாளர் அடையாள எண்" },
  loginIdLabelDoctor: { hi: "डॉक्टर आईडी", en: "Doctor ID", mr: "डॉक्टर आयडी", gu: "ડોક્ટર આઈડી", bn: "ডাক্তার আইডি", ta: "மருத்துவர் அடையாள எண்" },
  loginIdLabelPatient: { hi: "मोबाइल / ABHA नंबर", en: "Mobile / ABHA Number", mr: "मोबाइल / ABHA क्रमांक", gu: "મોબાઇલ / ABHA નંબર", bn: "মোবাইল / ABHA নম্বর", ta: "மொபைல் / ABHA எண்" },
  loginPasswordLabel: { hi: "पासवर्ड / पिन", en: "Password / PIN", mr: "पासवर्ड / पिन", gu: "પાસવર્ડ / પિન", bn: "পাসওয়ার্ড / পিন", ta: "கடவுச்சொல் / பின்" },
  loginContinue: { hi: "जारी रखें", en: "Continue", mr: "पुढे जा", gu: "ચાલુ રાખો", bn: "চালিয়ে যান", ta: "தொடரவும்" },
  loginSigningIn: { hi: "साइन इन हो रहा है…", en: "Signing in…", mr: "साइन इन होत आहे…", gu: "સાઇન ઇન થઈ રહ્યું છે…", bn: "সাইন ইন হচ্ছে…", ta: "உள்நுழைகிறது…" },
  loginDemoHint: {
    hi: "डेमो वातावरण — कोई भी आईडी व पासवर्ड दर्ज करें",
    en: "Demo environment — enter any ID & password",
    mr: "डेमो वातावरण — कोणतीही आयडी व पासवर्ड टाका",
    gu: "ડેમો પર્યાવરણ — કોઈપણ આઈડી અને પાસવર્ડ દાખલ કરો",
    bn: "ডেমো পরিবেশ — যেকোনো আইডি ও পাসওয়ার্ড দিন",
    ta: "டெமோ சூழல் — எந்த ஐடி & கடவுச்சொல்லையும் உள்ளிடவும்",
  },
  loginSecureBadge: {
    hi: "ABDM दिशानिर्देशों के अनुरूप, एन्क्रिप्टेड",
    en: "Encrypted & ABDM-guideline compliant",
    mr: "एन्क्रिप्टेड व ABDM मार्गदर्शक तत्त्वांनुसार",
    gu: "એન્ક્રિપ્ટેડ અને ABDM માર્ગદર્શિકા અનુરૂપ",
    bn: "এনক্রিপ্টেড ও ABDM নির্দেশিকা সম্মত",
    ta: "குறியாக்கம் & ABDM வழிகாட்டுதலுக்கு இணங்கியது",
  },

  // ---- Language picker -------------------------------------------------
  selectLanguageTitle: { hi: "अपनी भाषा चुनें", en: "Select Language", mr: "तुमची भाषा निवडा", gu: "તમારી ભાષા પસંદ કરો", bn: "আপনার ভাষা নির্বাচন করুন", ta: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்" },
  selectLanguageSubtitle: {
    hi: "सभी मरीज़ों व वरिष्ठ नागरिकों के लिए बड़े टच बटन",
    en: "Large touch buttons designed for all patients & elderly accessibility",
    mr: "सर्व रुग्ण व वृद्धांसाठी मोठी टच बटणे",
    gu: "તમામ દર્દીઓ અને વૃદ્ધો માટે મોટા ટચ બટન",
    bn: "সকল রোগী ও প্রবীণদের জন্য বড় টাচ বাটন",
    ta: "அனைத்து நோயாளிகள் & முதியோருக்கான பெரிய தொடு பொத்தான்கள்",
  },
  displayLanguageStep: { hi: "1. स्क्रीन की भाषा", en: "1. Display Language", mr: "1. स्क्रीनची भाषा", gu: "1. સ્ક્રીન ભાષા", bn: "১. স্ক্রিন ভাষা", ta: "1. திரை மொழி" },
  voiceLanguageStep: { hi: "2. बोलने की आवाज़", en: "2. Voice Speech Input", mr: "2. बोलण्याचा आवाज", gu: "2. બોલવાનો અવાજ", bn: "২. কণ্ঠস্বর ইনপুট", ta: "2. குரல் உள்ளீடு" },
  persistedSeparately: { hi: "अलग से सहेजा गया", en: "Persisted Separately", mr: "स्वतंत्रपणे जतन", gu: "અલગથી સાચવેલ", bn: "আলাদাভাবে সংরক্ষিত", ta: "தனித்தனியாக சேமிக்கப்பட்டது" },
  beginIntake: { hi: "शुरू करें", en: "Begin Clinical Intake", mr: "सुरू करा", gu: "શરૂ કરો", bn: "শুরু করুন", ta: "தொடங்கு" },

  // ---- Common actions ---------------------------------------------------
  back: { hi: "पीछे", en: "Back", mr: "मागे", gu: "પાછળ", bn: "ফিরে যান", ta: "பின்" },
  close: { hi: "बंद करें", en: "Close", mr: "बंद करा", gu: "બંધ કરો", bn: "বন্ধ করুন", ta: "மூடு" },
  cancel: { hi: "रद्द करें", en: "Cancel", mr: "रद्द करा", gu: "રદ કરો", bn: "বাতিল করুন", ta: "ரத்து செய்" },
  send: { hi: "भेजें", en: "Send", mr: "पाठवा", gu: "મોકલો", bn: "পাঠান", ta: "அனுப்பு" },

  // ---- Chatbot widget -----------------------------------------------------
  chatbotTitle: { hi: "मेडीकियोस्क सहायक", en: "MediKiosk Assistant", mr: "मेडीकियोस्क सहाय्यक", gu: "મેડીકિયોસ્ક સહાયક", bn: "মেডিকিয়স্ক সহায়ক", ta: "மெடிகியோஸ்க் உதவியாளர்" },
  chatbotSubtitle: { hi: "मैं आपकी कैसे मदद कर सकता हूँ?", en: "How can I help you today?", mr: "मी तुमची कशी मदत करू शकतो?", gu: "હું તમને કેવી રીતે મદદ કરી શકું?", bn: "আমি কীভাবে সাহায্য করতে পারি?", ta: "நான் எப்படி உதவலாம்?" },
  chatbotPlaceholder: { hi: "अपना सवाल टाइप करें…", en: "Type your question…", mr: "तुमचा प्रश्न टाइप करा…", gu: "તમારો પ્રશ્ન લખો…", bn: "আপনার প্রশ্ন লিখুন…", ta: "உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்…" },
  chatbotGreeting: {
    hi: "नमस्ते! मैं मेडीकियोस्क सहायक हूँ। मैं पंजीकरण, भाषा या डॉक्टर से मिलने से जुड़े सवालों में मदद कर सकता हूँ।",
    en: "Hi! I'm the MediKiosk assistant. I can help with check-in, language settings, or finding your way to a doctor.",
    mr: "नमस्कार! मी मेडीकियोस्क सहाय्यक आहे. नोंदणी, भाषा किंवा डॉक्टरांशी संबंधित मदत करू शकतो.",
    gu: "નમસ્તે! હું મેડીકિયોસ્ક સહાયક છું. ચેક-ઇન, ભાષા સેટિંગ્સ અથવા ડોક્ટર શોધવામાં મદદ કરી શકું છું.",
    bn: "নমস্কার! আমি মেডিকিয়স্ক সহায়ক। চেক-ইন, ভাষা সেটিংস বা ডাক্তার খুঁজে পেতে সাহায্য করতে পারি।",
    ta: "வணக்கம்! நான் மெடிகியோஸ்க் உதவியாளர். செக்-இன், மொழி அமைப்புகள் அல்லது மருத்துவரைக் கண்டறிய உதவ முடியும்.",
  },
} satisfies Record<string, TranslationTable>;

export type TranslationKey = keyof typeof translations;
