
import React from 'react';
import { Button } from '@/components/ui/button';
import { POI } from '@/types/navigation';
import { Navigation, X, MapPin, Clock } from 'lucide-react';

interface TransparentPOIOverlayProps {
  poi: POI;
  onNavigate: (poi: POI) => void;
  onClose: () => void;
}

export const TransparentPOIOverlay: React.FC<TransparentPOIOverlayProps> = ({
  poi,
  onNavigate,
  onClose
}) => {
  // Deutsche POI-Typ Übersetzungen basierend auf Roompot-Plan
  const getGermanPOIType = (category: string) => {
    const translations: Record<string, string> = {
      'buildings': 'Unterkunft',
      'facilities': 'Einrichtung',
      'services': 'Service',
      'food-drink': 'Gastronomie',
      'recreation': 'Freizeit',
      'parking': 'Parkplatz',
      'toilets': 'Sanitäranlagen'
    };
    return translations[category] || 'Sonstiges';
  };

  // Roompot-spezifische Zusatzinfos
  const getRoompotInfo = (poi: POI) => {
    if (poi.name?.includes('Bungalow')) return 'Ferienhaus mit Komfort-Ausstattung';
    if (poi.name?.includes('Beach House')) return 'Strandhaus in Wassernähe';
    if (poi.name?.includes('Chalet')) return 'Gemütliches Chalet für Familien';
    if (poi.name?.includes('toilets')) return 'Sanitäranlagen mit Duschen';
    if (poi.name?.includes('parking')) return 'Parkplatz für Gäste';
    return 'Roompot Beach Resort Einrichtung';
  };

  return (
    <div
      className="fixed bottom-32 left-4 right-4 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        animation: 'slideUpFromBottom 0.3s ease-out'
      }}
    >
      {/* Header mit Close Button */}
      <div className="flex items-start justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {getGermanPOIType(poi.category)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {poi.name || 'Unbekanntes Ziel'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3">
            {getRoompotInfo(poi)}
          </p>

          {/* Entfernung falls verfügbar */}
          {poi.distance && (
            <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
              <Clock className="w-4 h-4" />
              <span>{poi.distance} entfernt</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={() => onNavigate(poi)}
          className="w-full h-12 text-white font-medium rounded-xl transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
          }}
        >
          <Navigation className="w-5 h-5 mr-2" />
          Navigation starten
        </Button>
      </div>

      <style>{`
        @keyframes slideUpFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
