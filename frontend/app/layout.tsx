import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AseguraSimple",
  description: "Sistema de Gestión de Seguros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}