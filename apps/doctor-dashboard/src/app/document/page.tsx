"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore, Medication, LabValue } from "@/store/kioskStore";
import { DocumentOcrService, DocumentType } from "@/services/ocr/documentOcrService";
import { 
  FileScan, 
  Pill, 
  FlaskConical, 
  CheckCircle2, 
  Camera, 
  RefreshCw,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCAN_STEPS = [
  "Optical document edge detection...",
  "Running AI OCR on handwritten prescription...",
  "Extracting Ayurvedic & Allopathic medications (NER)...",
  "Validating dosage & cross-checking lab reference ranges...",
];

const DEFAULT_SAMPLE_MEDS: Medication[] = [
  { name: 'Amlodipine', dose: '5mg', frequency: 'OD', note: 'morning, post-meal', confidence: 0.96, source: 'ocr' },
  { name: 'Metformin HCl', dose: '500mg', frequency: 'BD', note: 'with meals', confidence: 0.94, source: 'ocr' },
];

const DEFAULT_SAMPLE_LABS: LabValue[] = [
  { test: 'Blood Glucose (R)', value: '194 mg/dL', range: '70 – 140 mg/dL', flag: 'high', confidence: 0.96 },
  { test: 'Serum Creatinine', value: '1.1 mg/dL', range: '0.6 – 1.2 mg/dL', flag: 'normal', confidence: 0.94 },
];

export default function DocumentStep() {
  const router = useRouter();
  const { currentPatient, setScannedDocuments } = useKioskStore();
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'done' | 'fallback'>(
    currentPatient.scannedDocs?.medications?.length > 0 ? 'done' : 'idle'
  );
  const [progress, setProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  // Manual medication form state
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newMed, setNewMed] = useState<Partial<Medication>>({
    name: "",
    dose: "",
    frequency: "OD",
    note: "after food",
  });

  // Manual lab form state
  const [isAddingLab, setIsAddingLab] = useState(false);
  const [newLab, setNewLab] = useState<Partial<LabValue>>({
    test: "",
    value: "",
    range: "",
    flag: "normal",
  });

  // Editing existing medication inline
  const [editingMedIdx, setEditingMedIdx] = useState<number | null>(null);
  const [editMedForm, setEditMedForm] = useState<Partial<Medication>>({});

  const [docType, setDocType] = useState<DocumentType>("prescription");
  const [currentPageCount, setCurrentPageCount] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [hasPhysicalDoc, setHasPhysicalDoc] = useState<boolean>(true);

  const medications = currentPatient.scannedDocs?.medications || [];
  const labValues = currentPatient.scannedDocs?.labValues || [];

  const startScan = (newDocType?: DocumentType, forceDemoMode?: boolean) => {
    const activeDocType = newDocType || docType;
    const activeDemo = forceDemoMode !== undefined ? forceDemoMode : isDemoMode;
    
    setScanStatus('scanning');
    setProgress(0);
    setMessageIdx(0);
    setIsAddingMed(false);
    setIsAddingLab(false);

    const nextPageNum = currentPageCount + 1;
    const duration = 1800;
    const interval = 40;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      setMessageIdx(Math.min(Math.floor((pct / 100) * SCAN_STEPS.length), SCAN_STEPS.length - 1));

      if (elapsed >= duration) {
        clearInterval(timer);
        setScanStatus('done');
        setCurrentPageCount(nextPageNum);

        const ocrResult = DocumentOcrService.processDocument({
          documentType: activeDocType,
          hasPhysicalDocument: hasPhysicalDoc,
          demoMode: activeDemo,
          pagesToScan: nextPageNum
        });

        // Accumulate newly extracted entities into active session store
        const mappedMeds: Medication[] = ocrResult.accumulatedMedications.map((m) => ({
          id: m.id,
          name: m.name,
          dose: m.dosage || "As directed",
          frequency: m.frequency || "OD",
          note: m.note || "post-meal",
          confidence: m.confidence,
          source: m.confidence < 1.0 ? 'ocr' : 'reported'
        }));

        const mappedLabs: LabValue[] = ocrResult.accumulatedLabValues.map((l) => ({
          id: l.id,
          test: l.name,
          value: l.value || "Normal",
          range: l.referenceRange || "Normal",
          flag: (l.abnormalFlag === "high" || l.abnormalFlag === "low") ? l.abnormalFlag : "normal",
          confidence: l.confidence
        }));

        setScannedDocuments(mappedMeds, mappedLabs);
      }
    }, interval);
  };

  const handleNoDocumentProvided = () => {
    setHasPhysicalDoc(false);
    setIsDemoMode(false);
    setScanStatus('idle');
    setScannedDocuments([], []);
  };

  const simulateOcrFallback = () => {
    setScanStatus('fallback');
    setIsAddingMed(true);
  };

  const handleAddMedication = () => {
    if (!newMed.name?.trim()) return;
    const item: Medication = {
      name: newMed.name.trim(),
      dose: newMed.dose?.trim() || "As directed",
      frequency: newMed.frequency || "OD",
      note: newMed.note?.trim() || "as advised",
      source: 'reported',
      confidence: 1.0,
    };
    const updated = [...medications, item];
    setScannedDocuments(updated, labValues);
    setNewMed({ name: "", dose: "", frequency: "OD", note: "after food" });
    setIsAddingMed(false);
  };

  const handleRemoveMedication = (idx: number) => {
    const updated = medications.filter((_, i) => i !== idx);
    setScannedDocuments(updated, labValues);
  };

  const handleStartEditMed = (idx: number) => {
    setEditingMedIdx(idx);
    setEditMedForm({ ...medications[idx] });
  };

  const handleSaveEditMed = () => {
    if (editingMedIdx === null || !editMedForm.name?.trim()) return;
    const updated = [...medications];
    updated[editingMedIdx] = {
      ...updated[editingMedIdx],
      name: editMedForm.name.trim(),
      dose: editMedForm.dose?.trim() || updated[editingMedIdx].dose,
      frequency: editMedForm.frequency || updated[editingMedIdx].frequency,
      note: editMedForm.note?.trim() || updated[editingMedIdx].note,
      source: 'reported',
    };
    setScannedDocuments(updated, labValues);
    setEditingMedIdx(null);
  };

  const handleAddLab = () => {
    if (!newLab.test?.trim() || !newLab.value?.trim()) return;
    const item: LabValue = {
      test: newLab.test.trim(),
      value: newLab.value.trim(),
      range: newLab.range?.trim() || "Normal",
      flag: newLab.flag || "normal",
      confidence: 1.0,
    };
    const updated = [...labValues, item];
    setScannedDocuments(medications, updated);
    setNewLab({ test: "", value: "", range: "", flag: "normal" });
    setIsAddingLab(false);
  };

  const handleRemoveLab = (idx: number) => {
    const updated = labValues.filter((_, i) => i !== idx);
    setScannedDocuments(medications, updated);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-32">
      {/* Progress Bar */}
      <div className="w-full max-w-[1024px] px-4 sm:px-8 pt-6">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal w-[75%] transition-all duration-500 ease-out" />
        </div>
        <div className="mt-2 text-text-muted text-xs sm:text-sm font-medium flex justify-between items-center">
          <span>चरण 3 / 4 · पर्ची व लैब रिपोर्ट (Step 3 of 4 · Documents & Labs)</span>
          <span className="text-teal font-bold">OCR & Clinical Extraction</span>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="w-full max-w-[1024px] px-4 sm:px-8 flex justify-between items-center mt-4 sm:mt-6">
        <button 
          onClick={() => router.push("/complaint")}
          className="text-primary font-semibold text-base sm:text-xl flex items-center gap-1 sm:gap-2 animate-press"
        >
          <span className="text-xl sm:text-2xl">←</span> Peeche (Back)
        </button>
        <button 
          onClick={() => router.push("/summary")}
          className="text-text-muted hover:text-text font-semibold text-xs sm:text-base flex items-center gap-1.5 animate-press bg-surface-card px-3 sm:px-4 py-2 rounded-xl border border-border"
        >
          Skip (No Docs) ⏭
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[820px] mt-5 sm:mt-6 flex flex-col items-center px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
            Puraani Parchi Ya Test Report Scan Karein
          </h1>
          <h2 className="text-text-muted text-sm sm:text-lg mt-1">
            Scan your doctor prescriptions or blood test reports — with full manual fallback
          </h2>
        </div>

        {/* Document Category Selection */}
        <div className="w-full grid grid-cols-3 gap-2 bg-surface p-1.5 rounded-2xl border border-border text-xs font-bold">
          <button
            onClick={() => setDocType("prescription")}
            className={cn(
              "py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all",
              docType === "prescription" ? "bg-primary text-white shadow-sm font-black" : "text-text-muted hover:text-text"
            )}
          >
            <Pill className="w-4 h-4" />
            <span>Prescription</span>
          </button>
          <button
            onClick={() => setDocType("lab_report")}
            className={cn(
              "py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all",
              docType === "lab_report" ? "bg-teal text-white shadow-sm font-black" : "text-text-muted hover:text-text"
            )}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Lab Report</span>
          </button>
          <button
            onClick={() => setDocType("discharge_summary")}
            className={cn(
              "py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all",
              docType === "discharge_summary" ? "bg-warning text-white shadow-sm font-black" : "text-text-muted hover:text-text"
            )}
          >
            <FileScan className="w-4 h-4" />
            <span>Discharge Summary</span>
          </button>
        </div>

        {/* OCR SCANNER IDLE STATE */}
        {scanStatus === 'idle' && (
          <div className="w-full bg-surface-card border-2 border-dashed border-primary/30 rounded-3xl p-6 sm:p-10 flex flex-col items-center text-center shadow-sm space-y-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-light flex items-center justify-center text-primary animate-pulse">
              <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-text mb-1">Place document under kiosk scanner</h3>
              <p className="text-text-muted text-sm sm:text-base max-w-md">
                Scanning category: <strong className="text-primary capitalize">{docType.replace("_", " ")}</strong>
                {currentPageCount > 0 && ` (${currentPageCount} page(s) scanned)`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-md">
              <button
                onClick={() => startScan(docType, isDemoMode)}
                className="w-full bg-primary text-white font-bold text-base sm:text-lg py-4 rounded-2xl shadow-md hover:bg-primary-dark animate-press flex items-center justify-center gap-2.5 transition-all"
              >
                <Camera className="w-5 h-5" />
                {currentPageCount > 0 ? `Scan Page ${currentPageCount + 1}` : "Start Scanner (स्कैन शुरू करें)"}
              </button>

              <label className="w-full bg-surface border-2 border-primary/30 text-primary hover:bg-primary/5 font-bold text-xs sm:text-sm py-3.5 rounded-2xl animate-press flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <FileScan className="w-4 h-4" />
                Upload File (Max 10MB)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      alert("File size exceeds 10MB limit. Please select a smaller file.");
                      return;
                    }
                    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
                    if (!allowedTypes.includes(file.type)) {
                      alert("Invalid file format. Please upload JPG, PNG, or PDF.");
                      return;
                    }
                    startScan(docType, true);
                  }}
                />
              </label>

              <button
                onClick={simulateOcrFallback}
                className="w-full bg-surface border-2 border-warning/50 text-warning hover:bg-warning-light font-bold text-xs sm:text-sm py-3.5 rounded-2xl animate-press flex items-center justify-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-warning" />
                Simulate OCR Failure (Fallback Demo)
              </button>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs">
              <button 
                onClick={handleNoDocumentProvided}
                className="text-text-muted hover:underline"
              >
                No document supplied (Clear OCR state)
              </button>
            </div>
          </div>
        )}

        {/* SCANNING IN PROGRESS STATE */}
        {scanStatus === 'scanning' && (
          <div className="w-full bg-surface-card border-2 border-teal rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center shadow-md">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-5">
              <div className="w-full h-full rounded-full border-4 border-teal-light border-t-teal animate-spin" />
              <FileScan className="w-10 h-10 sm:w-12 sm:h-12 text-teal absolute inset-0 m-auto" />
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-text mb-2">
              {SCAN_STEPS[messageIdx]}
            </h3>
            
            <div className="w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-teal transition-all duration-100 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-sm font-bold text-teal mt-2">{progress}% Completed</span>
          </div>
        )}

        {/* OCR FAILURE / FALLBACK NOTICE */}
        {scanStatus === 'fallback' && (
          <div className="w-full bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                  OCR Detection Fallback · Document Unclear (Low Confidence 28%)
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  Optical recognition could not read the handwriting reliably. No problem! Add your active medications manually below or show the physical document to the doctor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={() => startScan(docType, isDemoMode)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 animate-press transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-scan
              </button>
              <button
                onClick={() => {
                  setScannedDocuments(DEFAULT_SAMPLE_MEDS, DEFAULT_SAMPLE_LABS);
                  setScanStatus('done');
                }}
                className="bg-surface border border-amber-400 text-amber-900 font-bold text-xs px-3 py-2.5 rounded-xl hover:bg-amber-100 transition-colors"
              >
                Load Sample
              </button>
            </div>
          </div>
        )}

        {/* SCAN SUCCESS BANNER */}
        {scanStatus === 'done' && (
          <div className="w-full bg-success-light border border-success/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-success">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-success" />
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Document analyzed successfully! ({currentPageCount} Page(s) Scanned)</span>
                  {isDemoMode && (
                    <span className="text-[10px] bg-teal text-white font-black px-2 py-0.5 rounded font-mono">
                      SIMULATED DEMO OCR
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Accumulated {medications.length} active prescriptions and {labValues.length} lab biomarkers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startScan(docType, isDemoMode)}
                className="text-xs bg-teal text-white font-bold px-3 py-2 rounded-xl hover:bg-teal-bright flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Scan Page {currentPageCount + 1}
              </button>
              <button
                onClick={simulateOcrFallback}
                className="text-xs text-warning hover:underline font-semibold flex items-center gap-1 shrink-0 self-end sm:self-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Test Fallback Flow
              </button>
            </div>
          </div>
        )}

        {/* MEDICATIONS & LABS CONTAINER (Active in 'done', 'fallback', or whenever items exist) */}
        {(scanStatus === 'done' || scanStatus === 'fallback' || medications.length > 0) && (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* MEDICATIONS CARD */}
              <div className="bg-surface-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-text text-base flex items-center gap-2">
                      <Pill className="w-4 h-4 text-primary" />
                      Prescriptions ({medications.length})
                    </h4>
                    <button
                      onClick={() => setIsAddingMed(!isAddingMed)}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1 bg-primary-light px-2.5 py-1 rounded-lg animate-press"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isAddingMed ? "Band Karein" : "Dawai Jodein"}
                    </button>
                  </div>

                  {/* Add Medication Inline Form */}
                  {isAddingMed && (
                    <div className="bg-surface p-3.5 rounded-xl border border-primary/30 mb-3 space-y-2.5 animate-fadeIn">
                      <div className="text-xs font-bold text-primary flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Nayi Dawai Likhien (Add Medicine)
                      </div>
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Amlodipine, Ashwagandha)"
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Dose (e.g. 5mg, 2 tsp)"
                          value={newMed.dose}
                          onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <select
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                        >
                          <option value="OD">OD (Once Daily / Din Mein 1 Baar)</option>
                          <option value="BD">BD (Twice Daily / Din Mein 2 Baar)</option>
                          <option value="TDS">TDS (Thrice Daily / Din Mein 3 Baar)</option>
                          <option value="HS">HS (Bedtime / Raat Ko Sote Samay)</option>
                          <option value="SOS">SOS (When Required / Jarurat Par)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Instructions (e.g. after food, with warm water)"
                        value={newMed.note}
                        onChange={(e) => setNewMed({ ...newMed, note: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setIsAddingMed(false)}
                          className="text-xs text-text-muted hover:text-text px-2.5 py-1 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddMedication}
                          className="text-xs bg-primary text-white font-bold px-3 py-1 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Save Medicine
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Medication List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {medications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-text-muted">
                        No prescriptions recorded yet. Tap &ldquo;Dawai Jodein&rdquo; to add manually.
                      </div>
                    ) : (
                      medications.map((m, idx) => (
                        <div key={idx} className="p-3 bg-surface rounded-xl border border-border flex justify-between items-center group">
                          {editingMedIdx === idx ? (
                            <div className="w-full space-y-2">
                              <input
                                type="text"
                                value={editMedForm.name || ""}
                                onChange={(e) => setEditMedForm({ ...editMedForm, name: e.target.value })}
                                className="w-full text-xs p-1.5 border border-border rounded bg-surface-card"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editMedForm.dose || ""}
                                  onChange={(e) => setEditMedForm({ ...editMedForm, dose: e.target.value })}
                                  className="w-1/2 text-xs p-1.5 border border-border rounded bg-surface-card"
                                />
                                <select
                                  value={editMedForm.frequency || "OD"}
                                  onChange={(e) => setEditMedForm({ ...editMedForm, frequency: e.target.value })}
                                  className="w-1/2 text-xs p-1.5 border border-border rounded bg-surface-card font-medium"
                                >
                                  <option value="OD">OD</option>
                                  <option value="BD">BD</option>
                                  <option value="TDS">TDS</option>
                                  <option value="HS">HS</option>
                                  <option value="SOS">SOS</option>
                                </select>
                              </div>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingMedIdx(null)}
                                  className="text-[11px] px-2 py-0.5 rounded text-text-muted"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEditMed}
                                  className="text-[11px] bg-primary text-white font-bold px-2.5 py-0.5 rounded"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="font-bold text-sm text-text flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  <span className="text-xs text-text-muted font-normal">({m.dose})</span>
                                  {m.source === 'reported' ? (
                                    <span className="text-[10px] bg-gray-100 text-text-muted px-1.5 py-0.2 rounded">
                                      Manual
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-teal-light text-teal font-semibold px-1.5 py-0.2 rounded">
                                      OCR
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-text-muted">{m.note}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold bg-primary-light text-primary px-2 py-1 rounded">
                                  {m.frequency}
                                </span>
                                <button
                                  onClick={() => handleStartEditMed(idx)}
                                  className="text-text-muted hover:text-primary p-1 rounded transition-colors"
                                  title="Edit Medication"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMedication(idx)}
                                  className="text-text-muted hover:text-alert p-1 rounded transition-colors"
                                  title="Delete Medication"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* LABS CARD */}
              <div className="bg-surface-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-text text-base flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-teal" />
                      Lab Biomarkers ({labValues.length})
                    </h4>
                    <button
                      onClick={() => setIsAddingLab(!isAddingLab)}
                      className="text-xs text-teal font-bold hover:underline flex items-center gap-1 bg-teal-light px-2.5 py-1 rounded-lg animate-press"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isAddingLab ? "Band Karein" : "Lab Test Jodein"}
                    </button>
                  </div>

                  {/* Add Lab Inline Form */}
                  {isAddingLab && (
                    <div className="bg-surface p-3.5 rounded-xl border border-teal/30 mb-3 space-y-2.5 animate-fadeIn">
                      <div className="text-xs font-bold text-teal flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Nayi Lab Value Likhien (Add Lab Report)
                      </div>
                      <input
                        type="text"
                        placeholder="Test Name (e.g. HbA1c, Fasting Glucose)"
                        value={newLab.test}
                        onChange={(e) => setNewLab({ ...newLab, test: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-teal"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Value (e.g. 194 mg/dL)"
                          value={newLab.value}
                          onChange={(e) => setNewLab({ ...newLab, value: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-teal"
                        />
                        <input
                          type="text"
                          placeholder="Range (e.g. 70-140)"
                          value={newLab.range}
                          onChange={(e) => setNewLab({ ...newLab, range: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-teal"
                        />
                        <select
                          value={newLab.flag}
                          onChange={(e) => setNewLab({ ...newLab, flag: e.target.value as 'high' | 'low' | 'normal' })}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface-card focus:outline-none focus:ring-1 focus:ring-teal font-medium"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High (उच्च)</option>
                          <option value="low">Low (निम्न)</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setIsAddingLab(false)}
                          className="text-xs text-text-muted hover:text-text px-2.5 py-1 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddLab}
                          className="text-xs bg-teal text-white font-bold px-3 py-1 rounded-lg hover:bg-teal-bright transition-colors"
                        >
                          Save Lab Value
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lab Values List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {labValues.length === 0 ? (
                      <div className="text-center py-6 text-xs text-text-muted">
                        No lab values recorded yet. Tap &ldquo;Lab Test Jodein&rdquo; to add manually.
                      </div>
                    ) : (
                      labValues.map((l, idx) => (
                        <div key={idx} className="p-3 bg-surface rounded-xl border border-border flex justify-between items-center group">
                          <div>
                            <div className="font-bold text-sm text-text">{l.test}</div>
                            <div className="text-xs text-text-muted">Norm: {l.range}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className={cn(
                                "text-sm font-mono font-bold",
                                l.flag === 'high' ? "text-alert" : l.flag === 'low' ? "text-warning" : "text-teal"
                              )}>
                                {l.value}
                              </span>
                              <span className={cn(
                                "block text-[10px] font-bold uppercase",
                                l.flag === 'high' ? "text-alert" : l.flag === 'low' ? "text-warning" : "text-teal"
                              )}>
                                {l.flag}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveLab(idx)}
                              className="text-text-muted hover:text-alert p-1 rounded transition-colors"
                              title="Delete Lab Test"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rescan button */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => startScan(docType, isDemoMode)}
                className="text-primary text-xs sm:text-sm font-semibold flex items-center gap-2 hover:underline"
              >
                <RefreshCw className="w-4 h-4" /> Scan Another Page (अन्य दस्तावेज़ स्कैन करें)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-sm p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <button
          onClick={() => router.push("/summary")}
          className="max-w-[820px] w-full bg-primary text-white font-bold text-lg sm:text-xl md:text-2xl py-4 sm:py-5 rounded-2xl shadow-lg hover:bg-primary-dark animate-press transition-colors"
        >
          {medications.length > 0 || labValues.length > 0
            ? `Review & Generate Token (${medications.length} Prescriptions, ${labValues.length} Labs) →`
            : "Aage Badhein (Next Step) →"}
        </button>
      </div>
    </div>
  );
}

