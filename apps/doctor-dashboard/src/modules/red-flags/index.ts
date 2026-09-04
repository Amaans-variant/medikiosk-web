import { Complaint, RedFlag } from "../../models";
import { ControlledClinicalHistory } from "../history-engine/types";
import { ConfigurableRedFlagEngine, RedFlagRuleDefinition } from "./ruleEngine";
import { RedFlagAuditLogService } from "./auditLog";

export * from "./ruleEngine";
export * from "./auditLog";

const globalEngine = new ConfigurableRedFlagEngine();

export class RedFlagDetectionModule {
  public static getEngine(): ConfigurableRedFlagEngine {
    return globalEngine;
  }

  public static analyze(
    sessionId: string,
    complaints: Complaint[] = [],
    history?: Partial<ControlledClinicalHistory>,
    patientInfo?: { id: string; name?: string; token?: number }
  ): {
    hasEmergency: boolean;
    isEmergency: boolean;
    redFlags: RedFlag[];
    triggeredRules: RedFlagRuleDefinition[];
    detectedSymptoms: string[];
    patientAlert: { hi: string; en: string };
    doctorAlert: {
      badge: string;
      reason: string;
      symptoms: string[];
      timeRecorded: string;
    };
  } {
    const evalResult = globalEngine.evaluate(sessionId, history, complaints);

    // Audit log every alert
    if (evalResult.hasEmergency || evalResult.redFlags.length > 0) {
      RedFlagAuditLogService.recordAlert({
        sessionId,
        patientId: patientInfo?.id || `pt-${sessionId}`,
        patientName: patientInfo?.name,
        tokenNumber: patientInfo?.token,
        triggeringSymptoms: evalResult.detectedSymptoms,
        severity: evalResult.hasEmergency ? "emergency_code_red" : "urgent_amber",
        priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
        ruleId: evalResult.triggeredRules[0]?.id || "rf_general"
      });
    }

    return {
      isEmergency: evalResult.hasEmergency,
      ...evalResult,
      doctorAlert: {
        ...evalResult.doctorAlert,
        timeRecorded: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      }
    };
  }
}
