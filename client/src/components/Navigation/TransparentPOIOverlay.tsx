import { POI } from '@/types/navigation';

interface TransparentPOIOverlayProps {
  poi: POI;
  onNavigate: (poi: POI) => void;
  onClose: () => void;
}

export const TransparentPOIOverlay = ({ poi, onNavigate, onClose }: TransparentPOIOverlayProps) => {
  const handleNavigate = () => {
    onClose(); // Hide POI info immediately
    onNavigate(poi);
  };

  return (
    <div 
      className="absolute left-4 right-4 z-30"
      style={{
        top: '180px', // Below the 2-row button layout
        maxWidth: '320px',
        margin: '0 auto'
      }}
    >
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span className="text-sm text-gray-600">×</span>
        </button>

        {/* POI Header */}
        <div className="mb-3">
          <h3 
            className="text-lg font-bold mb-1"
            style={{ 
              color: '#000000', 
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            {poi.name}
          </h3>
          
          <div 
            className="text-sm mb-2"
            style={{ 
              color: '#333333', 
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            {poi.category} • {poi.distance}
          </div>
        </div>

        {/* Description */}
        {poi.description && (
          <div className="mb-4">
            <p 
              className="text-sm leading-relaxed"
              style={{ 
                color: '#555555', 
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              {poi.description}
            </p>
          </div>
        )}

        {/* Amenities */}
        {poi.amenities && poi.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {poi.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#166534',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Navigation Button */}
        <button
          onClick={handleNavigate}
          className="w-full h-12 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(34, 197, 94, 0.9)',
            color: '#ffffff',
            border: 'none',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          🧭 Navigate Here
        </button>
      </div>
    </div>
  );
};