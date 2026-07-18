import { Search, Filter } from "lucide-react";

interface FiltrosAgenciasProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filtroPlan: string;
  setFiltroPlan: (value: string) => void;
}

export default function FiltrosAgencias({ searchTerm, setSearchTerm, filtroPlan, setFiltroPlan }: FiltrosAgenciasProps) {
  const planes = ["TODOS", "GRATUITO", "BASICO", "PROFESIONAL", "AGENCIA"];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-sm">
      
      <div className="relative w-full md:w-96 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, email o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 text-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-gray-600"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Filter size={14} /> Filtrar:
        </span>
        {planes.map(plan => (
          <button
            key={plan}
            onClick={() => setFiltroPlan(plan)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              filtroPlan === plan
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-950 text-gray-500 border border-gray-800 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            {plan === "TODOS" ? "Todos" : plan === "AGENCIA" ? "Agencia Elite" : plan === "BASICO" ? "BASICO" : plan}
          </button>
        ))}
      </div>
    </div>
  );
}