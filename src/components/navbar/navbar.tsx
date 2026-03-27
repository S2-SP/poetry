import { useContext, useState } from 'react'
import myContext from '../../context/data/myContext';
import { Typography, Navbar, IconButton, Collapse } from '@material-tailwind/react';
import "./navbar.css";
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

// ─── Login Modal ──────────────────────────────────────────────────────────────

function LoginModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const { login } = useAdminAuth();
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const bg = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#1f2937';
  const sub = isDark ? '#94a3b8' : '#6b7280';
  const inputBg = isDark ? '#0f172a' : '#f9fafb';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(input);
    if (success) {
      onClose();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-8 flex flex-col gap-5"
        style={{ background: bg, border: `1px solid ${border}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <p style={{ fontSize: '2.2rem' }}>🔒</p>
          <h2 className="text-xl font-bold mt-2" style={{ color: text, fontFamily: 'Georgia, serif' }}>
            Admin Login
          </h2>
          <p className="text-sm mt-1" style={{ color: sub }}>
            Enter your password to write and manage poems.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl outline-none text-sm pr-10"
              style={{
                background: inputBg,
                border: `1.5px solid ${error ? '#dc2626' : border}`,
                color: text,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: sub }}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#dc2626' }}>
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!input}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
            style={{ background: '#FFBF00', color: '#291200' }}
            onMouseEnter={e => { if (input) (e.currentTarget as HTMLButtonElement).style.background = '#e6ac00'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFBF00'; }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: isDark ? '#334155' : '#f3f4f6', color: text }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#475569' : '#e5e7eb'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#334155' : '#f3f4f6'; }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Nav: React.FC = () => {
  const [openNav, setOpenNav] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const context = useContext(myContext);
  const { mode, toggleMode } = context;
  const { isAdmin, logout } = useAdminAuth();
  const isDark = mode === 'dark';

  const navList = (
    <ul className='nav-container'>
      <Typography
        as="li"
        variant='small'
        color='blue-gray'
        className='typography'
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <Link to={'/allBlogs'} className="nav-link">Poems</Link>
      </Typography>

      {isAdmin && (
        <Typography
          as="li"
          variant="small"
          color="blue-gray"
          className="typography"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Link to={'/writer'} className="nav-link">Write</Link>
        </Typography>
      )}

      {/* Login / Logout */}
      {isAdmin ? (
        <Typography
          as="li"
          variant="small"
          color="blue-gray"
          className="typography"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <button onClick={logout} className="btn-nav-logout">Logout</button>
        </Typography>
      ) : (
        <Typography
          as="li"
          variant="small"
          color="blue-gray"
          className="typography"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <button onClick={() => setShowLoginModal(true)} className="btn-nav-login">Login</button>
        </Typography>
      )}
    </ul>
  );

  return (
    <>
      <Navbar
        className='sticky inset-0 z-20 h-max max-w-full border-none rounded-none py-2 px-4 lg:px-8 lg:py-2'
        style={{ background: isDark ? '#000000' : '#FFBF00' }}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <div className='flex items-center justify-between text-blue-gray-900'>
          <Typography
            as="a"
            className="mr-4 cursor-pointer py-1.5 text-xl font-bold flex gap-2 items-center"
            style={{ color: 'white' }}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <span>
              {mode === 'light'
                ? (
                  <IconButton
                    onClick={toggleMode}
                    className="lg:inline-block rounded-full"
                    style={{ background: '#ffffff' }}
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </IconButton>
                )
                : (
                  <IconButton
                    onClick={toggleMode}
                    className="lg:inline-block rounded-full"
                    style={{ background: '#57606f' }}
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  </IconButton>
                )}
            </span>
          </Typography>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              {navList}
            </div>
            <IconButton
              className="ml-auto h-10 w-10 text-inherit rounded-lg lg:hidden"
              ripple={false}
              onClick={() => setOpenNav(!openNav)}
              style={{ background: mode === 'light' ? '#ced6e0' : '#57606f', color: mode === 'dark' ? 'white' : 'black' }}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              {openNav
                ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )
                : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
            </IconButton>
          </div>
        </div>
        <Collapse open={openNav}>
          {navList}
        </Collapse>
      </Navbar>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} isDark={isDark} />
      )}
    </>
  );
}

export default Nav;
