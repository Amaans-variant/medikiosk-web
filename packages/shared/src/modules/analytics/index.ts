import { AnalyticsService } from "../../services/analytics/analyticsService";

export class AnalyticsModule {
  public static logIntakeMilestone(step: number, name: string) {
    AnalyticsService.trackIntakeStep(step, name);
  }
}
