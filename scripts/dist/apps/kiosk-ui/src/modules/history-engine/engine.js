"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationalHistoryEngine = void 0;
const pathways_1 = require("./pathways");
class ConversationalHistoryEngine {
    pathway;
    state;
    constructor(complaintKey, initialHistory) {
        this.pathway = (0, pathways_1.resolvePathway)(complaintKey);
        const initial = {
            chiefComplaint: this.pathway.canonicalName,
            ...initialHistory
        };
        const firstQuestion = this.pathway.questions[this.pathway.firstQuestionId] || null;
        this.state = {
            complaintKey,
            history: initial,
            currentQuestion: firstQuestion,
            isComplete: false,
            conversationLog: firstQuestion ? [
                {
                    sender: "kiosk",
                    textHi: firstQuestion.promptHi,
                    textEn: firstQuestion.promptEn,
                    timestamp: Date.now()
                }
            ] : [],
            detectedRedFlags: [],
            summaryDraft: null
        };
        // Evaluate initial red flags
        this.state.detectedRedFlags = this.pathway.checkRedFlags(this.state.history);
    }
    getState() {
        return { ...this.state };
    }
    getHistory() {
        return { ...this.state.history };
    }
    getCurrentQuestion() {
        return this.state.currentQuestion;
    }
    getMissingMandatoryFields() {
        return this.pathway.mandatoryFields.filter(field => {
            const val = this.state.history[field];
            return val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
        });
    }
    /**
     * Process patient selecting a pre-structured choice (Touch interaction)
     */
    answerChoice(choiceId) {
        const q = this.state.currentQuestion;
        if (!q) {
            return { nextQuestion: null, isComplete: true, redFlags: this.state.detectedRedFlags };
        }
        const choice = q.choices.find(c => c.id === choiceId);
        if (!choice) {
            return { nextQuestion: q, isComplete: false, redFlags: this.state.detectedRedFlags };
        }
        // 1. Log patient response
        this.state.conversationLog.push({
            sender: "patient",
            textHi: choice.labelHi,
            textEn: choice.labelEn,
            timestamp: Date.now()
        });
        // 2. Update controlled history
        this.updateHistoryWithPartial(choice.extractedValue);
        // 3. Evaluate red flags
        const redFlags = this.pathway.checkRedFlags(this.state.history);
        this.state.detectedRedFlags = redFlags;
        // 4. Advance to next question in pathway
        return this.advanceQuestion(q.id);
    }
    /**
     * Process natural language patient response (Voice/Text ASR input)
     * Deterministic entity matching with clarification fallback
     */
    answerNaturalText(input) {
        const q = this.state.currentQuestion;
        if (!q) {
            return { recognized: false, messageHi: "सत्र पूरा हो चुका है।", messageEn: "Intake complete." };
        }
        const normalized = input.trim().toLowerCase();
        // 1. Log patient utterance
        this.state.conversationLog.push({
            sender: "patient",
            textHi: input,
            textEn: input,
            timestamp: Date.now()
        });
        // 2. Keyword & semantic matcher across question choices
        let matchedChoice = q.choices.find(c => {
            const hiLower = c.labelHi.toLowerCase();
            const enLower = c.labelEn.toLowerCase();
            return (normalized.includes(hiLower) ||
                normalized.includes(enLower) ||
                hiLower.split(" ").some(word => word.length > 3 && normalized.includes(word)) ||
                enLower.split(" ").some(word => word.length > 3 && normalized.includes(word)));
        });
        // Specific vernacular patterns
        if (!matchedChoice) {
            if (q.field === "duration") {
                if (/आज|घंटे|hour|sudden|abhi/i.test(normalized)) {
                    matchedChoice = q.choices[0];
                }
                else if (/दिन|day|2|3|4/i.test(normalized)) {
                    matchedChoice = q.choices[1] || q.choices[0];
                }
                else if (/हफ्ते|महीने|week|month|purana/i.test(normalized)) {
                    matchedChoice = q.choices[2] || q.choices[1];
                }
            }
            else if (q.field === "radiation") {
                if (/हाथ|कंधे|arm|jaw|jabda/i.test(normalized)) {
                    matchedChoice = q.choices.find(c => c.id.includes("arm_jaw"));
                }
                else if (/पीठ|back/i.test(normalized)) {
                    matchedChoice = q.choices.find(c => c.id.includes("back"));
                }
                else if (/नहीं|no|none/i.test(normalized)) {
                    matchedChoice = q.choices.find(c => c.id.includes("none"));
                }
            }
            else if (q.field === "location") {
                if (/ऊपर|up|chest|chhati/i.test(normalized)) {
                    matchedChoice = q.choices.find(c => c.id.includes("upper"));
                }
                else if (/नीचे|pedu|lower/i.test(normalized)) {
                    matchedChoice = q.choices.find(c => c.id.includes("lower"));
                }
                else if (/दाहिनी|right/i.test(normalized)) {
                    matchedChoice = q.choices.find(c => c.id.includes("right"));
                }
            }
        }
        if (matchedChoice) {
            this.updateHistoryWithPartial(matchedChoice.extractedValue);
            this.state.detectedRedFlags = this.pathway.checkRedFlags(this.state.history);
            this.advanceQuestion(q.id);
            return {
                recognized: true,
                messageHi: `समझा गया: ${matchedChoice.labelHi}`,
                messageEn: `Recognized: ${matchedChoice.labelEn}`
            };
        }
        // 3. Ambiguity handling: Ask clarification without hallucinating
        const clarificationHi = q.clarificationPromptHi || `कृपया स्पष्ट करें: क्या आपका मतलब ${q.choices.map(c => c.labelHi.split("/")[0]).join(" या ")} में से कुछ है?`;
        const clarificationEn = q.clarificationPromptEn || `Please clarify: did you mean one of: ${q.choices.map(c => c.labelEn).join(", ")}?`;
        this.state.conversationLog.push({
            sender: "kiosk",
            textHi: clarificationHi,
            textEn: clarificationEn,
            timestamp: Date.now()
        });
        return {
            recognized: false,
            messageHi: clarificationHi,
            messageEn: clarificationEn
        };
    }
    advanceQuestion(currentId) {
        const nextId = this.pathway.getNextQuestionId(this.state.history, currentId);
        if (nextId && this.pathway.questions[nextId]) {
            const nextQ = this.pathway.questions[nextId];
            this.state.currentQuestion = nextQ;
            this.state.conversationLog.push({
                sender: "kiosk",
                textHi: nextQ.promptHi,
                textEn: nextQ.promptEn,
                timestamp: Date.now()
            });
            return { nextQuestion: nextQ, isComplete: false, redFlags: this.state.detectedRedFlags };
        }
        // Pathway finished
        this.state.currentQuestion = null;
        this.state.isComplete = true;
        this.state.summaryDraft = this.generateStructuredSummary();
        return { nextQuestion: null, isComplete: true, redFlags: this.state.detectedRedFlags };
    }
    updateHistoryWithPartial(partial) {
        for (const [key, value] of Object.entries(partial)) {
            const fieldKey = key;
            if (Array.isArray(value)) {
                const existing = this.state.history[fieldKey] || [];
                this.state.history[fieldKey] = Array.from(new Set([...existing, ...value]));
            }
            else {
                this.state.history[fieldKey] = value;
            }
        }
    }
    /**
     * Generates a controlled, non-hallucinatory clinical summary.
     * COMPLIANCE: Clearly labelled "Information collected" (AI-Assisted Draft).
     */
    generateStructuredSummary() {
        const h = this.state.history;
        const parts = [];
        parts.push(`[CHIEF COMPLAINT]: ${h.chiefComplaint}`);
        if (h.duration)
            parts.push(`[DURATION]: ${h.duration}`);
        if (h.onset)
            parts.push(`[ONSET]: ${h.onset}`);
        if (h.location)
            parts.push(`[LOCATION]: ${h.location}`);
        if (h.character)
            parts.push(`[CHARACTER]: ${h.character}`);
        if (h.radiation)
            parts.push(`[RADIATION]: ${h.radiation}`);
        if (h.aggravatingFactors && h.aggravatingFactors.length > 0) {
            parts.push(`[AGGRAVATING FACTORS]: ${h.aggravatingFactors.join(", ")}`);
        }
        if (h.relievingFactors && h.relievingFactors.length > 0) {
            parts.push(`[RELIEVING FACTORS]: ${h.relievingFactors.join(", ")}`);
        }
        if (h.associatedSymptoms && h.associatedSymptoms.length > 0) {
            parts.push(`[ASSOCIATED SYMPTOMS]: ${h.associatedSymptoms.join(", ")}`);
        }
        if (h.pastMedicalHistory && h.pastMedicalHistory.length > 0) {
            parts.push(`[PAST MEDICAL HISTORY]: ${h.pastMedicalHistory.join(", ")}`);
        }
        if (this.state.detectedRedFlags.length > 0) {
            parts.push(`\n[🚨 RED-FLAG TRIAGE ALERTS DETECTED]:\n` +
                this.state.detectedRedFlags.map(rf => `- ${rf.condition} [${rf.severity}]: ${rf.rationale}`).join("\n"));
        }
        parts.push(`\n* Information collected via MediKiosk Controlled Adaptive Engine. AI-Assisted Draft. Final diagnosis and management determined solely by consulting physician. *`);
        return parts.join("\n");
    }
}
exports.ConversationalHistoryEngine = ConversationalHistoryEngine;
