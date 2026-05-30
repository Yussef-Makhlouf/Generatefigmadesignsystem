import { supabase } from "../supabase";
import type { Space } from "../database.types";

// ── Fetch all spaces ───────────────────────────────────────────
export async function getSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSpaces:", error);
    return [];
  }
  return (data ?? []) as Space[];
}

// ── Fetch active spaces only ──────────────────────────────────
export async function getActiveSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveSpaces:", error);
    return [];
  }
  return (data ?? []) as Space[];
}

// ── Create space (admin) ───────────────────────────────────────
export async function createSpace(
  name: string,
  description?: string,
  iconUrl?: string
): Promise<Space | null> {
  const { data, error } = await supabase
    .from("spaces")
    .insert({
      name,
      description: description ?? null,
      icon_url: iconUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("createSpace:", error);
    return null;
  }
  return data as Space;
}

// ── Update space (admin) ───────────────────────────────────────
export async function updateSpace(
  spaceId: string,
  updates: Partial<Pick<Space, "name" | "description" | "icon_url" | "is_active">>
): Promise<boolean> {
  const { error } = await supabase
    .from("spaces")
    .update(updates)
    .eq("id", spaceId);

  if (error) {
    console.error("updateSpace:", error);
    return false;
  }
  return true;
}