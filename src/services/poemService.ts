/**
 * poemService.ts
 *
 * All Supabase DB operations for published poems live here.
 * The rest of the app (components/pages) never imports supabase directly —
 * they only call these functions. This is the API abstraction layer.
 *
 * Auto-save / drafts / version history stay in localStorage (useAutoSave.ts).
 * Only finalized, published poems go to Supabase.
 */

import { supabase } from '../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Poem {
  id: string;
  title: string;
  content: string;
  published_at: string; // ISO string from Supabase
}

// ── Fetch all poems (newest first) ────────────────────────────────────────────

export async function fetchPoems(): Promise<Poem[]> {
  const { data, error } = await supabase
    .from('poems')
    .select('id, title, content, published_at')
    .order('published_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch a single poem by ID ─────────────────────────────────────────────────

export async function fetchPoemById(id: string): Promise<Poem | null> {
  const { data, error } = await supabase
    .from('poems')
    .select('id, title, content, published_at')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

// ── Publish a new poem ────────────────────────────────────────────────────────

export async function publishPoem(title: string, content: string): Promise<Poem> {
  const { data, error } = await supabase
    .from('poems')
    .insert({ title: title || 'Untitled', content })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Update an existing poem ───────────────────────────────────────────────────

export async function updatePoem(id: string, title: string, content: string): Promise<Poem> {
  const { data, error } = await supabase
    .from('poems')
    .update({ title: title || 'Untitled', content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Delete a poem by ID ───────────────────────────────────────────────────────

export async function deletePoem(id: string): Promise<void> {
  const { error } = await supabase
    .from('poems')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
