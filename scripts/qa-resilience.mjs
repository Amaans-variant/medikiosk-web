import { chromium } from "playwright";

const base=process.env.BASE_URL??"http://127.0.0.1:3000";
const hospitalEmail=process.env.E2E_HOSPITAL_EMAIL;
const hospitalPassword=process.env.E2E_HOSPITAL_PASSWORD;
if(!hospitalEmail||!hospitalPassword){
  console.error("E2E_HOSPITAL_EMAIL and E2E_HOSPITAL_PASSWORD are required for the least-privilege operations check.");
  process.exit(2);
}

function check(condition,message){if(!condition)throw new Error(`FAIL ${message}`);console.log(`PASS ${message}`);}
async function patientSession(page){return page.evaluate(async()=>{const r=await fetch("/api/patient/session",{cache:"no-store"});return {status:r.status,body:await r.json().catch(()=>null)};});}
async function encryptedStateDoesNotContain(page,needle){return page.evaluate(async(value)=>{
  const db=await new Promise((resolve,reject)=>{const q=indexedDB.open("medikiosk-resilience-v1",1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  try{const record=await new Promise((resolve,reject)=>{const tx=db.transaction("state","readonly");const q=tx.objectStore("state").get("active");q.onsuccess=()=>resolve(q.result??null);q.onerror=()=>reject(q.error);});return !JSON.stringify(record).includes(value);}finally{db.close();}
 },needle);}

const browser=await chromium.launch({headless:true});
let patientContext;
try{
  patientContext=await browser.newContext({viewport:{width:390,height:844}});
  const page=await patientContext.newPage();
  await page.goto(`${base}/patient`,{waitUntil:"domcontentloaded"});
  await page.getByRole("button",{name:/begin|start/i}).click();
  await page.waitForURL(/\/patient\/language/);
  const initial=await patientSession(page);check(initial.status===200,"server patient session created");
  const caseId=initial.body?.workflow?.caseId;check(typeof caseId==="string"&&caseId.startsWith("CASE-"),"case identity allocated once");

  await page.getByRole("button",{name:/continue/i}).click();await page.waitForURL(/\/consent/);
  await page.getByRole("button",{name:/agree|consent/i}).click();await page.waitForURL(/\/identity/);
  await page.getByRole("button",{name:/without abha|skip/i}).click();await page.waitForURL(/\/start/);
  await page.getByRole("button",{name:/continue/i}).click();await page.waitForURL(/\/complaint/);

  const unique=`QA offline recovery ${Date.now()}`;
  await page.locator("textarea#chief").fill(unique);
  await page.waitForTimeout(150);
  check(await encryptedStateDoesNotContain(page,unique),"typed PHI is not plaintext in IndexedDB record");

  await patientContext.setOffline(true);
  await page.getByRole("button",{name:/continue/i}).click();
  await page.waitForURL(/\/anatomy/);
  check(await page.getByText(/Offline/i).first().isVisible(),"patient can continue from complaint after network loss");

  await page.getByRole("button",{name:/Chest/i}).click();
  await page.getByRole("button",{name:/continue/i}).click();
  await page.waitForURL(/\/symptoms/);
  await page.locator("textarea#extra").fill("Nausea while offline");
  await page.getByRole("button",{name:/save symptom/i}).click();
  await page.getByText(/saved offline/i).waitFor();
  await page.getByRole("button",{name:/continue/i}).click();
  await page.waitForURL(/\/interview/);
  check(await page.getByText(/Offline .*pending/i).first().isVisible(),"multiple offline mutations remain visibly pending");

  await patientContext.setOffline(false);
  await page.getByText(/Saved/i).first().waitFor({timeout:15000});
  const synced=await patientSession(page);check(synced.status===200,"reconnected session is readable");
  check(synced.body?.workflow?.caseId===caseId,"reconnect preserves original case identity");
  check(synced.body?.workflow?.currentStep==="interview","queued steps replay in order through interview");

  await patientContext.clearCookies();
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForURL(/\/patient\/interview/,{timeout:15000});
  const resumed=await patientSession(page);check(resumed.status===200,"expired/missing short cookie is securely resumed");
  check(resumed.body?.workflow?.caseId===caseId,"secure resume does not create a duplicate case");

  await patientContext.clearCookies();
  await page.close();
  const reopened=await patientContext.newPage();
  await reopened.goto(`${base}/patient`,{waitUntil:"domcontentloaded"});
  await reopened.waitForURL(/\/patient\/interview/,{timeout:15000});
  const reopenedSession=await patientSession(reopened);check(reopenedSession.body?.workflow?.caseId===caseId,"encrypted recovery survives page close/reopen once network is available");

  const hospital=await browser.newContext({viewport:{width:1366,height:768}});const h=await hospital.newPage();
  await h.goto(`${base}/hospital/login`);await h.locator('input[type="email"]').fill(hospitalEmail);await h.locator('input[type="password"]').fill(hospitalPassword);await h.getByRole("button",{name:/sign in/i}).click();await h.waitForURL(/\/hospital$/);
  const overview=await h.evaluate(async()=>{const r=await fetch("/api/hospital/overview",{cache:"no-store"});return {status:r.status,text:await r.text()};});
  check(overview.status===200,"hospital operations API is available to hospital role");
  check(!overview.text.includes(unique)&&!overview.text.includes("Nausea while offline"),"hospital operations response does not leak chief-complaint PHI");
  await hospital.close();

  await reopened.evaluate(async()=>{await fetch("/api/patient/session/reset",{method:"POST"}).catch(()=>null);});
  console.log("\nRESILIENCE CHAOS QA PASSED");
}finally{
  if(patientContext)await patientContext.close().catch(()=>{});
  await browser.close();
}
