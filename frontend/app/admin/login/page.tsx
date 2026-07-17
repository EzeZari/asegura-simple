"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, { // ← CAMBIO
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Acceso denegado");
      }

      localStorage.setItem("asegurasimple_admin_token", data.token);
      
      setToast({ show: true, msg: "Autenticación exitosa. Entrando..." });
      
      setTimeout(() => {
        router.push("/admin"); 
      }, 1000);

    } catch (error: any) {
      setToast({ show: true, msg: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4 selection:bg-green-500/30">
      <div className="w-full max-w-md bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -translate-y-1/4 translate-x-1/4">
          <ShieldCheck size={200} />
        </div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center border border-green-500/20 mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Acceso Restringido</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">AseguraSimple Backoffice</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Maestro</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all placeholder:text-gray-700 font-medium"
                placeholder="admin@asegurasimple.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all placeholder:text-gray-700 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-green-700 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 active:scale-95 shadow-lg shadow-green-900/20"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Ingresar al Sistema <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>

      <Toast 
        message={toast.msg} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}