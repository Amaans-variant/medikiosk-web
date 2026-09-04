import { ComplaintPathway } from "./types";

// ============================================================================
// 1. CHEST PAIN PATHWAY
// ============================================================================
export const chestPainPathway: ComplaintPathway = {
  complaintKey: "chest_pain",
  titleHi: "छाती में दर्द / जकड़न",
  titleEn: "Chest Pain & Tightness",
  canonicalName: "Chest Pain",
  mandatoryFields: ["location", "duration", "onset", "character", "radiation", "severity"],
  optionalFields: ["aggravatingFactors", "relievingFactors", "associatedSymptoms", "pastMedicalHistory"],
  firstQuestionId: "cp_duration",
  questions: {
    cp_duration: {
      id: "cp_duration",
      field: "duration",
      promptHi: "यह दर्द कितने समय से हो रहा है?",
      promptEn: "How long have you had this chest pain?",
      audioPromptText: "Yeh dard kitne samay se ho raha hai?",
      choices: [
        { id: "dur_sudden_mins", labelHi: "अभी कुछ मिनटों या 1-2 घंटों से", labelEn: "Just few minutes / 1-2 hours", extractedValue: { duration: "Acute (<2 hours)", onset: "Sudden" } },
        { id: "dur_days", labelHi: "पिछले 1-3 दिनों से", labelEn: "Past 1-3 days", extractedValue: { duration: "1-3 days", onset: "Gradual" } },
        { id: "dur_weeks", labelHi: "काफी हफ़्तों या महीनों से (बार-बार)", labelEn: "Weeks / Months (Recurrent episodes)", extractedValue: { duration: "Recurrent / Chronic", onset: "Recurrent" } }
      ]
    },
    cp_character: {
      id: "cp_character",
      field: "character",
      promptHi: "दर्द किस तरह का महसूस होता है?",
      promptEn: "What does the pain feel like?",
      audioPromptText: "Dard kis tarah ka mehsoos hota hai?",
      choices: [
        { id: "char_heavy_squeeze", labelHi: "भारीपन या निचोड़ने जैसा दबाव", labelEn: "Heavy pressure / Squeezing", extractedValue: { character: "Heavy pressure / Squeezing retrosternal" } },
        { id: "char_burning", labelHi: "जलन या एसिडिटी जैसा", labelEn: "Burning / Acidity sensation", extractedValue: { character: "Burning substernal" } },
        { id: "char_sharp_pricking", labelHi: "चुभने या सांस लेने पर तेज दर्द", labelEn: "Sharp / Pricking on deep breath", extractedValue: { character: "Sharp pleuritic" } }
      ]
    },
    cp_radiation: {
      id: "cp_radiation",
      field: "radiation",
      promptHi: "क्या यह दर्द कहीं और भी फैल रहा है?",
      promptEn: "Does the pain travel or spread anywhere else?",
      audioPromptText: "Kya yeh dard kahin aur bhi fail raha hai?",
      choices: [
        { id: "rad_arm_jaw", labelHi: "हाँ, बाएं हाथ, कंधे या जबड़े में", labelEn: "Yes, to left arm, shoulder, or jaw", extractedValue: { radiation: "Radiating to left arm and jaw" }, isRedFlagTrigger: true, redFlagReason: "Radiation to left arm/jaw is highly indicative of Acute Coronary Syndrome" },
        { id: "rad_back", labelHi: "हाँ, पीठ की तरफ", labelEn: "Yes, straight to the back", extractedValue: { radiation: "Radiating to interscapular back" } },
        { id: "rad_none", labelHi: "नहीं, केवल छाती में ही है", labelEn: "No, confined to chest only", extractedValue: { radiation: "None (localized)" } }
      ]
    },
    cp_associated: {
      id: "cp_associated",
      field: "associatedSymptoms",
      promptHi: "क्या इसके साथ इनमें से कोई अन्य लक्षण है?",
      promptEn: "Are you experiencing any other symptoms with the chest pain?",
      audioPromptText: "Kya iske saath koi anya lakshan hain?",
      choices: [
        { id: "assoc_dyspnea_sweats", labelHi: "सांस फूलना और ठंडा पसीना", labelEn: "Shortness of breath & cold sweats", extractedValue: { associatedSymptoms: ["Shortness of breath", "Cold sweats"] }, isRedFlagTrigger: true, redFlagReason: "Chest pain with acute dyspnea and cold sweats warrants immediate emergency triage" },
        { id: "assoc_nausea_acidity", labelHi: "जी मिचलाना या खट्टी डकारें", labelEn: "Nausea or sour belching", extractedValue: { associatedSymptoms: ["Nausea", "Dyspepsia"] } },
        { id: "assoc_none", labelHi: "इनमें से कोई नहीं", labelEn: "None of these", extractedValue: { associatedSymptoms: ["None reported"] } }
      ]
    },
    cp_history: {
      id: "cp_history",
      field: "pastMedicalHistory",
      promptHi: "क्या आपको पहले से इनमें से कोई बीमारी है?",
      promptEn: "Do you have any past medical conditions?",
      audioPromptText: "Kya aapko pehle se koi bimari hai?",
      choices: [
        { id: "pmh_htn_dm", labelHi: "ब्लड प्रेशर (BP) या शुगर (Diabetes)", labelEn: "High BP or Diabetes", extractedValue: { pastMedicalHistory: ["Hypertension", "Diabetes Mellitus"] } },
        { id: "pmh_heart_attack", labelHi: "पहले दिल का दौरा या स्टेंट", labelEn: "Prior Heart Attack / Angioplasty / Stent", extractedValue: { pastMedicalHistory: ["Coronary Artery Disease (Prior event)"] } },
        { id: "pmh_none", labelHi: "कोई ज्ञात बीमारी नहीं है", labelEn: "No known chronic illnesses", extractedValue: { pastMedicalHistory: ["None"] } }
      ]
    }
  },
  getNextQuestionId: (history, currentId) => {
    const questionSequence = ["cp_duration", "cp_character", "cp_radiation", "cp_associated", "cp_history"];
    const fieldMap: Record<string, keyof typeof history> = {
      cp_duration: "duration",
      cp_character: "character",
      cp_radiation: "radiation",
      cp_associated: "associatedSymptoms",
      cp_history: "pastMedicalHistory"
    };

    const currentIndex = questionSequence.indexOf(currentId);
    for (let i = currentIndex + 1; i < questionSequence.length; i++) {
      const qId = questionSequence[i];
      const field = fieldMap[qId];
      const val = history[field];
      const isMissing = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
      if (isMissing) return qId;
    }
    return null;
  },
  checkRedFlags: (history) => {
    const flags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }> = [];
    const isRadiatingArmJaw = history.radiation?.includes("left arm");
    const hasColdSweatsOrDyspnea = history.associatedSymptoms?.some(s => s.toLowerCase().includes("breath") || s.toLowerCase().includes("sweat") || s.toLowerCase().includes("dyspnea"));
    const isSevere = (history.severity || 0) >= 7;

    if (isRadiatingArmJaw || hasColdSweatsOrDyspnea || (isSevere && history.character?.includes("pressure"))) {
      flags.push({
        condition: "Suspected Acute Coronary Syndrome (ACS / Myocardial Ischemia)",
        rationale: "Patient exhibits high-risk chest symptoms (heavy pressure, left arm/jaw radiation, or acute diaphoresis/dyspnea). Immediate ECG and triage required.",
        severity: "emergency_code_red"
      });
    }
    return flags;
  }
};

// ============================================================================
// 2. ABDOMINAL PAIN PATHWAY
// ============================================================================
export const abdominalPainPathway: ComplaintPathway = {
  complaintKey: "abdominal_pain",
  titleHi: "पेट में दर्द या मरोड़",
  titleEn: "Abdominal Pain & Cramping",
  canonicalName: "Abdominal Pain",
  mandatoryFields: ["location", "duration", "onset", "character", "aggravatingFactors"],
  optionalFields: ["associatedSymptoms", "relievingFactors", "pastMedicalHistory"],
  firstQuestionId: "ap_location",
  questions: {
    ap_location: {
      id: "ap_location",
      field: "location",
      promptHi: "दर्द पेट के किस हिस्से में सबसे ज्यादा है?",
      promptEn: "Where in your stomach is the pain most intense?",
      audioPromptText: "Dard pet ke kis hisse mein sabse zyada hai?",
      choices: [
        { id: "loc_upper", labelHi: "ऊपरी हिस्से में (छाती के ठीक नीचे / बीच में)", labelEn: "Upper abdomen / Epigastric", extractedValue: { location: "Upper abdomen (Epigastrium)" } },
        { id: "loc_lower", labelHi: "निचले हिस्से या पेडू में", labelEn: "Lower abdomen / Pelvic", extractedValue: { location: "Lower abdomen (Hypogastrium/Pelvic)" } },
        { id: "loc_right_lower", labelHi: "दाहिनी तरफ नीचे (Right Lower Side)", labelEn: "Right lower abdomen", extractedValue: { location: "Right Lower Quadrant (RLQ)" }, isRedFlagTrigger: true, redFlagReason: "Right Lower Quadrant tenderness can indicate acute appendicitis." },
        { id: "loc_diffuse", labelHi: "पूरे पेट में फैला हुआ", labelEn: "All over the abdomen (Diffuse)", extractedValue: { location: "Generalized diffuse abdomen" } }
      ]
    },
    ap_duration: {
      id: "ap_duration",
      field: "duration",
      promptHi: "यह दर्द कितने समय से हो रहा है?",
      promptEn: "How long has this pain been present?",
      audioPromptText: "Yeh dard kitne samay se ho raha hai?",
      choices: [
        { id: "dur_acute_hours", labelHi: "आज अचानक शुरू हुआ (कुछ घंटे)", labelEn: "Started suddenly today (few hours)", extractedValue: { duration: "<12 hours", onset: "Acute sudden" } },
        { id: "dur_days", labelHi: "पिछले 2-4 दिनों से", labelEn: "Past 2-4 days (e.g. 3 days)", extractedValue: { duration: "3 days", onset: "Subacute" } },
        { id: "dur_chronic", labelHi: "महीनों से बीच-बीच में होता है", labelEn: "Chronic / Intermittent for months", extractedValue: { duration: "Chronic recurring", onset: "Intermittent" } }
      ]
    },
    ap_food_relation: {
      id: "ap_food_relation",
      field: "aggravatingFactors",
      promptHi: "क्या खाना खाने से दर्द में कोई फर्क पड़ता है?",
      promptEn: "Does eating food change the pain?",
      audioPromptText: "Kya khana khane se dard mein koi fark padta hai?",
      choices: [
        { id: "food_aggravates", labelHi: "खाना खाते ही दर्द बढ़ जाता है", labelEn: "Worsens immediately after meals", extractedValue: { aggravatingFactors: ["Postprandial (worse after eating)"] } },
        { id: "food_relieves", labelHi: "खाली पेट ज्यादा होता है, खाने पर आराम मिलता है", labelEn: "Worse on empty stomach, relieved by food", extractedValue: { aggravatingFactors: ["Fasting / Empty stomach"], relievingFactors: ["Eating food / Milk"] } },
        { id: "food_no_change", labelHi: "खाने से कोई लेना-देना नहीं", labelEn: "No relation to food", extractedValue: { aggravatingFactors: ["None identified"] } }
      ]
    },
    ap_associated: {
      id: "ap_associated",
      field: "associatedSymptoms",
      promptHi: "क्या आपको इनमें से कोई अन्य समस्या भी है?",
      promptEn: "Do you have any of these associated symptoms?",
      audioPromptText: "Kya aapko inmein se koi anya samasya bhi hai?",
      choices: [
        { id: "assoc_vomiting_fever", labelHi: "उल्टी, दस्त या साथ में बुखार", labelEn: "Vomiting, diarrhea, or fever", extractedValue: { associatedSymptoms: ["Nausea / Vomiting", "Fever"] } },
        { id: "assoc_blood", labelHi: "उल्टी में खून या काले रंग का मल", labelEn: "Blood in vomit or dark black stools", extractedValue: { associatedSymptoms: ["Hematemesis / Melena (GI Bleed)"] }, isRedFlagTrigger: true, redFlagReason: "Gastrointestinal bleeding signs require urgent clinical stabilization." },
        { id: "assoc_acidity", labelHi: "खट्टी डकारें, गैस और पेट फूलना", labelEn: "Sour belching, gas, or bloating", extractedValue: { associatedSymptoms: ["Dyspepsia", "Flatulence"] } },
        { id: "assoc_none", labelHi: "कोई अन्य लक्षण नहीं", labelEn: "None", extractedValue: { associatedSymptoms: ["None reported"] } }
      ]
    }
  },
  getNextQuestionId: (history, currentId) => {
    const questionSequence = ["ap_location", "ap_duration", "ap_food_relation", "ap_associated"];
    const fieldMap: Record<string, keyof typeof history> = {
      ap_location: "location",
      ap_duration: "duration",
      ap_food_relation: "aggravatingFactors",
      ap_associated: "associatedSymptoms"
    };

    const currentIndex = questionSequence.indexOf(currentId);
    for (let i = currentIndex + 1; i < questionSequence.length; i++) {
      const qId = questionSequence[i];
      const field = fieldMap[qId];
      const val = history[field];
      const isMissing = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
      if (isMissing) return qId;
    }
    return null;
  },
  checkRedFlags: (history) => {
    const flags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }> = [];
    if (history.associatedSymptoms?.some(s => s.toLowerCase().includes("gi bleed") || s.toLowerCase().includes("blood"))) {
      flags.push({
        condition: "Acute Gastrointestinal Bleeding",
        rationale: "Patient reports blood in vomit or melena (black tarry stool). Requires urgent hemodynamic check and IV access.",
        severity: "emergency_code_red"
      });
    }
    if (history.location?.includes("Right Lower Quadrant") && (history.associatedSymptoms?.includes("Fever") || history.onset?.includes("Acute"))) {
      flags.push({
        condition: "Suspected Acute Appendicitis",
        rationale: "Right lower quadrant pain with acute onset and fever indicates surgical abdomen risk.",
        severity: "urgent_amber"
      });
    }
    return flags;
  }
};

// ============================================================================
// 3. HEADACHE PATHWAY
// ============================================================================
export const headachePathway: ComplaintPathway = {
  complaintKey: "headache",
  titleHi: "सिरदर्द / माइग्रेन",
  titleEn: "Headache & Migraine",
  canonicalName: "Headache",
  mandatoryFields: ["location", "duration", "onset", "character", "severity"],
  optionalFields: ["associatedSymptoms", "aggravatingFactors", "relievingFactors"],
  firstQuestionId: "ha_onset",
  questions: {
    ha_onset: {
      id: "ha_onset",
      field: "onset",
      promptHi: "सिरदर्द की शुरुआत कैसे हुई?",
      promptEn: "How did this headache start?",
      audioPromptText: "Sirdard ki shuruat kaise hui?",
      choices: [
        { id: "ha_thunderclap", labelHi: "अचानक बिजली की तरह तेज (जिंदगी का सबसे भयानक दर्द)", labelEn: "Sudden thunderclap (Worst headache of life)", extractedValue: { onset: "Sudden thunderclap (peak in seconds)", severity: 10 }, isRedFlagTrigger: true, redFlagReason: "Thunderclap headache can indicate subarachnoid hemorrhage or aneurysm." },
        { id: "ha_gradual", labelHi: "धीरे-धीरे बढ़ा और लगातार बना हुआ है", labelEn: "Gradual onset, steady ache", extractedValue: { onset: "Gradual onset" } },
        { id: "ha_recurrent", labelHi: "अक्सर होता रहता है (महीनों/सालों से)", labelEn: "Recurrent periodic attacks", extractedValue: { onset: "Recurrent periodic" } }
      ]
    },
    ha_character: {
      id: "ha_character",
      field: "character",
      promptHi: "दर्द किस प्रकार का है और सिर में कहाँ है?",
      promptEn: "What type of headache is it and where is it located?",
      audioPromptText: "Dard kis prakar ka hai aur kahan hai?",
      choices: [
        { id: "char_throbbing_one_side", labelHi: "आधे सिर में धक-धक करने वाला (धड़कता हुआ)", labelEn: "One-sided, throbbing / pulsating", extractedValue: { location: "Unilateral (one side)", character: "Pulsating / Throbbing" } },
        { id: "char_tight_band", labelHi: "पूरे सिर में कसाव या भारी पट्टी जैसा", labelEn: "Tight band-like pressure across head", extractedValue: { location: "Bilateral frontal-occipital", character: "Tight band-like pressing" } },
        { id: "char_back_neck", labelHi: "सिर के पीछे और गर्दन में दर्द", labelEn: "Back of head extending into neck", extractedValue: { location: "Occipital and posterior cervical", character: "Stiff dull ache" } }
      ]
    },
    ha_associated: {
      id: "ha_associated",
      field: "associatedSymptoms",
      promptHi: "क्या सिरदर्द के साथ इनमें से कोई लक्षण हैं?",
      promptEn: "Do you have any of these accompanying symptoms?",
      audioPromptText: "Kya sirdard ke saath inmein se koi lakshan hain?",
      choices: [
        { id: "assoc_neuro_stiff", labelHi: "गर्दन में अकड़न, तेज बुखार या देखने/बोलने में दिक्कत", labelEn: "Stiff neck, high fever, or vision/speech trouble", extractedValue: { associatedSymptoms: ["Neck rigidity", "Neurological deficit / Visual blurring"] }, isRedFlagTrigger: true, redFlagReason: "Meningeal signs or acute focal neurological deficits require emergency evaluation." },
        { id: "assoc_light_nausea", labelHi: "रोशनी/आवाज़ से चिढ़ और उल्टी जैसा लगना", labelEn: "Sensitivity to light/sound (Photophobia) & nausea", extractedValue: { associatedSymptoms: ["Photophobia", "Phonophobia", "Nausea"] } },
        { id: "assoc_none", labelHi: "कोई अन्य लक्षण नहीं", labelEn: "None", extractedValue: { associatedSymptoms: ["None reported"] } }
      ]
    }
  },
  getNextQuestionId: (history, currentId) => {
    const questionSequence = ["ha_onset", "ha_character", "ha_associated"];
    const fieldMap: Record<string, keyof typeof history> = {
      ha_onset: "onset",
      ha_character: "character",
      ha_associated: "associatedSymptoms"
    };

    const currentIndex = questionSequence.indexOf(currentId);
    for (let i = currentIndex + 1; i < questionSequence.length; i++) {
      const qId = questionSequence[i];
      const field = fieldMap[qId];
      const val = history[field];
      const isMissing = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
      if (isMissing) return qId;
    }
    return null;
  },
  checkRedFlags: (history) => {
    const flags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }> = [];
    if (history.onset?.toLowerCase().includes("thunderclap") || (history.severity === 10 && history.onset?.includes("Sudden"))) {
      flags.push({
        condition: "Suspected Subarachnoid Hemorrhage / Thunderclap Headache",
        rationale: "Sudden instantaneous peak of maximal intensity headache is a neurological emergency.",
        severity: "emergency_code_red"
      });
    }
    if (history.associatedSymptoms?.some(s => s.toLowerCase().includes("neck rigidity") || s.toLowerCase().includes("neurological"))) {
      flags.push({
        condition: "Suspected Meningitis or Acute Central Nervous System Pathology",
        rationale: "Headache accompanied by neck stiffness or focal deficits requires urgent CSF/neuro imaging review.",
        severity: "emergency_code_red"
      });
    }
    return flags;
  }
};

// ============================================================================
// 4. FEVER PATHWAY
// ============================================================================
export const feverPathway: ComplaintPathway = {
  complaintKey: "fever",
  titleHi: "बुखार एवं कंपकंपी",
  titleEn: "Fever & Chills",
  canonicalName: "Fever",
  mandatoryFields: ["duration", "onset", "severity", "associatedSymptoms"],
  optionalFields: ["aggravatingFactors", "relievingFactors", "pastMedicalHistory"],
  firstQuestionId: "fv_duration",
  questions: {
    fv_duration: {
      id: "fv_duration",
      field: "duration",
      promptHi: "बुखार कितने दिनों से आ रहा है?",
      promptEn: "How many days have you had fever?",
      audioPromptText: "Bukhar kitne dino se aa raha hai?",
      choices: [
        { id: "dur_1_3_days", labelHi: "पिछले 1-3 दिनों से", labelEn: "Past 1-3 days", extractedValue: { duration: "1-3 days", onset: "Acute" } },
        { id: "dur_week", labelHi: "लगभग 1 हफ्ते से", labelEn: "Around 1 week (5-7 days)", extractedValue: { duration: "5-7 days", onset: "Subacute" } },
        { id: "dur_chronic_fever", labelHi: "2 हफ्ते या उससे ज्यादा समय से", labelEn: ">2 weeks (Prolonged pyrexia)", extractedValue: { duration: ">2 weeks", onset: "Prolonged / Pyrexia of Unknown Origin" } }
      ]
    },
    fv_pattern: {
      id: "fv_pattern",
      field: "character",
      promptHi: "बुखार किस समय और किस तरह चढ़ता है?",
      promptEn: "What is the pattern of the fever?",
      audioPromptText: "Bukhar kis samay aur kis tarah chadhta hai?",
      choices: [
        { id: "pat_chills_rigor", labelHi: "कंपकंपी (ठंड) लगकर तेज बुखार चढ़ता है", labelEn: "High spike with chills & rigors", extractedValue: { character: "High grade with chills and rigors" } },
        { id: "pat_continuous", labelHi: "लगातार बना रहता है, दवा से भी कम नहीं होता", labelEn: "Continuous high fever with little relief", extractedValue: { character: "Continuous high grade" } },
        { id: "pat_evening_rise", labelHi: "शाम के समय हल्का बुखार और रात में पसीना", labelEn: "Low grade evening rise with night sweats", extractedValue: { character: "Evening rise with night sweats" } }
      ]
    },
    fv_associated: {
      id: "fv_associated",
      field: "associatedSymptoms",
      promptHi: "क्या बुखार के साथ इनमें से कोई समस्या है?",
      promptEn: "Do you have any of these symptoms alongside the fever?",
      audioPromptText: "Kya bukhar ke saath inmein se koi samasya hai?",
      choices: [
        { id: "assoc_rash_drowsy", labelHi: "शरीर पर लाल चकत्ते (दाने) या अत्यधिक सुस्ती/बेहोशी", labelEn: "Petechial rash, confusion, or extreme drowsiness", extractedValue: { associatedSymptoms: ["Petechial rash", "Altered sensorium / Lethargy"] }, isRedFlagTrigger: true, redFlagReason: "Fever with altered sensorium or purpuric rash suggests septicemia or severe dengue." },
        { id: "assoc_cough_cold", labelHi: "खांसी, जुकाम या गले में खराश", labelEn: "Cough, runny nose, or sore throat", extractedValue: { associatedSymptoms: ["Cough", "Coryza", "Pharyngitis"] } },
        { id: "assoc_urinary", labelHi: "पेशाब में जलन या बार-बार पेशाब आना", labelEn: "Burning micturition / Dysuria", extractedValue: { associatedSymptoms: ["Dysuria (Urinary tract symptoms)"] } },
        { id: "assoc_bodyache", labelHi: "हाथ-पैरों और जोड़ों में तेज दर्द", labelEn: "Severe bodyache and joint pain", extractedValue: { associatedSymptoms: ["Severe myalgia and arthralgia"] } }
      ]
    }
  },
  getNextQuestionId: (history, currentId) => {
    const questionSequence = ["fv_duration", "fv_pattern", "fv_associated"];
    const fieldMap: Record<string, keyof typeof history> = {
      fv_duration: "duration",
      fv_pattern: "character",
      fv_associated: "associatedSymptoms"
    };

    const currentIndex = questionSequence.indexOf(currentId);
    for (let i = currentIndex + 1; i < questionSequence.length; i++) {
      const qId = questionSequence[i];
      const field = fieldMap[qId];
      const val = history[field];
      const isMissing = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
      if (isMissing) return qId;
    }
    return null;
  },
  checkRedFlags: (history) => {
    const flags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }> = [];
    if (history.associatedSymptoms?.some(s => s.toLowerCase().includes("sensorium") || s.toLowerCase().includes("rash"))) {
      flags.push({
        condition: "High-Risk Febrile Syndrome / Suspected Sepsis or Severe Dengue",
        rationale: "Fever with altered sensorium, petechial rash, or severe lethargy requires urgent blood counts and triage monitoring.",
        severity: "emergency_code_red"
      });
    }
    return flags;
  }
};

// ============================================================================
// 5. COUGH PATHWAY
// ============================================================================
export const coughPathway: ComplaintPathway = {
  complaintKey: "cough",
  titleHi: "खांसी एवं सांस की तकलीफ",
  titleEn: "Cough & Respiratory Distress",
  canonicalName: "Cough",
  mandatoryFields: ["duration", "character", "associatedSymptoms"],
  optionalFields: ["aggravatingFactors", "relievingFactors", "pastMedicalHistory"],
  firstQuestionId: "cg_type",
  questions: {
    cg_type: {
      id: "cg_type",
      field: "character",
      promptHi: "खांसी किस प्रकार की है?",
      promptEn: "What kind of cough do you have?",
      audioPromptText: "Khasi kis prakar ki hai?",
      choices: [
        { id: "type_dry", labelHi: "सूखी खांसी (कफ नहीं निकलता)", labelEn: "Dry irritating cough (No phlegm)", extractedValue: { character: "Dry hacking, non-productive" } },
        { id: "type_wet_phlegm", labelHi: "कफ वाली (बलगम निकलता है)", labelEn: "Wet / Productive with phlegm", extractedValue: { character: "Productive with sputum" } },
        { id: "type_blood_streaked", labelHi: "बलगम में खून आता है", labelEn: "Blood in sputum (Hemoptysis)", extractedValue: { character: "Hemoptysis (Blood in sputum)" }, isRedFlagTrigger: true, redFlagReason: "Hemoptysis is an immediate red-flag requiring evaluation for TB, malignancy, or PE." }
      ]
    },
    cg_duration: {
      id: "cg_duration",
      field: "duration",
      promptHi: "खांसी कितने समय से चल रही है?",
      promptEn: "How long have you had this cough?",
      audioPromptText: "Khasi kitne samay se chal rahi hai?",
      choices: [
        { id: "dur_less_2w", labelHi: "2 हफ्ते से कम समय से", labelEn: "Less than 2 weeks", extractedValue: { duration: "<2 weeks", onset: "Acute" } },
        { id: "dur_2_4w", labelHi: "2 से 4 हफ्ते (लंबे समय से)", labelEn: "2 to 4 weeks", extractedValue: { duration: "2-4 weeks", onset: "Subacute" } },
        { id: "dur_chronic_cough", labelHi: "1 महीने से भी ज्यादा समय से", labelEn: "More than 1 month (Chronic)", extractedValue: { duration: ">4 weeks", onset: "Chronic" } }
      ]
    },
    cg_associated: {
      id: "cg_associated",
      field: "associatedSymptoms",
      promptHi: "क्या खांसी के साथ इनमें से कोई समस्या है?",
      promptEn: "Do you have any of these associated respiratory signs?",
      audioPromptText: "Kya khasi ke saath koi anya samasya hai?",
      choices: [
        { id: "assoc_dyspnea_stridor", labelHi: "सांस लेने में सीटी की आवाज (घरघराहट) या बहुत सांस फूलना", labelEn: "Wheezing / Stridor or severe breathlessness", extractedValue: { associatedSymptoms: ["Wheezing / Stridor", "Severe Dyspnea"] }, isRedFlagTrigger: true, redFlagReason: "Severe dyspnea with stridor or wheeze indicates acute bronchospasm / respiratory failure." },
        { id: "assoc_fever_weight_loss", labelHi: "बुखार और वजन घटना / भूख न लगना", labelEn: "Fever and noticeable weight loss", extractedValue: { associatedSymptoms: ["Unintentional weight loss", "Low grade fever"] } },
        { id: "assoc_none", labelHi: "कोई अन्य लक्षण नहीं", labelEn: "None", extractedValue: { associatedSymptoms: ["None reported"] } }
      ]
    }
  },
  getNextQuestionId: (history, currentId) => {
    const questionSequence = ["cg_type", "cg_duration", "cg_associated"];
    const fieldMap: Record<string, keyof typeof history> = {
      cg_type: "character",
      cg_duration: "duration",
      cg_associated: "associatedSymptoms"
    };

    const currentIndex = questionSequence.indexOf(currentId);
    for (let i = currentIndex + 1; i < questionSequence.length; i++) {
      const qId = questionSequence[i];
      const field = fieldMap[qId];
      const val = history[field];
      const isMissing = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
      if (isMissing) return qId;
    }
    return null;
  },
  checkRedFlags: (history) => {
    const flags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }> = [];
    if (history.character?.toLowerCase().includes("blood") || history.character?.toLowerCase().includes("hemoptysis")) {
      flags.push({
        condition: "Hemoptysis / Suspected Pulmonary Lesion or Active TB",
        rationale: "Presence of blood in sputum warrants immediate chest radiography and sputum examination.",
        severity: "emergency_code_red"
      });
    }
    if (history.associatedSymptoms?.some(s => s.toLowerCase().includes("severe dyspnea") || s.toLowerCase().includes("stridor"))) {
      flags.push({
        condition: "Acute Respiratory Distress",
        rationale: "Severe dyspnea or stridor indicates airway compromise or severe asthma/COPD exacerbation.",
        severity: "emergency_code_red"
      });
    }
    return flags;
  }
};

// ============================================================================
// 6. BACK PAIN PATHWAY
// ============================================================================
export const backPainPathway: ComplaintPathway = {
  complaintKey: "back_pain",
  titleHi: "पीठ एवं कमर का दर्द",
  titleEn: "Back & Lumbar Pain",
  canonicalName: "Back Pain",
  mandatoryFields: ["location", "duration", "radiation", "severity"],
  optionalFields: ["character", "aggravatingFactors", "relievingFactors", "associatedSymptoms"],
  firstQuestionId: "bp_location",
  questions: {
    bp_location: {
      id: "bp_location",
      field: "location",
      promptHi: "पीठ में दर्द किस जगह पर है?",
      promptEn: "Where on your back is the pain located?",
      audioPromptText: "Peeth mein dard kis jagah par hai?",
      choices: [
        { id: "loc_lower_back", labelHi: "निचली कमर में (कमर के बीच या नीचे)", labelEn: "Lower back (Lumbar spine)", extractedValue: { location: "Lumbar / Lower back" } },
        { id: "loc_upper_back", labelHi: "ऊपरी पीठ या कंधों के बीच", labelEn: "Upper back / Thoracic", extractedValue: { location: "Thoracic / Upper back" } },
        { id: "loc_cervical", labelHi: "गर्दन और ऊपरी रीढ़ की हड्डी में", labelEn: "Neck & cervical spine", extractedValue: { location: "Cervical spine / Neck" } }
      ]
    },
    bp_radiation: {
      id: "bp_radiation",
      field: "radiation",
      promptHi: "क्या यह दर्द पैर या कूल्हों की तरफ नीचे जाता है?",
      promptEn: "Does the pain shoot down into your legs or buttocks?",
      audioPromptText: "Kya yeh dard pair ya koolhon ki taraf neeche jaata hai?",
      choices: [
        { id: "rad_down_leg", labelHi: "हाँ, एक या दोनों पैरों में घुटने/पंजे तक जाता है (सायटिका)", labelEn: "Yes, radiates down the leg past the knee (Sciatica)", extractedValue: { radiation: "Radiating down lower extremity (Radiculopathy/Sciatica)" } },
        { id: "rad_buttock_only", labelHi: "केवल कूल्हों तक जाता है", labelEn: "Extends to buttocks only", extractedValue: { radiation: "Radiation to gluteal region" } },
        { id: "rad_no_leg", labelHi: "नहीं, केवल कमर तक ही सीमित है", labelEn: "No, confined to back only", extractedValue: { radiation: "None (localized back pain)" } }
      ]
    },
    bp_redflags: {
      id: "bp_redflags",
      field: "associatedSymptoms",
      promptHi: "क्या आपको इनमें से कोई गंभीर समस्या महसूस हुई है?",
      promptEn: "Have you noticed any of these critical symptoms?",
      audioPromptText: "Kya aapko inmein se koi gambhir samasya mehsoos hui hai?",
      choices: [
        { id: "assoc_cauda_equina", labelHi: "पेशाब/शौच पर नियंत्रण खोना या दोनों पैरों में कमजोरी/सुन्नपन", labelEn: "Loss of bowel/bladder control or progressive leg weakness", extractedValue: { associatedSymptoms: ["Loss of bowel/bladder control", "Bilateral lower limb motor weakness"] }, isRedFlagTrigger: true, redFlagReason: "Cauda equina syndrome is a surgical orthopedic/neurosurgical emergency." },
        { id: "assoc_stiffness_morning", labelHi: "सुबह उठने पर कमर में तेज अकड़न", labelEn: "Severe morning stiffness lasting >45 minutes", extractedValue: { associatedSymptoms: ["Morning stiffness (suggestive of Spondyloarthritis)"] } },
        { id: "assoc_bp_none", labelHi: "इनमें से कोई नहीं", labelEn: "None of these", extractedValue: { associatedSymptoms: ["None reported"] } }
      ]
    }
  },
  getNextQuestionId: (history, currentId) => {
    const questionSequence = ["bp_location", "bp_radiation", "bp_redflags"];
    const fieldMap: Record<string, keyof typeof history> = {
      bp_location: "location",
      bp_radiation: "radiation",
      bp_redflags: "associatedSymptoms"
    };

    const currentIndex = questionSequence.indexOf(currentId);
    for (let i = currentIndex + 1; i < questionSequence.length; i++) {
      const qId = questionSequence[i];
      const field = fieldMap[qId];
      const val = history[field];
      const isMissing = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
      if (isMissing) return qId;
    }
    return null;
  },
  checkRedFlags: (history) => {
    const flags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }> = [];
    if (history.associatedSymptoms?.some(s => s.toLowerCase().includes("bowel/bladder") || s.toLowerCase().includes("motor weakness"))) {
      flags.push({
        condition: "Suspected Cauda Equina Syndrome / Severe Spinal Cord Compression",
        rationale: "Back pain accompanied by loss of sphincter control or progressive bilateral weakness is a surgical emergency.",
        severity: "emergency_code_red"
      });
    }
    return flags;
  }
};

export const CLINICAL_PATHWAYS: Record<string, ComplaintPathway> = {
  "chest_pain": chestPainPathway,
  "chest_heart_lungs": chestPainPathway,
  "abdominal_pain": abdominalPainPathway,
  "stomach_abdomen": abdominalPainPathway,
  "headache": headachePathway,
  "head_brain": headachePathway,
  "fever": feverPathway,
  "fever_vitals": feverPathway,
  "cough": coughPathway,
  "throat_neck": coughPathway,
  "back_pain": backPainPathway,
  "spine_back": backPainPathway
};

export function resolvePathway(complaintKey: string): ComplaintPathway {
  return CLINICAL_PATHWAYS[complaintKey] || abdominalPainPathway;
}
