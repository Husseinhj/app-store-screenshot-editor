import type { ShapeElement } from '@/store/types';

interface Props {
  element: ShapeElement;
  width: number;
  height: number;
}

export function ShapeRenderer({ element, width, height }: Props) {
  const { shapeType, fillColor, strokeColor, strokeWidth } = element;
  const opacity = element.opacity ?? 1;
  const blur = element.blur ?? 0;
  const isBlurred = blur > 0 && (shapeType === 'rectangle' || shapeType === 'circle');

  // Glass/blur shapes — render as HTML div with backdrop-filter (SVG doesn't support it)
  if (isBlurred) {
    const borderRadius = shapeType === 'circle' ? '50%' : (element.borderRadius ?? 0);
    return (
      <div
        style={{
          width,
          height,
          opacity,
          backgroundColor: fillColor,
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
          borderRadius,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          boxSizing: 'border-box',
        }}
      />
    );
  }

  // Standard SVG rendering, wrapped with opacity
  return (
    <div style={{ opacity }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {shapeType === 'rectangle' && (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={width - strokeWidth}
            height={height - strokeWidth}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={element.borderRadius ?? 0}
            ry={element.borderRadius ?? 0}
          />
        )}
        {shapeType === 'circle' && (
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={(width - strokeWidth) / 2}
            ry={(height - strokeWidth) / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )}
        {shapeType === 'line' && (
          <line
            x1={strokeWidth / 2}
            y1={height - strokeWidth / 2}
            x2={width - strokeWidth / 2}
            y2={strokeWidth / 2}
            stroke={strokeColor || fillColor}
            strokeWidth={Math.max(strokeWidth, 2)}
            strokeLinecap="round"
          />
        )}
        {shapeType === 'arrow' && (
          <>
            <defs>
              <marker
                id={`arrowhead-${element.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={strokeColor || fillColor}
                />
              </marker>
            </defs>
            <line
              x1={strokeWidth / 2}
              y1={height / 2}
              x2={width - 12}
              y2={height / 2}
              stroke={strokeColor || fillColor}
              strokeWidth={Math.max(strokeWidth, 2)}
              strokeLinecap="round"
              markerEnd={`url(#arrowhead-${element.id})`}
            />
          </>
        )}
      </svg>
    </div>
  );
}
