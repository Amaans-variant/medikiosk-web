"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedFlagDetectionModule = void 0;
const ruleEngine_1 = require("./ruleEngine");
const auditLog_1 = require("./auditLog");
__exportStar(require("./ruleEngine"), exports);
__exportStar(require("./auditLog"), exports);
const globalEngine = new ruleEngine_1.ConfigurableRedFlagEngine();
class RedFlagDetectionModule {
    static getEngine() {
        return globalEngine;
    }
    static analyze(sessionId, complaints = [], history, patientInfo) {
        const evalResult = globalEngine.evaluate(sessionId, history, complaints);
        // Audit log every alert
        if (evalResult.hasEmergency || evalResult.redFlags.length > 0) {
            auditLog_1.RedFlagAuditLogService.recordAlert({
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
exports.RedFlagDetectionModule = RedFlagDetectionModule;
