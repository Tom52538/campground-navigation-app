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
      className="absolute top-20 right-4 z-30 w-72 max-w-[calc(100vw-2rem)]"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="p-3">
        {/* Compact Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3 
              className="text-base font-bold truncate leading-tight"
              style={{ 
                color: '#000000', 
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              {poi.name}
            </h3>
            <div 
              className="text-xs flex items-center mt-1"
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
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors flex-shrink-0"
            style={{ color: '#666666' }}
          >
            ✕
          </button>
        </div>

        {/* Navigation Button */}
        <button
          onClick={handleNavigate}
          className="w-full h-10 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(34, 197, 94, 0.85)',
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            boxShadow: '0 2px 12px rgba(34, 197, 94, 0.25)'
          }}
        >
          🧭 Navigate
        </button>
      </div>
    </div>
  );
};