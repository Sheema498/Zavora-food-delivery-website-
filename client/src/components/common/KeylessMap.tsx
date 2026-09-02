import React, { useState, useEffect, useMemo } from 'react';
import { LatLng, OrderStatus } from '../../types/index.js';
import { Store, Navigation, MapPin, Compass, LocateFixed, ZoomIn, ZoomOut } from 'lucide-react';
import { calculateDistanceKm } from '../../utils/geo.js';

export interface KeylessMapProps {
  restaurantLocation: LatLng;
  restaurantName: string;
  customerLocation: LatLng;
  customerAddress?: string;
  driverLocation?: LatLng | null;
  driverName?: string;
  orderStatus?: OrderStatus;
  height?: string;
  className?: string;
}

export const KeylessMap: React.FC<KeylessMapProps> = ({
  restaurantLocation,
  restaurantName,
  customerLocation,
  customerAddress = 'Delivery Destination',
  driverLocation,
  driverName = 'Delivery Partner',
  orderStatus,
  height = '420px',
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeMarker, setActiveMarker] = useState<'restaurant' | 'customer' | 'driver' | null>(null);

  // Compute bounding box and normalize coordinates to 0..1000 SVG canvas coordinate space
  const bounds = useMemo(() => {
    const lats = [restaurantLocation.latitude, customerLocation.latitude];
    const lngs = [restaurantLocation.longitude, customerLocation.longitude];

    if (driverLocation) {
      lats.push(driverLocation.latitude);
      lngs.push(driverLocation.longitude);
    }

    const minLat = Math.min(...lats) - 0.005;
    const maxLat = Math.max(...lats) + 0.005;
    const minLng = Math.min(...lngs) - 0.005;
    const maxLng = Math.max(...lngs) + 0.005;

    return { minLat, maxLat, minLng, maxLng };
  }, [restaurantLocation, customerLocation, driverLocation]);

  const projectToSvg = (coord: LatLng) => {
    const latSpan = bounds.maxLat - bounds.minLat || 0.01;
    const lngSpan = bounds.maxLng - bounds.minLng || 0.01;

    // Invert lat for SVG Y (higher lat is top)
    const x = ((coord.longitude - bounds.minLng) / lngSpan) * 800 + 100;
    const y = ((bounds.maxLat - coord.latitude) / latSpan) * 400 + 50;

    return { x, y };
  };

  const restPos = projectToSvg(restaurantLocation);
  const custPos = projectToSvg(customerLocation);
  const driverPos = driverLocation ? projectToSvg(driverLocation) : null;

  // Real-time distance and ETA telemetry
  const distanceKm = useMemo(() => {
    if (driverLocation) {
      return calculateDistanceKm(driverLocation, customerLocation);
    }
    return calculateDistanceKm(restaurantLocation, customerLocation);
  }, [driverLocation, restaurantLocation, customerLocation]);

  const etaMinutes = Math.max(3, Math.ceil((distanceKm / 22) * 60) + 2);

  return (
    <div
      className={`relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl select-none ${className}`}
      style={{ height }}
    >
      {/* Live Map Header HUD */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 items-center">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
          <span className="font-semibold">Live GPS Telemetry</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">ETA: <strong className="text-white">{etaMinutes} mins</strong></span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Distance: <strong className="text-white">{distanceKm} km</strong></span>
        </div>

        {orderStatus && (
          <div className="bg-brand-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Status: {orderStatus.replace(/_/g, ' ')}</span>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 shadow-lg transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 shadow-lg transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 shadow-lg transition-colors cursor-pointer"
          title="Reset Center"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas Map Engine */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Arterial Road Pattern */}
            <pattern id="major-grid" width="160" height="160" patternUnits="userSpaceOnUse">
              <path d="M 160 0 L 0 0 0 160" fill="none" stroke="#334155" strokeWidth="1.5" />
            </pattern>
            {/* Route Gradient */}
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            {/* Pulsing Driver Glow */}
            <radialGradient id="driver-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Land & City Sectors */}
          <rect width="1000" height="500" fill="#090d16" />
          <rect width="1000" height="500" fill="url(#city-grid)" />
          <rect width="1000" height="500" fill="url(#major-grid)" />

          {/* Simulated River / Green Park Belt */}
          <path
            d="M 0,320 Q 250,290 500,340 T 1000,310"
            fill="none"
            stroke="#0c4a6e"
            strokeWidth="38"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 150,80 Q 280,120 320,220 T 180,380"
            fill="none"
            stroke="#064e3b"
            strokeWidth="24"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Planned Delivery Route Polyline */}
          <path
            d={`M ${restPos.x},${restPos.y} Q ${(restPos.x + custPos.x) / 2 + 30},${(restPos.y + custPos.y) / 2 - 40} ${custPos.x},${custPos.y}`}
            fill="none"
            stroke="#334155"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Active Animated Route Overlay */}
          <path
            d={`M ${restPos.x},${restPos.y} Q ${(restPos.x + custPos.x) / 2 + 30},${(restPos.y + custPos.y) / 2 - 40} ${custPos.x},${custPos.y}`}
            fill="none"
            stroke="url(#route-gradient)"
            strokeWidth="4"
            strokeDasharray="8,8"
            className="animate-pulse"
          />

          {/* Restaurant Marker */}
          <g
            transform={`translate(${restPos.x}, ${restPos.y})`}
            className="cursor-pointer"
            onClick={() => setActiveMarker('restaurant')}
          >
            <circle r="18" fill="#f97316" fillOpacity="0.25" />
            <circle r="12" fill="#f97316" />
            <circle r="4" fill="#ffffff" />
            <text
              y="-18"
              textAnchor="middle"
              fill="#fed7aa"
              fontSize="11"
              fontWeight="bold"
              className="drop-shadow-md"
            >
              🍴 {restaurantName}
            </text>
          </g>

          {/* Customer Destination Marker */}
          <g
            transform={`translate(${custPos.x}, ${custPos.y})`}
            className="cursor-pointer"
            onClick={() => setActiveMarker('customer')}
          >
            <circle r="18" fill="#10b981" fillOpacity="0.25" />
            <circle r="12" fill="#10b981" />
            <circle r="4" fill="#ffffff" />
            <text
              y="-18"
              textAnchor="middle"
              fill="#a7f3d0"
              fontSize="11"
              fontWeight="bold"
              className="drop-shadow-md"
            >
              📍 Destination
            </text>
          </g>

          {/* Live Delivery Partner Marker (Driver) */}
          {driverPos && (
            <g
              transform={`translate(${driverPos.x}, ${driverPos.y})`}
              className="cursor-pointer"
              onClick={() => setActiveMarker('driver')}
            >
              {/* Radar Pulsing Wave */}
              <circle r="32" fill="url(#driver-glow)" className="map-driver-pulse" />
              <circle r="16" fill="#0284c7" />
              <circle r="6" fill="#ffffff" />
              <text
                y="28"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                className="drop-shadow-md"
              >
                🛵 {driverName}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Marker Details Popup Card */}
      {activeMarker && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-3.5 rounded-xl shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {activeMarker === 'restaurant' && <Store className="w-4 h-4 text-brand-400" />}
              {activeMarker === 'customer' && <MapPin className="w-4 h-4 text-emerald-400" />}
              {activeMarker === 'driver' && <Navigation className="w-4 h-4 text-sky-400" />}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {activeMarker === 'restaurant'
                  ? 'Restaurant Origin'
                  : activeMarker === 'customer'
                  ? 'Delivery Address'
                  : 'Live Courier'}
              </h4>
            </div>
            <button
              onClick={() => setActiveMarker(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-sm font-semibold text-white mt-1.5">
            {activeMarker === 'restaurant'
              ? restaurantName
              : activeMarker === 'customer'
              ? customerAddress
              : `${driverName} (Active on Route)`}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Lat: {activeMarker === 'driver' ? driverLocation?.latitude.toFixed(4) : activeMarker === 'restaurant' ? restaurantLocation.latitude.toFixed(4) : customerLocation.latitude.toFixed(4)}</span>
            <span>Lng: {activeMarker === 'driver' ? driverLocation?.longitude.toFixed(4) : activeMarker === 'restaurant' ? restaurantLocation.longitude.toFixed(4) : customerLocation.longitude.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
