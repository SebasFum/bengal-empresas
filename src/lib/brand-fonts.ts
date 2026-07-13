import { Cormorant_Garamond, Jost } from "next/font/google";

// Tipografías de la marca madre BENGAL (portada e páginas de marca).
// Distintas de las del portal Empresas (Playfair + Inter).
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});
