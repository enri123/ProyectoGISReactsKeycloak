import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return {
    authenticated: context.authenticated,
    keycloak: context.keycloak,
    logout: () => context.keycloak.logout(),
    login: () => context.keycloak.login(),
    token: context.keycloak.token,
    user: context.keycloak.tokenParsed,
  };
}
