import { createContext } from 'react';

export type SelectedFeatureProperties = Record<string, unknown>;

export interface LayoutContextType {
  fondo: string;
  setFondo: React.Dispatch<React.SetStateAction<string>>;
  comunidad: string;
  setComunidad: React.Dispatch<React.SetStateAction<string>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFeatureProperties: SelectedFeatureProperties | null;
  setSelectedFeatureProperties: React.Dispatch<
    React.SetStateAction<SelectedFeatureProperties | null>
  >;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
