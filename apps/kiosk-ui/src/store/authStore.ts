import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Auth store
 * ------------------------------------------------------------------
 * Frontend-only, simulated authentication. Structured so a backend
 * engineer can swap the body of `login()` for a real API call without
 * touching any consuming component — every screen reads `user`,
 * `token`, `isAuthenticated`, and `status` from this store only.
 *
 * INTEGRATION POINTS FOR BACKEND (see contents/frontend-integration.md):
 *   1. `login()` currently resolves locally after a simulated delay.
 *      Replace the body with e.g. `POST /api/auth/login` and set
 *      `token` to the returned session/JWT token.
 *   2. `token` is persisted to localStorage under the same key as the
 *      rest of this store. Once real tokens exist, consider moving
 *      the token itself to an httpOnly cookie set by the backend and
 *      keeping only non-sensitive user info here.
 *   3. `logout()` should additionally call a `POST /api/auth/logout`
 *      endpoint to invalidate the server-side session once it exists.
 *   4. `hydrated` flips true once the persisted state has been read
 *      from localStorage on first client render — route guards
 *      (see components/auth/RequireRole.tsx) wait for this before
 *      redirecting, to avoid bouncing a logged-in user back to
 *      /login during the first render.
 */

export type UserRole = "admin" | "doctor" | "patient";

export interface AuthUser {
  id: string;
  displayName: string;
  role: UserRole;
  /** Staff ID, Doctor ID, or mobile/ABHA number used to sign in. Cosmetic only until a backend exists. */
  identifier: string;
}

export type AuthStatus = "idle" | "authenticating" | "authenticated" | "error";

interface LoginParams {
  role: UserRole;
  identifier: string;
  /** Simulated password / OTP field — not validated against anything real yet. */
  secret?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;

  login: (params: LoginParams) => Promise<{ ok: true; role: UserRole } | { ok: false; error: string }>;
  logout: () => void;
  setHydrated: () => void;
}

const ROLE_DISPLAY_NAME: Record<UserRole, string> = {
  admin: "Hospital Admin",
  doctor: "Dr. On Duty",
  patient: "Patient",
};

export const AUTH_STORAGE_KEY = "medikiosk_auth_v1";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: "idle",
      error: null,
      hydrated: false,
      isAuthenticated: false,

      login: async ({ role, identifier, secret }) => {
        void secret;
        set({ status: "authenticating", error: null });

        if (!identifier || identifier.trim().length < 3) {
          const error = "Please enter a valid ID to continue.";
          set({ status: "error", error });
          return { ok: false, error };
        }

        // --- Simulated network round-trip -------------------------------
        // Replace this block with a real API call, e.g.:
        //   const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ role, identifier, secret }) });
        //   const { user, token } = await res.json();
        await new Promise((resolve) => setTimeout(resolve, 550));
        const user: AuthUser = {
          id: `${role}-${identifier.trim().toLowerCase().replace(/\s+/g, "-")}`,
          displayName: ROLE_DISPLAY_NAME[role],
          role,
          identifier: identifier.trim(),
        };
        const token = `demo-session-token.${role}.${Date.now()}`;
        // -----------------------------------------------------------------

        set({ user, token, status: "authenticated", error: null, isAuthenticated: true });
        return { ok: true, role };
      },

      logout: () => {
        set({ user: null, token: null, status: "idle", error: null, isAuthenticated: false });
      },

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
