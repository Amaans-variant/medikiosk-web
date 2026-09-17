import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const root=path.resolve(new URL("..",import.meta.url).pathname);let failures=[];let checks=0;
function ok(cond,msg){checks++;if(!cond)failures.push(msg);else console.log(`PASS ${msg}`)}
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==="node_modules"||e.name===".next"||e.name===".git"?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const files=walk(root);const read=p=>fs.readFileSync(p,"utf8");
let ts;for(const candidate of [path.join(root,"node_modules/typescript/lib/typescript.js"),"/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"]){try{ts=createRequire(import.meta.url)(candidate);break}catch{}}
ok(Boolean(ts),"TypeScript compiler is available for syntax validation");
if(ts){for(const f of files.filter(x=>/\.(ts|tsx)$/.test(x)&&!x.endsWith(".d.ts"))){const source=read(f);const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve},reportDiagnostics:true,fileName:f});const errs=(r.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errs.length)failures.push(`TypeScript syntax ${path.relative(root,f)}: ${errs.map(e=>ts.flattenDiagnosticMessageText(e.messageText," ")).join(" | ")}`);}checks++;if(!failures.some(x=>x.startsWith("TypeScript syntax")))console.log("PASS TypeScript syntax/transpile sweep");}
function resolves(from,spec){if(spec.startsWith("@/"))spec=path.join(root,spec.slice(2));else if(spec.startsWith("."))spec=path.resolve(path.dirname(from),spec);else return true;return [spec,`${spec}.ts`,`${spec}.tsx`,`${spec}.js`,`${spec}.mjs`,path.join(spec,"index.ts"),path.join(spec,"index.tsx"),path.join(spec,"route.ts")].some(fs.existsSync);}
for(const f of files.filter(x=>/\.(ts|tsx|js|mjs)$/.test(x))){const s=read(f);for(const m of s.matchAll(/(?:from\s+|import\s*\()["']([^"']+)["']/g)){if(!resolves(f,m[1]))failures.push(`Missing local import in ${path.relative(root,f)}: ${m[1]}`)}}checks++;if(!failures.some(x=>x.startsWith("Missing local import")))console.log("PASS local import resolution");
const appLib=files.filter(x=>/\.(ts|tsx)$/.test(x)&&(/\/app\//.test(x)||/\/lib\//.test(x))).map(read).join("\n");ok(!/\b(TODO|FIXME|HACK|XXX)\b/.test(appLib),"no TODO/FIXME/HACK/XXX markers in runtime source");ok(!/coming soon|next phase|future phase/i.test(appLib),"no prototype/future-phase copy in runtime source");
const dash=read(path.join(root,"lib/dashavidha.ts"));for(const k of ["prakriti","vikriti","sara","samhanana","pramana","satmya","sattva","ahara_shakti","vyayama_shakti","vaya"])ok(dash.includes(`"${k}"`),`Dashavidha contains ${k}`);ok(!/shabda|roop|sparsha|purana|sthana|vrikriti/.test(dash),"canonical Dashavidha module excludes legacy/noncanonical keys");
const sarvam=read(path.join(root,"lib/sarvam.ts"));ok(/speaker:\s*"priya"/.test(sarvam)&&/bulbul:v3/.test(sarvam),"Medi uses configured Priya female TTS identity");const assistant=read(path.join(root,"app/patient/assistant/page.tsx"));ok(/transcript/.test(assistant)&&!/data\.text\.trim/.test(assistant),"assistant consumes STT transcript contract");
const next=read(path.join(root,"next.config.ts"));for(const h of ["X-Content-Type-Options","X-Frame-Options","Referrer-Policy","Permissions-Policy","Strict-Transport-Security","X-Robots-Tag"])ok(next.includes(h),`security header ${h}`);
const sql=read(path.join(root,"db/schema.sql"));for(const t of ["patient_sessions","complaints","patient_identity_status","documents","clinical_evidence","safety_signals","staff","consultations","dashavidha_observations","chat_messages","audit_log"])ok(sql.includes(`CREATE TABLE IF NOT EXISTS ${t}`),`schema contains ${t}`);ok(sql.includes("FORCE ROW LEVEL SECURITY"),"schema forces RLS");ok(sql.includes("find_session_by_idempotency")&&sql.includes("SECURITY DEFINER")&&sql.includes("SET search_path=public"),"security-definer idempotency function pins search_path");
const allText=files.filter(x=>/\.(ts|tsx|js|mjs|md|json|sql|example)$/.test(x)).map(f=>[f,read(f)]);for(const [f,s] of allText){if(/-----BEGIN (RSA|OPENSSH|EC) PRIVATE KEY-----/.test(s)||/\bsk-(?:live|proj|tinyfish)-[A-Za-z0-9_-]{16,}/.test(s)||/postgres(?:ql)?:\/\/[^\s:<]+:[^\s@]+@/.test(s))failures.push(`Possible secret in ${path.relative(root,f)}`)}checks++;if(!failures.some(x=>x.startsWith("Possible secret")))console.log("PASS secret-pattern scan");
const ui=["app/patient/page.tsx","app/doctor/page.tsx","app/hospital/page.tsx"].map(x=>read(path.join(root,x))).join("\n");ok(!/Ashoka|Government of India|Ministry of Health/i.test(ui),"UI does not imply Government of India ownership");ok(ui.includes("Hospital Operations")||ui.includes("independent"),"institutional UI contains independence disclosure");ok(fs.existsSync(path.join(root,"CHECKPUSH.md")),"CHECKPUSH.md exists at package root");
const offline=read(path.join(root,"lib/offline-resilience.ts"));
ok(/AES-GCM/.test(offline)&&/indexedDB\.open/.test(offline)&&!/localStorage|sessionStorage/.test(offline),"offline recovery uses encrypted IndexedDB only");
ok(/generateKey\([\s\S]*false/.test(offline),"offline encryption key is non-extractable");
ok(/SENSITIVE_IDENTITY_NOT_CACHEABLE/.test(offline)&&/SENSITIVE_DRAFT_NOT_CACHEABLE/.test(offline),"offline cache rejects ABHA and document/blob drafts");
ok(/resume_token_hash/.test(sql)&&/resume_expires_at/.test(sql)&&/find_resumable_session/.test(sql),"schema contains bounded hashed session resume");
ok(/client_mutation_id/.test(sql)&&/idx_complaints_client_mutation/.test(sql),"queued complaint replay has database idempotency");
const shell=read(path.join(root,"app/patient/PatientShell.tsx"));
ok(/addEventListener\("online"/.test(shell)&&/replayQueuedMutations/.test(shell),"patient shell auto-replays queued changes on reconnect");
ok((shell.match(/pendingMutationCount\(\)>0&&!await flush\(\)/g)||[]).length>=2,"older offline writes flush before newer online writes");
ok(/currentStep==="complete"\)\{await clearOfflineState\(\);return;/.test(shell),"submitted cases purge local PHI recovery state");
const hospitalApi=read(path.join(root,"app/api/hospital/overview/route.ts"));
ok(!/primaryComplaint|complaintText/.test(hospitalApi),"hospital operations API excludes chief-complaint PHI");
const queueApi=read(path.join(root,"app/api/staff/queue/route.ts"));
ok(/requireStaff\("DOCTOR"\)/.test(queueApi),"clinical case queue is doctor-role only");
const heartbeat=read(path.join(root,"app/api/kiosk/heartbeat/route.ts"));
ok(/KIOSK_HEARTBEAT_SECRET/.test(heartbeat)&&/timingSafeEqual/.test(heartbeat),"production kiosk heartbeat requires timing-safe device authentication");
const ocrRoute=read(path.join(root,"app/api/patient/documents/[id]/ocr/route.ts"));
ok(/OCR_IN_PROGRESS/.test(ocrRoute)&&/runOcr/.test(ocrRoute),"OCR path has claim/process/finalize concurrency protection");
if(failures.length){console.error(`\nQUALITY GATE FAILED (${failures.length})`);for(const f of failures)console.error(`FAIL ${f}`);process.exit(1)}console.log(`\nQUALITY GATE PASSED (${checks} contract checks + full TS syntax sweep)`);
