import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AseguraSimple",
  description: "Sistema de Gestión de Seguros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* Aquí va el contenido limpio, sin Sidebar */}
        {children}
      </body>
    </html>
  );
}