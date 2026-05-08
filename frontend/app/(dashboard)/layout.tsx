import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Ponemos el Sidebar acá. Como tiene position: fixed, se queda clavado a la izquierda */}
      <Sidebar />

      {/* 2. El contenido principal (children) envuelve a Inicio, Asegurados, etc. */}
      {/* Usamos ml-64 (margin-left: 16rem) para empujar el contenido hacia la derecha y que el Sidebar no lo tape */}
      <main className="flex-1 ml-64 min-h-screen bg-white">
        {children}
      </main>
    </div>
  );
}