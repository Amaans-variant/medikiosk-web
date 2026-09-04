import { Complaint, AyushAssessment, ExtractedMedicalEntity, ClinicalSummary, RedFlag } from "../../models";

export interface SummarizeClinicalIntakeParams {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    abhaId?: string;
  };
  sessionId: string;
  tokenNumber: number;
  complaints: Complaint[];
  ayushAssessment?: AyushAssessment;
  medications: ExtractedMedicalEntity[];
  labs: ExtractedMedicalEntity[];
  redFlags: RedFlag[];
  assignedRoom: string;
  assignedDepartment: string;
  estimatedWaitMinutes: number;
}

export class ClinicalAiService {
  /**
   * Generates a structured clinical summary draft.
   * COMPLIANCE: ALWAYS marked as isAiDraft: true until approved by physician.
   */
  public static generateDraftSummary(params: SummarizeClinicalIntakeParams): ClinicalSummary {
    const complaintSummary = params.complaints.map(c => 
      `${c.labelHi} (${c.labelEn}) - Severity ${c.severity}/10, Duration: ${c.duration || "acute onset"}`
    ).join("; ");

    const associated = params.complaints
      .flatMap(c => c.associatedSymptoms || [])
      .filter(Boolean)
      .join(", ");

    const ayushText = params.ayushAssessment 
      ? `Ayurvedic Pariksha indicates ${params.ayushAssessment.prakriti} constitution with ${params.ayushAssessment.agni} and ${params.ayushAssessment.bala}.`
      : "";

    const hpi = `Patient presents with ${complaintSummary}. ` +
      (associated ? `Associated symptoms reported: ${associated}. ` : "") +
      ayushText;

    return {
      id: `sum-${Date.now()}`,
      patientId: params.patient.id,
      sessionId: params.sessionId,
      tokenNumber: params.tokenNumber,
      assignedRoom: params.assignedRoom,
      assignedDepartment: params.assignedDepartment,
      estimatedWaitMinutes: params.estimatedWaitMinutes,
      hpiNarrative: hpi,
      chiefComplaints: params.complaints,
      extractedMedications: params.medications,
      flaggedLabs: params.labs,
      ayushSummary: params.ayushAssessment,
      redFlags: params.redFlags,
      
      // CRITICAL AI GOVERNANCE REQUIREMENT
      isAiDraft: true,
      aiDisclaimer: "AI-Assisted Pre-Consultation Intake Draft — Not a clinical diagnosis. Final clinical evaluation remains exclusively with the consulting physician.",
      status: "ai_draft",
      createdAt: Date.now()
    };
  }

  /**
   * Adaptive Follow-Up Question Generator
   */
  public static getAdaptiveQuestions(regionId: string): Array<{ questionHi: string; questionEn: string; options: string[] }> {
    switch (regionId) {
      case "chest_heart_lungs":
        return [
          {
            questionHi: "Kya dard baayein haath ya jabde ki taraf jaata hai?",
            questionEn: "Does pain radiate to the left arm or jaw?",
            options: ["Haan (Yes)", "Nahi (No)"]
          },
          {
            questionHi: "Kya saans lene mein takleef ho rahi hai?",
            questionEn: "Are you feeling shortness of breath?",
            options: ["Haan, zyada (Yes, severe)", "Thoda sa (Mild)", "Bilkul nahi (None)"]
          }
        ];
      case "stomach_abdomen":
        return [
          {
            questionHi: "Kya khana khane ke baad dard badhta hai?",
            questionEn: "Does pain increase after meals?",
            options: ["Haan (Yes)", "Nahi (No)", "Khaali pet hota hai (On empty stomach)"]
          }
        ];
      default:
        return [
          {
            questionHi: "Yeh dard kitne samay se ho raha hai?",
            questionEn: "How long have you had this symptom?",
            options: ["Aaj se (Today)", "2-3 Dino se (2-3 Days)", "Ek hafte se zyada (>1 Week)"]
          }
        ];
    }
  }
}
