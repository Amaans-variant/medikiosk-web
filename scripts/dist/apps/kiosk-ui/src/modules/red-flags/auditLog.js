"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedFlagAuditLogService = void 0;
class RedFlagAuditLogService {
    static STORAGE_KEY = "medikiosk_redflag_audit_logs_v1";
    static memoryLogs = [];
    static recordAlert(entry) {
        const fullEntry = {
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
            }
            catch {
                console.warn("[AuditLog] Failed writing to localStorage");
            }
        }
        console.info(`[AuditLog 🚨] Recorded priority red-flag alert for Patient ${entry.patientId}: ${entry.priorityReason}`);
        return fullEntry;
    }
    static getLogs() {
        if (typeof window !== "undefined") {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (raw)
                    return JSON.parse(raw);
            }
            catch {
                // fallback to memory
            }
        }
        return RedFlagAuditLogService.memoryLogs;
    }
    static acknowledgeAlert(auditId, acknowledgedBy = "OPD Triage Nurse") {
        const logs = RedFlagAuditLogService.getLogs();
        const entry = logs.find(l => l.auditId === auditId);
        if (entry) {
            entry.acknowledged = true;
            entry.acknowledgedAt = Date.now();
            entry.acknowledgedBy = acknowledgedBy;
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
                }
                catch {
                    // ignore
                }
            }
            return true;
        }
        return false;
    }
}
exports.RedFlagAuditLogService = RedFlagAuditLogService;
