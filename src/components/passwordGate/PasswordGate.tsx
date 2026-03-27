import { useState, useContext } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import myContext from '../../context/data/myContext';
import WriterPage from '../../pages/writer/writer';

export default function PasswordGate() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useContext(myContext) as any;
  const { mode } = context;
  const isDark = mode === 'dark';

  const { isAdmin, login } = useAdminAuth();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAdmin) return <WriterPage />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(input);
    if (!success) {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2500);
    }
  };

  const bg = isDark ? 'rgb(17, 34, 39)' : '#fffdf5';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';
  const inputBg = isDark ? '#1e293b' : '#f9fafb';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: bg }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6"
        style={{ background: cardBg, border: `1px solid ${border}` }}
      >
        {/* Icon */}
        <div className="text-5xl">🔒</div>

        {/* Heading */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold"
            style={{ color: text, fontFamily: 'Georgia, serif' }}
          >
            Admin Access
          </h1>
          <p className="text-sm mt-1" style={{ color: sub }}>
            This page is private. Enter your password to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl outline-none text-sm pr-10"
              style={{
                background: inputBg,
                border: `1.5px solid ${error ? '#dc2626' : border}`,
                color: text,
              }}
            />
            {/* Show/hide toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: sub }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-center" style={{ color: '#dc2626' }}>
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!input}
            className="w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
            style={{ background: '#FFBF00', color: '#291200' }}
            onMouseEnter={e => { if (input) (e.currentTarget as HTMLButtonElement).style.background = '#e6ac00'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFBF00'; }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
