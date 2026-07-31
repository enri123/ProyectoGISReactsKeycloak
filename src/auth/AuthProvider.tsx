import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import keycloak from "./keycloak";

type AuthContextType = {
  keycloak: typeof keycloak;
  authenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await keycloak.init({
          onLoad: "login-required",
        });

        setAuthenticated(auth);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return <h2>Inicializando Keycloak...</h2>;
  }

  return (
    <AuthContext.Provider
      value={{
        keycloak,
        authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };