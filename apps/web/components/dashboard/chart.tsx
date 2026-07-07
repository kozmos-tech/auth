import { cn } from "@/lib/utils";

function points(data: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data.map((value, i) => {
    const x =
      data.length === 1
        ? w / 2
        : pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
}

function line(pts: readonly (readonly [number, number])[]) {
  return pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

/** Compact inline trend line — sized to fill its container. */
export function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  const w = 100;
  const h = 32;
  const pts = points(data, w, h);
  const path = line(pts);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full text-foreground/70", className)}
      aria-hidden
    >
      <path
        d={`${path} L${w},${h} L0,${h} Z`}
        fill="currentColor"
        className="opacity-[0.07]"
      />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Larger area chart with gridlines and axis labels for the Overview tab. */
export function AreaChart({
  data,
  labels,
  className,
}: {
  data: number[];
  labels?: string[];
  className?: string;
}) {
  const w = 600;
  const h = 180;
  const pad = 8;
  const pts = points(data, w, h, pad);
  const path = line(pts);
  const rows = [0.25, 0.5, 0.75];
  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-44 w-full text-foreground"
        aria-hidden
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.12} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        {rows.map((r) => (
          <line
            key={r}
            x1={0}
            x2={w}
            y1={h * r}
            y2={h * r}
            stroke="currentColor"
            strokeWidth={1}
            className="text-border"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={`${path} L${w - pad},${h} L${pad},${h} Z`} fill="url(#area-fill)" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="currentColor" />
        ))}
      </svg>
      {labels && (
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
