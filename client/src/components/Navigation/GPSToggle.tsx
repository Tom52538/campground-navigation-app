interface GPSToggleProps {
  useRealGPS: boolean;
  onToggle: () => void;
}

export const GPSToggle = ({ useRealGPS, onToggle }: GPSToggleProps) => {
  return (
    <div 
      className="flex flex-col rounded-full overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <button 
        onClick={onToggle}
        className="w-12 h-8 flex items-center justify-center text-xs font-medium transition-all duration-200 hover:bg-white/20 active:bg-white/40"
        style={{
          background: useRealGPS ? 'rgba(34, 197, 94, 0.9)' : 'transparent',
          color: useRealGPS ? '#ffffff' : '#374151',
          textShadow: useRealGPS 
            ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
            : '0 1px 2px rgba(255, 255, 255, 0.8)',
          minWidth: '48px',
          minHeight: '32px'
        }}
        title="Toggle to Real GPS"
      >
        Real
      </button>
      <div 
        className="h-px"
        style={{ background: 'rgba(156, 163, 175, 0.3)' }}
      ></div>
      <button 
        onClick={onToggle}
        className="w-12 h-8 flex items-center justify-center text-xs font-medium transition-all duration-200 hover:bg-white/20 active:bg-white/40"
        style={{
          background: !useRealGPS ? 'rgba(59, 130, 246, 0.9)' : 'transparent',
          color: !useRealGPS ? '#ffffff' : '#374151',
          textShadow: !useRealGPS 
            ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
            : '0 1px 2px rgba(255, 255, 255, 0.8)',
          minWidth: '48px',
          minHeight: '32px'
        }}
        title="Toggle to Mock GPS"
      >
        Mock
      </button>
    </div>
  );
};