import { DocumentOcrService } from "../../services/ocr/documentOcrService";
import { ExtractedMedicalEntity } from "../../models";

export class EntityExtractionModule {
  public static extractFromDocument(docId: string): { medications: ExtractedMedicalEntity[]; labs: ExtractedMedicalEntity[] } {
    const res = DocumentOcrService.processDocument({
      documentId: docId,
      hasPhysicalDocument: true,
      demoMode: true
    });
    return {
      medications: res.accumulatedMedications,
      labs: res.accumulatedLabValues
    };
  }
}
