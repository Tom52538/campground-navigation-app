import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'food-drink': 'bg-red-500',
  'accommodation': 'bg-teal-500', 
  'recreation': 'bg-blue-500',
  'services': 'bg-green-500',
  'facilities': 'bg-yellow-500',
  'transportation': 'bg-purple-500',
  'shopping': 'bg-orange-500',
  'default': 'bg-indigo-500'
};

export function CategoryFilter({ categories, selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const uniqueCategories = Array.from(new Set(categories));

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearAll = () => {
    onCategoryChange([]);
  };

  if (uniqueCategories.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-3">
      <div className="flex flex-wrap gap-2">
        {uniqueCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
          
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 capitalize",
                isSelected 
                  ? `${colorClass} text-white shadow-md` 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {category.replace('-', ' ')}
            </button>
          );
        })}
        
        {selectedCategories.length > 0 && (
          <button
            onClick={clearAll}
            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white hover:bg-gray-900 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}