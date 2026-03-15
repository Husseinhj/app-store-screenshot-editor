import { useProjectStore } from '@/store/useProjectStore';

interface Props {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

export function UserGuides({ canvasWidth, canvasHeight, scale }: Props) {
  const userGuides = useProjectStore((s) => s.userGuides);
  const removeUserGuide = useProjectStore((s) => s.removeUserGuide);

  if (userGuides.length === 0) return null;

  // Compensate for CSS transform scaling so strokes appear at consistent screen size
  const sw = 1.5 / scale;       // visible stroke width in screen pixels
  const hitSw = 12 / scale;     // hit area width in screen pixels
  const dash = `${8 / scale} ${5 / scale}`;  // dash pattern in screen pixels
  const extend = 9999 / scale;  // line extension beyond canvas

  // Scale-compensated font size for labels
  const labelFontSize = 10 / scale;
  const labelPadX = 4 / scale;
  const labelPadY = 2 / scale;
  const labelOffset = 6 / scale;
  const labelBgRx = 3 / scale;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: canvasWidth,
        height: canvasHeight,
        pointerEvents: 'none',
        zIndex: 9997,
        overflow: 'visible',
      }}
    >
      {userGuides.map((guide) => {
        if (guide.type === 'vertical') {
          const x = (guide.position / 100) * canvasWidth;
          return (
            <g key={guide.id}>
              {/* Dashed orange line */}
              <line
                x1={x}
                y1={-extend}
                x2={x}
                y2={canvasHeight + extend}
                stroke="#f97316"
                strokeWidth={sw}
                strokeDasharray={dash}
                opacity={0.85}
              />
              {/* Invisible wide hit area for double-click to delete */}
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={canvasHeight}
                stroke="transparent"
                strokeWidth={hitSw}
                style={{ pointerEvents: 'auto', cursor: 'ew-resize' }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  removeUserGuide(guide.id);
                }}
              />
              {/* Label */}
              {guide.label && (
                <g transform={`translate(${x + labelOffset}, ${labelOffset})`}>
                  <rect
                    x={0}
                    y={0}
                    width={guide.label.length * labelFontSize * 0.6 + labelPadX * 2}
                    height={labelFontSize + labelPadY * 2}
                    rx={labelBgRx}
                    fill="rgba(249,115,22,0.85)"
                  />
                  <text
                    x={labelPadX}
                    y={labelFontSize + labelPadY - labelFontSize * 0.15}
                    fontSize={labelFontSize}
                    fontFamily="Inter, sans-serif"
                    fill="#ffffff"
                    fontWeight={500}
                  >
                    {guide.label}
                  </text>
                </g>
              )}
            </g>
          );
        } else {
          const y = (guide.position / 100) * canvasHeight;
          return (
            <g key={guide.id}>
              {/* Dashed orange line */}
              <line
                x1={-extend}
                y1={y}
                x2={canvasWidth + extend}
                y2={y}
                stroke="#f97316"
                strokeWidth={sw}
                strokeDasharray={dash}
                opacity={0.85}
              />
              {/* Invisible wide hit area for double-click to delete */}
              <line
                x1={0}
                y1={y}
                x2={canvasWidth}
                y2={y}
                stroke="transparent"
                strokeWidth={hitSw}
                style={{ pointerEvents: 'auto', cursor: 'ns-resize' }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  removeUserGuide(guide.id);
                }}
              />
              {/* Label */}
              {guide.label && (
                <g transform={`translate(${labelOffset}, ${y - labelFontSize - labelPadY * 2 - labelOffset})`}>
                  <rect
                    x={0}
                    y={0}
                    width={guide.label.length * labelFontSize * 0.6 + labelPadX * 2}
                    height={labelFontSize + labelPadY * 2}
                    rx={labelBgRx}
                    fill="rgba(249,115,22,0.85)"
                  />
                  <text
                    x={labelPadX}
                    y={labelFontSize + labelPadY - labelFontSize * 0.15}
                    fontSize={labelFontSize}
                    fontFamily="Inter, sans-serif"
                    fill="#ffffff"
                    fontWeight={500}
                  >
                    {guide.label}
                  </text>
                </g>
              )}
            </g>
          );
        }
      })}
    </svg>
  );
}
