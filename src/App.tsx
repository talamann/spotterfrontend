import { useState } from 'react';
import { TripForm } from './components/TripForm';
import { RouteMap } from './components/RouteMap';
import { TripSummary } from './components/TripSummary';
import { StopsTimeline } from './components/StopsTimeline';
import { EldChart } from './components/EldChart';
import { planTrip } from './lib/api';
import type { TripRequest, TripResponse } from './lib/types';

function App() {
  const [tripData, setTripData] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: TripRequest) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await planTrip(data);
      setTripData(result);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to plan trip. Check the backend is running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow--1" aria-hidden="true" />
      <div className="bg-glow bg-glow--2" aria-hidden="true" />

      <div className="app-layout">
        {/* Left sidebar — form */}
        <aside className="app-sidebar">
          <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
        </aside>

        {/* Right main area */}
        <main className="app-main">
          {/* Map always visible */}
          <RouteMap route={tripData?.route ?? null} />

          {/* Error state */}
          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <p>Computing optimal route...</p>
            </div>
          )}

          {/* Results */}
          {tripData && !isLoading && (
            <div className="results">
              <TripSummary data={tripData} />
              
              {tripData.eld_logs.length > 0 ? (
                <div className="results-grid">
                  <StopsTimeline stops={tripData.route.stops} />
                  <EldChart logs={tripData.eld_logs} />
                </div>
              ) : (
                <div className="error-banner" style={{ marginTop: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  No driving time available. You may be out of hours for this cycle.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
