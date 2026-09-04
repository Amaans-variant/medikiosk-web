import { Patient, Session } from "../../models";

export class PatientIntakeModule {
  public static createSession(patient: Partial<Patient>, language: string = "hi"): { patient: Patient; session: Session } {
    const patientRecord: Patient = {
      id: patient.id || `pt-${Date.now()}`,
      name: patient.name || "Walk-in Patient",
      age: patient.age || 40,
      gender: patient.gender || "M",
      abhaId: patient.abhaId,
      mobile: patient.mobile || "+91 98000 00000",
      registeredAt: Date.now()
    };

    const sessionRecord: Session = {
      id: `sess-${Date.now()}`,
      patientId: patientRecord.id,
      kioskId: "KIOSK-AIIA-OPD-01",
      language,
      status: "active",
      currentStep: 1,
      startedAt: Date.now()
    };

    return { patient: patientRecord, session: sessionRecord };
  }
}
