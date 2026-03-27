import { useState, useEffect, useCallback, useRef } from 'react';

export interface DraftVersion {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  label?: string;
}

const DRAFT_KEY = 'poetry_current_draft';
const VERSIONS_KEY = 'poetry_versions';
const MAX_VERSIONS = 20;
const AUTOSAVE_DELAY_MS = 2000;

function loadDraft(): { title: string; content: string } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { title: '', content: '' };
}

function loadVersions(): DraftVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function useAutoSave() {
  const saved = loadDraft();
  const [title, setTitle] = useState<string>(saved.title);
  const [content, setContent] = useState<string>(saved.content);
  const [versions, setVersions] = useState<DraftVersion[]>(loadVersions);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist draft to localStorage (debounced)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        setIsSaving(true);
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content }));
        setLastSaved(new Date());
      } finally {
        setTimeout(() => setIsSaving(false), 400);
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, content]);

  // Save a named version snapshot
  const saveVersion = useCallback((label?: string) => {
    if (!content.trim()) return;
    const version: DraftVersion = {
      id: Date.now().toString(),
      title: title || 'Untitled',
      content,
      timestamp: Date.now(),
      label,
    };
    setVersions(prev => {
      const updated = [version, ...prev].slice(0, MAX_VERSIONS);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [title, content]);

  // Restore a past version into the editor
  const restoreVersion = useCallback((version: DraftVersion) => {
    setTitle(version.title);
    setContent(version.content);
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: version.title, content: version.content }));
    setLastSaved(new Date());
  }, []);

  // Delete a specific version by id
  const deleteVersion = useCallback((id: string) => {
    setVersions(prev => {
      const updated = prev.filter(v => v.id !== id);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear the current draft (not version history)
  const clearDraft = useCallback(() => {
    setTitle('');
    setContent('');
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return {
    title, setTitle,
    content, setContent,
    versions,
    lastSaved,
    isSaving,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearDraft,
  };
}
