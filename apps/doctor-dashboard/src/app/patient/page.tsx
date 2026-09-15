"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RequireRole from "@/components/auth/RequireRole";

// Dedicated Patient entry route. The actual patient-facing clinical
// intake flow is unchanged (/language -> /consultation-type -> ...);
// this route only adds the role gate in front of it so the flow can't
// be reached before "signing in" as a patient.
function PatientRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/language");
  }, [router]);
  return null;
}

export default function PatientPage() {
  return (
    <RequireRole role="patient">
      <PatientRedirect />
    </RequireRole>
  );
}
