import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* La barra lateral ahora pertenece solo al grupo privado (dashboard) */}
      <Sidebar />
      
      {/* ml-64 empuja el contenido hacia la derecha para que no se superponga */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}