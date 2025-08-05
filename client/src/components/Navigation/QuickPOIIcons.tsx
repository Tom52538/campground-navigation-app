import { Button } from '@/components/ui/button';
import { POICategory } from '@/types/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface QuickPOIIconsProps {
  filteredCategories: string[];
  onToggleCategory: (category: string) => void;
}

const CAMPING_POI_ICONS = [
  // Row 1 - 4 icons (Services - Wichtigste Einrichtungen)
  { category: 'services' as POICategory, icon: '🚻', label: 'Toiletten' },
  { category: 'services' as POICategory, icon: '🚿', label: 'Waschstation' },
  { category: 'services' as POICategory, icon: '🏪', label: 'Shop' },
  { category: 'services' as POICategory, icon: '🔌', label: 'Ladestation' },
  // Row 2 - 4 icons (Food & Entertainment)
  { category: 'food-drink' as POICategory, icon: '🍕', label: 'Pizzeria' },
  { category: 'food-drink' as POICategory, icon: '🍽️', label: 'Restaurant' },
  { category: 'recreation' as POICategory, icon: '🎮', label: 'Kids Club' },
  { category: 'recreation' as POICategory, icon: '🏐', label: 'Volleyball' },
  // Row 3 - 3 icons (Unterkünfte & Sonstiges)
  { category: 'facilities' as POICategory, icon: '🏠', label: 'Bungalows' },
  { category: 'facilities' as POICategory, icon: '🅿️', label: 'Parkplatz' },
  { category: 'services' as POICategory, icon: 'ℹ️', label: 'Info' }
];

export const QuickPOIIcons = ({ filteredCategories, onToggleCategory }: QuickPOIIconsProps) => {
  const { t } = useLanguage();

  const renderButton = (poi: typeof CAMPING_POI_ICONS[0], index: number) => {
    const isActive = filteredCategories.includes(poi.category);

    return (
      <Button
        key={`poi-${index}`}
        variant="ghost"
        size="sm"
        className={`
          h-16 rounded-xl flex flex-col items-center justify-center 
          transition-all duration-200 hover:scale-105 active:scale-95
          ${isActive 
            ? 'bg-blue-500/90 text-white scale-105 shadow-xl' 
            : 'bg-white/80 text-gray-700 hover:bg-gray-50/90'
          }
        `}
        style={{
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minWidth: '80px',
          flex: '1'
        }}
        onClick={() => onToggleCategory(poi.category)}
        title={t(`categories.${poi.category}`)}
      >
        <span className="text-xl mb-1">{poi.icon}</span>
        <span 
          className="text-xs font-semibold text-center leading-tight"
          style={{
            color: isActive ? 'white' : '#374151',
            textShadow: isActive ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          {poi.label}
        </span>
      </Button>
    );
  };

  return (
    <div className="absolute bottom-6 left-4 right-4 z-20">
      <div className="flex flex-col gap-3">
        {/* ROW 1: Icons 0-3 (🚿, 🍽️, 🔥, 🥾) */}
        <div className="flex gap-2">
          {CAMPING_POI_ICONS.slice(0, 4).map((poi, index) => renderButton(poi, index))}
        </div>

        {/* ROW 2: Icons 4-7 (⛽, 🏕️, 🏊, 🅿️) */}
        <div className="flex gap-2">
          {CAMPING_POI_ICONS.slice(4, 8).map((poi, index) => renderButton(poi, index + 4))}
        </div>

        {/* ROW 3: Icons 8-10 (🏪, 🎯, 🔧) - centered */}
        <div className="flex gap-2 justify-center">
          {CAMPING_POI_ICONS.slice(8, 11).map((poi, index) => renderButton(poi, index + 8))}
        </div>
      </div>
    </div>
  );
};