"use client";

import RequireRole from "@/components/auth/RequireRole";
import PhysicianConsole from "@/components/PhysicianConsole";

// Dedicated Doctor dashboard route. Reuses the existing PhysicianConsole
// component behind a real route + auth guard.
export default function DoctorPage() {
  return (
    <RequireRole role="doctor">
      <PhysicianConsole />
    </RequireRole>
  );
}
