import { useContext, useState, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/layout';
import { Link } from 'react-router-dom';
import { fetchPoems, deletePoem, Poem } from '../../services/poemService';

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  poem,
  onConfirm,
  onCancel,
  isDark,
}: {
  poem: Poem;
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
            Delete Poem?
          </h2>
          <p style={{ color: sub, fontSize: '0.85rem', marginTop: '0.4rem' }}>
            <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>"{poem.title}"</span>
            {' '}will be permanently removed from the cloud.
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
            No, Keep It
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#dc2626' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b91c1c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#dc2626'; }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Poem Card ────────────────────────────────────────────────────────────────

function PoemCard({
  poem,
  mode,
  onDeleteRequest,
}: {
  poem: Poem;
  mode: string;
  onDeleteRequest: (poem: Poem) => void;
}) {
  const isDark = mode === 'dark';
  const lines = poem.content.split('\n').filter(l => l.trim());
  const preview = lines.slice(0, 4).join('\n');
  const hasMore = lines.length > 4;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3 shadow-lg hover:-translate-y-1 transition-transform"
      style={{
        background: isDark ? 'rgb(30, 41, 59)' : 'white',
        borderBottom: `4px solid ${isDark ? 'rgb(226, 232, 240)' : 'rgb(30, 41, 59)'}`,
      }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h2
          className="text-lg font-bold flex-1"
          style={{ fontFamily: 'Georgia, serif', color: isDark ? 'rgb(226, 232, 240)' : 'rgb(30, 41, 59)' }}
        >
          {poem.title}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs mt-1" style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>
            {new Date(poem.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {/* Delete button */}
          <button
            onClick={() => onDeleteRequest(poem)}
            className="mt-0.5 p-1.5 rounded-lg transition-colors"
            title="Delete poem"
            style={{ background: isDark ? '#7f1d1d33' : '#fee2e2', color: isDark ? '#fca5a5' : '#b91c1c' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#7f1d1d88' : '#fecaca'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#7f1d1d33' : '#fee2e2'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview */}
      <pre
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ fontFamily: 'Georgia, serif', color: isDark ? 'rgb(203, 213, 225)' : 'rgb(51, 65, 85)' }}
      >
        {preview}{hasMore ? '\n…' : ''}
      </pre>

      <Link
        to={`/poem/${poem.id}`}
        className="self-start text-xs font-semibold px-3 py-1 rounded-full mt-1"
        style={{ background: '#FFBF00', color: '#291200' }}
      >
        Read Full Poem
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AllBlog() {
  const context = useContext(myContext) as any;
  const { mode } = context;
  const isDark = mode === 'dark';

  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Poem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPoems();
  }, []);

  async function loadPoems() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPoems();
      setPoems(data);
    } catch (err: any) {
      setError('Could not load poems. Check your Supabase connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deletePoem(pendingDelete.id);
      setPoems(prev => prev.filter(p => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  }

  const sub = isDark ? '#94a3b8' : '#6b7280';

  return (
    <Layout>
      <section style={{ minHeight: '80vh', background: isDark ? 'rgb(17, 34, 39)' : '#fffdf5' }}>
        <div className="container px-5 py-10 mx-auto max-w-4xl">
          <h1
            className="text-center text-3xl font-bold mb-8"
            style={{ color: isDark ? 'white' : 'rgb(30, 41, 59)', fontFamily: 'Georgia, serif' }}
          >
            Poems
          </h1>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FFBF00', borderTopColor: 'transparent' }} />
              <p style={{ color: sub, fontSize: '0.9rem' }}>Loading poems...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-4xl">⚠️</p>
              <p style={{ color: sub }}>{error}</p>
              <button
                onClick={loadPoems}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#FFBF00', color: '#291200' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && poems.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <p className="text-5xl">📜</p>
              <p className="text-lg font-medium" style={{ color: sub }}>
                No poems published yet.
              </p>
              <Link
                to="/writer"
                className="px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#FFBF00', color: '#291200' }}
              >
                Write your first poem
              </Link>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && poems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poems.map(poem => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  mode={mode}
                  onDeleteRequest={setPendingDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <ConfirmDeleteModal
          poem={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setPendingDelete(null)}
          isDark={isDark}
        />
      )}
    </Layout>
  );
}

export default AllBlog;
