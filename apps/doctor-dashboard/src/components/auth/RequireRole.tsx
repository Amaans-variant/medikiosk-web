"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";

/**
 * Wrap any /admin, /doctor, or /patient page with this to enforce that
 * only a user who "signed in" as that role can view it. Since there is
 * no real backend yet, this only checks the persisted local auth
 * state — once a backend exists, swap the `isAuthenticated` check for
 * a server-verified session (e.g. re-validate `token` against
 * `GET /api/auth/me` on mount) without changing how any page uses
 * this component.
 */
export default function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return; // wait for localStorage rehydration before deciding
    if (!isAuthenticated || user?.role !== role) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, user, role, router]);

  if (!hydrated || !isAuthenticated || user?.role !== role) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <span className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-sm font-medium">Checking access…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
