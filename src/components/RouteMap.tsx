import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TripRoute } from '@/lib/types';

interface RouteMapProps {
  route: TripRoute | null;
}

const STOP_COLORS: Record<string, string> = {
  current: '#8b5cf6',
  pickup: '#22c55e',
  dropoff: '#ef4444',
  fuel: '#f59e0b',
  rest: '#6366f1',
};

const STOP_ICONS: Record<string, string> = {
  current: '🚛',
  pickup: '📦',
  dropoff: '🏁',
  fuel: '⛽',
  rest: '🛏️',
};

const STOP_LABELS: Record<string, string> = {
  current: 'Current Location',
  pickup: 'Pickup',
  dropoff: 'Drop-off',
  fuel: 'Truck Stop / Fuel',
  rest: 'Rest Stop / Motel',
};

function createStopIcon(type: string, label: string) {
  return L.divIcon({
    className: 'stop-marker',
    html: `<div class="stop-marker-inner" style="--stop-color: ${STOP_COLORS[type] || '#fff'}">
      <span class="stop-emoji">${STOP_ICONS[type] || '📍'}</span>
    </div>
    <div class="stop-marker-label" style="--stop-color: ${STOP_COLORS[type] || '#fff'}">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function RouteMap({ route }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [39.8283, -98.5795],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapInstance.current);

    layerGroup.current = L.layerGroup().addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;
    layerGroup.current.clearLayers();

    if (!route || !route.geometry || route.geometry.length === 0) return;

    // Route geometry is [lon, lat], Leaflet needs [lat, lon]
    const latLngs: L.LatLngExpression[] = route.geometry.map(
      ([lon, lat]) => [lat, lon] as L.LatLngExpression
    );

    // Draw the route polyline — solid, glowing, prominent
    const polylineBg = L.polyline(latLngs, {
      color: '#06b6d4',
      weight: 7,
      opacity: 0.25,
      lineCap: 'round',
      lineJoin: 'round',
    });
    layerGroup.current.addLayer(polylineBg);

    const polyline = L.polyline(latLngs, {
      color: '#06b6d4',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    });
    layerGroup.current.addLayer(polyline);

    // Fit map to route bounds
    const bounds = polyline.getBounds();
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });

    // Place waypoint markers using exact coords from the API
    // waypoint_coords: [current_location, pickup_location, dropoff_location]
    const waypoints = route.waypoint_coords || [];
    const waypointTypes = ['current', 'pickup', 'dropoff'];

    waypoints.forEach((coord, i) => {
      if (!coord || coord.length < 2) return;
      const [lon, lat] = coord;
      const type = waypointTypes[i] || 'current';
      const label = STOP_LABELS[type];
      const marker = L.marker([lat, lon], {
        icon: createStopIcon(type, label),
        zIndexOffset: type === 'pickup' ? 1000 : type === 'dropoff' ? 900 : 800,
      });
      marker.bindPopup(
        `<div class="map-popup"><strong>${label}</strong></div>`
      );
      layerGroup.current!.addLayer(marker);
    });

    // Add intermediate stop markers (fuel, rest) along the route
    route.stops.forEach((stop) => {
      if (stop.type === 'pickup' || stop.type === 'dropoff') return;
      // Position along route based on hour proportion
      const totalHours = route.stops[route.stops.length - 1]?.hour || 1;
      const fraction = Math.min(stop.hour / totalHours, 1);
      const index = Math.min(
        Math.floor(fraction * (latLngs.length - 1)),
        latLngs.length - 1
      );
      const pos = latLngs[index];
      if (pos) {
        const label = stop.name || STOP_LABELS[stop.type] || stop.type;
        const marker = L.marker(stop.lat && stop.lon ? [stop.lat, stop.lon] : pos, {
          icon: createStopIcon(stop.type, label),
          zIndexOffset: 500,
        });
        
        const googleMapsLink = stop.google_maps_url 
          ? `<br/><a href="${stop.google_maps_url}" target="_blank" rel="noopener noreferrer" style="color: #06b6d4; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
              View on Google Maps 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>` 
          : '';

        marker.bindPopup(
          `<div class="map-popup">
            <strong>${label}</strong><br/>
            Hour ${stop.hour}${stop.mile ? ` • Mile ${stop.mile.toLocaleString()}` : ''}
            ${googleMapsLink}
          </div>`
        );
        layerGroup.current!.addLayer(marker);
      }
    });
  }, [route]);

  return (
    <div className="route-map-container">
      <div ref={mapRef} className="route-map" />
      {!route && (
        <div className="map-empty">
          <div className="map-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
            </svg>
          </div>
          <p>Plan a trip to see the route here</p>
        </div>
      )}
    </div>
  );
}
