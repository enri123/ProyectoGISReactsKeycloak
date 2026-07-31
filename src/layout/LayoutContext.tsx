import { createContext } from "react";

export interface LayoutContextType {
  fondo: string;
  setFondo: React.Dispatch<React.SetStateAction<string>>;
  comunidad: string;
  setComunidad: React.Dispatch<React.SetStateAction<string>>;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(
  undefined
);