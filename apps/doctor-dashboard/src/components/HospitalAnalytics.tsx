"use client";

import React, { useState, useMemo } from "react";
import { useKioskStore } from "@/store/kioskStore";
import { 
  PROTOTYPE_KPIS, 
  WORKLOAD_COMPARISONS, 
  DEPARTMENT_STATS, 
  LANGUAGE_STATS, 
  COMMON_COMPLAINTS, 
  calculateTimeSaved 
} from "@/data/analyticsData";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Info,
  Building2,
  TrendingUp,
  Activity,
  Mic,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "today" | "week" | "month";
type StreamFilter = "all" | "ayush" | "modern";

export default function HospitalAnalytics() {
  const { queue } = useKioskStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [streamFilter, setStreamFilter] = useState<StreamFilter>("all");
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Compute live queue metrics dynamically
  const liveMetrics = useMemo(() => {
    const totalQueueCount = queue.length;
    const emergencyCount = queue.filter(
      p => (p.redFlags && p.redFlags.length > 0) || p.room.includes("Emergency") || p.department.includes("Triage")
    ).length;
    const ayushCount = queue.filter(p => p.consultationType === "ayurveda").length;
    const verifiedCount = queue.filter(p => p.reviewStatus === "doctor_verified" || p.status === "completed" || p.status === "pushed").length;
    const reinterviewCount = queue.filter(p => p.reviewStatus === "reinterview_requested" || p.status === "reinterview").length;
    const rejectedCount = queue.filter(p => p.reviewStatus === "doctor_rejected" || p.status === "rejected").length;
    const docsCount = queue.reduce((acc, p) => acc + (p.documents?.medications.length || 0) + (p.documents?.labValues.length || 0), 0);
    const auditEventsCount = queue.reduce((acc, p) => acc + (p.auditLogs?.length || 0), 0);

    return {
      totalQueueCount,
      emergencyCount,
      ayushCount,
      verifiedCount,
      reinterviewCount,
      rejectedCount,
      docsCount,
      auditEventsCount
    };
  }, [queue]);

  // Active KPIs based on selected timeframe
  const rawKpiList = PROTOTYPE_KPIS[timeRange];

  // Dynamic KPIs merging live queue state
  const kpiList = useMemo(() => {
    return rawKpiList.map((kpi) => {
      if (kpi.id === "patients_processed") {
        return { ...kpi, value: liveMetrics.totalQueueCount > 0 ? liveMetrics.totalQueueCount.toString() : kpi.value };
      }
      if (kpi.id === "red_flags_caught") {
        return { ...kpi, value: liveMetrics.emergencyCount.toString() };
      }
      if (kpi.id === "docs_digitized") {
        return { ...kpi, value: liveMetrics.docsCount.toString() };
      }
      return kpi;
    });
  }, [rawKpiList, liveMetrics]);

  // Derive dynamic total patients for calculation
  const totalPatients = useMemo(() => {
    return Math.max(liveMetrics.totalQueueCount, 1);
  }, [liveMetrics.totalQueueCount]);

  // Dynamic time savings model
  const timeSaved = useMemo(() => {
    return calculateTimeSaved(totalPatients, 9.5, 2.0);
  }, [totalPatients]);

  // Filtered department throughput
  const filteredDepartments = useMemo(() => {
    if (streamFilter === "all") return DEPARTMENT_STATS;
    return DEPARTMENT_STATS.filter(d => d.stream === streamFilter);
  }, [streamFilter]);

  const handleExport = () => {
    setExportFeedback("Simulating PDF/CSV export: 'MediKiosk_OPD_Executive_Summary_2026.pdf' downloaded.");
    setTimeout(() => setExportFeedback(null), 4000);
  };

  return (
    <div className="flex-1 bg-surface min-h-[calc(100vh-64px)] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Toast Feedback */}
      {exportFeedback && (
        <div className="fixed top-20 right-8 bg-slate-900 text-white border border-teal/40 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 transition-all">
          <CheckCircle2 className="w-5 h-5 text-teal" />
          <span className="font-semibold text-sm">{exportFeedback}</span>
        </div>
      )}

      {/* 1. Institutional Header & Mandatory Prototype Label */}
      <div className="bg-surface-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary shrink-0 shadow-xs">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-text">
                  Hospital OPD Analytics & Operational Impact
                </h1>
                <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                  AIIA Executive Dashboard
                </span>
                <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 font-mono">
                  Prototype Model · Demo Data
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Executive throughput metrics, clinician time savings, and intake quality monitoring.
              </p>
            </div>
          </div>

          {/* Timeframe & Export Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-surface border border-border p-1 rounded-xl text-xs font-bold">
              {(["today", "week", "month"] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all capitalize",
                    timeRange === r
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text"
                  )}
                >
                  {r === "today" ? "Today (Live Queue)" : r === "week" ? "This Week" : "Last 30 Days"}
                </button>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-card border border-border text-text font-bold text-xs rounded-xl shadow-xs transition-all animate-press"
            >
              <Download className="w-4 h-4 text-primary" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* PROMINENT MANDATORY DISCLAIMER BADGE */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <div className="p-1 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="uppercase font-black tracking-wider text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                Prototype Model & Demo Data
              </strong>
              <span className="font-bold">Estimated Operational Impact Model</span>
            </div>
            <p className="mt-1 text-amber-800">
              Numbers marked <strong>Simulated</strong> or <strong>Estimated</strong> are derived from prototype models and high-volume OPD assumptions. Metrics for <strong>Live Queue Patients ({liveMetrics.totalQueueCount})</strong>, <strong>Red Flags ({liveMetrics.emergencyCount})</strong>, and <strong>Documents ({liveMetrics.docsCount})</strong> dynamically reflect the active doctor console queue.
            </p>
          </div>
        </div>

        {/* Live OPD Queue Derived Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border text-xs font-bold">
          <div className="bg-surface p-3 rounded-xl border border-border">
            <span className="text-[10px] text-text-muted block font-semibold">Active Queue Patients</span>
            <span className="text-lg font-black text-primary font-mono">{liveMetrics.totalQueueCount}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-border">
            <span className="text-[10px] text-text-muted block font-semibold">Priority Emergencies</span>
            <span className="text-lg font-black text-alert font-mono">{liveMetrics.emergencyCount}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-border">
            <span className="text-[10px] text-text-muted block font-semibold">AYUSH Stream</span>
            <span className="text-lg font-black text-teal font-mono">{liveMetrics.ayushCount}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-border">
            <span className="text-[10px] text-text-muted block font-semibold">Doctor Verified</span>
            <span className="text-lg font-black text-emerald-700 font-mono">{liveMetrics.verifiedCount}</span>
          </div>
          <div className="bg-surface p-3 rounded-xl border border-border col-span-2 sm:col-span-1">
            <span className="text-[10px] text-text-muted block font-semibold">Audit Trail Events</span>
            <span className="text-lg font-black text-text font-mono">{liveMetrics.auditEventsCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Prototype KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiList.map((kpi) => (
          <div 
            key={kpi.id} 
            className="bg-surface-card border border-border rounded-2xl p-5 shadow-xs space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">{kpi.label}</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Simulated
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl font-black text-text font-mono tracking-tight">{kpi.value}</span>
              {kpi.unit && <span className="text-xs font-bold text-text-muted">{kpi.unit}</span>}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
              <span className={cn(
                "font-bold flex items-center gap-0.5",
                kpi.isPositive ? "text-emerald-700" : "text-rose-700"
              )}>
                {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.change}
              </span>
              <span className="text-[11px] text-text-muted font-medium">{kpi.benchmark}</span>
            </div>
            <p className="text-[11px] text-text-muted leading-tight">{kpi.description}</p>
          </div>
        ))}
      </div>

      {/* 3. Potential Clinician Time Saved Visualizer Card */}
      <div className="bg-gradient-to-br from-primary/5 via-teal-light/40 to-primary/10 border-2 border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center shadow-xs shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-text">
                  Estimated Time Saved (Based on Prototype Assumptions)
                </h2>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Modeled Estimate
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Estimated reduction in manual case-taking workload across {totalPatients} OPD patients
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-white px-5 py-3 rounded-2xl border border-primary/20 shadow-xs">
            <span className="text-3xl sm:text-4xl font-black text-primary font-mono">
              ~{timeSaved.totalHoursSaved}
            </span>
            <span className="text-sm font-bold text-text-muted">Doctor Hours Saved</span>
          </div>
        </div>

        {/* Calculation Visualizer Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1">
            <span className="text-text-muted block font-semibold">1. Standard Manual History</span>
            <div className="text-lg font-bold text-rose-700">~{timeSaved.manualMinutesPerPatient} minutes / patient</div>
            <p className="text-[11px] text-text-muted">Typing, handwriting, and verbatim verbal querying during consult.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1">
            <span className="text-text-muted block font-semibold">2. MediKiosk + Doctor Review</span>
            <div className="text-lg font-bold text-teal">~{timeSaved.aiDocReviewMinutesPerPatient} minutes / patient</div>
            <p className="text-[11px] text-text-muted">Kiosk self-intake + doctor reviewing & confirming pre-structured HPI draft.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-xs space-y-1">
            <span className="text-text-muted block font-semibold">3. Net Doctor Capacity Gain</span>
            <div className="text-lg font-bold text-primary">+{timeSaved.doctorCapacityGainPct}% Consultation Velocity</div>
            <p className="text-[11px] text-text-muted">Physicians can spend more time on clinical examination & counseling.</p>
          </div>
        </div>

        <div className="p-3 bg-white/80 rounded-xl border border-primary/10 text-[11px] text-text-muted italic flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{timeSaved.disclaimer}</span>
        </div>
      </div>

      {/* 4. BEFORE vs AFTER: Manual History Workload vs AI-Assisted Intake */}
      <div className="bg-surface-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-text">Workflow Comparison: BEFORE vs AFTER</h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Comparative analysis of standard manual hospital case-taking versus MediKiosk pre-consultation
            </p>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
            Hospital Value Matrix
          </span>
        </div>

        {/* 6 Comparative Dimension Cards */}
        <div className="space-y-4">
          {WORKLOAD_COMPARISONS.map((item, idx) => (
            <div 
              key={idx} 
              className="border border-border rounded-2xl p-5 bg-surface space-y-3 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-text text-sm sm:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </span>
                  {item.dimension}
                </h3>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full">
                  ✓ {item.improvement}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* BEFORE Box */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
                    ❌ BEFORE (Manual Intake)
                  </span>
                  <p className="font-semibold text-rose-950">{item.manualBefore}</p>
                </div>

                {/* AFTER Box */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    ✨ AFTER (MediKiosk AI-Assisted)
                  </span>
                  <p className="font-semibold text-emerald-950">{item.aiAfter}</p>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed pl-1">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Clinical & Operational Distributions Grid (Languages & Common Complaints) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Preference & Voice Adoption */}
        <div className="bg-surface-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-teal" />
              <div>
                <h3 className="font-bold text-text text-base">Language Usage & Voice Adoption</h3>
                <p className="text-xs text-text-muted">Multilingual spoken vs touch interaction breakdown</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-teal bg-teal-light px-2.5 py-1 rounded-lg">
              74% Voice Overall
            </span>
          </div>

          <div className="space-y-4">
            {LANGUAGE_STATS.map((lang, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text">{lang.language}</span>
                  <span className="text-text-muted font-mono">
                    {lang.percentage}% ({lang.count} pts) · <strong className="text-teal">{lang.voiceUsagePct}% Voice</strong>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden border border-border">
                  <div 
                    className="h-full bg-teal transition-all duration-500 rounded-full" 
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-text-muted italic border-t border-border pt-3">
            * High voice adoption demonstrates accessibility for non-literate and elderly patients in high-volume rural/semi-urban OPDs.
          </p>
        </div>

        {/* Most Common Clinical Complaints */}
        <div className="bg-surface-card border border-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-text text-base">Top Clinical Complaint Categories</h3>
                <p className="text-xs text-text-muted">Presenting symptoms & emergency red-flag correlation</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-alert bg-alert/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Red Flags
            </span>
          </div>

          <div className="space-y-3">
            {COMMON_COMPLAINTS.map((comp, idx) => (
              <div 
                key={idx} 
                className="bg-surface p-3.5 rounded-2xl border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-text truncate">{comp.category}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {comp.count} cases ({comp.pct}%) · Avg. Severity: <strong className="text-alert">{comp.avgSeverity}/10</strong>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {comp.redFlagCount > 0 ? (
                    <span className="bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-1 rounded-lg font-bold text-[11px] inline-block">
                      {comp.redFlagCount} Priority
                    </span>
                  ) : (
                    <span className="text-text-muted text-[11px]">No red flags</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-text-muted italic border-t border-border pt-3">
            * Chest tightness and respiratory complaints represent the highest concentration of triggered red-flag alerts.
          </p>
        </div>
      </div>

      {/* 6. Departmental Throughput Table */}
      <div className="bg-surface-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-text text-base sm:text-lg">Departmental Throughput & Quality Metrics</h3>
              <p className="text-xs text-text-muted">Breakdown across AYUSH (Ayurveda) and Modern Medicine streams</p>
            </div>
          </div>

          {/* Stream Filter Pills */}
          <div className="flex items-center bg-surface border border-border p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStreamFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all",
                streamFilter === "all" ? "bg-primary text-white" : "text-text-muted hover:text-text"
              )}
            >
              All Streams
            </button>
            <button
              onClick={() => setStreamFilter("ayush")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all",
                streamFilter === "ayush" ? "bg-teal text-white" : "text-text-muted hover:text-text"
              )}
            >
              🌿 AYUSH
            </button>
            <button
              onClick={() => setStreamFilter("modern")}
              className={cn(
                "px-3 py-1 rounded-lg transition-all",
                streamFilter === "modern" ? "bg-primary text-white" : "text-text-muted hover:text-text"
              )}
            >
              🏥 Modern
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-border rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-text font-bold">
              <tr>
                <th className="p-3.5">Department Name</th>
                <th className="p-3.5">Care Stream</th>
                <th className="p-3.5 text-right">Patients</th>
                <th className="p-3.5 text-right">Avg Intake</th>
                <th className="p-3.5 text-right">Doc Review</th>
                <th className="p-3.5 text-right">Red Flags</th>
                <th className="p-3.5 text-right">Doc Amendment Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredDepartments.map((dept, idx) => (
                <tr key={idx} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3.5 font-bold text-text flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary shrink-0" />
                    {dept.dept}
                  </td>
                  <td className="p-3.5">
                    {dept.stream === "ayush" ? (
                      <span className="bg-teal-light text-teal border border-teal/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        🌿 AYUSH
                      </span>
                    ) : (
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        🏥 Modern
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold">{dept.patients}</td>
                  <td className="p-3.5 text-right font-mono">{dept.avgIntakeMin} min</td>
                  <td className="p-3.5 text-right font-mono text-teal font-bold">{dept.avgDocReviewMin} min</td>
                  <td className="p-3.5 text-right">
                    {dept.redFlags > 0 ? (
                      <span className="text-alert font-bold font-mono">🚨 {dept.redFlags}</span>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-mono">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold",
                      dept.docCorrectionRate > 15 
                        ? "bg-amber-100 text-amber-900" 
                        : "bg-emerald-50 text-emerald-800"
                    )}>
                      {dept.docCorrectionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
