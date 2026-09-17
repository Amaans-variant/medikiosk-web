/**
 * MediKiosk RAG knowledge base — seed content.
 *
 * These are GENERAL EDUCATIONAL REFERENCE SHEETS written for this product.
 * They are deliberately conservative: they describe common patterns and
 * red-flag signs that warrant medical review, and they never instruct the
 * user to self-diagnose or self-treat. The assistant always frames answers
 * as "general information" and points clinical decisions to the physician.
 */

const MODERN_VERSION = "2026.09.1";
const AYURVEDA_VERSION = "2026.09.1";

const modern = [
  {
    title: "Chest pain — signs that need urgent review",
    section: "Chest",
    content: `Chest pain has many possible causes, ranging from muscle strain and acid reflux to heart and lung conditions that need urgent attention.
Because some causes are serious, chest pain is always checked by a doctor at MediKiosk before the visit.
Signs that suggest the pain needs urgent medical attention include: pressure, squeezing, or heaviness in the center of the chest; pain spreading to the arm, shoulder, neck, jaw, or back; shortness of breath; sweating, nausea, or feeling faint at the same time; pain that wakes you from sleep; or chest pain during exertion.
Risk factors that make urgent review more important include age over 45, diabetes, high blood pressure, high cholesterol, smoking, or a family history of early heart disease.
Chest pain that is sharp, comes and goes with movement or deep breaths, or is reproduced by pressing on the area can be musculoskeletal, but a doctor still needs to confirm this.
Do not assume chest pain is harmless. If you have severe chest pain right now, seek emergency care immediately rather than waiting for a kiosk review.`,
  },
  {
    title: "Headache — red flags and common patterns",
    section: "Head",
    content: `Headache is one of the most common reasons for a consultation. Most headaches are benign, but a few patterns need urgent review.
Red flags for headache include: a sudden 'thunderclap' headache reaching maximum intensity within seconds; a new severe headache after age 50; headache with fever and a stiff neck; headache with confusion, weakness, numbness, trouble speaking, or vision loss; headache that steadily worsens over days; or a new headache after a head injury.
Common primary headache types include tension-type headache (pressure-like pain on both sides, often related to stress or posture) and migraine (often one-sided, throbbing, with nausea, light or sound sensitivity, sometimes visual aura).
Frequent or worsening headaches, headaches that change their pattern, or headaches that limit daily activity deserve a doctor's review to establish a diagnosis.
Overuse of pain relievers more than a few days a week can itself cause new headaches, which is another reason to speak with a doctor.`,
  },
  {
    title: "Fever in adults — general guidance",
    section: "General",
    content: `Fever is a symptom of many conditions, most often infections. In adults, a temperature around 38 degrees Celsius or higher is generally considered a fever.
Common causes include viral infections (colds, flu), bacterial infections (urinary, chest, throat), and, less commonly, inflammatory or other conditions.
Fever usually needs medical review if it is very high (above about 39.5 degrees), persists for more than three days, is accompanied by confusion, a stiff neck, a spreading rash, difficulty breathing, severe headache, or chest pain, or occurs in someone with a weakened immune system.
General supportive measures while awaiting review include rest, fluids, and comfort. A doctor should decide on the cause and any treatment.`,
  },
  {
    title: "Shortness of breath — general guidance",
    section: "Chest",
    content: `Shortness of breath (dyspnea) can be a normal response to exertion or a sign of a lung, heart, blood, or other condition that needs review.
Features that suggest urgent review include: breathlessness at rest or with minimal activity; breathlessness that is new or rapidly worsening; blue or pale lips or face; chest pain; waking up at night gasping for air; swelling of the ankles or legs; or an asthma attack that is not relieved by a reliever inhaler.
Common reviewable causes include asthma, infections such as bronchitis or pneumonia, anemia, anxiety-related hyperventilation, deconditioning, and heart or thyroid conditions.
If you feel acutely breathless right now, especially with chest pain or blue lips, seek emergency care immediately.`,
  },
  {
    title: "Abdominal pain — patterns that need review",
    section: "Abdomen",
    content: `Abdominal pain is common and usually related to the gut, but location and associated symptoms help a doctor decide how urgent it is.
Patterns that should be reviewed urgently include: severe pain localized to the lower right side (possible appendicitis); pain after a fall or blow to the abdomen; pain with a rigid or tender belly; vomiting blood or black tarry stools; yellowing of the skin or eyes; severe pain in an elderly person or a pregnant person; or pain with inability to pass urine.
Common reviewable causes include indigestion, gas, constipation, diarrhea, urinary infections, and menstrual pain.
A doctor uses the pain's location, timing, and associated symptoms to decide on the next step. Do not take strong painkillers before the review if the pain is severe or unusual, as they can mask important signs.`,
  },
  {
    title: "Dizziness and fainting — general guidance",
    section: "General",
    content: `Dizziness covers several sensations: lightheadedness, vertigo (the world spinning), unsteadiness, or near-fainting.
Fainting (syncope) that needs medical review includes fainting during exercise, with chest pain, or with a racing or irregular heartbeat; a first faint in an older adult; fainting while lying down; or fainting with a seizure-like episode or head injury.
Common reviewable causes include low blood pressure on standing, dehydration, anemia, inner-ear causes of vertigo such as BPPV, low blood sugar, medication effects, and anxiety.
General guidance while awaiting review: sit or lie down when dizzy, rise slowly, drink fluids, and avoid driving or operating machinery until a doctor confirms the cause.`,
  },
  {
    title: "Why your medication and allergy answers matter",
    section: "General",
    content: `The kiosk asks about current medicines and allergies because they change how safely a doctor can interpret your symptoms.
When you answer 'no' to a question, the record stores that as DENIED; when you are not sure, it stores UNKNOWN; when you choose not to answer, it stores DECLINED. All three are preserved in your record exactly as given — the system never fills in a guess.
Allergies matter most when they are to medicines you may be offered during care. If you are unsure about an old reaction, say so; the doctor can weigh the risk.
Never hide a medicine or supplement you take. Doctors need the full list to avoid interactions and to interpret tests correctly.`,
  },
  {
    title: "What the MediKiosk assistant will and will not do",
    section: "General",
    content: `The MediKiosk assistant is an information helper, not a doctor. It records what you tell it, answers general questions using reference material, and highlights signs that deserve a doctor's review.
It will never diagnose you, prescribe medicine, or tell you that you do not need to see a doctor. Every case is reviewed by a doctor, and safety flags are always escalated to them.
The assistant gives general information from two clearly separated reference sets: modern medicine guidance and Ayurvedic (AYUSH) educational material. When it quotes material, it says which set it came from.
If you are in immediate danger, or your symptoms are severe or rapidly worsening, call emergency services or go to the nearest emergency department instead of continuing with the kiosk.`,
  },
];

const ayurveda = [
  {
    title: "Dashavidha Pariksha — the eight observations",
    section: "Pariksha",
    content: `Dashavidha Pariksha is the classical Ayurvedic physical examination described in the Samhitas. It examines ten parameters in many texts and eight core observations in common practice.
Shabda is the voice: its strength, tone, and quality can suggest the state of the doshas.
Roop is the complexion and general appearance of the body, face, and eyes.
Sparsha is the feel of the skin and body on touch — warmth, dryness, oiliness, texture.
Purana is the age of the person, because the tendency of the doshas shifts across life stages.
Prakriti is the person's constitutional type, assessed from birth characteristics.
Vrikriti (also spelled Vritti) refers to the body's current habit and metabolic state, including appetite and digestion patterns.
Vikriti is the present imbalance of the doshas, assessed from signs and symptoms.
Sthana is the localisation of the problem: where in the body the complaint is felt.
These observations are recorded by the treating physician during the consultation. They describe constitutional and physical patterns; they do not replace modern clinical assessment.`,
  },
  {
    title: "Doshas — vata, pitta, kapha: basic features",
    section: "Foundations",
    content: `In Ayurveda, vata, pitta, and kapha (the three doshas) describe functional patterns of the body. They are educational concepts used in AYUSH practice, not substitutes for biomedical diagnosis.
Vata is associated with movement and air: qualities like light, dry, cold, and rough. When vata is aggravated, common patterns include restlessness, dry skin, constipation, gassiness, anxiety, and poor sleep.
Pitta is associated with transformation and fire: qualities like hot, sharp, and oily. Common pitta patterns include heartburn, irritation, strong appetite, and inflammatory or burning sensations.
Kapha is associated with structure and water: qualities like heavy, slow, and smooth. Common kapha patterns include heaviness, sluggish digestion, congestion, and tendency to retain weight.
Most people have a unique combination of all three. An Ayurvedic practitioner assesses the pattern through examination and questions; the balance described as 'prakriti' is the person's constitutional tendency.`,
  },
  {
    title: "Prakriti — understanding constitutional type",
    section: "Foundations",
    content: `Prakriti is the Ayurvedic concept of a person's inherent constitutional type, formed at conception and stable across life.
It is traditionally assessed from childhood features: body build, skin texture, appetite, digestion, temperament, and sleep pattern.
Prakriti is an educational and traditional framework. It helps structure lifestyle advice in AYUSH practice but does not predict disease and does not replace clinical examination.
In a MediKiosk consultation, the physician may record prakriti as one of the Dashavidha observations if assessed in person. The system never assigns a prakriti by itself.`,
  },
  {
    title: "Dinacharya — general daily routine practices",
    section: "Lifestyle",
    content: `Dinacharya is the Ayurvedic idea of a regular daily routine that supports the body's natural rhythms. The following are commonly described general practices, offered as educational information only.
Rising early, especially before mid-morning, is a widely recommended practice in Ayurvedic tradition.
Aiming for regular meal times, eating mindfully, and chewing thoroughly are emphasized across sources.
Warming foods and drinks are generally favored in Ayurvedic practice over very cold ones.
Gentle daily movement — walking, stretching, or yoga — is a common recommendation, matched to the person's capacity.
Going to sleep at a regular time and keeping a quiet evening routine are standard advice.
These practices complement, and never replace, the treatment plan a doctor recommends.`,
  },
  {
    title: "How Ayurvedic observations fit this consultation",
    section: "Practice",
    content: `MediKiosk supports integrated care: the same doctor reviews your biomedical intake and, if practiced, records Ayurvedic (AYUSH) observations in the same case record.
Ayurvedic observations are entered only by the physician during the consultation. They are marked with the provenance DOCTOR, and anything not assessed is left as NOT_ASSESSED — the system never infers dosha states from your answers.
The Ayurvedic section of your record is kept separate from the modern medicine section so that neither system of knowledge is blended or confused with the other.
Ayurvedic observations are context for the physician's holistic assessment. They do not diagnose disease and do not change urgent safety review: red-flag symptoms are always handled by the standard clinical pathway first.`,
  },
];

export const knowledgeDocuments = [
  ...modern.map((d) => ({
    corpus: "MODERN_MEDICINE",
    corpusVersion: MODERN_VERSION,
    title: d.title,
    source: "MediKiosk clinical education reference (general information; not a substitute for medical advice)",
    author: null,
    section: d.section,
    year: "2026",
    license: "internal-educational",
    language: "en",
    content: d.content,
    metadata: { kind: "modern-medicine" },
  })),
  ...ayurveda.map((d) => ({
    corpus: "AYURVEDA",
    corpusVersion: AYURVEDA_VERSION,
    title: d.title,
    source: "MediKiosk AYUSH education reference (traditional framework; educational only)",
    author: null,
    section: d.section,
    year: "2026",
    license: "internal-educational",
    language: "en",
    content: d.content,
    metadata: { kind: "ayurveda" },
  })),
];

export default knowledgeDocuments;
