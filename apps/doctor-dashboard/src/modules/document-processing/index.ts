import { MedicalDocument } from "../../models";

export class DocumentProcessingModule {
  public static createDocumentRecord(patientId: string, sessionId: string, type: MedicalDocument["documentType"]): MedicalDocument {
    return {
      id: `doc-${Date.now()}`,
      patientId,
      sessionId,
      documentType: type,
      uploadedAt: Date.now(),
      status: "completed",
      ocrEngine: "Gemini-1.5-Flash-Vision",
      confidenceScore: 0.94
    };
  }
}
