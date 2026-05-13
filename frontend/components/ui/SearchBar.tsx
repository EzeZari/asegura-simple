import { Search } from "lucide-react";

interface Props {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

export default function SearchBar({ valor, onChange, placeholder = "Buscar..." }: Props) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input 
        type="text" 
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 transition-all"
      />
    </div>
  );
}