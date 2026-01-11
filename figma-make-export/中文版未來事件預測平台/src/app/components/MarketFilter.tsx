import { TrendingUp, Clock, Star, TrendingDown } from 'lucide-react';

interface MarketFilterProps {
  selected: string;
  onSelect: (filter: string) => void;
  isLoggedIn: boolean;
}

export function MarketFilter({ selected, onSelect, isLoggedIn }: MarketFilterProps) {
  const filters = isLoggedIn 
    ? [
        { id: '熱門', label: '熱門', icon: TrendingUp },
        { id: '最新', label: '最新', icon: Clock },
        { id: '已關注', label: '已關注', icon: Star },
        { id: '已下注', label: '已下注', icon: TrendingDown },
      ]
    : [
        { id: '熱門', label: '熱門', icon: TrendingUp },
        { id: '最新', label: '最新', icon: Clock },
      ];

  return (
    <div className="mt-2 sm:mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {filters.map(filter => {
        const Icon = filter.icon;
        
        return (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-medium whitespace-nowrap transition-all ${
              selected === filter.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}