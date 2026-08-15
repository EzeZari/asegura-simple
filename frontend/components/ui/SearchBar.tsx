import { Search } from "lucide-react";

interface Props {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

export default function SearchBar({ valor, onChange, placeholder = "Buscar..." }: Props) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" size={20} />
      <input 
        type="text" 
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        // 🔥 Adaptado: bg oscuro, borde oscuro y texto claro
        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
      />
    </div>
  );
}