export class AnalyticsService {
  public static trackIntakeStep(step: number, stepName: string): void {
    // Lightweight telemetry for hackathon metrics
    if (typeof window !== "undefined") {
      console.log(`[Analytics] Step ${step}: ${stepName} at ${new Date().toISOString()}`);
    }
  }

  public static trackRedFlagTrigger(condition: string, severity: string): void {
    console.warn(`[Analytics] 🚨 Red Flag Triggered: ${condition} [${severity}]`);
  }
}
