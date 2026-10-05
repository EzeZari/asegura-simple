'use client';

import React from 'react';

export default function AnuncioNotebookPage() {
  return (
    <div className="absolute top-0 left-0 min-w-full min-h-screen z-[99999] bg-slate-900 py-12 flex flex-col items-center font-sans antialiased overflow-hidden">
      
      {/* Oculta los widgets flotantes globales */}
      <style dangerouslySetInnerHTML={{__html: `
        .crisp-client, [id^="crisp-"], [href*="wa.me"], .whatsapp-button-class-name { display: none !important; }
      `}} />

      {/* Barra de ayuda */}
      <div className="mb-6 text-slate-300 text-sm flex items-center gap-4 bg-slate-800 px-6 py-3 rounded-full shadow-lg border border-slate-700">
        <span>🔥 <strong>TRUCO HD:</strong> Usá el Modo Dispositivo (Ctrl+Shift+M) en tamaño 1080x1080.</span>
      </div>

      {/* ========================================================
          LIENZO DEL ANUNCIO (1080 x 1080 PX)
          ======================================================== */}
      <div 
        id="ad-notebook"
        className="w-[1080px] h-[1080px] bg-white relative flex flex-col items-center p-12 overflow-hidden shrink-0 shadow-2xl"
      >
        {/* Fondo más limpio */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[80px] pointer-events-none" />

        {/* 1. ENCABEZADO */}
        <div className="text-center z-10 pt-8 mb-16">
          <h1 className="text-[68px] font-extrabold text-[#0a251c] tracking-tight leading-[1.1] max-w-[950px] mx-auto">
            Tu agencia, <br />
            por fin bajo control.
          </h1>
        </div>

        {/* 2. ZONA CENTRAL: NOTEBOOK 3D + TOOLTIPS */}
        <div className="relative w-full flex-1 flex flex-col items-center mt-8">

          {/* MOCKUP NOTEBOOK 3D */}
          <div className="relative w-[780px] flex flex-col items-center z-10 drop-shadow-2xl">
            
            {/* Pantalla (Marcos ultra finos) */}
            <div className="w-full bg-[#121212] rounded-t-xl p-1.5 shadow-2xl border border-slate-700/60 relative z-20">
              {/* Webcam sutil */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full z-20" />
              
              {/* Contenedor de la captura */}
              <div className="relative w-full aspect-[16/10] bg-black rounded-lg overflow-hidden border border-slate-800">
                <img 
                  src="/recursos-ads/calendario.png" 
                  alt="Sistema" 
                  className="w-full h-full object-cover object-top" 
                  onError={(e) => { e.currentTarget.src = "/dashboard.png"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none mix-blend-overlay"></div>
              </div>
              
              {/* Marco inferior de la pantalla */}
              <div className="w-full h-4 bg-[#121212] flex items-center justify-center rounded-b-lg">
                <span className="text-[7px] text-slate-500 tracking-[0.2em] font-medium">MACBOOK PRO</span>
              </div>
            </div>

            {/* BASE Y TECLADO 3D (La magia de CSS) */}
            <div 
              className="relative w-[115%] h-[240px] bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] rounded-b-[2.5rem] border-t border-slate-300 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] flex flex-col items-center z-10"
              style={{
                transform: "perspective(1200px) rotateX(65deg)",
                transformOrigin: "top",
                marginTop: "-2px", // Pega la base a la pantalla
              }}
            >
              {/* Bisagra negra */}
              <div className="w-3/4 h-3 bg-slate-800 rounded-b-xl mb-3 shadow-inner"></div>

              {/* Teclado */}
              <div className="w-[85%] h-[115px] bg-[#1e293b] rounded-lg shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] border border-slate-700 flex justify-center items-center p-1.5">
                {/* Patrón de teclas */}
                <div className="w-full h-full bg-[linear-gradient(to_right,#0f172a_2px,transparent_2px),linear-gradient(to_bottom,#0f172a_2px,transparent_2px)] bg-[size:14px_14px] opacity-70 rounded-sm"></div>
              </div>

              {/* Trackpad */}
              <div className="w-[30%] h-[60px] bg-[#cbd5e1] rounded-lg mt-3 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)] border border-slate-300/60"></div>
              
              {/* Muesca para abrir */}
              <div className="absolute bottom-0 w-32 h-1.5 bg-slate-400 rounded-t-xl"></div>
            </div>

          </div>

          {/* LÍNEAS SVG CONECTORAS (Con flechas) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
            </defs>
            
            {/* Línea hacia Tooltip 1 (Izquierda Arriba) */}
            <path d="M 330 30 Q 380 90 410 120" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow)" />
            
            {/* Línea hacia Tooltip 2 (Derecha Arriba) */}
            <path d="M 860 100 Q 890 200 870 230" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow)" />

            {/* Línea hacia Tooltip 3 (Abajo Izquierda) */}
            <path d="M 280 430 Q 370 330 420 300" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow)" />
          </svg>

          {/* TOOLTIPS (Estilo píldora blanca con borde verde) */}
          <div className="absolute left-[30px] top-[-10px] z-40 bg-white px-5 py-3 rounded-full shadow-xl border border-emerald-500 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
               {/* Ícono Dashboard */}
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <span className="text-xl font-bold text-slate-800">Toda tu cartera <br/> en 1 pantalla</span>
          </div>

          <div className="absolute right-[-20px] top-[40px] z-40 bg-white px-5 py-3 rounded-full shadow-xl border border-emerald-500 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
               {/* Ícono Calendario */}
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <span className="text-xl font-bold text-slate-800">Control automático <br/> de renovaciones</span>
          </div>

          <div className="absolute left-[20px] bottom-[110px] z-40 bg-white px-5 py-3 rounded-full shadow-xl border border-emerald-500 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
               {/* Ícono WhatsApp */}
               <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.124-.531-1.826-.759-2.99-2.617-3.08-2.739-.089-.12-1.748-2.327-1.748-4.439 0-2.112 1.106-3.146 1.498-3.576.393-.43.858-.538 1.144-.538.286 0 .572.004.823.016.264.013.621-.1 1.002.812.392.936.858 2.08.932 2.234.074.153.123.332.025.534-.099.201-.148.326-.296.502-.148.176-.312.393-.446.527-.148.148-.302.309-.13.606.173.296.769 1.268 1.65 2.052 1.134 1.01 2.088 1.323 2.385 1.471.297.148.47.123.643-.075.173-.198.742-.864.939-1.161.198-.297.395-.248.667-.148.272.099 1.728.815 2.025.964.297.148.494.223.568.347.074.123.074.717-.07 1.122z"/></svg>
            </div>
            <span className="text-xl font-bold text-slate-800">Avisos por WhatsApp <br/> en 1 clic</span>
          </div>

        </div>

        {/* 3. BOTÓN INFERIOR */}
        <div className="z-40 pb-6 mt-12">
          <div className="bg-[#009b62] text-white font-bold text-[26px] px-12 py-4 rounded-full shadow-lg flex items-center gap-3">
            <span>Automatizá tu agencia. 14 días gratis.</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
        </div>

      </div>
    </div>
  );
}