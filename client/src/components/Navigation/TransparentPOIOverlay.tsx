
import React from 'react';
import { POI } from '@/types/navigation';
import { Navigation, X, Phone, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <div 
      className="absolute bottom-24 left-4 right-4 z-40 rounded-2xl p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-grow min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
            {poi.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {poi.distance && `${poi.distance} away`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="flex-shrink-0 ml-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Contact Information */}
      {(poi.phone || poi.website || poi.opening_hours) && (
        <div className="space-y-2 mb-4">
          {poi.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4" />
              <span>{poi.phone}</span>
            </div>
          )}
          {poi.website && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Globe className="w-4 h-4" />
              <span className="truncate">{poi.website}</span>
            </div>
          )}
          {poi.opening_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{poi.opening_hours}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Navigation Button */}
      <Button
        onClick={() => onNavigate(poi)}
        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        <Navigation className="w-5 h-5 mr-2" />
        Navigate Here
      </Button>
    </div>
  );
};
