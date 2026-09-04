import { AyushAssessment } from "../models";

export const PRAKRITI_PROFILES: Record<string, { dosha: string; traits: string; diet: string }> = {
  "Vata": {
    dosha: "Vata (Air + Ether)",
    traits: "Light, dry, mobile, variable digestion, prone to joint stiffness and sleep disturbance",
    diet: "Warm, nourishing, grounding foods with sneha (ghee/sesame oil)"
  },
  "Pitta": {
    dosha: "Pitta (Fire + Water)",
    traits: "Sharp, hot, intense, strong metabolic fire (Tikshnagni), prone to hyperacidity",
    diet: "Cooling, sweet, bitter, astringent foods; avoid excessive sour and spicy items"
  },
  "Kapha": {
    dosha: "Kapha (Water + Earth)",
    traits: "Heavy, cool, stable, slow metabolism (Mandagni), strong vital endurance",
    diet: "Light, dry, warm, pungent, bitter, and astringent foods; avoid day-sleep"
  },
  "Vata-Pitta": {
    dosha: "Vata-Pitta (Dual)",
    traits: "Variable metabolism with sensitivity to heat and irregular digestion",
    diet: "Moderately warming, easy to digest balanced diet"
  },
  "Pitta-Kapha": {
    dosha: "Pitta-Kapha (Dual)",
    traits: "Moderate build, strong appetite, tendency to skin flushing and lethargy",
    diet: "Cooling, light, bitter and astringent dietary regimen"
  },
  "Vata-Kapha": {
    dosha: "Vata-Kapha (Dual)",
    traits: "Sensitivity to cold, variable appetite, sluggish circulation",
    diet: "Warm, light, dry, and stimulating diet"
  }
};

/**
 * 12 SIH Dashavidha Pariksha Dimensions & Options
 */
export const DASHAVIDHA_QUESTIONS = [
  {
    id: "prakriti",
    sanskrit: "प्रकृति (Prakriti)",
    titleHi: "आपकी शारीरिक एवं मानसिक मूल प्रकृति",
    titleEn: "Baseline Doshic Constitution",
    options: [
      { id: "Vata", labelHi: "वात (Vata)", labelEn: "Vata (Air/Ether)", desc: "हल्का, चंचल, शुष्क त्वचा, अनियमित भूख" },
      { id: "Pitta", labelHi: "पित्त (Pitta)", labelEn: "Pitta (Fire/Water)", desc: "तेज, तीक्ष्ण, पसीना अधिक, तीव्र भूख" },
      { id: "Kapha", labelHi: "कफ (Kapha)", labelEn: "Kapha (Earth/Water)", desc: "स्थिर, भारी, शांत स्वभाव, मंद पाचन" },
      { id: "Vata-Pitta", labelHi: "वात-पित्त (Vata-Pitta)", labelEn: "Vata-Pitta Dual", desc: "अनियमित पाचन व उष्णता संवेदनशीलता" },
      { id: "Pitta-Kapha", labelHi: "पित्त-कफ (Pitta-Kapha)", labelEn: "Pitta-Kapha Dual", desc: "मध्यम गठन, तीव्र भूख, स्थिरता" }
    ]
  },
  {
    id: "vikriti",
    sanskrit: "विकृति (Vikriti)",
    titleHi: "वर्तमान में अनुभव हो रहे दोष असंतुलन",
    titleEn: "Current Doshic Morbidity / Imbalance",
    options: [
      { id: "Vata Vriddhi", labelHi: "वात वृद्धि (Vata Imbalance)", labelEn: "Vata Aggravation", desc: "जोड़ों में दर्द, गैस, अनिद्रा, सूखापन" },
      { id: "Pitta Vriddhi", labelHi: "पित्त वृद्धि (Pitta Imbalance)", labelEn: "Pitta Aggravation", desc: "अम्लपित्त/एसिडिटी, दाह, जलन, अत्यधिक प्यास" },
      { id: "Kapha Vriddhi", labelHi: "कफ वृद्धि (Kapha Imbalance)", labelEn: "Kapha Aggravation", desc: "आलस्य, भारीपन, बलगम, मंदाग्नि" },
      { id: "Dwandwaja Vriddhi", labelHi: "द्वन्द्वज (वात-पित्त वृद्धि)", labelEn: "Dual Aggravation", desc: "पेट में जलन के साथ गैस व अनिद्रा" }
    ]
  },
  {
    id: "sara",
    sanskrit: "सार (Sara)",
    titleHi: "धातु सारता (शरीर के धातुओं की उत्कृष्टता)",
    titleEn: "Dhatu Sarata (Tissue Excellence)",
    options: [
      { id: "Twak-Rakta Sara", labelHi: "त्वक एवं रक्त सार (Skin & Blood)", labelEn: "Twak-Rakta Sara", desc: "स्निग्ध त्वचा, लालिमायुक्त होंठ व नाखून" },
      { id: "Mamsa-Asthi Sara", labelHi: "मांस एवं अस्थि सार (Muscle & Bone)", labelEn: "Mamsa-Asthi Sara", desc: "मजबूत मांसपेशियां, दृढ़ संधियां एवं अस्थियां" },
      { id: "Madhyama Sara", labelHi: "मध्यम सार (Moderate Tissue Quality)", labelEn: "Madhyama Sara", desc: "सामान्य शारीरिक धातु पुष्टि" },
      { id: "Avara Sara", labelHi: "अवर सार (Frail / Low Tissue Reserve)", labelEn: "Avara Sara", desc: "धातु दुर्बलता एवं शीघ्र थकान" }
    ]
  },
  {
    id: "samhanana",
    sanskrit: "संहनन (Samhanana)",
    titleHi: "शरीर की सुगठनता एवं बनावट",
    titleEn: "Body Compactness & Structural Frame",
    options: [
      { id: "Susamhata", labelHi: "सुसंहत (Well-Built / Compact)", labelEn: "Susamhata (Compact)", desc: "सुदृढ़ मांसपेशियां, सुगठित शरीर" },
      { id: "Madhyama", labelHi: "मध्यम (Moderate Compactness)", labelEn: "Madhyama (Average)", desc: "सामान्य शारीरिक बनावट" },
      { id: "Hina", labelHi: "हीन / शिथिल (Frail / Low Density)", labelEn: "Hina (Frail)", desc: "ढीली मांसपेशियां, दुर्बल शारीरिक ढांचा" }
    ]
  },
  {
    id: "pramana",
    sanskrit: "प्रमाण (Pramana)",
    titleHi: "शारीरिक अनुपात एवं माप",
    titleEn: "Anthropometric Proportions & Stature",
    options: [
      { id: "Anuroopa", labelHi: "अनुरूप (Balanced / Proportionate)", labelEn: "Anuroopa (Proportionate)", desc: "ऊंचाई, बाहें एवं शरीर के अंग आनुपातिक" },
      { id: "Madhyama", labelHi: "मध्यम (Average Stature)", labelEn: "Madhyama (Average)", desc: "सामान्य कद-काठी" },
      { id: "Heena", labelHi: "हीन (Disproportionate / Stunted)", labelEn: "Heena (Disproportionate)", desc: "अनियमित शारीरिक अनुपात" }
    ]
  },
  {
    id: "satmya",
    sanskrit: "सात्म्य (Satmya)",
    titleHi: "आहार एवं पर्यावरण की अनुकूलता",
    titleEn: "Habituation & Environmental Adaptability",
    options: [
      { id: "Sarva-rasa Satmya", labelHi: "सर्वरस सात्म्य (High Adaptability)", labelEn: "Sarva-rasa Satmya", desc: "सभी छह रसों व सभी मौसमों में अनुकूलन क्षमता" },
      { id: "Madhyama Satmya", labelHi: "मध्यम सात्म्य (Moderate Adaptability)", labelEn: "Madhyama Satmya", desc: "अधिकांश सामान्य आहार सुपाच्य" },
      { id: "Eka-rasa / Avara", labelHi: "अवर सात्म्य (Poor Adaptability)", labelEn: "Avara Satmya", desc: "आहार या मौसम बदलते ही स्वास्थ्य खराब होना" }
    ]
  },
  {
    id: "sattva",
    sanskrit: "सत्त्व (Sattva)",
    titleHi: "मानसिक बल एवं सहनशीलता",
    titleEn: "Psychological Resilience & Mental Strength",
    options: [
      { id: "Pravara Sattva", labelHi: "प्रवर सत्त्व (High Mental Strength)", labelEn: "Pravara Sattva", desc: "धैर्यवान, कष्ट व रोग में अडिग, दृढ़ निश्चयी" },
      { id: "Madhyama Sattva", labelHi: "मध्यम सत्त्व (Moderate Resilience)", labelEn: "Madhyama Sattva", desc: "दूसरों के ढांढस से सामान्य रहने वाला" },
      { id: "Avara Sattva", labelHi: "अवर सत्त्व (Low Resilience / Anxious)", labelEn: "Avara Sattva", desc: "शीघ्र घबराने वाला, अल्प सहनशीलता, भयभीत" }
    ]
  },
  {
    id: "aharaShakti",
    sanskrit: "आहार शक्ति (Ahara Shakti)",
    titleHi: "भोजन ग्रहण (अभ्यवहरण) व पाचन (जरण) शक्ति",
    titleEn: "Food Intake Capacity & Digestive Power",
    options: [
      { id: "Pravara Ahara Shakti", labelHi: "प्रवर (उत्कृष्ट पाचन व भूख)", labelEn: "Pravara (Strong Digestion)", desc: "समय पर तीव्र भूख, भारी भोजन भी सुपाच्य (तीक्ष्णाग्नि)" },
      { id: "Madhyama Ahara Shakti", labelHi: "मध्यम (सामान्य भूख व पाचन)", labelEn: "Madhyama (Balanced)", desc: "नियमित सामान्य भोजन सुपाच्य (समाग्नि)" },
      { id: "Vishamagni", labelHi: "विषमाग्नि (अनियमित पाचन)", labelEn: "Vishamagni (Irregular)", desc: "कभी भूख अधिक, कभी बिल्कुल नहीं; पेट फूलना" },
      { id: "Mandagni", labelHi: "मंदाग्नि (धीमा पाचन / अपच)", labelEn: "Mandagni (Hypoactive)", desc: "भूख कम लगना, भारीपन, खट्टी डकारें" }
    ]
  },
  {
    id: "vyayamaShakti",
    sanskrit: "व्यायाम शक्ति (Vyayama Shakti)",
    titleHi: "शारीरिक परिश्रम व कार्य करने की क्षमता",
    titleEn: "Physical Endurance & Exercise Capacity",
    options: [
      { id: "Pravara", labelHi: "प्रवर (High Endurance)", labelEn: "Pravara (High Endurance)", desc: "कठिन शारीरिक कार्य बिना अत्यधिक थकान के करना" },
      { id: "Madhyama", labelHi: "मध्यम (Moderate Endurance)", labelEn: "Madhyama (Moderate)", desc: "दैनिक सामान्य कार्य सुगमता से संपन्न" },
      { id: "Avara", labelHi: "अवर (Low Endurance)", labelEn: "Avara (Low / Easily Fatigued)", desc: "सीढ़ियां चढ़ने या अल्प परिश्रम से सांस फूलना व थकान" }
    ]
  },
  {
    id: "vaya",
    sanskrit: "वय (Vaya)",
    titleHi: "आयु वर्ग (Age Classification)",
    titleEn: "Biological Age Stage",
    options: [
      { id: "Bala", labelHi: "बाल्यावस्था (Childhood / Growth <16y)", labelEn: "Bala (<16 years)", desc: "कफ दोष प्रधान काल" },
      { id: "Madhyama", labelHi: "युवा / मध्यमावस्था (Adult 16-60y)", labelEn: "Madhyama (16-60 years)", desc: "पित्त दोष प्रधान काल (ऊर्जा व उपापचय)" },
      { id: "Vriddha", labelHi: "वृद्धावस्था (Geriatric >60y)", labelEn: "Vriddha (>60 years)", desc: "वात दोष प्रधान काल (क्षय व संधि वेदना)" }
    ]
  },
  {
    id: "ahara",
    sanskrit: "आहार (Ahara)",
    titleHi: "खानपान की आदतें व प्रमुख रस",
    titleEn: "Dietary Habits & Preferred Rasas",
    options: [
      { id: "Tikshna-Katu", labelHi: "तीखा व तला-भुना (Spicy / Pungent)", labelEn: "Katu-Lavana (Spicy/Salty)", desc: "मिर्च-मसाले, तली हुई वस्तुएं, चाय/कॉफी अधिक" },
      { id: "Madhura-Snigdha", labelHi: "मधुर व स्निग्ध (Sweet / Heavy)", labelEn: "Madhura-Snigdha (Sweet/Rich)", desc: "दूध, घी, मिठाई, भारी आहार अधिक" },
      { id: "Ruksha-Shita", labelHi: "रूखा व ठंडा आहार (Dry / Cold / Fast food)", labelEn: "Ruksha-Sheeta", desc: "बासी भोजन, सूखा नाश्ता, पैकेज्ड फूड" },
      { id: "Sattvic-Balanced", labelHi: "सात्त्विक व सुपाच्य (Light / Balanced)", labelEn: "Sattvic & Balanced", desc: "ताजा पकाया दाल, चावल, रोटी, मौसमी सब्जियां" }
    ]
  },
  {
    id: "vihara",
    sanskrit: "विहार (Vihara)",
    titleHi: "दिनचर्या, निद्रा एवं जीवनशैली",
    titleEn: "Lifestyle, Sleep (Nidra) & Daily Conduct",
    options: [
      { id: "Ratri-Jagarana", labelHi: "रात्रि जागरण (Late Night Sleep)", labelEn: "Ratri-Jagarana (Late sleeping)", desc: "देर रात तक जागना, स्क्रीन टाइम > 8 घंटे" },
      { id: "Divasvapna", labelHi: "दिन में सोना (Daytime Sleep)", labelEn: "Divasvapna (Day sleeping)", desc: "दोपहर में भोजन के बाद सोना, आलस्य" },
      { id: "Chinta-Shoka", labelHi: "मानसिक तनाव (Mental Stress / Anxiety)", labelEn: "Chinta / Stress", desc: "लगातार चिंता, कार्य का दबाव, बेचैनी" },
      { id: "Samyak-Vihara", labelHi: "नियमित दिनचर्या (Disciplined Routine)", labelEn: "Samyak Routine", desc: "समय पर शयन, 7-8 घंटे गाढ़ी नींद, हल्का व्यायाम" }
    ]
  }
];

/**
 * Builds a complete 12-factor AyushAssessment object
 */
export function determineAyushProfile(
  prakritiInput: string,
  overrides?: Partial<AyushAssessment>
): AyushAssessment {
  const hasPitta = prakritiInput?.includes("Pitta");
  const hasVata = prakritiInput?.includes("Vata");
  const hasKapha = prakritiInput?.includes("Kapha");
  const profileKey = prakritiInput 
    ? ((hasVata && hasPitta) ? "Vata-Pitta" : (hasPitta && hasKapha) ? "Pitta-Kapha" : (hasVata && hasKapha) ? "Vata-Kapha" : hasPitta ? "Pitta" : hasKapha ? "Kapha" : "Vata")
    : "Not assessed";

  return {
    prakriti: overrides?.prakriti || profileKey,
    vikriti: overrides?.vikriti || "Not assessed",
    sara: overrides?.sara || "Not assessed",
    samhanana: overrides?.samhanana || "Not assessed",
    pramana: overrides?.pramana || "Not assessed",
    satmya: overrides?.satmya || "Not assessed",
    sattva: overrides?.sattva || "Not assessed",
    aharaShakti: overrides?.aharaShakti || "Not assessed",
    vyayamaShakti: overrides?.vyayamaShakti || "Not assessed",
    vaya: overrides?.vaya || "Not assessed",
    ahara: overrides?.ahara || "Not assessed",
    vihara: overrides?.vihara || "Not assessed",
    agni: overrides?.agni || "Not assessed",
    bala: overrides?.bala || "Not assessed",
    koshtha: overrides?.koshtha || "Not assessed"
  };
}
