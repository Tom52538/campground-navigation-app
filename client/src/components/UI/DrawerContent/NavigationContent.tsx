import { NavigationRoute, Coordinates } from '@/types/navigation';
import { Navigation, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationContentProps {
  route: NavigationRoute;
  currentPosition: Coordinates;
  onEndNavigation?: () => void;
}

export const NavigationContent = ({ route, currentPosition, onEndNavigation }: NavigationContentProps) => {
  const nextInstruction = route.nextInstruction || route.instructions[0];

  return (
    <div className="h-full overflow-y-auto">
      {/* Current Navigation Instruction */}
      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              {nextInstruction?.instruction || 'Continue straight'}
            </h3>
            <div className="flex items-center text-sm text-blue-700 space-x-4">
              {nextInstruction?.distance && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{nextInstruction.distance}</span>
                </div>
              )}
              {nextInstruction?.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{nextInstruction.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Route Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Route Summary</h4>
          <div className="text-xs text-gray-500">ETA {route.arrivalTime}</div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{route.totalDistance}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{route.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Instructions */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Turns</h4>
        <div className="space-y-2">
          {route.instructions.slice(0, 3).map((instruction, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-white border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{instruction.instruction}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>{instruction.distance}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{instruction.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="space-y-2">
        {onEndNavigation && (
          <Button
            variant="outline"
            className="w-full min-h-[48px] border-red-200 text-red-600 hover:bg-red-50"
            onClick={onEndNavigation}
          >
            End Navigation
          </Button>
        )}
      </div>
    </div>
  );
};