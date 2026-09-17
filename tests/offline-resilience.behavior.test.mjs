import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";

const root=path.resolve(new URL("..",import.meta.url).pathname);
let ts;for(const candidate of [path.join(root,"node_modules/typescript/lib/typescript.js"),"/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"]){try{ts=createRequire(import.meta.url)(candidate);break}catch{}}
if(!ts)throw new Error("TypeScript compiler unavailable");

function createFakeIndexedDb(){
 const stores=new Map();
 class Tx{
  pending=0;oncomplete=null;onerror=null;
  objectStore(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);const op=(fn)=>{this.pending++;const req={result:undefined,error:null,onsuccess:null,onerror:null};queueMicrotask(()=>{try{req.result=fn();req.onsuccess?.();}catch(e){req.error=e;req.onerror?.();this.onerror?.();}finally{this.pending--;if(this.pending===0)queueMicrotask(()=>this.oncomplete?.());}});return req;};return{get:(key)=>op(()=>map.get(key)),put:(value)=>op(()=>{map.set(value.id,value);return value.id;}),delete:(key)=>op(()=>{map.delete(key);return undefined;})};}
 }
 const db={objectStoreNames:{contains:(name)=>stores.has(name)},createObjectStore:(name)=>{if(!stores.has(name))stores.set(name,new Map());return{};},transaction:()=>new Tx(),close:()=>{}};
 return {stores,api:{open(){const req={result:db,error:null,onupgradeneeded:null,onsuccess:null,onerror:null};setTimeout(()=>{req.onupgradeneeded?.();setTimeout(()=>req.onsuccess?.(),0)},0);return req;}}};
}
const fake=createFakeIndexedDb();globalThis.indexedDB=fake.api;
const source=fs.readFileSync(path.join(root,"lib/offline-resilience.ts"),"utf8");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const mod=await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

const workflow={sessionId:"11111111-1111-4111-8111-111111111111",caseId:"CASE-1001",language:"en",consentStatus:"ACCEPTED",currentStep:"complaint",complaint:"chest pain",region:null,severity:null,interviewFacts:{},documents:[]};

test("resume credentials are stable and high entropy",async()=>{await mod.clearOfflineState();const a=await mod.getResumeCredentials();const b=await mod.getResumeCredentials();assert.equal(a.createKey,b.createKey);assert.equal(a.resumeSecret,b.resumeSecret);assert.match(a.resumeSecret,/^[0-9a-f]{64}$/);assert.ok(a.createKey.length>=8);});
test("workflow survives encrypted offline round trip",async()=>{await mod.saveOfflineWorkflow(workflow);assert.deepEqual(await mod.loadOfflineWorkflow(),workflow);});
test("encrypted record does not expose patient plaintext",async()=>{const rec=fake.stores.get("state").get("active");assert.ok(rec.cipher instanceof ArrayBuffer);assert.ok(rec.iv instanceof ArrayBuffer);const visible=JSON.stringify(rec);assert.doesNotMatch(visible,/chest pain|CASE-1001|resumeSecret|complaint/);});
test("text draft survives reload while full ABHA is prohibited",async()=>{await mod.saveFormDraft("complaint-draft",{text:"fever for two days"});assert.deepEqual(await mod.loadFormDraft("complaint-draft"),{text:"fever for two days"});await assert.rejects(()=>mod.saveFormDraft("abha-number","12345678901234"),/SENSITIVE_DRAFT_NOT_CACHEABLE/);});
test("document/file/blob drafts are never cached",async()=>{await assert.rejects(()=>mod.saveFormDraft("document-file",{name:"report.pdf"}),/SENSITIVE_DRAFT_NOT_CACHEABLE/);await assert.rejects(()=>mod.saveFormDraft("voice-blob",{size:10}),/SENSITIVE_DRAFT_NOT_CACHEABLE/);});
test("queue deduplicates same mutation id",async()=>{await mod.enqueueJsonMutation({id:"mutation-12345678",path:"/api/patient/session",method:"PATCH",body:{workflowStep:"anatomy"}});await mod.enqueueJsonMutation({id:"mutation-12345678",path:"/api/patient/session",method:"PATCH",body:{workflowStep:"anatomy"}});const q=await mod.listPendingMutations();assert.equal(q.filter(x=>x.id==="mutation-12345678").length,1);});
test("queue refuses full ABHA values",async()=>{await assert.rejects(()=>mod.enqueueJsonMutation({id:"abha-12345678",path:"/api/patient/identity",method:"POST",body:{abhaNumber:"12345678901234"}}),/SENSITIVE_IDENTITY_NOT_CACHEABLE/);});
test("successful replay removes queued mutation",async()=>{await mod.clearOfflineState();await mod.getResumeCredentials();await mod.enqueueJsonMutation({id:"ok-12345678",path:"/api/patient/session",method:"PATCH",body:{workflowStep:"symptoms"}});const out=await mod.replayQueuedMutations(async()=>new Response("{}",{status:200,headers:{"content-type":"application/json"}}));assert.equal(out.synced,1);assert.equal(out.remaining,0);});
test("network failure preserves queued mutation",async()=>{await mod.enqueueJsonMutation({id:"net-12345678",path:"/api/patient/session",method:"PATCH",body:{workflowStep:"interview"}});const out=await mod.replayQueuedMutations(async()=>{throw new TypeError("network down")});assert.equal(out.networkLost,true);assert.equal(out.remaining,1);assert.equal((await mod.listPendingMutations())[0].id,"net-12345678");});
test("expired server cookie response requests secure resume instead of dropping queue",async()=>{const out=await mod.replayQueuedMutations(async()=>new Response("{}",{status:410}));assert.equal(out.sessionLost,true);assert.equal(out.remaining,1);});
test("validation conflict preserves queue for human-safe attention",async()=>{const out=await mod.replayQueuedMutations(async()=>new Response("{}",{status:409}));assert.equal(out.conflict,true);assert.equal(out.remaining,1);});
test("queue is replayed in insertion order",async()=>{await mod.clearOfflineState();await mod.getResumeCredentials();for(const id of ["order-a-123","order-b-123","order-c-123"])await mod.enqueueJsonMutation({id,path:"/api/patient/session",method:"PATCH",body:{workflowStep:"interview"}});const seen=[];await mod.replayQueuedMutations(async(_url,init)=>{seen.push(JSON.parse(init.body).workflowStep+":"+seen.length);return new Response("{}",{status:200});});assert.deepEqual(seen,["interview:0","interview:1","interview:2"]);});
test("expired local snapshot becomes unavailable",async()=>{await mod.saveOfflineWorkflow(workflow);const real=Date.now;const now=real();Date.now=()=>now+mod.OFFLINE_RESUME_TTL_MS+1000;try{assert.equal(await mod.loadOfflineWorkflow(),null);assert.equal(await mod.loadResumeCredentials(),null);}finally{Date.now=real;}});
test("clear removes recoverable patient state",async()=>{await mod.getResumeCredentials();await mod.saveOfflineWorkflow(workflow);await mod.clearOfflineState();assert.equal(await mod.loadOfflineWorkflow(),null);assert.equal(await mod.loadResumeCredentials(),null);});

test("offline encryption key is non-extractable",async()=>{
  await mod.clearOfflineState();
  await mod.getResumeCredentials();
  const keyRecord=fake.stores.get("keys")?.get("draft-key");
  assert.ok(keyRecord?.key,"encryption key should exist");
  assert.equal(keyRecord.key.extractable,false,"offline PHI key must be non-extractable");
});

test("expired encrypted PHI record is physically removed",async()=>{
  await mod.clearOfflineState();
  await mod.getResumeCredentials();
  await mod.saveOfflineWorkflow(workflow);
  assert.ok(fake.stores.get("state")?.has("active"));
  const real=Date.now;const now=real();Date.now=()=>now+mod.OFFLINE_RESUME_TTL_MS+1000;
  try{assert.equal(await mod.loadOfflineWorkflow(),null);}finally{Date.now=real;}
  assert.equal(fake.stores.get("state")?.has("active"),false,"expired PHI ciphertext must be deleted, not merely ignored");
});

test("clear removes ciphertext and encryption key and rotates recovery credentials",async()=>{
  await mod.clearOfflineState();
  const before=await mod.getResumeCredentials();
  await mod.saveOfflineWorkflow(workflow);
  assert.ok(fake.stores.get("state")?.size>0);
  assert.ok(fake.stores.get("keys")?.size>0);
  await mod.clearOfflineState();
  assert.equal(fake.stores.get("state")?.size,0);
  assert.equal(fake.stores.get("keys")?.size,0);
  const after=await mod.getResumeCredentials();
  assert.notEqual(after.resumeSecret,before.resumeSecret);
  assert.notEqual(after.createKey,before.createKey);
});

test("nested sensitive identity and binary values cannot bypass offline cache guard",async()=>{
  await assert.rejects(()=>mod.saveFormDraft("safe-name",{nested:{abhaAddress:"patient@abdm"}}),/SENSITIVE_DRAFT_NOT_CACHEABLE/);
  await assert.rejects(()=>mod.saveFormDraft("safe-name",{nested:new Uint8Array([1,2,3])}),/SENSITIVE_DRAFT_NOT_CACHEABLE/);
  await assert.rejects(()=>mod.enqueueJsonMutation({id:"nested-abha-123",path:"/api/patient/session",method:"PATCH",body:{payload:{abhaNumber:"12345678901234"}}}),/SENSITIVE_IDENTITY_NOT_CACHEABLE/);
});

test("offline queue fails closed at capacity instead of dropping oldest patient work",async()=>{
  await mod.clearOfflineState();await mod.getResumeCredentials();
  for(let i=0;i<100;i++)await mod.enqueueJsonMutation({id:`cap-${String(i).padStart(3,"0")}-mutation`,path:"/api/patient/session",method:"PATCH",body:{workflowStep:"interview",seq:i}});
  const before=await mod.listPendingMutations();assert.equal(before.length,100);assert.equal(before[0].body.seq,0);
  await assert.rejects(()=>mod.enqueueJsonMutation({id:"cap-overflow-mutation",path:"/api/patient/session",method:"PATCH",body:{workflowStep:"documents"}}),/OFFLINE_QUEUE_FULL/);
  const after=await mod.listPendingMutations();assert.equal(after.length,100);assert.equal(after[0].body.seq,0);assert.equal(after.at(-1).body.seq,99);
});
