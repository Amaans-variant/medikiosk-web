import { ExtractedMedicalEntity } from "../../models";

export interface MockOcrExtractionResult {
  medications: ExtractedMedicalEntity[];
  labValues: ExtractedMedicalEntity[];
  confidence: number;
}

export class DocumentOcrService {
  public static extractEntitiesFromDocument(docId: string = "doc-default"): MockOcrExtractionResult {
    const medications: ExtractedMedicalEntity[] = [
      {
        id: `med-${Date.now()}-1`,
        documentId: docId,
        category: "medication",
        name: "Metformin",
        dosage: "500mg",
        frequency: "BD",
        route: "Oral",
        note: "with meals",
        confidence: 0.94,
        isVerifiedByDoctor: false
      },
      {
        id: `med-${Date.now()}-2`,
        documentId: docId,
        category: "medication",
        name: "Aspirin",
        dosage: "75mg",
        frequency: "OD",
        route: "Oral",
        note: "post lunch",
        confidence: 0.91,
        isVerifiedByDoctor: false
      },
      {
        id: `med-${Date.now()}-3`,
        documentId: docId,
        category: "medication",
        name: "Sutshekhar Ras",
        dosage: "125mg",
        frequency: "BD",
        route: "Oral",
        note: "Ayurvedic with honey",
        confidence: 0.88,
        isVerifiedByDoctor: false
      }
    ];

    const labValues: ExtractedMedicalEntity[] = [
      {
        id: `lab-${Date.now()}-1`,
        documentId: docId,
        category: "lab_biomarker",
        name: "HbA1c",
        value: "8.4%",
        referenceRange: "4.0 – 5.6%",
        abnormalFlag: "high",
        confidence: 0.98,
        isVerifiedByDoctor: false
      },
      {
        id: `lab-${Date.now()}-2`,
        documentId: docId,
        category: "lab_biomarker",
        name: "Fasting Blood Sugar",
        value: "162 mg/dL",
        referenceRange: "70 – 100 mg/dL",
        abnormalFlag: "high",
        confidence: 0.96,
        isVerifiedByDoctor: false
      },
      {
        id: `lab-${Date.now()}-3`,
        documentId: docId,
        category: "lab_biomarker",
        name: "Serum Bilirubin",
        value: "1.4 mg/dL",
        referenceRange: "0.2 – 1.2 mg/dL",
        abnormalFlag: "high",
        confidence: 0.92,
        isVerifiedByDoctor: false
      }
    ];

    return {
      medications,
      labValues,
      confidence: 0.93
    };
  }
}
