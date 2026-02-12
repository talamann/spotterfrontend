export interface TripRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_used_hours: number;
}

export interface EldSegment {
  status: 'off_duty' | 'on_duty' | 'driving' | 'sleeper';
  hours: number;
}

export interface EldLog {
  day: number;
  segments: EldSegment[];
}

export interface Stop {
  type: 'pickup' | 'dropoff' | 'fuel' | 'rest';
  hour: number;
  mile?: number;
  name?: string;
  google_maps_url?: string;
  lat?: number;
  lon?: number;
}

export interface TripRoute {
  geometry: [number, number][];
  stops: Stop[];
  waypoint_coords: [number, number][];
}

export interface TripResponse {
  distance_miles: number;
  estimated_drive_hours: number;
  route: TripRoute;
  eld_logs: EldLog[];
}
