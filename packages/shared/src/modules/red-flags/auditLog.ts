export interface RedFlagAuditLogEntry {
  auditId: string;
  timestamp: number;
  sessionId: string;
  patientId: string;
  patientName?: string;
  tokenNumber?: number;
  triggeringSymptoms: string[];
  severity: "emergency_code_red" | "urgent_amber" | "routine_green";
  priorityReason: string;
  ruleId: string;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

export class RedFlagAuditLogService {
  private static STORAGE_KEY = "medikiosk_redflag_audit_logs_v1";
  private static memoryLogs: RedFlagAuditLogEntry[] = [];

  public static recordAlert(entry: Omit<RedFlagAuditLogEntry, "auditId" | "timestamp" | "acknowledged">): RedFlagAuditLogEntry {
    const fullEntry: RedFlagAuditLogEntry = {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      acknowledged: false,
      ...entry
    };

    RedFlagAuditLogService.memoryLogs.unshift(fullEntry);

    if (typeof window !== "undefined") {
      try {
        const existing = RedFlagAuditLogService.getLogs();
        const updated = [fullEntry, ...existing].slice(0, 100);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.warn("[AuditLog] Failed writing to localStorage");
      }
    }

    console.info(`[AuditLog 🚨] Recorded priority red-flag alert for Patient ${entry.patientId}: ${entry.priorityReason}`);
    return fullEntry;
  }

  public static getLogs(): RedFlagAuditLogEntry[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // fallback to memory
      }
    }
    return RedFlagAuditLogService.memoryLogs;
  }

  public static acknowledgeAlert(auditId: string, acknowledgedBy: string = "OPD Triage Nurse"): boolean {
    const logs = RedFlagAuditLogService.getLogs();
    const entry = logs.find(l => l.auditId === auditId);
    if (entry) {
      entry.acknowledged = true;
      entry.acknowledgedAt = Date.now();
      entry.acknowledgedBy = acknowledgedBy;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
        } catch {
          // ignore
        }
      }
      return true;
    }
    return false;
  }
}
