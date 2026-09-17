import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=async p=>readFile(`${process.cwd()}/${p}`,'utf8');

test('patient welcome combines branded welcome and six-language selection',async()=>{
  const s=await read('app/patient/page.tsx');
  assert.match(s,/Welcome to MediKiosk/);assert.match(s,/language-reference-list/);assert.match(s,/Private & secure/);assert.match(s,/Saves progress safely/);
});
test('consent matches privacy-first reference structure',async()=>{
  const s=await read('app/patient/consent/page.tsx');assert.match(s,/Your Information Stays Private/);assert.match(s,/privacy-points/);assert.match(s,/I Agree and Continue/);
});
test('optional ABHA screen is visibly optional and privacy minimized',async()=>{
  const s=await read('app/patient/identity/page.tsx');assert.match(s,/ABHA \(Optional\)/);assert.match(s,/Continue without ABHA/);assert.match(s,/never cached/);
});
test('chief complaint has large voice interaction and Medi helper',async()=>{
  const s=await read('app/patient/complaint/page.tsx');assert.match(s,/reference-mic/);assert.match(s,/voice-wave/);assert.match(s,/Medi is here to help/);
});
test('severity and affected area are combined like approved reference',async()=>{
  const s=await read('app/patient/anatomy/page.tsx');assert.match(s,/Rate your pain or discomfort/);assert.match(s,/severity-reference-grid/);assert.match(s,/body-map/);assert.match(s,/Select affected area/);
});
test('other symptoms expose quick patient-friendly choices',async()=>{
  const s=await read('app/patient/symptoms/page.tsx');for(const symptom of ['Nausea','Vomiting','Loss of appetite','Bloating','Fever','Fatigue'])assert.match(s,new RegExp(symptom));assert.match(s,/symptom-reference-list/);
});
test('documents use a visual dropzone and progress cards',async()=>{
  const s=await read('app/patient/documents/page.tsx');assert.match(s,/document-dropzone/);assert.match(s,/document-card/);assert.match(s,/document-progress/);assert.match(s,/Submit to doctor/);
});
test('Medi assistant is visibly a female voice health assistant',async()=>{
  const s=await read('app/patient/assistant/page.tsx');assert.match(s,/Female voice health assistant/);assert.match(s,/👩‍⚕️/);assert.match(s,/general information only/);
});
test('completion screen has reference success state and next steps',async()=>{
  const s=await read('app/patient/complete/page.tsx');assert.match(s,/completion-mark/);assert.match(s,/Consultation Submitted Successfully/);assert.match(s,/What happens next/);assert.match(s,/Start New Consultation/);
});
test('reference design supports phone tablet and laptop without horizontal layout dependency',async()=>{
  const css=await read('app/globals.css');for(const bp of ['max-width:900px','max-width:640px','max-width:380px'])assert.match(css,new RegExp(bp.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.match(css,/welcome-reference-grid\{display:grid/);assert.match(css,/reference-trust-strip/);assert.match(css,/anatomy-reference-layout/);
});
