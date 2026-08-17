import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Dashboard from './routes/Dashboard';
import App from './App';
import CrearUsuario from './routes/CrearUsuarios';

import { AuthProvider } from './auth/AuthProvider';

import 'bootstrap/dist/css/bootstrap.min.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

//Rutas que tiene el proyecto, es este caso solo la ruta base tiene contenido
const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/main',
    element: <App />,
  },
  {
    path: '/crear-usuario',
    element: <CrearUsuario />,
  },
]);

//AuthProvider es el que tiene toda la lógica de inicio de sesión
//RouterProvider son las distintas páginas de nuestro proyecto
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
