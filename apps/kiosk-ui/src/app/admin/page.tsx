"use client";

import RequireRole from "@/components/auth/RequireRole";
import HospitalAnalytics from "@/components/HospitalAnalytics";

// Dedicated Admin dashboard route. Reuses the existing, already-built
// HospitalAnalytics component (previously only reachable via the
// TopBar mode switcher's in-page toggle) behind a real route + auth
// guard, per the role-based login requirement.
export default function AdminPage() {
  return (
    <RequireRole role="admin">
      <HospitalAnalytics />
    </RequireRole>
  );
}
