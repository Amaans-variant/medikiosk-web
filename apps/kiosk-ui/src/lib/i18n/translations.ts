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
  beginIntake: { hi: "शुरू करें", en: "Begin Clinical Intake", mr: "सुरू करा", gu: "શરૂ કરો", bn: "શરૂ করুন", ta: "தொடங்கு" },

  // ---- Common actions ---------------------------------------------------
  back: { hi: "पीछे", en: "Back", mr: "मागे", gu: "પાછળ", bn: "ফিরে যান", ta: "பின்" },
  close: { hi: "बंद करें", en: "Close", mr: "बंद करा", gu: "બંધ કરો", bn: "বন্ধ করুন", ta: "மூடு" },
  cancel: { hi: "रद्द करें", en: "Cancel", mr: "रद्द करा", gu: "રદ કરો", bn: "বাতিল করুন", ta: "ரத்து செய்" },
  send: { hi: "भेजें", en: "Send", mr: "पाठवा", gu: "મોકલો", bn: "পাঠান", ta: "அனுப்பு" },

  // ---- Chatbot widget -----------------------------------------------------
  chatbotTitle: { hi: "मेडीकियोस्क सहायक", en: "MediKiosk Assistant", mr: "मेडीकियोस्क सहाय्यक", gu: "મેડીકિયોસ્ક સહાયક", bn: "মেডিকিয়স্ক সহায়ক", ta: "மெடிகியோஸ்க் உதவியாளர்" },
  chatbotSubtitle: { hi: "मैं आपकी कैसे मदद कर सकता हूँ?", en: "How can I help you today?", mr: "मी तुमची कशी मदत करू शकतो?", gu: "હું તમને કેવી રીતે મદદ કરી શકું?", bn: "আমি কীভাবে সাহায্য করতে পারি?", ta: "நான் எப்படி உதவலாம்?" },
  chatbotPlaceholder: { hi: "अपना सवाल टाइप करें… या माइक दबाएं", en: "Type your question… or tap mic to speak", mr: "तुमचा प्रश्न टाइप करा… किंवा बोला", gu: "તમારો પ્રશ્ન લખો… અથવા માઇક દબાવો", bn: "আপনার প্রশ্ন লিখুন… বা মাইক টিপুন", ta: "உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்… அல்லது பேசவும்" },
  chatbotGreeting: {
    hi: "नमस्ते! मैं मेडीकियोस्क सहायक हूँ। मैं पंजीकरण, भाषा, रिपोर्ट स्कैनिंग या डॉक्टर से मिलने से जुड़े सवालों में मदद कर सकता हूँ। आप बोलकर भी पूछ सकते हैं!",
    en: "Hi! I'm the MediKiosk assistant. I can help with check-in, language settings, scanning reports, or finding your doctor. You can also speak to me!",
    mr: "नमस्कार! मी मेडीकियोस्क सहाय्यक आहे. नोंदणी, भाषा किंवा डॉक्टरांशी संबंधित मदत करू शकतो. तुम्ही बोलूनही विचारू शकता!",
    gu: "નમસ્તે! હું મેડીકિયોસ્ક સહાયક છું. ચેક-ઇન, ભાષા સેટિંગ્સ અથવા ડોક્ટર શોધવામાં મદદ કરી શકું છું. તમે બોલી પણ શકો છો!",
    bn: "নমস্কার! আমি মেডিকিয়স্ক সহায়ক। চেক-ইন, ভাষা সেটিংস বা রিপোর্ট স্ক্যানিংয়ে সাহায্য করতে পারি। আপনি মুখে বলেও জানতে পারেন!",
    ta: "வணக்கம்! நான் மெடிகியோஸ்க் உதவியாளர். செக்-இன், மொழி அல்லது அறிக்கைகளை ஸ்கேன் செய்வதில் உதவ முடியும். நீங்கள் பேசியும் கேட்கலாம்!",
  },
  chatbotListening: { hi: "सुन रहा हूँ… बोलिए", en: "Listening… speak now", mr: "ऐकत आहे… बोला", gu: "સાંભળી રહ્યો છું… બોલો", bn: "শুনছি… বলুন", ta: "கேட்கிறது… பேசுங்கள்" },
  chatbotVoiceInput: { hi: "बोलकर पूछें", en: "Speak your question", mr: "बोलून विचारा", gu: "બોલીને પૂછો", bn: "বলে জিজ্ঞাসা করুন", ta: "பேசி கேளுங்கள்" },
  chatbotStopListening: { hi: "सुनना बंद करें", en: "Stop listening", mr: "ऐकणे थांबवा", gu: "સાંભળવાનું બંધ કરો", bn: "থামুন", ta: "நிறுத்து" },
  chatbotSpeakMessage: { hi: "आवाज़ में सुनें", en: "Listen aloud", mr: "आवाजात ऐका", gu: "અવાજમાં સાંભળો", bn: "শব্দে শুনুন", ta: "கேளுங்கள்" },
  chatbotStopSpeaking: { hi: "आवाज़ बंद करें", en: "Stop audio", mr: "आवाज थांबवा", gu: "અવાજ બંધ કરો", bn: "শব্দ বন্ধ করুন", ta: "ஒலியை நிறுத்து" },
  chatbotClearChat: { hi: "चैट साफ़ करें", en: "Clear chat", mr: "चॅट साफ करा", gu: "ચેટ સાફ કરો", bn: "চ্যাট মুছুন", ta: "அரட்டையை அழிக்கவும்" },

  // ---- Informed Consent & Privacy ----------------------------------------
  consentStep: {
    hi: "चरण 2 / 5 · सहमति एवं गोपनीयता",
    en: "Step 2 of 5 · Informed Consent & Privacy",
    mr: "टप्पा 2 / 5 · संमती आणि गोपनीयता",
    gu: "પગલું 2 / 5 · સંમતિ અને ગોપનીયતા",
    bn: "ধাপ ২ / ৫ · সম্মতি ও গোপনীয়তা",
    ta: "படி 2 / 5 · ஒப்புதல் மற்றும் தனியுரிமை",
  },
  consentTitle: {
    hi: "आपकी स्वास्थ्य जानकारी सुरक्षित और गोपनीय है",
    en: "Your Health Information Stays Private & Secure",
    mr: "तुमची आरोग्य माहिती सुरक्षित आणि गोपनीय आहे",
    gu: "તમારી સ્વાસ્થ્ય માહિતી સુરક્ષિત અને ખાનગી રહે છે",
    bn: "আপনার স্বাস্থ্য তথ্য গোপন এবং সুরক্ষিত থাকে",
    ta: "உங்கள் சுகாதாரத் தகவல் பாதுகாப்பாகவும் ரகசியமாகவும் இருக்கும்",
  },
  consentSubtitle: {
    hi: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP 2023) और ABDM मानकों के अनुरूप",
    en: "Protected under the Digital Personal Data Protection (DPDP) Act 2023 & ABDM guidelines",
    mr: "डिजिटल वैयक्तिक डेटा संरक्षण कायदा (DPDP 2023) आणि ABDM मानकांनुसार संरक्षित",
    gu: "ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન (DPDP 2023) અને ABDM ધોરણો અનુસાર સુરક્ષિત",
    bn: "ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন (DPDP 2023) ও ABDM নির্দেশিকা দ্বারা সুরক্ষিত",
    ta: "டிஜிட்டல் தனிநபர் தரவு பாதுகாப்பு (DPDP 2023) & ABDM வழிகாட்டுதல்களின் கீழ் பாதுகாக்கப்பட்டது",
  },
  consentAudioPrompt: {
    hi: "नमस्ते। कृपया ध्यान दें कि आपका डेटा सुरक्षित है और केवल आपके डॉक्टर के साथ साझा किया जाएगा। आगे बढ़ने के लिए सहमति दें।",
    en: "Welcome. Please be assured that your data is encrypted and shared only with your attending physician. Please review and provide consent to proceed.",
    mr: "नमस्कार. कृपया खात्री बाळगा की तुमचा डेटा सुरक्षित आहे आणि केवळ तुमच्या डॉक्टरांसोबत शेअर केला जाईल.",
    gu: "નમસ્તે. કૃપા કરીને ખાતરી રાખો કે તમારો ડેટા સુરક્ષિત છે અને ફક્ત તમારા ડૉક્ટર સાથે જ શેર કરવામાં આવશે.",
    bn: "নমস্কার। নিশ্চিত থাকুন যে আপনার তথ্য সুরক্ষিত এবং কেবল আপনার চিকিৎসকের সঙ্গেই ভাগ করা হবে।",
    ta: "வணக்கம். உங்கள் தகவல் பாதுகாப்பானது மற்றும் உங்கள் மருத்துவருடன் மட்டுமே பகிரப்படும்.",
  },
  consentPillar1Title: {
    hi: "डीपीडीपी अधिनियम और आभा (ABDM) अनुपालन",
    en: "DPDP Act 2023 & ABDM Compliant",
    mr: "DPDP कायदा 2023 आणि ABDM अनुपालन",
    gu: "DPDP એક્ટ 2023 અને ABDM પાલન",
    bn: "DPDP আইন ২০২৩ এবং ABDM নির্দেশিকা",
    ta: "DPDP சட்டம் 2023 & ABDM இணக்கம்",
  },
  consentPillar1Desc: {
    hi: "आपका क्लिनिकल डेटा राष्ट्रीय स्वास्थ्य प्राधिकरण के सुरक्षित मानकों के तहत एन्क्रिप्टेड है।",
    en: "End-to-end encrypted storage strictly aligned with National Health Authority standards.",
    mr: "तुमचा डेटा राष्ट्रीय आरोग्य प्राधिकरणाच्या मानकांनुसार एन्क्रिप्टेड आहे.",
    gu: "તમારો ડેટા રાષ્ટ્રીય આરોગ્ય સત્તામંડળના ધોરણો હેઠળ એન્ક્રિપ્ટેડ છે.",
    bn: "আপনার স্বাস্থ্য তথ্য এনএইচএ মান অনুযায়ী এনক্রিপ্ট করা হয়েছে।",
    ta: "உங்கள் தகவல் தேசிய சுகாதார ஆணைய தரநிலைகளின் கீழ் குறியாக்கம் செய்யப்பட்டுள்ளது.",
  },
  consentPillar2Title: {
    hi: "केवल आपके चिकित्सक के साथ साझा",
    en: "Attending OPD Physician Only",
    mr: "केवळ तुमच्या डॉक्टरांशी शेअर",
    gu: "ફક્ત તમારા ડૉક્ટર સાથે શેર",
    bn: "শুধুমাত্র আপনার চিকিৎসকের সাথে ভাগ",
    ta: "உங்கள் மருத்துவரிடம் மட்டுமே பகிர்வு",
  },
  consentPillar2Desc: {
    hi: "लक्षण, पुराने पर्चे और सारांश केवल परामर्श कक्ष में उपस्थित डॉक्टर ही देख सकते हैं।",
    en: "Symptoms, history, and scanned prescriptions are shared exclusively with your treating doctor.",
    mr: "लक्षणे आणि तपासणी अहवाल केवळ तुमचे डॉक्टरच पाहू शकतात.",
    gu: "લક્ષણો અને અહેવાલો ફક્ત તમારા ડૉક્ટર જ જોઈ શકે છે.",
    bn: "লক্ষণ ও রিপোর্ট কেবল আপনার পরামর্শক চিকিৎসকই দেখতে পারেন।",
    ta: "அறிகுறிகள் மற்றும் அறிக்கைகள் உங்கள் மருத்துவரால் மட்டுமே பார்க்க முடியும்.",
  },
  consentPillar3Title: {
    hi: "कोई व्यावसायिक या बाज़ार उपयोग नहीं",
    en: "Zero Commercial Exploitation",
    mr: "कोणताही व्यावसायिक वापर नाही",
    gu: "કોઈ વ્યાવસાયિક ઉપયોગ નથી",
    bn: "কোনো বাণিজ্যিক ব্যবহার নেই",
    ta: "வணிக பயன்பாடு இல்லை",
  },
  consentPillar3Desc: {
    hi: "आपका स्वास्थ्य डेटा कभी किसी विज्ञापनदाता या तीसरे पक्ष को नहीं बेचा या दिया जाएगा।",
    en: "We never monetize, sell, or disclose your health information to advertisers or external parties.",
    mr: "तुमचा डेटा कधीही जाहिरातदार किंवा तृतीय पक्षांना दिला जाणार नाही.",
    gu: "તમારો ડેટા ક્યારેય જાહેરાતકર્તાઓ કે તૃતીય પક્ષોને આપવામાં આવશે નહીં.",
    bn: "আপনার স্বাস্থ্য তথ্য কখনোই বিজ্ঞাপনদাতা বা তৃতীয় পক্ষকে দেওয়া হবে না।",
    ta: "உங்கள் தகவல் விளம்பரதாரர்களுக்கோ பிற மூன்றாம் தரப்பினருக்கோ விற்கப்படாது.",
  },
  consentPillar4Title: {
    hi: "सत्र समाप्ति पर बफर शुद्धि",
    en: "Ephemeral Kiosk Memory Cleared",
    mr: "सत्र संपल्यावर बफर साफ",
    gu: "સત્ર પૂરું થતાં ડેટા સાફ",
    bn: "সেশন শেষে মেমরি পরিষ্কার",
    ta: "அமர்வு முடிந்ததும் நினைவகம் அழிக்கப்படும்",
  },
  consentPillar4Desc: {
    hi: "टोकन मिलने के बाद कियोस्क की स्थानीय मेमोरी से आपके अस्थायी स्कैन तुरंत हटा दिए जाते हैं।",
    en: "Local scratch files and camera buffers are purged immediately upon token generation.",
    mr: "टोकन मिळाल्यानंतर कियोस्कच्या मेमरीमधून तात्पुरती माहिती साफ केली जाते.",
    gu: "ટોકન મળ્યા પછી કિઓસ્કની મેમરીમાંથી અસ્થાયી ફાઇલો સાફ થાય છે.",
    bn: "টোকেন পাওয়ার পর কিওস্ক মেমরি থেকে অস্থায়ী ফাইল মুছে ফেলা হয়।",
    ta: "டோக்கன் பெற்ற பிறகு தற்காலிக கோப்புகள் அழிக்கப்படும்.",
  },
  consentScopeTitle: {
    hi: "स्वीकृत अनुमतियाँ (Scope of Consent)",
    en: "Authorized Clinical Scope",
    mr: "मंजूर केलेल्या परवानग्या",
    gu: "મંજૂર કરેલ પરવાનગીઓ",
    bn: "অনুমোদিত ক্লিনিকাল পরিধি",
    ta: "அங்கீகரிக்கப்பட்ட மருத்துவ நோக்கம்",
  },
  consentScopeHistory: {
    hi: "मुख्य लक्षण एवं क्लिनिकल इतिहास दर्ज करना",
    en: "Record chief complaints & clinical intake history",
    mr: "मुख्य लक्षणे आणि इतिहास नोंदवणे",
    gu: "મુખ્ય લક્ષણો અને ઇતિહાસ નોંધવો",
    bn: "প্রধান লক্ষণ ও ইতিহাস নথিভুক্ত করা",
    ta: "முக்கிய அறிகுறிகள் மற்றும் வரலாற்றைப் பதிவுசெய்தல்",
  },
  consentScopeOcr: {
    hi: "पुराने पर्चे व लैब रिपोर्ट का एआई-ओसीआर स्कैन",
    en: "AI OCR processing of past prescriptions & lab reports",
    mr: "जुने प्रिस्क्रिप्शन व लॅब रिपोर्टचे स्कॅन",
    gu: "જૂના પ્રિસ્ક્રિપ્શન અને રિપોર્ટનું સ્કેનિંગ",
    bn: "পূর্বের প্রেসক্রিপশন ও ল্যাব রিপোর্টের এআই স্ক্যান",
    ta: "மருத்துவ ஆவணங்கள் & ஆய்வக அறிக்கைகளின் AI ஸ்கேன்",
  },
  consentScopeDoctor: {
    hi: "डॉक्टर के कंसोल पर सारांश ड्राफ्ट भेजना",
    en: "Transmit preliminary clinical draft to OPD doctor console",
    mr: "डॉक्टरांच्या कन्सोलवर सारांश पाठवणे",
    gu: "ડૉક્ટરના કન્સોલ પર સારાંશ મોકલવો",
    bn: "ডাক্তারের কনসোলে প্রাথমিক সারাংশ পাঠানো",
    ta: "மருத்துவர் பணியகத்திற்கு சுருக்கத்தை அனுப்புதல்",
  },
  consentScopeAbdm: {
    hi: "आभा (ABHA) स्वास्थ्य रिकॉर्ड से परामर्श पर्ची लिंक करना",
    en: "Link consultation encounter to ABHA Health Locker",
    mr: "ABHA आरोग्य नोंदींशी जोडणी",
    gu: "ABHA આરોગ્ય રેકોર્ડ સાથે લિંક કરવું",
    bn: "আভা (ABHA) স্বাস্থ্য রেকর্ডের সাথে যুক্ত করা",
    ta: "ABHA சுகாதார பதிவுகளுடன் இணைத்தல்",
  },
  agreeAndContinue: {
    hi: "मैं सहमत हूँ एवं आगे बढ़ें",
    en: "I Agree & Continue",
    mr: "मी सहमत आहे व पुढे जा",
    gu: "હું સંમત છું અને આગળ વધો",
    bn: "আমি সম্মত ও এগিয়ে চলুন",
    ta: "நான் ஒப்புக்கொள்கிறேன் & தொடரவும்",
  },
  declineConsent: {
    hi: "सहमति अस्वीकार करें",
    en: "Decline Consent",
    mr: "संमती नाकारा",
    gu: "સંમતિ અસ્વીકાર કરો",
    bn: "সম্মতি প্রত্যাখ্যান",
    ta: "ஒப்புதலை நிராகரி",
  },
  declineModalTitle: {
    hi: "डिजिटल सहमति एवं वॉक-इन परामर्श",
    en: "Digital Consent & Walk-in Option",
    mr: "डिजिटल संमती आणि वॉक-इन पर्याय",
    gu: "ડિજિટલ સંમતિ અને વોક-ઇન વિકલ્પ",
    bn: "ডিজিটাল সম্মতি ও সরাসরি সাক্ষাতের বিকল্প",
    ta: "டிஜிட்டல் ஒப்புதல் & நேரடி உதவி",
  },
  declineModalDesc: {
    hi: "कियोस्क पर डिजिटल केस-टेकिंग पूरी तरह स्वैच्छिक है। यदि आप सहमति नहीं देना चाहते, तो आप सीधे स्वागत काउंटर से पारंपरिक टोकन ले सकते हैं।",
    en: "Digital intake is completely optional. If you decline digital processing, you may immediately receive a standard walk-in token or seek assistance from the physical triage counter.",
    mr: "कियोस्कवर नोंदणी पूर्णपणे ऐच्छिक आहे. आपण थेट स्वागत कक्षातून नेहमीचे टोकन मिळवू शकता.",
    gu: "કિઓસ્ક પર કેસ-ટેકિંગ સંપૂર્ણપણે સ્વૈચ્છિક છે. તમે સ્વાગત કાઉન્ટર પરથી પરંપરાગત ટોકન લઈ શકો છો.",
    bn: "কিওস্কে ডিজিটাল অন্তর্ভুক্তি সম্পূর্ণ ঐচ্ছিক। আপনি কাউন্টার থেকে সাধারণ টোকেন সংগ্রহ করতে পারেন।",
    ta: "கியோஸ்க் மூலம் பதிவு செய்வது முற்றிலும் விருப்பமானது. நீங்கள் வரவேற்பு கவுண்ட்டரில் வழக்கமான டோக்கனைப் பெறலாம்.",
  },
  declineModalWalkInBtn: {
    hi: "वॉक-इन टोकन जारी करें",
    en: "Issue Walk-in Physical Token",
    mr: "वॉक-इन टोकन घ्या",
    gu: "વોક-ઇન ટોકન મેળવો",
    bn: "সাধারণ টোকেন ইস্যু করুন",
    ta: "வழக்கமான டோக்கன் பெறவும்",
  },
  declineModalReconsiderBtn: {
    hi: "सहमति फॉर्म पर वापस जाएं",
    en: "Return to Consent Form",
    mr: "संमती फॉर्मवर परत जा",
    gu: "સંમતિ ફોર્મ પર પાછા જાઓ",
    bn: "সম্মতি ফর্মে ফিরে যান",
    ta: "படிவத்திற்குத் திரும்பவும்",
  },
  consentNonDiagnosticNotice: {
    hi: "यह कोई नैदानिक उपकरण नहीं है · चिकित्सक द्वारा क्लिनिकल सत्यापन अनिवार्य है",
    en: "Not a diagnostic tool · Physician clinical verification mandatory",
    mr: "हे निदान साधन नाही · डॉक्टरांचे सत्यापन आवश्यक आहे",
    gu: "આ નિદાન સાધન નથી · ડૉક્ટરની ચકાસણી ફરજિયાત છે",
    bn: "এটি কোনো রোগ নির্ণায়ক সরঞ্জাম নয় · চিকিৎসকের যাচাইকরণ বাধ্যতামূলক",
    ta: "இது நோயறிதல் கருவி அல்ல · மருத்துவர் சரிபார்ப்பு கட்டாயமானது",
  },
} satisfies Record<string, TranslationTable>;

export type TranslationKey = keyof typeof translations;
