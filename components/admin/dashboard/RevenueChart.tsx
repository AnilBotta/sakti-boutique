interface RevenueChartProps {
  points: number[];
  height?: number;
}

/**
 * 30-day revenue line chart. Hand-rolled SVG, no chart lib.
 * Includes faint horizontal gridlines at 25/50/75/100% of the range.
 */
export function RevenueChart({ points, height = 220 }: RevenueChartProps) {
  if (points.length < 2) return null;
  const w = 800;
  const h = 220;
  const padX = 8;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = innerW / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: padX + i * step,
    y: padY + innerH - ((p - min) / range) * innerH,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L${padX + innerW},${padY + innerH} L${padX},${padY + innerH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(
    (t) => padY + t * innerH,
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label="Revenue, last 30 days"
    >
      <defs>
        <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C75A1E" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#C75A1E" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((y, i) => (
        <line
          key={i}
          x1={padX}
          x2={padX + innerW}
          y1={y}
          y2={y}
          stroke="#ECE8E1"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <path d={areaPath} fill="url(#revenue-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="#C75A1E"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {coords.map((c, i) =>
        i === coords.length - 1 ? (
          <circle key={i} cx={c.x} cy={c.y} r={3} fill="#C75A1E" />
        ) : null,
      )}
    </svg>
  );
}
