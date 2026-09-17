"use client";

import React from "react";
import RequireRole from "@/components/auth/RequireRole";
import HospitalAnalytics from "@/components/HospitalAnalytics";

export default function AnalyticsPage() {
  return (
    <RequireRole role="admin">
      <HospitalAnalytics />
    </RequireRole>
  );
}
