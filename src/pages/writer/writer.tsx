import { useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/layout';
import myContext from '../../context/data/myContext';
import { useAutoSave, DraftVersion } from '../../hooks/useAutoSave';
import {
  detectEmotion,
  suggestNextLines,
  suggestRhymes,
  rewriteInStyle,
  getWritersBlockPrompt,
  analyzeWriting,
  WritingStyle,
  EmotionResult,
  WritingInsights,
} from '../../services/aiService';
import { publishPoem, updatePoem, fetchPoemById } from '../../services/poemService';

// ─── Hover-aware button ───────────────────────────────────────────────────────

function HoverBtn({
  onClick,
  children,
  bg,
  hoverBg,
  color = '#fff',
  border,
  className = '',
  disabled = false,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  bg: string;
  hoverBg: string;
  color?: string;
  border?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`transition-all duration-150 ${className}`}
      style={{
        background: hovered ? hoverBg : bg,
        color,
        border,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmotionBadge({ emotion }: { emotion: EmotionResult }) {
  if (emotion.primary === 'neutral' && emotion.score === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
      style={{ background: emotion.color }}
      title={emotion.description}
    >
      {emotion.emoji} {emotion.primary} · {emotion.description}
    </span>
  );
}

function SaveStatus({ isSaving, lastSaved, isDark }: { isSaving: boolean; lastSaved: Date | null; isDark: boolean }) {
  const color = isDark ? '#94a3b8' : '#6b7280';
  if (isSaving) return <span style={{ color, fontSize: '0.75rem' }}>Saving...</span>;
  if (lastSaved) {
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    const label = diff < 5 ? 'just now' : diff < 60 ? `${diff}s ago` : `${Math.floor(diff / 60)}m ago`;
    return <span style={{ color, fontSize: '0.75rem' }}>Saved {label}</span>;
  }
  return null;
}

// ─── Clear Confirmation Modal ─────────────────────────────────────────────────

function ClearModal({
  onConfirm,
  onCancel,
  isDark,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
}) {
  const bg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ background: bg, border: `1px solid ${border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <p style={{ fontSize: '2.5rem' }}>🗑️</p>
          <h2 style={{ color: text, fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Clear Draft?
          </h2>
          <p style={{ color: sub, fontSize: '0.85rem', marginTop: '0.4rem' }}>
            Your current poem will be erased. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{ background: isDark ? '#334155' : '#f3f4f6', color: text }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#475569' : '#e5e7eb'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#334155' : '#f3f4f6'; }}
          >
            No, Keep Writing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#dc2626' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b91c1c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626'; }}
          >
            Yes, Clear It
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Version History Modal ────────────────────────────────────────────────────

function VersionHistoryModal({
  versions,
  onRestore,
  onDelete,
  onClose,
  isDark,
}: {
  versions: DraftVersion[];
  onRestore: (v: DraftVersion) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  const bg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';
  const cardBg = isDark ? '#0f172a' : '#f9fafb';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ background: bg, border: `1px solid ${border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${border}` }}>
          <h2 style={{ color: text, fontWeight: 700, fontSize: '1.1rem' }}>Version History</h2>
          <button onClick={onClose} style={{ color: sub, fontSize: '1.4rem', lineHeight: 1 }}>&times;</button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: '60vh' }}>
          {versions.length === 0 ? (
            <p style={{ color: sub, textAlign: 'center', padding: '2rem' }}>
              No versions saved yet. Use "Save Version" to snapshot your work.
            </p>
          ) : versions.map(v => (
            <div
              key={v.id}
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p style={{ color: text, fontWeight: 600, fontSize: '0.9rem' }}>
                    {v.label ?? v.title}
                  </p>
                  <p style={{ color: sub, fontSize: '0.75rem' }}>
                    {new Date(v.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { onRestore(v); onClose(); }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: '#FFBF00', color: '#291200' }}
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(v.id)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: isDark ? '#7f1d1d' : '#fee2e2', color: isDark ? '#fca5a5' : '#b91c1c' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p
                className="text-xs rounded p-2"
                style={{
                  color: sub, background: isDark ? '#1e293b' : '#f1f5f9',
                  whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif',
                  maxHeight: '4rem', overflow: 'hidden',
                }}
              >
                {v.content.slice(0, 150)}{v.content.length > 150 ? '…' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsPanel({ insights, isDark }: { insights: WritingInsights; isDark: boolean }) {
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';
  const cardBg = isDark ? '#0f172a' : '#f9fafb';
  const border = isDark ? '#1e293b' : '#e5e7eb';

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
      <p style={{ color: text, fontWeight: 600, fontSize: '0.85rem' }}>Writing Insights</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Words', value: insights.wordCount },
          { label: 'Lines', value: insights.lineCount },
          { label: 'Avg/Line', value: insights.avgWordsPerLine },
        ].map(({ label, value }) => (
          <div key={label} className="text-center rounded-lg py-2" style={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${border}` }}>
            <p style={{ color: '#FFBF00', fontWeight: 700, fontSize: '1.1rem' }}>{value}</p>
            <p style={{ color: sub, fontSize: '0.65rem' }}>{label}</p>
          </div>
        ))}
      </div>
      {insights.mostUsedWords.length > 0 && (
        <div>
          <p style={{ color: sub, fontSize: '0.75rem', marginBottom: '0.4rem' }}>Recurring words</p>
          <div className="flex flex-wrap gap-1">
            {insights.mostUsedWords.map(w => (
              <span key={w} className="px-2 py-0.5 rounded-full text-xs" style={{ background: isDark ? '#1e293b' : '#e5e7eb', color: text }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Writer Page ─────────────────────────────────────────────────────────

export default function WriterPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useContext(myContext) as any;
  const { mode } = context;
  const isDark = mode === 'dark';

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const { title, setTitle, content, setContent, versions, lastSaved, isSaving, saveVersion, restoreVersion, deleteVersion, clearDraft } = useAutoSave();

  const [emotion, setEmotion] = useState<EmotionResult>({ primary: 'neutral', score: 0, description: 'Thoughtful & balanced', color: '#7f8c8d', emoji: '✨' });
  const [insights, setInsights] = useState<WritingInsights>({ wordCount: 0, lineCount: 0, avgWordsPerLine: 0, longestLine: '', mostUsedWords: [] });
  const [nextLines, setNextLines] = useState<string[]>([]);
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<'suggestions' | 'rhymes' | 'rewrite' | 'prompt' | 'insights'>('suggestions');
  const [rewrittenText, setRewrittenText] = useState('');
  const [blockPrompt, setBlockPrompt] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [showSaveVersionInput, setShowSaveVersionInput] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // ── Load poem for editing ──────────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    setEditLoading(true);
    fetchPoemById(editId).then(poem => {
      if (poem) {
        setTitle(poem.title);
        setContent(poem.content);
      }
      setEditLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // ── Analyze text whenever content changes ──────────────────────────────────
  useEffect(() => {
    const emo = detectEmotion(content);
    setEmotion(emo);
    setInsights(analyzeWriting(content));
  }, [content]);

  // ── Auto-suggest next lines & rhymes as user types (debounced 1.5 s) ──────
  useEffect(() => {
    if (!content.trim()) return;
    const timer = setTimeout(() => {
      setNextLines(suggestNextLines(content));
      setRhymes(suggestRhymes(content));
    }, 1500);
    return () => clearTimeout(timer);
  }, [content]);

  const handleSuggestLines = useCallback(() => {
    setNextLines(suggestNextLines(content));
    setActivePanel('suggestions');
  }, [content]);

  const handleSuggestRhymes = useCallback(() => {
    setRhymes(suggestRhymes(content));
    setActivePanel('rhymes');
  }, [content]);

  const handleRewrite = useCallback((style: WritingStyle) => {
    setRewrittenText(rewriteInStyle(content, style));
    setActivePanel('rewrite');
  }, [content]);

  const handleWritersBlock = useCallback(() => {
    setBlockPrompt(getWritersBlockPrompt());
    setActivePanel('prompt');
  }, []);

  const applyLine = useCallback((line: string) => {
    setContent(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + line);
  }, [setContent]);

  const applyRewrite = useCallback(() => {
    if (rewrittenText) setContent(rewrittenText);
  }, [rewrittenText, setContent]);

  const handleSaveVersion = useCallback(() => {
    saveVersion(versionLabel || undefined);
    setVersionLabel('');
    setShowSaveVersionInput(false);
  }, [saveVersion, versionLabel]);

  const handlePublish = useCallback(async () => {
    if (!content.trim() || publishing) return;
    setPublishing(true);
    setPublishError(null);
    try {
      if (isEditMode && editId) {
        await updatePoem(editId, title || 'Untitled', content);
      } else {
        await publishPoem(title || 'Untitled', content);
        clearDraft();
      }
      setPublished(true);
      setTimeout(() => setPublished(false), 2500);
    } catch (err: any) {
      setPublishError(isEditMode ? 'Update failed. Check your connection.' : 'Publish failed. Check your connection.');
      setTimeout(() => setPublishError(null), 3000);
    } finally {
      setPublishing(false);
    }
  }, [title, content, publishing, isEditMode, editId]);

  const handleClearConfirm = useCallback(() => {
    clearDraft();
    setShowClearModal(false);
  }, [clearDraft]);

  // ── Colours ────────────────────────────────────────────────────────────────
  const bg = isDark ? 'rgb(17, 34, 39)' : '#fffdf5';
  const panelBg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';
  const editorBg = isDark ? '#0d1b22' : '#fffdf5';
  const inputBorder = isDark ? '#334155' : '#d1d5db';
  const tabActive = '#FFBF00';
  const tabBg = isDark ? '#1e293b' : '#f3f4f6';

  const panels = [
    { key: 'suggestions', label: 'Next Line' },
    { key: 'rhymes', label: 'Rhymes' },
    { key: 'rewrite', label: 'Style' },
    { key: 'prompt', label: 'Prompt' },
    { key: 'insights', label: 'Insights' },
  ] as const;

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: bg, padding: '1.5rem 1rem' }}>

        {/* ── Top Bar ───────────────────────────────── */}
        <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            {isEditMode && (
              <span style={{ color: sub, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Editing poem
              </span>
            )}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Untitled Poem"
              className="w-full text-xl font-bold bg-transparent border-b-2 outline-none py-1"
              style={{ color: text, borderColor: inputBorder, fontFamily: 'Georgia, serif', opacity: editLoading ? 0.4 : 1 }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <EmotionBadge emotion={emotion} />
            <SaveStatus isSaving={isSaving} lastSaved={lastSaved} isDark={isDark} />

            {/* Save Version */}
            {showSaveVersionInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={versionLabel}
                  onChange={e => setVersionLabel(e.target.value)}
                  placeholder="Version label (optional)"
                  className="text-xs px-2 py-1 rounded-lg border outline-none"
                  style={{ background: panelBg, color: text, borderColor: inputBorder, width: '150px' }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveVersion()}
                  autoFocus
                />
                <HoverBtn
                  onClick={handleSaveVersion}
                  bg="#FFBF00" hoverBg="#e6ac00" color="#291200"
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                >
                  Save
                </HoverBtn>
                <button onClick={() => setShowSaveVersionInput(false)} className="px-2 py-1 rounded-lg text-xs" style={{ color: sub }}>
                  Cancel
                </button>
              </div>
            ) : (
              <HoverBtn
                onClick={() => setShowSaveVersionInput(true)}
                bg="transparent"
                hoverBg={isDark ? '#1e293b' : '#f3f4f6'}
                color={text}
                border={`1px solid ${inputBorder}`}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
              >
                Save Version
              </HoverBtn>
            )}

            <HoverBtn
              onClick={() => setShowVersions(true)}
              bg="transparent"
              hoverBg={isDark ? '#1e293b' : '#f3f4f6'}
              color={text}
              border={`1px solid ${inputBorder}`}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
            >
              History ({versions.length})
            </HoverBtn>

            <HoverBtn
              onClick={handlePublish}
              disabled={!content.trim() || publishing || editLoading}
              bg={published ? '#16a34a' : publishError ? '#dc2626' : '#FFBF00'}
              hoverBg={published ? '#15803d' : publishError ? '#b91c1c' : '#e6ac00'}
              color={published || publishError ? '#fff' : '#291200'}
              className="px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              {publishing
                ? (isEditMode ? 'Saving…' : 'Publishing…')
                : published
                ? (isEditMode ? '✓ Saved!' : '✓ Published!')
                : publishError
                ? 'Failed — retry'
                : isEditMode ? 'Save Changes' : 'Publish Poem'}
            </HoverBtn>

            <HoverBtn
              onClick={() => setShowClearModal(true)}
              bg={isDark ? '#7f1d1d22' : '#fee2e2'}
              hoverBg={isDark ? '#7f1d1d66' : '#fecaca'}
              color={isDark ? '#fca5a5' : '#b91c1c'}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
            >
              Clear
            </HoverBtn>
          </div>
        </div>

        {/* ── Editor + AI Panel ─────────────────────── */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Poem Editor */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"Begin your poem here...\n\nWrite freely — your draft is saved automatically."}
              className="w-full rounded-2xl p-6 outline-none resize-none text-lg leading-relaxed"
              style={{
                background: editorBg,
                color: text,
                border: `1px solid ${border}`,
                fontFamily: 'Georgia, serif',
                minHeight: '480px',
                boxShadow: isDark ? '0 4px 24px #00000055' : '0 4px 24px #0000001a',
              }}
            />

            {/* Quick AI Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <HoverBtn
                onClick={handleSuggestLines}
                bg="#FFBF00" hoverBg="#e6ac00" color="#291200"
                className="px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Suggest Next Line
              </HoverBtn>
              <HoverBtn
                onClick={handleSuggestRhymes}
                bg="transparent" hoverBg="#FFBF0022" color={text}
                border={`1.5px solid #FFBF00`}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Rhyme Suggestions
              </HoverBtn>
              <HoverBtn
                onClick={handleWritersBlock}
                bg="transparent" hoverBg={isDark ? '#1e293b' : '#f3f4f6'} color={text}
                border={`1px solid ${inputBorder}`}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Writer's Block
              </HoverBtn>
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: panelBg,
              border: `1px solid ${border}`,
              boxShadow: isDark ? '0 4px 24px #00000055' : '0 4px 24px #0000001a',
              minHeight: '480px',
            }}
          >
            {/* Panel Tabs */}
            <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${border}` }}>
              {panels.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActivePanel(key);
                    if (key === 'suggestions') handleSuggestLines();
                    if (key === 'rhymes') handleSuggestRhymes();
                    if (key === 'prompt') handleWritersBlock();
                  }}
                  className="flex-1 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
                  style={{
                    background: activePanel === key ? tabActive : tabBg,
                    color: activePanel === key ? '#291200' : sub,
                    borderBottom: activePanel === key ? `2px solid ${tabActive}` : '2px solid transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Panel Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">

              {/* ─ Next Line Suggestions ─ */}
              {activePanel === 'suggestions' && (
                <div className="space-y-3">
                  <p style={{ color: sub, fontSize: '0.75rem' }}>
                    Suggestions update as you type. Click one to append it.
                  </p>
                  {nextLines.length === 0 ? (
                    <p style={{ color: sub, fontSize: '0.85rem' }}>Start writing to get line suggestions.</p>
                  ) : nextLines.map((line, i) => (
                    <button
                      key={i}
                      onClick={() => applyLine(line)}
                      className="w-full text-left rounded-xl p-3 transition-colors"
                      style={{
                        background: isDark ? '#1e293b' : '#f9fafb',
                        border: `1px solid ${border}`,
                        color: text,
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#334155' : '#f3f4f6'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1e293b' : '#f9fafb'; }}
                    >
                      {line}
                    </button>
                  ))}
                  <HoverBtn
                    onClick={handleSuggestLines}
                    bg="#FFBF0022" hoverBg="#FFBF0044" color="#FFBF00"
                    className="w-full py-2 rounded-xl text-sm font-semibold"
                  >
                    Refresh Suggestions
                  </HoverBtn>
                </div>
              )}

              {/* ─ Rhyme Suggestions ─ */}
              {activePanel === 'rhymes' && (
                <div className="space-y-3">
                  <p style={{ color: sub, fontSize: '0.75rem' }}>
                    Rhymes for the last word — updates as you type.
                  </p>
                  {rhymes.length === 0 ? (
                    <p style={{ color: sub, fontSize: '0.85rem' }}>Write something first.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {rhymes.map((r, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-colors"
                          style={{ background: isDark ? '#1e293b' : '#f3f4f6', color: text, border: `1px solid ${border}` }}
                          onClick={() => applyLine(r)}
                          title="Click to append"
                          onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.background = '#FFBF0033'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.background = isDark ? '#1e293b' : '#f3f4f6'; }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  <HoverBtn
                    onClick={handleSuggestRhymes}
                    bg="#FFBF0022" hoverBg="#FFBF0044" color="#FFBF00"
                    className="w-full py-2 rounded-xl text-sm font-semibold"
                  >
                    Refresh Rhymes
                  </HoverBtn>
                </div>
              )}

              {/* ─ Style Rewrite ─ */}
              {activePanel === 'rewrite' && (
                <div className="space-y-3">
                  <p style={{ color: sub, fontSize: '0.75rem' }}>
                    Rewrite your poem in a different style.
                  </p>
                  <div className="flex flex-col gap-2">
                    {([['shakespearean', 'Shakespearean', 'thee / thy / doth'], ['modern', 'Modern', 'lowercase minimalism'], ['haiku', 'Haiku', '5-7-5 form']] as const).map(([style, label, desc]) => (
                      <button
                        key={style}
                        onClick={() => handleRewrite(style as WritingStyle)}
                        className="w-full text-left rounded-xl p-3 transition-colors"
                        style={{ background: isDark ? '#1e293b' : '#f9fafb', border: `1px solid ${border}` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#334155' : '#f3f4f6'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1e293b' : '#f9fafb'; }}
                      >
                        <p style={{ color: text, fontWeight: 600, fontSize: '0.85rem' }}>{label}</p>
                        <p style={{ color: sub, fontSize: '0.72rem' }}>{desc}</p>
                      </button>
                    ))}
                  </div>
                  {rewrittenText && (
                    <div className="rounded-xl p-3 space-y-2" style={{ background: isDark ? '#0f172a' : '#fffdf5', border: `1px solid ${border}` }}>
                      <p style={{ color: sub, fontSize: '0.72rem' }}>Preview</p>
                      <pre style={{ color: text, fontFamily: 'Georgia, serif', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                        {rewrittenText}
                      </pre>
                      <HoverBtn
                        onClick={applyRewrite}
                        bg="#FFBF00" hoverBg="#e6ac00" color="#291200"
                        className="w-full py-1.5 rounded-lg text-sm font-semibold"
                      >
                        Apply to Editor
                      </HoverBtn>
                    </div>
                  )}
                </div>
              )}

              {/* ─ Writer's Block Prompt ─ */}
              {activePanel === 'prompt' && (
                <div className="space-y-4">
                  <p style={{ color: sub, fontSize: '0.75rem' }}>
                    Use this prompt to break through writer's block.
                  </p>
                  {blockPrompt ? (
                    <div className="rounded-xl p-4" style={{ background: isDark ? '#1e293b' : '#fffbeb', border: `1px solid ${isDark ? '#334155' : '#fde68a'}` }}>
                      <p style={{ color: text, fontFamily: 'Georgia, serif', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        "{blockPrompt}"
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: sub }}>Click below to get a prompt.</p>
                  )}
                  <HoverBtn
                    onClick={handleWritersBlock}
                    bg="#FFBF00" hoverBg="#e6ac00" color="#291200"
                    className="w-full py-2 rounded-xl text-sm font-semibold"
                  >
                    New Prompt
                  </HoverBtn>
                  {blockPrompt && (
                    <HoverBtn
                      onClick={() => applyLine(`[${blockPrompt}]`)}
                      bg="transparent" hoverBg={isDark ? '#1e293b' : '#f3f4f6'} color={text}
                      border={`1px solid ${inputBorder}`}
                      className="w-full py-2 rounded-xl text-sm font-semibold"
                    >
                      Add to Editor as Note
                    </HoverBtn>
                  )}
                </div>
              )}

              {/* ─ Writing Insights ─ */}
              {activePanel === 'insights' && (
                <div className="space-y-3">
                  <InsightsPanel insights={insights} isDark={isDark} />
                  <div className="rounded-xl p-3" style={{ background: isDark ? '#1e293b' : '#f9fafb', border: `1px solid ${border}` }}>
                    <p style={{ color: sub, fontSize: '0.72rem', marginBottom: '0.4rem' }}>Tone detected</p>
                    {emotion.primary !== 'neutral' ? (
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }}>{emotion.emoji}</span>
                        <div>
                          <p style={{ color: text, fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{emotion.primary}</p>
                          <p style={{ color: sub, fontSize: '0.72rem' }}>{emotion.description}</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: sub, fontSize: '0.85rem' }}>Write more to detect the tone of your poem.</p>
                    )}
                  </div>
                  {insights.longestLine && (
                    <div className="rounded-xl p-3" style={{ background: isDark ? '#1e293b' : '#f9fafb', border: `1px solid ${border}` }}>
                      <p style={{ color: sub, fontSize: '0.72rem', marginBottom: '0.3rem' }}>Longest line</p>
                      <p style={{ color: text, fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontStyle: 'italic' }}>
                        "{insights.longestLine.trim()}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────── */}
      {showClearModal && (
        <ClearModal
          onConfirm={handleClearConfirm}
          onCancel={() => setShowClearModal(false)}
          isDark={isDark}
        />
      )}

      {showVersions && (
        <VersionHistoryModal
          versions={versions}
          onRestore={restoreVersion}
          onDelete={deleteVersion}
          onClose={() => setShowVersions(false)}
          isDark={isDark}
        />
      )}
    </Layout>
  );
}
