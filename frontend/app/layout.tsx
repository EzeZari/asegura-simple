import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Importamos tu nueva barra lateral (Asegurate de que la ruta sea correcta)
import Sidebar from "../components/layout/Sidebar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Le ponemos el nombre real a tu proyecto
export const metadata: Metadata = {
  title: "AseguraSimple",
  description: "Sistema de gestión para productores de seguros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Cambiamos el idioma a español
    <html lang="es"> 
      <body
        // Mantenemos tus fuentes Geist y le sumamos el fondo gris y el layout flex
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex min-h-screen`}
      >
        {/* Renderizamos la barra lateral a la izquierda */}
        <Sidebar />

        {/* Empujamos el contenido a la derecha para que no quede abajo de la barra */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}