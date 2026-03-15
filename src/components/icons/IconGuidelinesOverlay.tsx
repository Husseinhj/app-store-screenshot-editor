interface GuidelinePreset {
  id: string;
  name: string;
  lines: { type: 'horizontal' | 'vertical'; position: number; label?: string }[];
  circles?: { cx: number; cy: number; r: number; label?: string }[];
}

export const ICON_GUIDELINE_PRESETS: GuidelinePreset[] = [
  {
    id: 'safe-zone',
    name: 'Safe Zone',
    lines: [
      { type: 'vertical', position: 4, label: '4%' },
      { type: 'vertical', position: 96, label: '96%' },
      { type: 'horizontal', position: 4, label: '4%' },
      { type: 'horizontal', position: 96, label: '96%' },
    ],
  },
  {
    id: 'grid',
    name: 'Grid',
    lines: [
      { type: 'vertical', position: 33.33 },
      { type: 'vertical', position: 50 },
      { type: 'vertical', position: 66.67 },
      { type: 'horizontal', position: 33.33 },
      { type: 'horizontal', position: 50 },
      { type: 'horizontal', position: 66.67 },
    ],
  },
  {
    id: 'circle-safe',
    name: 'Circle Safe',
    lines: [
      { type: 'vertical', position: 50 },
      { type: 'horizontal', position: 50 },
    ],
    circles: [
      { cx: 50, cy: 50, r: 35, label: '70%' },
      { cx: 50, cy: 50, r: 50 },
    ],
  },
];

interface Props {
  preset: string;
  canvasSize: number;
}

export function IconGuidelinesOverlay({ preset, canvasSize }: Props) {
  const config = ICON_GUIDELINE_PRESETS.find((p) => p.id === preset);
  if (!config) return null;

  const color = '#22d3ee'; // cyan-400
  const strokeW = 1;

  return (
    <svg
      width={canvasSize}
      height={canvasSize}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9997,
      }}
    >
      {/* Lines */}
      {config.lines.map((line, i) => {
        const pos = (line.position / 100) * canvasSize;
        return line.type === 'vertical' ? (
          <g key={`l-${i}`}>
            <line
              x1={pos}
              y1={0}
              x2={pos}
              y2={canvasSize}
              stroke={color}
              strokeWidth={strokeW}
              strokeDasharray="6 4"
              opacity={0.6}
            />
            {line.label && (
              <text
                x={pos + 4}
                y={14}
                fill={color}
                fontSize={10}
                opacity={0.8}
                fontFamily="system-ui, sans-serif"
              >
                {line.label}
              </text>
            )}
          </g>
        ) : (
          <g key={`l-${i}`}>
            <line
              x1={0}
              y1={pos}
              x2={canvasSize}
              y2={pos}
              stroke={color}
              strokeWidth={strokeW}
              strokeDasharray="6 4"
              opacity={0.6}
            />
            {line.label && (
              <text
                x={4}
                y={pos - 4}
                fill={color}
                fontSize={10}
                opacity={0.8}
                fontFamily="system-ui, sans-serif"
              >
                {line.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Circles */}
      {config.circles?.map((circle, i) => {
        const cx = (circle.cx / 100) * canvasSize;
        const cy = (circle.cy / 100) * canvasSize;
        const r = (circle.r / 100) * canvasSize;
        return (
          <g key={`c-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeDasharray="6 4"
              opacity={0.5}
            />
            {circle.label && (
              <text
                x={cx + r + 4}
                y={cy + 4}
                fill={color}
                fontSize={10}
                opacity={0.8}
                fontFamily="system-ui, sans-serif"
              >
                {circle.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
