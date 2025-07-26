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
      className="absolute bottom-4 left-4 right-4 z-30 max-w-sm mx-auto"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="p-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-bold truncate"
              style={{ 
                color: '#000000', 
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              {poi.name}
            </h3>
            <div 
              className="text-sm flex items-center"
              style={{ 
                color: '#555555', 
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              <span className="mr-2">{poi.category}</span>
              {poi.distance && (
                <>
                  <span className="mx-1">•</span>
                  <span>{poi.distance}</span>
                </>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
            style={{ color: '#666666' }}
          >
            ✕
          </button>
        </div>

        {/* Navigation Button */}
        <button
          onClick={handleNavigate}
          className="w-full h-12 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.2)'
          }}
        >
          🧭 Hier navigieren
        </button>
      </div>
    </div>
  );
};