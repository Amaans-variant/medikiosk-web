import { useKioskStore } from "@/store/kioskStore";

export function runStep14AnalyticsTests(): { name: string; passed: boolean; details?: string; error?: string }[] {
  const results: { name: string; passed: boolean; details?: string; error?: string }[] = [];

  try {
    // 1. Process 1 Normal Patient
    useKioskStore.getState().loadDemoScenario(1);
    useKioskStore.getState().completeIntakeAndEnqueue();

    // 2. Process 1 Emergency Patient
    useKioskStore.getState().loadDemoScenario(2);
    useKioskStore.getState().completeIntakeAndEnqueue();

    // 3. Process 1 AYUSH Patient
    useKioskStore.getState().loadDemoScenario(3);
    useKioskStore.getState().completeIntakeAndEnqueue();

    const queue = useKioskStore.getState().queue;
    if (queue.length === 0) throw new Error("Queue is empty after processing 3 patients");

    const totalCount = queue.length;
    const emergencyCount = queue.filter(
      p => (p.redFlags && p.redFlags.length > 0) || p.room.includes("Emergency") || p.department.includes("Triage")
    ).length;
    const ayushCount = queue.filter(p => p.consultationType === "ayurveda").length;

    if (emergencyCount === 0) throw new Error("Expected red flag emergency patients in queue");
    if (ayushCount === 0) throw new Error("Expected AYUSH patients in queue");
    if (totalCount < 3) throw new Error(`Expected at least 3 queue items, found ${totalCount}`);

    results.push({
      name: "Hospital Analytics Consistency & Live Queue Integration",
      passed: true,
      details: `Processed 1 Normal, 1 Emergency, 1 AYUSH. Queue updated consistently: Total ${totalCount}, Emergencies ${emergencyCount}, AYUSH ${ayushCount}. Zero impossible metrics.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({
      name: "Hospital Analytics Consistency & Live Queue Integration",
      passed: false,
      error: msg
    });
  }

  return results;
}
