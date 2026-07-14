import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cormorant } from "@/lib/brand-fonts";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FooterGate from "@/components/FooterGate";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bengal Empresas — Gastronomía Premium Corporativa",
  description: "Viandas gourmet y eventos corporativos para equipos que exigen calidad. Pedidos simples, servicio impecable.",
  keywords: "catering corporativo, viandas empresas, almuerzo oficina, eventos corporativos, gastronomía premium",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`h-full ${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <FooterGate><Footer /></FooterGate>
        </Providers>
      </body>
    </html>
  );
}
