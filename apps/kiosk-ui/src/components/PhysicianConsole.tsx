"use client";

import React, { useState, useMemo } from "react";
import { useKioskStore, PatientRecord } from "@/store/kioskStore";
import { 
  UserRound, 
  Pencil, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Sparkles,
  Flame,
  Activity,
  ShieldAlert,
  Check,
  X,
  RotateCcw,
  Search,
  Copy,
  Calendar,
  Stethoscope,
  HeartPulse,
  History,
  Building2,
  SlidersHorizontal,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type QueueFilterTab = "PRIORITY" | "WAITING" | "REINTERVIEW" | "COMPLETED" | "REJECTED";
type ClinicalViewTab = "summary" | "history" | "meds_labs" | "timeline" | "audit_trail" | "ayush";

export default function PhysicianConsole() {
  const { 
    queue, 
    selectedPatientId, 
    selectPatient, 
    confirmPatient, 
    rejectPatient, 
    requestReinterview, 
    updatePatientRecord,
    pushToEmr 
  } = useKioskStore();

  const patient = queue.find((p) => p.id === selectedPatientId) || queue[0];

  // UI States
  const [queueTab, setQueueTab] = useState<QueueFilterTab>("PRIORITY");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ClinicalViewTab>("summary");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAbha, setCopiedAbha] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);

  // Doctor Action Modals & Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isReinterviewModalOpen, setIsReinterviewModalOpen] = useState(false);
  const [reinterviewNotes, setReinterviewNotes] = useState("");

  // Edit Form State
  const [editForm, setEditForm] = useState({
    hpi: "",
    complaintLabel: "",
    duration: "",
    severity: 5,
    pastMedical: "",
    pastSurgical: "",
    allergies: "",
    familyHistory: "",
    diet: "",
    smoking: "",
    alcohol: ""
  });

  // Filtered Queue Calculation
  const { priorityCount, waitingCount, reinterviewCount, completedCount, rejectedCount, filteredQueue } = useMemo(() => {
    let pCount = 0;
    let wCount = 0;
    let rCount = 0;
    let cCount = 0;
    let xCount = 0;

    queue.forEach((p) => {
      const isRejected = p.reviewStatus === "doctor_rejected" || p.status === "rejected";
      const isReinterview = p.reviewStatus === "reinterview_requested" || p.status === "reinterview";
      const isCompleted = p.reviewStatus === "doctor_verified" || p.status === "completed" || p.status === "pushed";
      const isPriority = !isCompleted && !isRejected && !isReinterview && ((p.redFlags && p.redFlags.length > 0) || p.room.includes("Emergency") || p.department.includes("Triage"));

      if (isRejected) {
        xCount++;
      } else if (isReinterview) {
        rCount++;
      } else if (isCompleted) {
        cCount++;
      } else if (isPriority) {
        pCount++;
      } else {
        wCount++;
      }
    });

    const filtered = queue.filter((p) => {
      const isRejected = p.reviewStatus === "doctor_rejected" || p.status === "rejected";
      const isReinterview = p.reviewStatus === "reinterview_requested" || p.status === "reinterview";
      const isCompleted = p.reviewStatus === "doctor_verified" || p.status === "completed" || p.status === "pushed";
      const isPriority = !isCompleted && !isRejected && !isReinterview && ((p.redFlags && p.redFlags.length > 0) || p.room.includes("Emergency") || p.department.includes("Triage"));

      // Match Tab
      if (queueTab === "PRIORITY" && !isPriority) return false;
      if (queueTab === "WAITING" && (isPriority || isCompleted || isRejected || isReinterview)) return false;
      if (queueTab === "REINTERVIEW" && !isReinterview) return false;
      if (queueTab === "COMPLETED" && !isCompleted) return false;
      if (queueTab === "REJECTED" && !isRejected) return false;

      // Match Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesToken = p.token.toString().includes(q);
        const matchesAbha = p.abhaId.toLowerCase().includes(q);
        const matchesComplaint = p.complaint.symptomLabel.toLowerCase().includes(q);
        return matchesName || matchesToken || matchesAbha || matchesComplaint;
      }

      return true;
    }).sort((a, b) => {
      // Emergency priority patients auto-sort to top
      const aPriority = (a.redFlags && a.redFlags.length > 0) || a.room.includes("Emergency") || a.department.includes("Triage") ? 1 : 0;
      const bPriority = (b.redFlags && b.redFlags.length > 0) || b.room.includes("Emergency") || b.department.includes("Triage") ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return a.waitSince - b.waitSince;
    });

    return {
      priorityCount: pCount,
      waitingCount: wCount,
      reinterviewCount: rCount,
      completedCount: cCount,
      rejectedCount: xCount,
      filteredQueue: filtered
    };
  }, [queue, queueTab, searchQuery]);

  // Copy ABHA to clipboard
  const handleCopyAbha = (abha: string) => {
    navigator.clipboard?.writeText(abha);
    setCopiedAbha(true);
    setTimeout(() => setCopiedAbha(false), 2000);
  };

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Enter Edit Mode
  const startEditMode = () => {
    if (!patient) return;
    setEditForm({
      hpi: patient.hpiOverride || generateDefaultHpi(patient),
      complaintLabel: patient.complaint.symptomLabel,
      duration: patient.complaint.duration || "Recent",
      severity: patient.complaint.severity || 5,
      pastMedical: (patient.pastHistory?.medical || []).join("\n"),
      pastSurgical: (patient.pastHistory?.surgical || []).join("\n"),
      allergies: (patient.allergies || []).join("\n"),
      familyHistory: (patient.familyHistory || []).join("\n"),
      diet: patient.personalHistory?.diet || "",
      smoking: patient.personalHistory?.smoking || "",
      alcohol: patient.personalHistory?.alcohol || ""
    });
    setIsEditing(true);
  };

  // Save Edit Changes
  const saveEditChanges = () => {
    if (!patient) return;
    const updatedMedical = editForm.pastMedical.split("\n").map((s) => s.trim()).filter(Boolean);
    const updatedSurgical = editForm.pastSurgical.split("\n").map((s) => s.trim()).filter(Boolean);
    const updatedAllergies = editForm.allergies.split("\n").map((s) => s.trim()).filter(Boolean);
    const updatedFamily = editForm.familyHistory.split("\n").map((s) => s.trim()).filter(Boolean);

    updatePatientRecord(patient.id, {
      hpiOverride: editForm.hpi,
      complaint: {
        ...patient.complaint,
        symptomLabel: editForm.complaintLabel,
        duration: editForm.duration,
        severity: editForm.severity
      },
      pastHistory: {
        medical: updatedMedical,
        surgical: updatedSurgical
      },
      allergies: updatedAllergies,
      familyHistory: updatedFamily,
      personalHistory: {
        diet: editForm.diet || patient.personalHistory?.diet || "",
        smoking: editForm.smoking || patient.personalHistory?.smoking || "",
        alcohol: editForm.alcohol || patient.personalHistory?.alcohol || "",
        sleep: patient.personalHistory?.sleep || "",
        bowelBladder: patient.personalHistory?.bowelBladder || ""
      }
    });

    setIsEditing(false);
    showToast("Clinical record amended and saved successfully.");
  };

  // Confirm as Doctor Verified
  const handleConfirm = () => {
    if (!patient) return;
    confirmPatient(patient.id, "Dr. Anand Sharma, MD (Reg #DMC-49210)");
    showToast(`Clinical record verified for ${patient.name}. Status updated to Doctor Verified.`);
  };

  // Reject Draft
  const handleRejectSubmit = () => {
    if (!patient) return;
    rejectPatient(patient.id, rejectReason.trim() || "Clinical intake data rejected by consulting physician.");
    setIsRejectModalOpen(false);
    setRejectReason("");
    showToast(`AI Draft rejected for ${patient.name}.`);
  };

  // Request Re-interview
  const handleReinterviewSubmit = () => {
    if (!patient) return;
    requestReinterview(patient.id, reinterviewNotes.trim() || "Doctor requested re-interview for clinical clarification.");
    setIsReinterviewModalOpen(false);
    setReinterviewNotes("");
    showToast(`Patient ${patient.name} routed back to Kiosk for re-interview.`);
  };

  // Push to ABDM / EMR
  const handlePushToAbdm = () => {
    if (!patient) return;
    pushToEmr(patient.id);
    showToast(`[ABDM / FHIR DEMO SANDBOX] Bundle generated for ${patient.name}. External submission simulated!`);
  };

  function generateDefaultHpi(p: PatientRecord | undefined) {
    if (!p) return "";
    return `Patient presents with ${p.complaint.symptomLabel} persisting for ${p.complaint.duration || 'recent onset'}, evaluated severity at ${p.complaint.severity || 5}/10 on Wong-Baker FACES. ${p.complaint.onset ? `Onset is ${p.complaint.onset}. ` : ''}${p.complaint.character ? `Characterized by ${p.complaint.character}. ` : ''}${p.complaint.radiation ? `Radiation: ${p.complaint.radiation}. ` : ''}Associated symptoms include ${p.complaint.associated?.join(", ") || 'none'}. Aggravating factors: ${p.complaint.aggravatingFactors?.join(", ") || 'None noted'}. Relieving factors: ${p.complaint.relievingFactors?.join(", ") || 'None noted'}. Ayurvedic Pariksha indicates ${p.ayushAssessment?.prakriti || 'Vata-Pitta'} Prakriti with ${p.ayushAssessment?.agni || 'Tikshna Agni'}.`;
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-surface">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-slate-900 text-white border border-teal/40 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 transition-all">
          <CheckCircle2 className="w-5 h-5 text-teal" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Queue Toggle Bar */}
      <div className="lg:hidden bg-surface-card border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileQueueOpen(!mobileQueueOpen)}
          className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {mobileQueueOpen ? "Hide OPD Queue" : `View OPD Queue (${queue.length})`}
        </button>
        {patient && (
          <span className="text-xs font-semibold text-text-muted">
            Token #{patient.token} · {patient.name}
          </span>
        )}
      </div>

      {/* 1. Left Sidebar: OPD Queue with Tabs & Search */}
      <aside 
        className={cn(
          "w-full lg:w-96 border-r border-border bg-surface-card flex flex-col shrink-0 transition-all z-20",
          mobileQueueOpen ? "block fixed inset-y-16 left-0 right-0 z-40 bg-surface-card" : "hidden lg:flex"
        )}
      >
        {/* Queue Header & Search */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-text text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                OPD Live Queue
              </h2>
              <p className="text-xs text-text-muted">AI-Triage & Clinical Case Taking</p>
            </div>
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-black font-mono">
              {queue.length} Active
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, token #, ABHA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          {/* Top-Level Queue Tabs: PRIORITY, WAITING, REINTERVIEW, COMPLETED, REJECTED */}
          <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-xl border border-border text-[11px] font-bold">
            <button
              onClick={() => setQueueTab("PRIORITY")}
              className={cn(
                "flex-1 min-w-[65px] py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all",
                queueTab === "PRIORITY"
                  ? "bg-alert text-white shadow-sm font-black"
                  : "text-text-muted hover:text-text"
              )}
            >
              <span>🚨 Priority</span>
              {priorityCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  queueTab === "PRIORITY" ? "bg-white text-alert" : "bg-alert/15 text-alert"
                )}>
                  {priorityCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setQueueTab("WAITING")}
              className={cn(
                "flex-1 min-w-[60px] py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all",
                queueTab === "WAITING"
                  ? "bg-primary text-white shadow-sm font-black"
                  : "text-text-muted hover:text-text"
              )}
            >
              <span>Waiting</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                queueTab === "WAITING" ? "bg-white text-primary" : "bg-primary/10 text-primary"
              )}>
                {waitingCount}
              </span>
            </button>

            <button
              onClick={() => setQueueTab("REINTERVIEW")}
              className={cn(
                "flex-1 min-w-[70px] py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all",
                queueTab === "REINTERVIEW"
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-text-muted hover:text-text"
              )}
            >
              <span>Re-interview</span>
              {reinterviewCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  queueTab === "REINTERVIEW" ? "bg-white text-blue-700" : "bg-blue-100 text-blue-800"
                )}>
                  {reinterviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setQueueTab("COMPLETED")}
              className={cn(
                "flex-1 min-w-[60px] py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all",
                queueTab === "COMPLETED"
                  ? "bg-teal text-white shadow-sm font-black"
                  : "text-text-muted hover:text-text"
              )}
            >
              <span>Verified</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                queueTab === "COMPLETED" ? "bg-white text-teal" : "bg-teal-light text-teal"
              )}>
                {completedCount}
              </span>
            </button>

            <button
              onClick={() => setQueueTab("REJECTED")}
              className={cn(
                "flex-1 min-w-[60px] py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all",
                queueTab === "REJECTED"
                  ? "bg-rose-700 text-white shadow-sm font-black"
                  : "text-text-muted hover:text-text"
              )}
            >
              <span>Rejected</span>
              {rejectedCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  queueTab === "REJECTED" ? "bg-white text-rose-700" : "bg-rose-100 text-rose-800"
                )}>
                  {rejectedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">
              No patients in {queueTab.toLowerCase()} queue.
            </div>
          ) : (
            filteredQueue.map((p) => {
              const isSelected = p.id === patient?.id;
              const waitMinutes = Math.floor((Date.now() - p.waitSince) / 60000);
              const hasRedFlags = p.redFlags && p.redFlags.length > 0;
              const isVerified = p.reviewStatus === "doctor_verified" || p.status === "completed" || p.status === "pushed";

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    selectPatient(p.id);
                    setIsEditing(false);
                    setMobileQueueOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-surface",
                    isSelected && "bg-primary-light border-l-4 border-primary"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 text-sm",
                    hasRedFlags && !isVerified
                      ? "bg-alert/15 text-alert font-black border border-alert/30"
                      : isVerified
                      ? "bg-teal-light text-teal border border-teal/30"
                      : "bg-primary/10 text-primary"
                  )}>
                    #{p.token}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-text text-sm truncate">{p.name}</span>
                      <span className="text-[11px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {waitMinutes}m
                      </span>
                    </div>

                    <p className="text-xs text-text-muted truncate mb-2">
                      {p.age}y · {p.gender} · {p.complaint.symptomLabel}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-surface px-2 py-0.5 rounded border border-border text-text">
                        {p.department.split(" ")[0]}
                      </span>
                      {p.consultationType === "ayurveda" && (
                        <span className="text-[10px] font-bold bg-teal-light text-teal px-2 py-0.5 rounded border border-teal/20">
                          🌿 AYUSH
                        </span>
                      )}

                      {hasRedFlags && !isVerified && (
                        <span className="text-[10px] font-black bg-alert text-white px-2 py-0.5 rounded flex items-center gap-1">
                          🚨 Priority
                        </span>
                      )}

                      {isVerified && (
                        <span className="text-[10px] font-bold bg-teal-light text-teal px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}

                      {!hasRedFlags && !isVerified && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          AI Draft
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Main Consult Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {patient ? (
          <>
            {/* Top Patient Header Banner with Demographics & Vitals */}
            <div className="bg-surface-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                    <UserRound className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-text">{patient.name}</h1>
                      <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md">
                        Token #{patient.token}
                      </span>
                      <span className="text-xs font-bold bg-teal-light text-teal px-2.5 py-1 rounded-md">
                        {patient.room}
                      </span>
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                        {patient.consultationType === "ayurveda" ? "🌿 Ayurveda Stream" : "🏥 Modern Medicine"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs sm:text-sm text-text-muted mt-1 flex-wrap">
                      <span>{patient.age} yrs · {patient.gender === "M" ? "Male" : "Female"}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        ABHA: <strong className="font-mono text-primary">{patient.abhaId}</strong>
                        <button
                          onClick={() => handleCopyAbha(patient.abhaId)}
                          className="text-text-muted hover:text-primary transition-colors"
                          title="Copy ABHA ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedAbha && <span className="text-[10px] text-teal font-bold">Copied!</span>}
                      </span>
                      <span>·</span>
                      <span>{patient.mobile}</span>
                    </div>
                  </div>
                </div>

                {/* AI Governance / Verification Status Badge */}
                <div className="flex items-center gap-2">
                  {patient.reviewStatus === "doctor_verified" || patient.status === "pushed" ? (
                    <div className="bg-teal-light border border-teal/30 px-3.5 py-2 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-teal uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4" />
                        Doctor Verified
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {patient.verifiedBy || "Dr. Anand Sharma, MD"}
                      </p>
                      {patient.verifiedAt && (
                        <p className="text-[10px] text-text-muted font-mono">
                          {new Date(patient.verifiedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  ) : patient.reviewStatus === "doctor_rejected" ? (
                    <div className="bg-rose-50 border border-rose-300 px-3.5 py-2 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wide">
                        <X className="w-4 h-4" />
                        AI Draft Rejected
                      </div>
                      <p className="text-[11px] text-rose-600 mt-0.5">{patient.rejectionReason || "Clinical data discarded"}</p>
                    </div>
                  ) : patient.reviewStatus === "reinterview_requested" ? (
                    <div className="bg-blue-50 border border-blue-300 px-3.5 py-2 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wide">
                        <RotateCcw className="w-4 h-4" />
                        Re-Interview Requested
                      </div>
                      <p className="text-[11px] text-blue-600 mt-0.5">{patient.reinterviewNotes || "Sent to Kiosk"}</p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-300 px-3.5 py-2 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        AI Draft Intake
                      </div>
                      <p className="text-[11px] text-amber-700 mt-0.5">Physician Review Required</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vitals Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-border">
                <div className="bg-surface p-2.5 rounded-xl border border-border flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">Blood Pressure</span>
                    <span className={cn(
                      "text-xs font-bold font-mono",
                      patient.vitals?.bp?.includes("168") ? "text-alert font-black" : "text-text"
                    )}>
                      {patient.vitals?.bp || "120/80 mmHg"}
                    </span>
                  </div>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border flex items-center gap-2.5">
                  <HeartPulse className="w-4 h-4 text-alert shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">Heart Rate</span>
                    <span className="text-xs font-bold font-mono text-text">
                      {patient.vitals?.pulse || 78} bpm
                    </span>
                  </div>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-teal shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">SpO2</span>
                    <span className={cn(
                      "text-xs font-bold font-mono",
                      (patient.vitals?.spO2 || 99) < 95 ? "text-alert font-black" : "text-text"
                    )}>
                      {patient.vitals?.spO2 || 99}%
                    </span>
                  </div>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-warning shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">Temperature</span>
                    <span className="text-xs font-bold font-mono text-text">
                      {patient.vitals?.temp || 98.4} °F
                    </span>
                  </div>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <Clock className="w-4 h-4 text-text-muted shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block font-semibold">Resp. Rate</span>
                    <span className="text-xs font-bold font-mono text-text">
                      {patient.vitals?.respiratoryRate || 16} /min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Actions Bar (Always Accessible) */}
            <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={startEditMode}
                  className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-surface-card border border-primary/30 text-primary font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Draft
                </button>

                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal text-white font-bold text-xs rounded-xl hover:bg-teal-bright transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Confirm as Doctor Verified
                </button>

                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>

                <button
                  onClick={() => setIsReinterviewModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Request Re-interview
                </button>
              </div>

              <div className="flex items-center gap-2">
                {patient.status === "pushed" ? (
                  <div className="flex items-center gap-1.5 bg-teal-light text-teal px-4 py-2 rounded-xl font-bold text-xs border border-teal/30">
                    <CheckCircle2 className="w-4 h-4" />
                    FHIR Pushed to ABDM
                  </div>
                ) : (
                  <button
                    onClick={handlePushToAbdm}
                    className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary-dark transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Push to ABDM / Hospital EMR
                  </button>
                )}
              </div>
            </div>

            {/* Priority Alert Banner (Non-Diagnostic Phrasing) */}
            {patient.redFlags && patient.redFlags.length > 0 && (
              <div className="bg-alert/10 border-2 border-alert rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-alert text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-alert text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          🚨 PRIORITY PATIENT
                        </span>
                        <span className="text-xs text-text-muted font-mono">
                          Recorded: {new Date(patient.redFlags[0].triggeredAt).toLocaleTimeString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-text mt-1.5">
                        Triggering symptoms: <span className="text-alert">{patient.redFlags[0].condition}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Patient / Session ID: <span className="font-mono text-primary font-bold">{patient.id}</span> · Token #{patient.token}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold bg-alert text-white px-3 py-1.5 rounded-xl shrink-0 shadow-sm">
                    Urgent Clinical Assessment Recommended
                  </span>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-alert/20 text-xs text-alert font-semibold">
                  Reason for priority: Potential emergency symptoms reported — urgent clinical assessment recommended.
                </div>
              </div>
            )}

            {/* Navigation Tabs for 15 Clinical Dimensions */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab("summary")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === "summary"
                    ? "bg-primary text-white shadow-sm font-black"
                    : "text-text-muted hover:text-text bg-surface"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Current Complaint & HPI
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === "history"
                    ? "bg-primary text-white shadow-sm font-black"
                    : "text-text-muted hover:text-text bg-surface"
                )}
              >
                <History className="w-3.5 h-3.5" />
                Past, Family & Personal
              </button>

              <button
                onClick={() => setActiveTab("meds_labs")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === "meds_labs"
                    ? "bg-primary text-white shadow-sm font-black"
                    : "text-text-muted hover:text-text bg-surface"
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                Medications & Labs
              </button>

              <button
                onClick={() => setActiveTab("timeline")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === "timeline"
                    ? "bg-primary text-white shadow-sm font-black"
                    : "text-text-muted hover:text-text bg-surface"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Medical Timeline
              </button>

              <button
                onClick={() => setActiveTab("audit_trail")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === "audit_trail"
                    ? "bg-primary text-white shadow-sm font-black"
                    : "text-text-muted hover:text-text bg-surface"
                )}
              >
                <History className="w-3.5 h-3.5" />
                Audit Trail ({patient.auditLogs?.length || 0})
              </button>

              {patient.consultationType === "ayurveda" && (
                <button
                  onClick={() => setActiveTab("ayush")}
                  className={cn(
                    "px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5",
                    activeTab === "ayush"
                      ? "bg-primary text-white shadow-sm font-black"
                      : "text-text-muted hover:text-text bg-surface"
                  )}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  Ayurvedic Pariksha
                </button>
              )}
            </div>

            {/* TAB 1: Current Complaint & HPI */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                {/* Chief Complaint Card */}
                <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-text text-base flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      Chief Complaint & Presentation
                    </h3>
                    <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-lg">
                      Duration: {patient.complaint.duration || "Acute"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-border">
                      <span className="text-[11px] text-text-muted font-medium block">Reported Symptom</span>
                      <p className="text-sm font-bold text-text mt-1">{patient.complaint.symptomLabel}</p>
                      <span className="text-[10px] text-teal font-mono">Region: {patient.complaint.anatomicalRegion || "General"}</span>
                    </div>

                    <div className="bg-surface p-4 rounded-xl border border-border">
                      <span className="text-[11px] text-text-muted font-medium block">Severity Index (0-10)</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-black text-alert">{patient.complaint.severity || 5}/10</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-alert h-full rounded-full" 
                            style={{ width: `${((patient.complaint.severity || 5) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-text-muted">Wong-Baker FACES Scale</span>
                    </div>

                    <div className="bg-surface p-4 rounded-xl border border-border">
                      <span className="text-[11px] text-text-muted font-medium block">Onset & Course</span>
                      <p className="text-sm font-bold text-text mt-1">{patient.complaint.onset || "Gradual onset"}</p>
                      <span className="text-[10px] text-text-muted">{patient.complaint.character || "Persistent"}</span>
                    </div>
                  </div>

                  {/* Character, Radiation, Aggravating & Relieving Factors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-surface p-4 rounded-xl border border-border">
                    <div>
                      <p className="text-text-muted font-medium">Radiation / Spread:</p>
                      <p className="font-semibold text-text mt-0.5">{patient.complaint.radiation || "Localized, no radiation reported"}</p>
                    </div>
                    <div>
                      <p className="text-text-muted font-medium">Associated Symptoms:</p>
                      <p className="font-semibold text-text mt-0.5">{patient.complaint.associated?.join(", ") || "None reported"}</p>
                    </div>
                    <div>
                      <p className="text-text-muted font-medium">Aggravating Factors:</p>
                      <p className="font-semibold text-text mt-0.5">{patient.complaint.aggravatingFactors?.join(", ") || "None specified"}</p>
                    </div>
                    <div>
                      <p className="text-text-muted font-medium">Relieving Factors:</p>
                      <p className="font-semibold text-text mt-0.5">{patient.complaint.relievingFactors?.join(", ") || "None specified"}</p>
                    </div>
                  </div>
                </div>

                {/* History of Present Illness (HPI) Narrative */}
                <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal" />
                      <h3 className="font-bold text-text text-base">History of Present Illness (HPI)</h3>
                      <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                        🤖 AI Drafted
                      </span>
                    </div>
                    <button
                      onClick={startEditMode}
                      className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 border border-primary/20 px-2.5 py-1 rounded-lg"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit HPI
                    </button>
                  </div>

                  <div className="bg-surface p-4 rounded-xl border border-border text-sm text-text leading-relaxed">
                    {patient.hpiOverride || generateDefaultHpi(patient)}
                  </div>
                  <p className="text-[11px] text-text-muted italic">
                    * AI-Assisted Clinical History. All facts synthesized from patient dialogue; physician verification and sign-off required.
                  </p>
                </div>

                {/* Allergies & Red Flags Quick Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Allergies Card */}
                  <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-alert" />
                        Drug & Other Allergies
                      </h3>
                      <span className="text-[10px] text-text-muted font-bold">High Priority</span>
                    </div>

                    <div className="space-y-2">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        patient.allergies.map((allergy, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "p-3 rounded-xl border text-xs font-bold flex items-center gap-2",
                              allergy.includes("NKDA") || allergy.includes("No Known")
                                ? "bg-teal-light/50 border-teal/30 text-teal"
                                : "bg-alert/10 border-alert/30 text-alert"
                            )}
                          >
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{allergy}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text-muted">
                          No allergy information recorded.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Red Flags Status Card */}
                  <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text text-sm flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-warning" />
                        Red Flags Status
                      </h3>
                      <span className="text-[10px] text-text-muted font-bold">Rule Engine</span>
                    </div>

                    {patient.redFlags && patient.redFlags.length > 0 ? (
                      <div className="p-3 rounded-xl bg-alert/10 border border-alert/30 text-alert text-xs space-y-1">
                        <p className="font-black">🚨 {patient.redFlags[0].condition}</p>
                        <p className="text-[11px] text-text">{patient.redFlags[0].clinicalRationale}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-teal-light/50 border border-teal/30 text-teal rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>None reported — no acute red-flags identified during intake.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Past, Family & Personal History */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {/* Past Medical & Surgical History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Past Medical History */}
                  <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Past Medical History
                      </h3>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Chronic / Prior</span>
                    </div>

                    <ul className="space-y-2">
                      {patient.pastHistory?.medical && patient.pastHistory.medical.length > 0 ? (
                        patient.pastHistory.medical.map((item, idx) => (
                          <li key={idx} className="bg-surface p-3 rounded-xl border border-border text-xs font-semibold text-text flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-text-muted p-2">No past medical illnesses reported.</li>
                      )}
                    </ul>
                  </div>

                  {/* Past Surgical History */}
                  <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text text-sm flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-teal" />
                        Past Surgical History
                      </h3>
                      <span className="text-[10px] bg-teal-light text-teal px-2 py-0.5 rounded font-bold">Procedures</span>
                    </div>

                    <ul className="space-y-2">
                      {patient.pastHistory?.surgical && patient.pastHistory.surgical.length > 0 ? (
                        patient.pastHistory.surgical.map((item, idx) => (
                          <li key={idx} className="bg-surface p-3 rounded-xl border border-border text-xs font-semibold text-text flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-text-muted p-2">No past surgeries reported.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Family History & Personal History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Family History */}
                  <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text text-sm flex items-center gap-2">
                        <UserRound className="w-4 h-4 text-warning" />
                        Family History
                      </h3>
                      <span className="text-[10px] text-text-muted font-bold">1st Degree Relatives</span>
                    </div>

                    <ul className="space-y-2">
                      {patient.familyHistory && patient.familyHistory.length > 0 ? (
                        patient.familyHistory.map((item, idx) => (
                          <li key={idx} className="bg-surface p-3 rounded-xl border border-border text-xs font-semibold text-text flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-text-muted p-2">Non-contributory family history.</li>
                      )}
                    </ul>
                  </div>

                  {/* Personal & Lifestyle History */}
                  <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text text-sm flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        Personal & Lifestyle History
                      </h3>
                      <span className="text-[10px] text-text-muted font-bold">Social / Habits</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-surface p-3 rounded-xl border border-border">
                        <span className="text-[10px] text-text-muted font-semibold block">Diet</span>
                        <p className="font-bold text-text mt-0.5">{patient.personalHistory?.diet || "Mixed"}</p>
                      </div>

                      <div className="bg-surface p-3 rounded-xl border border-border">
                        <span className="text-[10px] text-text-muted font-semibold block">Smoking</span>
                        <p className="font-bold text-text mt-0.5">{patient.personalHistory?.smoking || "Never"}</p>
                      </div>

                      <div className="bg-surface p-3 rounded-xl border border-border">
                        <span className="text-[10px] text-text-muted font-semibold block">Alcohol</span>
                        <p className="font-bold text-text mt-0.5">{patient.personalHistory?.alcohol || "None"}</p>
                      </div>

                      <div className="bg-surface p-3 rounded-xl border border-border">
                        <span className="text-[10px] text-text-muted font-semibold block">Sleep</span>
                        <p className="font-bold text-text mt-0.5">{patient.personalHistory?.sleep || "Normal"}</p>
                      </div>

                      <div className="bg-surface p-3 rounded-xl border border-border sm:col-span-2">
                        <span className="text-[10px] text-text-muted font-semibold block">Bowel & Bladder (Koshtha)</span>
                        <p className="font-bold text-text mt-0.5">{patient.personalHistory?.bowelBladder || "Regular habits"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Medications & Investigations */}
            {activeTab === "meds_labs" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medications Table */}
                <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-text text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Current Medications
                      </h3>
                      <p className="text-xs text-text-muted">Digitized from prescriptions & patient interview</p>
                    </div>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold">
                      {(patient.documents?.medications || []).length} Prescribed
                    </span>
                  </div>

                  <div className="divide-y divide-border">
                    {patient.documents?.medications && patient.documents.medications.length > 0 ? (
                      patient.documents.medications.map((m, idx) => (
                        <div key={idx} className="py-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text text-sm">{m.name}</span>
                              <span className="text-xs font-semibold text-primary">({m.dose})</span>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">{m.note}</p>
                            {m.confidence && (
                              <span className="text-[10px] font-mono text-text-muted mt-1 inline-block">
                                OCR Confidence: {Math.round(m.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono bg-surface px-2.5 py-1 rounded-lg border border-border font-bold text-primary shrink-0">
                            {m.frequency}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted py-4">No current medications recorded.</p>
                    )}
                  </div>
                </div>

                {/* Lab Investigations Table */}
                <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-text text-base flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal" />
                        Previous Investigations & Labs
                      </h3>
                      <p className="text-xs text-text-muted">Extracted from scanned reports with reference intervals</p>
                    </div>
                    <span className="text-xs font-bold text-alert bg-alert/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Reference Flags
                    </span>
                  </div>

                  <div className="divide-y divide-border">
                    {patient.documents?.labValues && patient.documents.labValues.length > 0 ? (
                      patient.documents.labValues.map((l, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-text text-sm">{l.test}</span>
                            <p className="text-[11px] text-text-muted">Bio Reference: {l.range}</p>
                            {l.confidence && (
                              <span className="text-[10px] font-mono text-text-muted">
                                AI Confidence: {Math.round(l.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "text-sm font-bold font-mono px-2.5 py-1 rounded-lg",
                              l.flag === "high"
                                ? "bg-alert/15 text-alert"
                                : l.flag === "low"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-surface text-text border border-border"
                            )}>
                              {l.value}
                            </span>
                            {l.flag === "high" && (
                              <span className="block text-[10px] font-black text-alert mt-0.5">HIGH</span>
                            )}
                            {l.flag === "low" && (
                              <span className="block text-[10px] font-black text-amber-700 mt-0.5">LOW</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted py-4">No diagnostic reports scanned for this visit.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Medical Timeline */}
            {activeTab === "timeline" && (
              <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Longitudinal Medical Timeline
                    </h3>
                    <p className="text-xs text-text-muted">Chronological history of past OPD visits, lab reports, and admissions</p>
                  </div>
                  <span className="text-xs bg-teal-light text-teal font-bold px-3 py-1 rounded-full">
                    ABDM Linked Records
                  </span>
                </div>

                <div className="relative pl-6 border-l-2 border-primary/20 space-y-8 my-4">
                  {patient.medicalTimeline && patient.medicalTimeline.length > 0 ? (
                    patient.medicalTimeline.map((item, idx) => (
                      <div key={idx} className="relative group">
                        {/* Stepper Dot */}
                        <div className={cn(
                          "absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
                          item.type === "admission" 
                            ? "bg-alert" 
                            : item.type === "lab" 
                            ? "bg-warning" 
                            : "bg-primary"
                        )} />

                        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {item.date}
                            </span>
                            <span className={cn(
                              "text-[10px] uppercase font-black px-2 py-0.5 rounded",
                              item.type === "admission" ? "bg-alert/15 text-alert" :
                              item.type === "lab" ? "bg-warning-light text-warning" :
                              "bg-teal-light text-teal"
                            )}>
                              {item.type}
                            </span>
                          </div>

                          <h4 className="font-bold text-text text-sm">{item.title}</h4>
                          <p className="text-xs text-text-muted flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {item.facility} {item.doctor && `· ${item.doctor}`}
                          </p>
                          <p className="text-xs text-text font-medium mt-1 leading-relaxed bg-surface-card p-3 rounded-xl border border-border">
                            {item.details}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-muted">No historical timeline records available.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Audit Trail */}
            {activeTab === "audit_trail" && (
              <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text text-base flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" />
                      Clinical Audit Trail & Verification Logs
                    </h3>
                    <p className="text-xs text-text-muted">Transparent history of clinical edits, doctor verifications, and re-interview requests</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full font-mono">
                    {patient.auditLogs?.length || 0} Events Recorded
                  </span>
                </div>

                <div className="space-y-3">
                  {patient.auditLogs && patient.auditLogs.length > 0 ? (
                    patient.auditLogs.map((log, idx) => (
                      <div key={idx} className="bg-surface p-4 rounded-xl border border-border flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-primary">{log.field}</span>
                            <span className="text-[11px] font-mono text-text-muted">
                              {new Date(log.timestamp).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-text">Modified by: <span className="text-primary">{log.author}</span></p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                            <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                              <span className="text-[10px] font-bold text-rose-800 uppercase block">Previous Value</span>
                              <span className="text-rose-900 line-through">{log.previousValue || "N/A"}</span>
                            </div>
                            <div className="bg-teal-light p-2.5 rounded-lg border border-teal/30">
                              <span className="text-[10px] font-bold text-teal uppercase block">New Value</span>
                              <span className="text-teal font-semibold">{log.newValue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-surface rounded-xl border border-border text-xs text-text-muted">
                      No clinical modifications or status updates have been recorded yet for this session.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: Ayurvedic Pariksha (Dashavidha - 12 Core SIH Fields) */}
            {activeTab === "ayush" && (
              <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-warning" />
                    <h3 className="font-bold text-text text-lg">Ayurvedic Assessment (Dashavidha Pariksha)</h3>
                    <span className="text-xs bg-teal-light text-teal font-semibold px-2.5 py-0.5 rounded-full">
                      AIIA / Ministry of Ayush
                    </span>
                  </div>
                  <span className="text-xs font-mono text-text-muted bg-surface px-2.5 py-1 rounded-lg border border-border font-bold">
                    Mode: {patient.consultationType === "ayurveda" ? "🌿 Ayurveda OPD Intake" : "🏥 Modern Medicine"}
                  </span>
                </div>

                {/* 12 SIH Problem Statement Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-teal font-bold uppercase block font-mono">1. प्रकृति (Prakriti)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.prakriti || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Doshic Baseline</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-warning font-bold uppercase block font-mono">2. विकृति (Vikriti)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.vikriti || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Current Morbidity</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-primary font-bold uppercase block font-mono">3. सार (Sara)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.sara || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Dhatu Excellence</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">4. संहनन (Samhanana)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.samhanana || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Body Compactness</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">5. प्रमाण (Pramana)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.pramana || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Body Proportions</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">6. सात्म्य (Satmya)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.satmya || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Adaptability</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">7. सत्त्व (Sattva)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.sattva || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Mental Resilience</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-warning font-bold uppercase block font-mono">8. आहार शक्ति (Ahara Shakti)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.aharaShakti || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Intake & Agni</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">9. व्यायाम शक्ति (Vyayama Shakti)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.vyayamaShakti || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Physical Endurance</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">10. वय (Vaya)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.vaya || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Age Classification</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">11. आहार (Ahara)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.ahara || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Dietary Habits</span>
                  </div>

                  <div className="bg-surface p-3.5 rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">12. विहार (Vihara)</span>
                    <p className="font-bold text-text mt-1">{patient.ayushAssessment?.vihara || "Not assessed"}</p>
                    <span className="text-[10px] text-text-muted">Daily Lifestyle</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-light/40 border border-teal/20 text-xs text-text space-y-1">
                  <p className="font-bold text-teal">AIIA Clinical Guidance Note (Non-Diagnostic Safety Protocol):</p>
                  <p>
                    The 12-factor Dashavidha findings above are observational history collected for qualified Ayurvedic Vaidya / Practitioner review and clinical correlation. Artificial Intelligence does not diagnose Dosha imbalances or prescribe Chikitsa autonomously.
                  </p>
                </div>
              </div>
            )}

            {/* Doctor Edit Modal */}
            {isEditing && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-surface-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-text text-lg">Amend Clinical History (Doctor Edit)</h3>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Chief Complaint & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-text block mb-1">Chief Complaint</label>
                        <input
                          type="text"
                          value={editForm.complaintLabel}
                          onChange={(e) => setEditForm({ ...editForm, complaintLabel: e.target.value })}
                          className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-text block mb-1">Duration</label>
                        <input
                          type="text"
                          value={editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                          className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* HPI Narrative */}
                    <div>
                      <label className="font-bold text-text block mb-1">HPI Narrative (Doctor Overwrite)</label>
                      <textarea
                        rows={5}
                        value={editForm.hpi}
                        onChange={(e) => setEditForm({ ...editForm, hpi: e.target.value })}
                        className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary leading-relaxed font-sans"
                      />
                    </div>

                    {/* Past Medical & Surgical */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-text block mb-1">Past Medical History (1 per line)</label>
                        <textarea
                          rows={3}
                          value={editForm.pastMedical}
                          onChange={(e) => setEditForm({ ...editForm, pastMedical: e.target.value })}
                          className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-text block mb-1">Past Surgical History (1 per line)</label>
                        <textarea
                          rows={3}
                          value={editForm.pastSurgical}
                          onChange={(e) => setEditForm({ ...editForm, pastSurgical: e.target.value })}
                          className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Allergies & Family */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-alert block mb-1">Allergies (1 per line)</label>
                        <textarea
                          rows={2}
                          value={editForm.allergies}
                          onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                          className="w-full p-2.5 bg-surface border border-alert/30 rounded-xl text-xs text-text focus:outline-none focus:border-alert"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-text block mb-1">Family History (1 per line)</label>
                        <textarea
                          rows={2}
                          value={editForm.familyHistory}
                          onChange={(e) => setEditForm({ ...editForm, familyHistory: e.target.value })}
                          className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditChanges}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm"
                    >
                      Save Amendments
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Modal */}
            {isRejectModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-surface-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-rose-700">
                    <X className="w-5 h-5" />
                    <h3 className="font-bold text-text text-base">Reject AI Intake Draft</h3>
                  </div>
                  <p className="text-xs text-text-muted">
                    Provide clinical rationale for rejecting this case intake. This will mark the record as rejected.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="E.g., Incoherent symptoms, patient mismatch, invalid records..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsRejectModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectSubmit}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Re-interview Modal */}
            {isReinterviewModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-surface-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-blue-700">
                    <RotateCcw className="w-5 h-5" />
                    <h3 className="font-bold text-text text-base">Request Patient Re-interview</h3>
                  </div>
                  <p className="text-xs text-text-muted">
                    Specify instructions for the MediKiosk assistant to re-query the patient at the kiosk station.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="E.g., Clarify radiation of pain to left arm, exact duration, and medication timing..."
                    value={reinterviewNotes}
                    onChange={(e) => setReinterviewNotes(e.target.value)}
                    className="w-full p-3 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsReinterviewModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReinterviewSubmit}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                    >
                      Send to Kiosk
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            Select a patient from the OPD queue to review clinical intake.
          </div>
        )}
      </main>
    </div>
  );
}
