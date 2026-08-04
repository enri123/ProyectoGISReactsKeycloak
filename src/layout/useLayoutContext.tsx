import { useContext } from 'react';
import { LayoutContext } from './LayoutContext';

export function useLayout() {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayout debe usarse dentro de SideBarLayout');
  }

  return context;
}
