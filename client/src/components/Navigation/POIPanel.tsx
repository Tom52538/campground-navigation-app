import { POI, POI_CATEGORIES } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, X, MapPin } from 'lucide-react';

interface POIPanelProps {
  poi: POI | null;
  isVisible: boolean;
  onNavigate: (poi: POI) => void;
  onClose: () => void;
}

export const POIPanel = ({ poi, isVisible, onNavigate, onClose }: POIPanelProps) => {
  if (!poi) return null;

  const category = POI_CATEGORIES[poi.category as keyof typeof POI_CATEGORIES];

  return (
    <div className={`navigation-panel z-30 ${!isVisible ? 'hidden' : ''}`}>
      {/* Panel Handle */}
      <div className="flex justify-center py-3">
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* POI Details */}
      <div className="px-6 pb-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className={`${category?.color || 'bg-gray-500'} rounded-xl p-3`}>
            <div className="text-white text-xl">
              {category?.icon === 'fas fa-utensils' && '🍽️'}
              {category?.icon === 'fas fa-swimming-pool' && '🏊'}
              {category?.icon === 'fas fa-restroom' && '🚻'}
              {category?.icon === 'fas fa-info-circle' && 'ℹ️'}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{poi.name}</h3>
            <p className="text-gray-600 mb-2">{category?.label || poi.category}</p>
            {poi.distance && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{poi.distance} away</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Amenities */}
        {poi.amenities && poi.amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {poi.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Hours */}
        {poi.hours && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Hours</h4>
            <p className="text-gray-600">{poi.hours}</p>
          </div>
        )}

        {/* Description */}
        {poi.description && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600 text-sm">{poi.description}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            className="flex-1"
            onClick={() => onNavigate(poi)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate Here
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
