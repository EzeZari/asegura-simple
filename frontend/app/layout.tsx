import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AseguraSimple",
  description: "Sistema de Gestión de Seguros",
  verification: {
    google: "dcNDxe2BN3PQ4IaIT2JOxKu6_E6bss36-Xr3l2SpomA",
  },
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