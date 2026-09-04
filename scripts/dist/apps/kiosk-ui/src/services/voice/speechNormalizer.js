"use strict";
/**
 * Multilingual Clinical Speech Normalizer
 * Handles Hindi, English, and code-mixed Hinglish.
 * Normalizes vernacular utterances into structured clinical entities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechNormalizer = void 0;
// Word maps for vernacular numbers and timeframes
const TIME_UNITS = [
    { regex: /(?:ek|1|one)\s*(?:din|day)/i, val: "1 day" },
    { regex: /(?:do|2|two)\s*(?:din|dinon|days)/i, val: "2 days" },
    { regex: /(?:teen|tin|3|three)\s*(?:din|dinon|days)/i, val: "3 days" },
    { regex: /(?:char|chaar|4|four)\s*(?:din|dinon|days)/i, val: "4 days" },
    { regex: /(?:paanch|panch|5|five)\s*(?:din|dinon|days)/i, val: "5 days" },
    { regex: /(?:kal|yesterday|since yesterday)/i, val: "Since yesterday" },
    { regex: /(?:aaj|today|abhi|just now|few hours)/i, val: "<12 hours (Acute)" },
    { regex: /(?:hafte|hafta|week|weeks)/i, val: "1-2 weeks" },
    { regex: /(?:mahine|mahina|month|months)/i, val: ">1 month (Chronic)" }
];
class SpeechNormalizer {
    static normalize(raw) {
        const text = raw.trim();
        const lower = text.toLowerCase();
        let detectedComplaint;
        const entities = {};
        let confidence = 0.90;
        // 1. Detect Chief Complaint
        if (/chest|chhati|chati|heart|dil|seena/i.test(lower) && /pain|dard|jakdan|tightness|jalan/i.test(lower)) {
            detectedComplaint = "chest_pain";
            entities.location = "Retrosternal / Subcardiac chest";
        }
        else if (/pet|stomach|abdomen|abdominal|belly|pait|tummy/i.test(lower) && /pain|dard|marod|acidity|gas/i.test(lower)) {
            detectedComplaint = "abdominal_pain";
            entities.location = "Abdominal";
        }
        else if (/sir|sar|head|sirdard|sar dard|headache|migraine/i.test(lower)) {
            detectedComplaint = "headache";
            entities.location = "Cranial / Frontal";
        }
        else if (/bukhar|fever|tapman|temperature|thand|chills/i.test(lower)) {
            detectedComplaint = "fever";
        }
        else if (/khansi|cough|balgam|phlegm|dhaska/i.test(lower)) {
            detectedComplaint = "cough";
        }
        else if (/kamar|peeth|back|spine|lumbar/i.test(lower) && /pain|dard|strain/i.test(lower)) {
            detectedComplaint = "back_pain";
            entities.location = "Lumbar spine / Lower back";
        }
        // 2. Extract Duration
        for (const tu of TIME_UNITS) {
            if (tu.regex.test(lower)) {
                entities.duration = tu.val;
                break;
            }
        }
        // 3. Extract Radiation
        if (/haath|arm|bazu|kandha|shoulder|jaw|jabda/i.test(lower)) {
            entities.radiation = "Radiating to left arm / shoulder / jaw";
        }
        else if (/pair|leg|knee|ghutna/i.test(lower)) {
            entities.radiation = "Radiating down lower extremity (Sciatica)";
        }
        else if (/nahi|not radiating|no/i.test(lower)) {
            entities.radiation = "None (localized)";
        }
        // 4. Extract Character / Sensation
        if (/dabaav|squeeze|pressure|heavy|bhari/i.test(lower)) {
            entities.character = "Heavy pressure / Squeezing";
        }
        else if (/jalan|burning|acid/i.test(lower)) {
            entities.character = "Burning";
        }
        else if (/chubhan|sharp|stabbing/i.test(lower)) {
            entities.character = "Sharp / Stabbing";
        }
        else if (/dhak|throbbing|pulsating/i.test(lower)) {
            entities.character = "Pulsating / Throbbing";
        }
        else if (/sukhi|dry/i.test(lower)) {
            entities.character = "Dry non-productive";
        }
        else if (/balgam|wet|productive/i.test(lower)) {
            entities.character = "Productive with sputum";
        }
        else if (/khoon|blood|hemoptysis/i.test(lower)) {
            entities.character = "Hemoptysis (Blood in sputum)";
        }
        // 5. Extract Associated Symptoms
        const assoc = [];
        if (/saans|breath|dyspnea|dum phool/i.test(lower))
            assoc.push("Shortness of breath");
        if (/pasina|sweat|diaphoresis/i.test(lower))
            assoc.push("Cold sweats");
        if (/ulti|vomit|nausea|ji michlana/i.test(lower))
            assoc.push("Nausea / Vomiting");
        if (/chakkar|dizziness|giddiness/i.test(lower))
            assoc.push("Dizziness");
        if (/thand|chills|kapkapi/i.test(lower))
            assoc.push("Chills & Rigors");
        if (assoc.length > 0)
            entities.associated = assoc;
        // 6. Confidence Scoring & Uncertainty Checks
        // If text is very short (<3 words) or has no recognized clinical entity:
        const recognizedCount = (detectedComplaint ? 1 : 0) + (entities.duration ? 1 : 0) + (entities.character ? 1 : 0) + (entities.radiation ? 1 : 0) + (entities.associated ? 1 : 0);
        if (recognizedCount === 0) {
            confidence = 0.45;
        }
        else if (recognizedCount === 1) {
            confidence = 0.72;
        }
        else {
            confidence = 0.92;
        }
        // Never silently discard uncertainty: flag if confidence < 0.78
        const needsConfirmation = confidence < 0.78;
        const confirmationMessageHi = `क्या आपका मतलब है: "${text}"?`;
        const confirmationMessageEn = `Did we understand you correctly: "${text}"?`;
        return {
            rawText: text,
            normalizedText: text,
            detectedComplaint,
            extractedEntities: entities,
            confidence,
            needsConfirmation,
            confirmationMessageHi,
            confirmationMessageEn
        };
    }
}
exports.SpeechNormalizer = SpeechNormalizer;
