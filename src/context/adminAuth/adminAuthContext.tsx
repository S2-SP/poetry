import { createContext, useContext, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loginWithRedirect, logout: auth0Logout, user } = useAuth0();

  const login = () => loginWithRedirect();
  const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  console.log(isAuthenticated, user);

  return (
    <AdminAuthContext.Provider value={{ isAdmin: isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
