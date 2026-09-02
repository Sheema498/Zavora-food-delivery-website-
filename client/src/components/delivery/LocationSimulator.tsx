import React, { useState, useEffect, useRef } from 'react';
import { LatLng } from '../../types/index.js';
import { useSocket } from '../../context/SocketContext.js';
import { generateInterpolatedRoute } from '../../utils/geo.js';
import { Play, Pause, StepForward, RotateCcw, Navigation, Radio } from 'lucide-react';
import { Button } from '../ui/Button.js';

export interface LocationSimulatorProps {
  orderId?: string;
  deliveryPartnerId: string;
  origin: LatLng;
  destination: LatLng;
  onLocationUpdate?: (coord: LatLng, progressPercent: number) => void;
}

export const LocationSimulator: React.FC<LocationSimulatorProps> = ({
  orderId,
  deliveryPartnerId,
  origin,
  destination,
  onLocationUpdate,
}) => {
  const { emitDriverLocation } = useSocket();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(24);

  // Generate 25 waypoints along the route
  const waypoints = useMemoRoute(origin, destination, 25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const broadcastStep = (stepIdx: number) => {
    const point = waypoints[stepIdx];
    if (!point) return;

    const progress = Math.round((stepIdx / (waypoints.length - 1)) * 100);

    emitDriverLocation({
      orderId,
      deliveryPartnerId,
      latitude: point.latitude,
      longitude: point.longitude,
      speed: speedKmh,
      heading: 195,
    });

    if (onLocationUpdate) {
      onLocationUpdate(point, progress);
    }
  };

  const handleStepForward = () => {
    if (currentStep < waypoints.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      broadcastStep(next);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentStep(0);
    broadcastStep(0);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= waypoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          broadcastStep(next);
          return next;
        });
      }, 2000); // 2 second interval for smooth realistic movement
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, waypoints]);

  const progressPercent = Math.round((currentStep / (waypoints.length - 1)) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Live GPS Location Broadcaster</h4>
            <p className="text-[11px] text-slate-400">
              Simulates realistic courier turn-by-turn road coordinates to customer
            </p>
          </div>
        </div>

        <div className="bg-slate-800 px-3 py-1 rounded-xl text-xs font-bold text-sky-400 border border-slate-700">
          {isPlaying ? 'Broadcasting LIVE' : 'Standby'}
        </div>
      </div>

      {/* Progress Telemetry */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-300 font-semibold">
          <span>Route Progress</span>
          <span className="text-sky-400">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 pt-1">
          <span>Restaurant Pickup</span>
          <span>Waypoint {currentStep + 1} of {waypoints.length}</span>
          <span>Customer Doorstep</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          variant={isPlaying ? 'danger' : 'primary'}
          size="sm"
          icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        >
          {isPlaying ? 'Pause Simulation' : 'Drive Route Automatically'}
        </Button>

        <Button
          onClick={handleStepForward}
          variant="outline"
          size="sm"
          disabled={isPlaying || currentStep >= waypoints.length - 1}
          icon={<StepForward className="w-4 h-4" />}
          className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
        >
          Step Forward
        </Button>

        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          icon={<RotateCcw className="w-4 h-4" />}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          Reset to Start
        </Button>
      </div>
    </div>
  );
};

function useMemoRoute(origin: LatLng, destination: LatLng, steps: number): LatLng[] {
  return React.useMemo(() => {
    return generateInterpolatedRoute(origin, destination, steps);
  }, [origin.latitude, origin.longitude, destination.latitude, destination.longitude, steps]);
}
