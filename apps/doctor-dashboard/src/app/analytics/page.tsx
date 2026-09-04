"use client";

import React, { useEffect } from "react";
import HospitalAnalytics from "@/components/HospitalAnalytics";
import { useKioskStore } from "@/store/kioskStore";

export default function AnalyticsPage() {
  const { setView } = useKioskStore();

  useEffect(() => {
    setView("analytics");
  }, [setView]);

  return <HospitalAnalytics />;
}
