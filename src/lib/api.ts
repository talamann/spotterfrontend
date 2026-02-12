import axios from 'axios';
import type { TripRequest, TripResponse } from './types';

const API_BASE = 'http://localhost:8000';

export async function planTrip(data: TripRequest): Promise<TripResponse> {
  const response = await axios.post<TripResponse>(
    `${API_BASE}/api/trip/plan`,
    data
  );
  return response.data;
}
