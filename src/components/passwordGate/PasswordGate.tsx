import { useContext } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import myContext from '../../context/data/myContext';
import WriterPage from '../../pages/writer/writer';

export default function PasswordGate() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useContext(myContext) as any;
  const { mode } = context;
  const isDark = mode === 'dark';

  const { isAdmin, login } = useAdminAuth();

  if (isAdmin) return <WriterPage />;

  const bg = isDark ? 'rgb(17, 34, 39)' : '#fffdf5';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: bg }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6"
        style={{ background: cardBg, border: `1px solid ${border}` }}
      >
        <div className="text-5xl">🔒</div>

        <div className="text-center">
          <h1
            className="text-2xl font-bold"
            style={{ color: text, fontFamily: 'Georgia, serif' }}
          >
            Admin Access
          </h1>
          <p className="text-sm mt-1" style={{ color: sub }}>
            This page is private. Log in to continue.
          </p>
        </div>

        <button
          type="button"
          onClick={login}
          className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
          style={{ background: '#FFBF00', color: '#291200' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e6ac00'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFBF00'; }}
        >
          Log in
        </button>
      </div>
    </div>
  );
}
