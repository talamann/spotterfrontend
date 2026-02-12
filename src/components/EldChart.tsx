import { useMemo, useState } from 'react';
import type { EldLog } from '@/lib/types';

interface EldChartProps {
  logs: EldLog[];
}

const STATUS_ROWS = ['off_duty', 'sleeper', 'driving', 'on_duty'] as const;
const STATUS_LABELS: Record<string, string> = {
  off_duty: 'Off Duty',
  sleeper: 'Sleeper Berth',
  driving: 'Driving',
  on_duty: 'On Duty',
};
const STATUS_COLORS: Record<string, string> = {
  off_duty: '#64748b',
  sleeper: '#818cf8',
  driving: '#06b6d4',
  on_duty: '#f59e0b',
};

const HOURS = Array.from({ length: 25 }, (_, i) => i);
const CHART_LEFT = 100;
const CHART_RIGHT = 50;
const ROW_HEIGHT = 40;
const CHART_TOP = 30;

export function EldChart({ logs }: EldChartProps) {
  return (
    <div className="eld-section">
      <h3 className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="section-title-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
        </svg>
        Daily ELD Logs
      </h3>
      <div className="eld-logs">
        {logs.map((log) => (
          <EldDayChart key={log.day} log={log} />
        ))}
      </div>
    </div>
  );
}

interface EldDayChartProps {
  log: EldLog;
}

function EldDayChart({ log }: EldDayChartProps) {
  const [hoverInfo, setHoverInfo] = useState<string | null>(null);

  const totalWidth = 900;
  const chartWidth = totalWidth - CHART_LEFT - CHART_RIGHT;
  const totalHeight = CHART_TOP + ROW_HEIGHT * 4 + 30;

  const hourTotals = useMemo(() => {
    const totals: Record<string, number> = {
      off_duty: 0,
      sleeper: 0,
      driving: 0,
      on_duty: 0,
    };
    for (const seg of log.segments) {
      const key = seg.status in totals ? seg.status : 'off_duty';
      totals[key] += seg.hours;
    }
    return totals;
  }, [log.segments]);

  // Build the step-line path
  const pathSegments = useMemo(() => {
    const segments: Array<{
      status: string;
      startHour: number;
      endHour: number;
      rowIndex: number;
    }> = [];

    let currentHour = 0;
    for (const seg of log.segments) {
      const rowIndex = STATUS_ROWS.indexOf(seg.status as typeof STATUS_ROWS[number]);
      const ri = rowIndex >= 0 ? rowIndex : 0;
      segments.push({
        status: seg.status,
        startHour: currentHour,
        endHour: currentHour + seg.hours,
        rowIndex: ri,
      });
      currentHour += seg.hours;
    }
    return segments;
  }, [log.segments]);

  function hourToX(hour: number) {
    return CHART_LEFT + (hour / 24) * chartWidth;
  }

  function rowToY(rowIndex: number) {
    return CHART_TOP + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
  }

  // Build SVG path for the step function line
  const linePath = useMemo(() => {
    if (pathSegments.length === 0) return '';
    const parts: string[] = [];
    const first = pathSegments[0];
    parts.push(`M ${hourToX(first.startHour)} ${rowToY(first.rowIndex)}`);

    for (let i = 0; i < pathSegments.length; i++) {
      const seg = pathSegments[i];
      const x1 = hourToX(seg.startHour);
      const x2 = hourToX(Math.min(seg.endHour, 24));
      const y = rowToY(seg.rowIndex);

      // Vertical line to this row (if different from previous)
      if (i > 0) {
        parts.push(`L ${x1} ${y}`);
      }
      // Horizontal line across
      parts.push(`L ${x2} ${y}`);
    }
    return parts.join(' ');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSegments]);

  return (
    <div className="eld-day" style={{ animationDelay: `${(log.day - 1) * 0.1}s` }}>
      <div className="eld-day-header">
        <span className="eld-day-label">Day {log.day}</span>
        <span className="eld-hover-info" style={{ color: hoverInfo ? 'var(--accent-cyan)' : 'var(--muted-foreground)' }}>
          {hoverInfo || `Driving: ${hourTotals.driving.toFixed(1)}h • On Duty: ${hourTotals.on_duty.toFixed(1)}h`}
        </span>
      </div>
      <div className="eld-chart-wrapper" style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="eld-svg"
          onMouseLeave={() => setHoverInfo(null)}
        >
          {/* Row backgrounds */}
          {STATUS_ROWS.map((status, ri) => (
            <g key={status}>
              <rect
                x={CHART_LEFT}
                y={CHART_TOP + ri * ROW_HEIGHT}
                width={chartWidth}
                height={ROW_HEIGHT}
                fill={ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'}
              />
              {/* Row label */}
              <text
                x={CHART_LEFT - 8}
                y={CHART_TOP + ri * ROW_HEIGHT + ROW_HEIGHT / 2 + 4}
                textAnchor="end"
                className="eld-row-label"
              >
                {STATUS_LABELS[status]}
              </text>
              {/* Hour total */}
              <text
                x={CHART_LEFT + chartWidth + 8}
                y={CHART_TOP + ri * ROW_HEIGHT + ROW_HEIGHT / 2 + 4}
                textAnchor="start"
                className="eld-hour-total"
                fill={STATUS_COLORS[status]}
              >
                {hourTotals[status].toFixed(1)}h
              </text>
            </g>
          ))}

          {/* Vertical gridlines */}
          {HOURS.map((h) => (
            <g key={h}>
              <line
                x1={hourToX(h)}
                y1={CHART_TOP}
                x2={hourToX(h)}
                y2={CHART_TOP + ROW_HEIGHT * 4}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={h % 6 === 0 ? 1.5 : 0.5}
              />
              {/* Only show label for every other hour */}
              {h % 2 === 0 && h < 25 && (
                <text
                  x={hourToX(h)}
                  y={CHART_TOP + ROW_HEIGHT * 4 + 16}
                  textAnchor="middle"
                  className="eld-hour-label"
                >
                  {h === 0 || h === 24 ? 'MN' : h === 12 ? 'N' : h > 12 ? `${h - 12}` : `${h}`}
                </text>
              )}
            </g>
          ))}

          {/* Horizontal row dividers */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={CHART_LEFT}
              y1={CHART_TOP + i * ROW_HEIGHT}
              x2={CHART_LEFT + chartWidth}
              y2={CHART_TOP + i * ROW_HEIGHT}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          ))}

          {/* Colored segment backgrounds on the row */}
          {pathSegments.map((seg, i) => {
            const x1 = hourToX(seg.startHour);
            const x2 = hourToX(Math.min(seg.endHour, 24));
            const y = CHART_TOP + seg.rowIndex * ROW_HEIGHT;
            const infoText = `${STATUS_LABELS[seg.status] || seg.status}: ${(seg.endHour - seg.startHour).toFixed(1)}h (${formatHour(seg.startHour)} – ${formatHour(seg.endHour)})`;
            return (
              <rect
                key={i}
                x={x1}
                y={y}
                width={Math.max(x2 - x1, 1)}
                height={ROW_HEIGHT}
                fill={STATUS_COLORS[seg.status] || STATUS_COLORS.off_duty}
                opacity={0.15}
                rx={2}
                onMouseEnter={() => setHoverInfo(infoText)}
                className="eld-segment-bg"
              />
            );
          })}

          {/* Step function line */}
          <path
            d={linePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="eld-line"
          />

          {/* Transition dots */}
          {pathSegments.map((seg, i) => (
            <circle
              key={i}
              cx={hourToX(seg.startHour)}
              cy={rowToY(seg.rowIndex)}
              r={3}
              fill={STATUS_COLORS[seg.status] || '#06b6d4'}
              className="eld-dot"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${h12}:${mins.toString().padStart(2, '0')} ${period}`;
}
