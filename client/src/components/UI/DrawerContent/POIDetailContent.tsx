import { POI, POI_CATEGORIES } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, X, MapPin, Phone, Globe, Clock } from 'lucide-react';

interface POIDetailContentProps {
  poi: POI;
  onNavigate?: (poi: POI) => void;
  onClose?: () => void;
}

export const POIDetailContent = ({ poi, onNavigate, onClose }: POIDetailContentProps) => {
  const category = POI_CATEGORIES[poi.category as keyof typeof POI_CATEGORIES];

  return (
    <div className="h-full overflow-y-auto">
      {/* POI Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className={`${category?.color || 'bg-gray-500'} rounded-xl p-3 flex-shrink-0`}>
          <div className="text-white text-xl">
            {category?.icon === 'fas fa-utensils' && '🍽️'}
            {category?.icon === 'fas fa-swimming-pool' && '🏊'}
            {category?.icon === 'fas fa-restroom' && '🚻'}
            {category?.icon === 'fas fa-info-circle' && 'ℹ️'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">{poi.name}</h3>
          <p className="text-gray-600 mb-2">{category?.label || poi.category}</p>
          {poi.distance && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{poi.distance} away</span>
            </div>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
      
      {/* Quick Actions Row */}
      <div className="flex space-x-2 mb-4">
        {onNavigate && (
          <Button
            className="flex-1 min-h-[48px]"
            onClick={() => onNavigate(poi)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate Here
          </Button>
        )}
        {poi.amenities?.some(amenity => amenity.toLowerCase().includes('phone')) && (
          <Button variant="outline" size="icon" className="min-h-[48px] min-w-[48px]">
            <Phone className="w-4 h-4" />
          </Button>
        )}
        {poi.amenities?.some(amenity => amenity.toLowerCase().includes('website')) && (
          <Button variant="outline" size="icon" className="min-h-[48px] min-w-[48px]">
            <Globe className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Amenities */}
      {poi.amenities && poi.amenities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {poi.amenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Hours */}
      {poi.hours && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-700">Hours</h4>
          </div>
          <p className="text-gray-600 text-sm">{poi.hours}</p>
        </div>
      )}

      {/* Description */}
      {poi.description && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{poi.description}</p>
        </div>
      )}
    </div>
  );
};