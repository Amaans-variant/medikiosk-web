"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("../apps/kiosk-ui/src/modules/history-engine/engine");
function testPathway(name, complaintKey, choicesSequence, naturalInputs) {
    console.log("\n=======================================================");
    console.log(`TESTING PATHWAY: ${name.toUpperCase()} (${complaintKey})`);
    console.log("=======================================================");
    const engine = new engine_1.ConversationalHistoryEngine(complaintKey);
    let step = 1;
    while (!engine.getState().isComplete) {
        const q = engine.getCurrentQuestion();
        if (!q)
            break;
        console.log(`\n[Step ${step}] Question Asked: ${q.promptHi} / ${q.promptEn}`);
        console.log(`  Available choices: ${q.choices.map(c => c.id).join(", ")}`);
        // Pick from sequence or default to first
        const choiceId = choicesSequence[step - 1] || q.choices[0].id;
        console.log(`  --> Patient selects: [${choiceId}]`);
        const res = engine.answerChoice(choiceId);
        if (res.redFlags && res.redFlags.length > 0) {
            console.log(`  🚨 RED FLAG TRIGGERED: ${res.redFlags[0].condition} (${res.redFlags[0].severity})`);
        }
        step++;
    }
    const finalState = engine.getState();
    console.log("\n[Summary Draft Generated]:");
    console.log(finalState.summaryDraft);
    console.log(`\nStatus: Complete = ${finalState.isComplete}, Red Flags Count = ${finalState.detectedRedFlags.length}`);
    // Test Natural Language input if provided
    if (naturalInputs && naturalInputs.length > 0) {
        console.log("\n--- Testing Natural Language & Ambiguity ---");
        const nlEngine = new engine_1.ConversationalHistoryEngine(complaintKey);
        for (const input of naturalInputs) {
            const q = nlEngine.getCurrentQuestion();
            console.log(`Question: ${q?.promptHi}`);
            console.log(`Patient speaks: "${input}"`);
            const nlRes = nlEngine.answerNaturalText(input);
            console.log(`Engine Response: Recognized=${nlRes.recognized} -> ${nlRes.messageHi}`);
        }
    }
}
// 1. CHEST PAIN (Acute Emergency with Red Flag)
testPathway("Chest Pain (High-Risk ACS)", "chest_pain", ["dur_sudden_mins", "char_heavy_squeeze", "rad_arm_jaw", "assoc_dyspnea_sweats", "pmh_htn_dm"], ["2 ghante se dard hai", "kuch ajeeb sa lag raha hai"] // 1 match, 1 ambiguous
);
// 2. ABDOMINAL PAIN (Right Lower Quadrant Appendicitis Risk)
testPathway("Abdominal Pain (RLQ)", "abdominal_pain", ["loc_right_lower", "dur_acute_hours", "food_aggravates", "assoc_vomiting_fever"], ["pet ke neeche dahini taraf", "khaana khane ke baad"]);
// 3. HEADACHE (Thunderclap Emergency SAH)
testPathway("Headache (Thunderclap)", "headache", ["ha_thunderclap", "char_throbbing_one_side", "assoc_neuro_stiff"], ["achanak bijli ki tarah shuru hua", "roshni se pareshani"]);
// 4. FEVER (Prolonged Pyrexia with Red Flag Alert)
testPathway("Fever (High Grade)", "fever", ["dur_1_3_days", "pat_chills_rigor", "assoc_rash_drowsy"], ["3 din se bukhar hai", "thand lagti hai"]);
// 5. COUGH (Hemoptysis Red Flag)
testPathway("Cough (Productive Hemoptysis)", "cough", ["type_blood_streaked", "dur_2_4w", "assoc_dyspnea_stridor"], ["balgam mein khoon aata hai", "saans lene mein seeti"]);
// 6. BACK PAIN (Cauda Equina Red Flag)
testPathway("Back Pain (Cauda Equina)", "back_pain", ["loc_lower_back", "rad_down_leg", "assoc_cauda_equina"], ["kamar mein dard", "peshab par control nahi"]);
