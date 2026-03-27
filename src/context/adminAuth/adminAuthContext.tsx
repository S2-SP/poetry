import { createContext, useContext, useState, ReactNode } from 'react';

const SESSION_KEY = 'poetry_admin_auth';
const CORRECT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? '';

function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === CORRECT_PASSWORD && CORRECT_PASSWORD !== '';
}

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(isAuthenticated);

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD && CORRECT_PASSWORD !== '') {
      sessionStorage.setItem(SESSION_KEY, password);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
