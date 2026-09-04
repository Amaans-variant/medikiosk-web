import { Complaint } from "../models";

export interface TriageAssignment {
  room: string;
  department: string;
  estimatedWaitMinutes: number;
}

export function routePatientToOPD(complaints: Complaint[]): TriageAssignment {
  const hasChest = complaints.some(c => c.anatomicalRegion === "chest_heart_lungs" && c.severity >= 7);
  if (hasChest) {
    return {
      room: "Room 1 (Red Flag Emergency)",
      department: "Emergency & Critical Triage",
      estimatedWaitMinutes: 2
    };
  }

  const hasJoint = complaints.some(c => c.anatomicalRegion === "knee_joint" || c.anatomicalRegion === "spine_back");
  if (hasJoint) {
    return {
      room: "Room 4 (Ayush Shalya & Panchakarma)",
      department: "Ayurvedic Musculoskeletal & Asthi-Sandhi OPD",
      estimatedWaitMinutes: 12
    };
  }

  const hasStomach = complaints.some(c => c.anatomicalRegion === "stomach_abdomen");
  if (hasStomach) {
    return {
      room: "Room 2 (Kayachikitsa)",
      department: "Kayachikitsa (Ayurvedic Internal Medicine)",
      estimatedWaitMinutes: 8
    };
  }

  return {
    room: "Room 3 (General OPD)",
    department: "General Medicine & Ayush Triage",
    estimatedWaitMinutes: 10
  };
}
