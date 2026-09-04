import { AyushAssessment } from "../models";

export const PRAKRITI_PROFILES: Record<string, { dosha: string; traits: string; diet: string }> = {
  "Vata": {
    dosha: "Vata (Air + Ether)",
    traits: "Light, dry, mobile, quick digestion, prone to joint stiffness and insomnia",
    diet: "Warm, nourishing, grounding foods with unctuous sneha (ghee/oils)"
  },
  "Pitta": {
    dosha: "Pitta (Fire + Water)",
    traits: "Sharp, hot, intense, strong metabolic fire (Tikshnagni), prone to acidity",
    diet: "Cooling, sweet, bitter, astringent foods; avoid excessive sour and spicy"
  },
  "Kapha": {
    dosha: "Kapha (Water + Earth)",
    traits: "Heavy, cool, stable, slow metabolism (Mandagni), strong vital endurance",
    diet: "Light, dry, warm, pungent, bitter, and astringent foods"
  },
  "Vata-Pitta": {
    dosha: "Vata-Pitta (Dual)",
    traits: "Variable metabolism with sensitivity to heat and irregular digestion",
    diet: "Moderately warming, easy to digest balanced diet"
  }
};

export function determineAyushProfile(prakritiInput: string): AyushAssessment {
  const profileKey = Object.keys(PRAKRITI_PROFILES).find(k => prakritiInput.includes(k)) || "Vata-Pitta";
  const agni = profileKey.includes("Pitta") ? "Tikshnagni (Hyperactive)" : profileKey.includes("Kapha") ? "Mandagni (Hypoactive)" : "Vishamagni (Irregular)";
  
  return {
    prakriti: profileKey,
    agni,
    bala: "Madhyama (Medium Vitality)",
    koshtha: profileKey.includes("Pitta") ? "Mridu (Soft/Fast)" : profileKey.includes("Vata") ? "Krura (Constipated/Hard)" : "Madhyama (Balanced)",
    aharaShakti: "Madhyama",
    vyayamaShakti: "Madhyama"
  };
}
