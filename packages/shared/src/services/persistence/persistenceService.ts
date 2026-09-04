import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmxuxxcgvukepufhowwz.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-build-key";

let supabaseInstance: ReturnType<typeof createClient> | null = null;
export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseInstance;
};

export class PersistenceService {
  private static STORAGE_KEY = "medikiosk_active_queue_v1";

  public static saveQueueLocal(items: unknown[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  public static loadQueueLocal<T = unknown>(): T[] | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
      return null;
    }
  }
}
