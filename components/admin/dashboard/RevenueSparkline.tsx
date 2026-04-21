interface RevenueSparklineProps {
  points: number[];
  height?: number;
  className?: string;
}

/**
 * Hand-drawn SVG sparkline. No chart lib.
 * Renders a smooth polyline with a soft area fill.
 */
export function RevenueSparkline({
  points,
  height = 80,
  className,
}: RevenueSparklineProps) {
  if (points.length < 2) return null;
  const w = 100;
  const h = 100;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: i * step,
    y: h - ((p - min) / range) * h,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C75A1E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C75A1E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="#C75A1E"
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
