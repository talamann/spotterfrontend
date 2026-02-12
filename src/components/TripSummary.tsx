import type { TripResponse } from '@/lib/types';

interface TripSummaryProps {
  data: TripResponse;
}

export function TripSummary({ data }: TripSummaryProps) {
  const totalStops = data.route.stops.filter(
    (s) => s.type === 'fuel' || s.type === 'rest'
  ).length;
  const totalDays = data.eld_logs.length;

  const stats = [
    {
      label: 'Total Distance',
      value: `${data.distance_miles.toLocaleString()}`,
      unit: 'miles',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          <circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" />
        </svg>
      ),
      color: 'var(--accent-cyan)',
    },
    {
      label: 'Drive Time',
      value: `${data.estimated_drive_hours}`,
      unit: 'hours',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
      color: 'var(--accent-amber)',
    },
    {
      label: 'Trip Days',
      value: `${totalDays}`,
      unit: totalDays === 1 ? 'day' : 'days',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      color: 'var(--accent-indigo)',
    },
    {
      label: 'Stops',
      value: `${totalStops}`,
      unit: totalStops === 1 ? 'stop' : 'stops',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
        </svg>
      ),
      color: 'var(--accent-green)',
    },
  ];

  return (
    <div className="trip-summary">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="summary-card"
          style={{ '--card-accent': stat.color, animationDelay: `${i * 0.08}s` } as React.CSSProperties}
        >
          <div className="summary-icon">{stat.icon}</div>
          <div className="summary-data">
            <span className="summary-value">{stat.value}</span>
            <span className="summary-unit">{stat.unit}</span>
          </div>
          <span className="summary-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
