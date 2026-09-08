import { Megaphone, Layout, AppWindow, Loader2, Save } from "lucide-react";

interface Comunicado {
  mensajeBanner: string;
  activoBanner: boolean;
  tipoBanner: string;
  mensajeModal: string;
  activoModal: boolean;
  tipoModal: string;
}

interface GestorComunicadosProps {
  comunicado: Comunicado;
  setComunicado: (c: Comunicado) => void;
  onGuardar: () => void;
  isSaving: boolean;
}

export default function GestorComunicados({ comunicado, setComunicado, onGuardar, isSaving }: GestorComunicadosProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Megaphone className="text-blue-500 w-6 h-6" /> Centro de Comunicados
        </h2>
        <p className="text-sm text-gray-400">Gestioná los mensajes globales. Podés tener un Banner superior y un Modal activos al mismo tiempo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* B A N N E R */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <Layout size={18} className="text-gray-400"/> Banner Superior
            </div>
            <button type="button" onClick={() => setComunicado({ ...comunicado, activoBanner: !comunicado.activoBanner })} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${comunicado.activoBanner ? 'bg-green-600' : 'bg-gray-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${comunicado.activoBanner ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <textarea 
            rows={3}
            value={comunicado.mensajeBanner}
            onChange={(e) => setComunicado({...comunicado, mensajeBanner: e.target.value})}
            placeholder="Escribí el texto del banner acá..."
            className="w-full bg-gray-900/80 border border-gray-800 rounded-xl p-5 text-gray-200 outline-none focus:border-blue-500 transition-colors resize-y min-h-[100px] text-base leading-relaxed custom-scrollbar"
          />
          <div className="flex gap-2">
            <button onClick={() => setComunicado({...comunicado, tipoBanner: 'blue'})} className={`w-6 h-6 rounded-full bg-blue-600 border-2 ${comunicado.tipoBanner === 'blue' ? 'border-white' : 'border-transparent opacity-50'}`} />
            <button onClick={() => setComunicado({...comunicado, tipoBanner: 'red'})} className={`w-6 h-6 rounded-full bg-red-600 border-2 ${comunicado.tipoBanner === 'red' ? 'border-white' : 'border-transparent opacity-50'}`} />
            <button onClick={() => setComunicado({...comunicado, tipoBanner: 'green'})} className={`w-6 h-6 rounded-full bg-green-600 border-2 ${comunicado.tipoBanner === 'green' ? 'border-white' : 'border-transparent opacity-50'}`} />
            <button onClick={() => setComunicado({...comunicado, tipoBanner: 'yellow'})} className={`w-6 h-6 rounded-full bg-amber-500 border-2 ${comunicado.tipoBanner === 'yellow' ? 'border-white' : 'border-transparent opacity-50'}`} />
          </div>
        </div>

        {/* M O D A L */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <AppWindow size={18} className="text-gray-400"/> Modal Pop-up <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase font-semibold ml-2">Lectura obligatoria</span>
            </div>
            <button type="button" onClick={() => setComunicado({ ...comunicado, activoModal: !comunicado.activoModal })} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${comunicado.activoModal ? 'bg-purple-600' : 'bg-gray-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${comunicado.activoModal ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <textarea 
              rows={7}
              value={comunicado.mensajeModal}
              onChange={(e) => setComunicado({...comunicado, mensajeModal: e.target.value})}
              placeholder="Escribí la noticia del modal acá..."
              className="w-full bg-gray-900/80 border border-gray-800 rounded-xl p-5 text-gray-200 outline-none focus:border-purple-500 transition-colors resize-y min-h-[180px] text-base leading-relaxed custom-scrollbar"
            />
            <p className="text-[11px] text-gray-500 font-medium px-1">💡 <strong>Tip:</strong> Usá <code className="text-gray-400"># </code> para títulos grandes, y encerrá palabras en <code className="text-gray-400">**asteriscos**</code> para <strong>negritas</strong>.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setComunicado({...comunicado, tipoModal: 'blue'})} className={`w-6 h-6 rounded-full bg-blue-600 border-2 ${comunicado.tipoModal === 'blue' ? 'border-white' : 'border-transparent opacity-50'}`} />
            <button onClick={() => setComunicado({...comunicado, tipoModal: 'red'})} className={`w-6 h-6 rounded-full bg-red-600 border-2 ${comunicado.tipoModal === 'red' ? 'border-white' : 'border-transparent opacity-50'}`} />
            <button onClick={() => setComunicado({...comunicado, tipoModal: 'green'})} className={`w-6 h-6 rounded-full bg-green-600 border-2 ${comunicado.tipoModal === 'green' ? 'border-white' : 'border-transparent opacity-50'}`} />
            <button onClick={() => setComunicado({...comunicado, tipoModal: 'yellow'})} className={`w-6 h-6 rounded-full bg-amber-500 border-2 ${comunicado.tipoModal === 'yellow' ? 'border-white' : 'border-transparent opacity-50'}`} />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2 pt-6 border-t border-gray-800">
        <button onClick={onGuardar} disabled={isSaving} className="flex items-center w-full sm:w-auto justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar Anuncios
        </button>
      </div>
    </div>
  );
}