import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import SideBarLayout from './SideBarLayout';
import { LayoutContext } from './LayoutContext';

import { useAuth } from '../auth/useAuth';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [fondo, setFondo] = useState('osm');

  const { authenticated, logout, user } = useAuth();

  const [comunidad, setComunidad] = useState('canarias');

  return (
    <LayoutContext.Provider value={{ fondo, setFondo, comunidad, setComunidad }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <header style={{ height: 64, position: 'relative', zIndex: 1200 }}>
          <nav style={{ backgroundColor: 'black', height: '100%' }}>
            <ul
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: 0,
                padding: '0 16px',
                height: '100%',
              }}
            >
              <div
                className="izquierda"
                style={{
                  width: '70%',
                  display: 'flex',
                  alignItems: 'center',
                  margin: 0,
                }}
              >
                <li>
                  <IconButton
                    onClick={() => setDrawerOpen((prev) => !prev)}
                    sx={{ color: 'white' }}
                  >
                    <MenuIcon />
                  </IconButton>
                </li>

                <li>
                  <Link to="/">Dashboard</Link>
                </li>

                {authenticated && (
                  <li>
                    <button onClick={logout}>
                      <Link to="/">Logout</Link>
                    </button>
                  </li>
                )}

                {authenticated && user?.realm_access?.roles.includes('user_creation') && (
                  <li>
                    <button>
                      <Link to="/crear-usuario">Crear usuario</Link>
                    </button>
                  </li>
                )}
              </div>

              <div className="derecha" style={{ width: '30%', textAlign: 'right' }}>
                <li>
                  <a
                    href="https://enri123.github.io/portfolio-angular/es/home"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    © Enrique Ruiz Tirado
                  </a>
                </li>
              </div>
            </ul>
          </nav>
        </header>

        <SideBarLayout open={drawerOpen} />

        <main
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
