import type { ReactNode } from 'react';
import { Auth0Provider, type AppState } from '@auth0/auth0-react';

export function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  const onRedirectCallback = (appState?: AppState) => {
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo ?? window.location.pathname
    );
  };

  if (!domain || !clientId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 text-center px-4">
        <h1 className="text-lg font-semibold text-slate-900">Auth0 is not configured</h1>
        <p className="text-sm text-slate-500 max-w-sm">
          Set <code className="bg-slate-100 px-1 rounded">VITE_AUTH0_DOMAIN</code> and{' '}
          <code className="bg-slate-100 px-1 rounded">VITE_AUTH0_CLIENT_ID</code> in{' '}
          <code className="bg-slate-100 px-1 rounded">.env.local</code> (see{' '}
          <code className="bg-slate-100 px-1 rounded">.env.local.example</code>).
        </p>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
