import { supabase, isSupabaseConfigured } from "./supabase";

export interface CloudSyncPayload {
  resume: any;
  structuredCoverLetter: any;
  savedApplications: any[];
  masterContext: any;
}

let syncTimeout: NodeJS.Timeout | null = null;

/**
 * Upload state to Supabase table `user_sync`
 */
export async function pushStateToCloud(payload: CloudSyncPayload) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase
      .from("user_sync")
      .upsert(
        {
          id: "default_user",
          resume_data: payload.resume,
          cover_letter_data: payload.structuredCoverLetter,
          history_snapshots: payload.savedApplications,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.warn("Cloud push warning:", error.message);
    }
  } catch (err) {
    console.warn("Cloud push failed:", err);
  }
}

/**
 * Debounced push to cloud whenever state changes (waits 1.5s after user stops typing)
 */
export function debouncedCloudPush(payload: CloudSyncPayload) {
  if (!isSupabaseConfigured || !supabase) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushStateToCloud(payload);
  }, 1500);
}

/**
 * Fetch latest state from Supabase on app load
 */
export async function pullStateFromCloud(): Promise<Partial<CloudSyncPayload> | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("user_sync")
      .select("resume_data, cover_letter_data, history_snapshots, updated_at")
      .eq("id", "default_user")
      .single();

    if (error || !data) {
      return null;
    }

    return {
      resume: data.resume_data,
      structuredCoverLetter: data.cover_letter_data,
      savedApplications: data.history_snapshots,
    };
  } catch (err) {
    console.warn("Failed to fetch cloud state:", err);
    return null;
  }
}
