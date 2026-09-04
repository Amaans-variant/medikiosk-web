import { Consent, ConsentScope } from "../../models";

export class ConsentPrivacyModule {
  public static recordConsent(patientId: string, sessionId: string, scope?: Partial<ConsentScope>): Consent {
    return {
      id: `cns-${Date.now()}`,
      patientId,
      sessionId,
      scope: {
        intakeHistory: true,
        documentOcr: true,
        physicianSharing: true,
        abdmRecordLinkage: scope?.abdmRecordLinkage ?? true
      },
      language: "hi",
      audioConsentVerified: true,
      grantedAt: Date.now(),
      kioskId: "KIOSK-AIIA-OPD-01"
    };
  }

  public static purgeLocalBuffer() {
    // Purges temporary biometric and OCR scratch memory
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
  }
}
