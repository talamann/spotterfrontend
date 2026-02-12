import { Badge } from '@/components/ui/badge';
import type { Stop } from '@/lib/types';

interface StopsTimelineProps {
  stops: Stop[];
}

const STOP_META: Record<string, { emoji: string; color: string; label: string }> = {
  pickup: { emoji: '📦', color: 'var(--accent-green)', label: 'Pickup' },
  dropoff: { emoji: '🏁', color: 'var(--accent-red)', label: 'Drop-off' },
  fuel: { emoji: '⛽', color: 'var(--accent-amber)', label: 'Fuel Stop' },
  rest: { emoji: '🛏️', color: 'var(--accent-indigo)', label: 'Rest Period' },
};

export function StopsTimeline({ stops }: StopsTimelineProps) {
  return (
    <div className="stops-timeline">
      <h3 className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="section-title-icon">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
        </svg>
        Planned Stops
      </h3>
      <div className="timeline">
        {stops.map((stop, i) => {
          const meta = STOP_META[stop.type] || STOP_META.fuel;
          return (
            <div
              key={`${stop.type}-${i}`}
              className="timeline-item"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="timeline-connector">
                <div
                  className="timeline-dot"
                  style={{ '--dot-color': meta.color } as React.CSSProperties}
                >
                  <span>{meta.emoji}</span>
                </div>
                {i < stops.length - 1 && <div className="timeline-line" />}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-label">{stop.name || meta.label}</span>
                  <div className="timeline-badges">
                    <Badge variant="secondary" className="timeline-badge">
                      Hr {stop.hour}
                    </Badge>
                    {stop.mile !== undefined && (
                      <Badge variant="outline" className="timeline-badge">
                        Mi {stop.mile.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
                {stop.google_maps_url && (
                  <a 
                    href={stop.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="timeline-link"
                  >
                    View on Maps
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
