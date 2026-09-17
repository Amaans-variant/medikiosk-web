import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const root=path.resolve(new URL("..",import.meta.url).pathname);const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const schema=read("db/schema.sql"), shell=read("app/patient/PatientShell.tsx"), offline=read("lib/offline-resilience.ts"), complaints=read("app/api/patient/complaints/route.ts"), docs=read("app/patient/documents/page.tsx"), complete=read("app/api/patient/complete/route.ts"), resume=read("app/api/patient/session/resume/route.ts"), identity=read("app/patient/identity/page.tsx");
test("server uses hashed resume token and bounded recovery window",()=>{assert.match(schema,/resume_token_hash/);assert.match(schema,/8 hours/);assert.match(resume,/createHash\("sha256"\)/);assert.doesNotMatch(schema,/resume_secret/i);});
test("normal patient cookie remains short-lived and HttpOnly",()=>{const s=read("app/api/patient/session/route.ts");assert.match(s,/httpOnly:true/);assert.match(s,/maxAge:30\*60/);});
test("resume lookup is security definer with pinned search path",()=>{assert.match(schema,/find_resumable_session[\s\S]*SECURITY DEFINER SET search_path=public/);assert.match(schema,/REVOKE EXECUTE ON FUNCTION find_resumable_session\(text\) FROM PUBLIC/);});
test("offline storage is encrypted IndexedDB, never localStorage",()=>{assert.match(offline,/AES-GCM/);assert.match(offline,/indexedDB\.open/);assert.match(offline,/generateKey\([^)]*[\s\S]*false/);assert.doesNotMatch(offline,/localStorage|sessionStorage/);});
test("full ABHA and file/blob drafts are prohibited offline",()=>{assert.match(offline,/SENSITIVE_IDENTITY_NOT_CACHEABLE/);assert.match(offline,/SENSITIVE_DRAFT_NOT_CACHEABLE/);assert.match(identity,/full ABHA values are never cached offline/i);assert.match(docs,/Document files are never stored in the offline recovery cache/i);});
test("offline queue replays automatically on browser online event",()=>{assert.match(shell,/addEventListener\("online"/);assert.match(shell,/replayQueuedMutations/);assert.match(shell,/resumeSavedSession/);});
test("queued complaint replay has idempotency protection",()=>{assert.match(schema,/client_mutation_id/);assert.match(schema,/idx_complaints_client_mutation/);assert.match(complaints,/clientMutationId/);assert.match(complaints,/duplicate/);});
test("completion cannot bypass queued offline changes",()=>{assert.match(docs,/ensureSynced/);assert.match(docs,/Saved offline answers must finish syncing/);});
test("successful submission revokes resume token",()=>{assert.match(complete,/resume_token_hash=NULL/);assert.match(docs,/finishOfflineCase/);});
test("new patient reset is fail-closed when offline",()=>{assert.match(shell,/Reconnect before starting a new patient/);assert.match(shell,/await clearOfflineState\(\)/);});
test("server and local recovery are separate layers",()=>{assert.match(shell,/encrypted local draft/);assert.match(shell,/secure server resume/);assert.match(resume,/RESUME_NOT_AVAILABLE/);});

test("submitted complete state purges local recovery instead of re-caching PHI",()=>{
  assert.match(shell,/currentStep==="complete"\)\{await clearOfflineState\(\);return;/);
});

test("older offline mutations must flush before any newer online write",()=>{
  const matches=shell.match(/pendingMutationCount\(\)>0&&!await flush\(\)/g)??[];
  assert.ok(matches.length>=2,"both session sync and API mutation paths must flush older queued changes first");
});
