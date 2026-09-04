import { DocumentOcrService } from "../../services/ocr/documentOcrService";
import { ExtractedMedicalEntity } from "../../models";

export class EntityExtractionModule {
  public static extractFromDocument(docId: string): { medications: ExtractedMedicalEntity[]; labs: ExtractedMedicalEntity[] } {
    const res = DocumentOcrService.extractEntitiesFromDocument(docId);
    return {
      medications: res.medications,
      labs: res.labValues
    };
  }
}
