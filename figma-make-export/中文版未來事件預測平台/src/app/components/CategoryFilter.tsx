interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="mt-3 sm:mt-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full font-medium whitespace-nowrap transition-all ${
              selected === category
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}