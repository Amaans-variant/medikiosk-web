import { ClinicalSummary, DoctorReview } from "../../models";

export class DoctorDashboardModule {
  public static reviewDraftSummary(
    summary: ClinicalSummary,
    doctorId: string,
    doctorName: string,
    action: "approved" | "amended" | "rejected",
    amendedHpi?: string
  ): { updatedSummary: ClinicalSummary; review: DoctorReview } {
    const updatedSummary: ClinicalSummary = {
      ...summary,
      hpiNarrative: amendedHpi || summary.hpiNarrative,
      status: action === "approved" ? "physician_reviewed" : action === "amended" ? "physician_amended" : "physician_rejected",
      reviewedAt: Date.now(),
      reviewedBy: doctorName
    };

    const review: DoctorReview = {
      id: `rev-${Date.now()}`,
      summaryId: summary.id,
      doctorId,
      doctorName,
      action,
      originalHpi: summary.hpiNarrative,
      amendedHpi,
      reviewedAt: Date.now(),
      pushedToAbdm: false
    };

    return { updatedSummary, review };
  }
}
