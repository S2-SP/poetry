import { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/layout/layout';
import myContext from '../../context/data/myContext';
import { fetchPoemById, Poem } from '../../services/poemService';

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>();
  const context = useContext(myContext) as any;
  const { mode } = context;
  const isDark = mode === 'dark';
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPoemById(id).then(data => {
      setPoem(data);
      setLoading(false);
    });
  }, [id]);

  const bg = isDark ? 'rgb(17, 34, 39)' : '#fffdf5';
  const text = isDark ? 'rgb(226, 232, 240)' : 'rgb(30, 41, 59)';
  const sub = isDark ? '#94a3b8' : '#6b7280';

  return (
    <Layout>
      <div style={{ minHeight: '80vh', background: bg }} className="flex justify-center px-5 py-12">
        <div className="w-full max-w-xl">
          <Link
            to="/allblogs"
            className="inline-flex items-center gap-1 text-sm mb-8"
            style={{ color: '#FFBF00' }}
          >
            ← Back to Poems
          </Link>

          {loading ? (
            <div className="flex items-center gap-2 py-12" style={{ color: sub }}>
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#FFBF00', borderTopColor: 'transparent' }} />
              <span>Loading poem...</span>
            </div>
          ) : !poem ? (
            <p style={{ color: sub }}>Poem not found.</p>
          ) : (
            <>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: 'Georgia, serif', color: text }}
              >
                {poem.title}
              </h1>
              <p className="text-xs mb-8" style={{ color: sub }}>
                {new Date(poem.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <pre
                className="text-lg leading-loose whitespace-pre-wrap no-select"
                style={{ fontFamily: 'Georgia, serif', color: text }}
              >
                {poem.content}
              </pre>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
