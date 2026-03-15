import type { ResizeHandle } from '@/hooks/useResizeElement';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  onResizeStart?: (handle: ResizeHandle, e: React.MouseEvent) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
  multiSelect?: boolean;
}

const handles: { handle: ResizeHandle; cursor: string; style: React.CSSProperties }[] = [
  { handle: 'nw', cursor: 'nw-resize', style: { top: -5, left: -5 } },
  { handle: 'n', cursor: 'n-resize', style: { top: -5, left: '50%', transform: 'translateX(-50%)' } },
  { handle: 'ne', cursor: 'ne-resize', style: { top: -5, right: -5 } },
  { handle: 'e', cursor: 'e-resize', style: { top: '50%', right: -5, transform: 'translateY(-50%)' } },
  { handle: 'se', cursor: 'se-resize', style: { bottom: -5, right: -5 } },
  { handle: 's', cursor: 's-resize', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' } },
  { handle: 'sw', cursor: 'sw-resize', style: { bottom: -5, left: -5 } },
  { handle: 'w', cursor: 'w-resize', style: { top: '50%', left: -5, transform: 'translateY(-50%)' } },
];

export function SelectionBox({ x, y, width, height, scale, rotation, onResizeStart, onRotateStart, multiSelect }: Props) {
  const borderWidth = Math.max(1, 1.5 / scale);
  const handleSize = Math.max(8, 10 / scale);
  const rotateHandleDistance = Math.max(24, 32 / scale);
  const rotateHandleSize = Math.max(10, 12 / scale);

  const accentColor = multiSelect ? '#22c55e' : '#3b82f6';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      {/* Selection border — double layer for visibility on any background */}
      <div
        style={{
          position: 'absolute',
          inset: -borderWidth * 2,
          border: `${borderWidth}px solid rgba(0, 0, 0, 0.25)`,
          borderRadius: 3,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -borderWidth,
          border: `${borderWidth}px dashed ${accentColor}`,
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Rotation handle — only for single selection */}
      {!multiSelect && onRotateStart && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -rotateHandleDistance - rotateHandleSize / 2,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Connecting line */}
          <div
            style={{
              width: Math.max(1, 1.5 / scale),
              height: rotateHandleDistance - rotateHandleSize / 2,
              backgroundColor: accentColor,
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          />
          {/* Rotation circle */}
          <div
            onMouseDown={onRotateStart}
            style={{
              position: 'absolute',
              top: 0,
              width: rotateHandleSize,
              height: rotateHandleSize,
              backgroundColor: '#ffffff',
              border: `${Math.max(1, 1.5 / scale)}px solid ${accentColor}`,
              borderRadius: '50%',
              cursor: 'grab',
              pointerEvents: 'auto',
              zIndex: 10001,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
            }}
          />
        </div>
      )}

      {/* Resize handles — only for single selection */}
      {!multiSelect && onResizeStart &&
        handles.map(({ handle, cursor, style }) => (
          <div
            key={handle}
            onMouseDown={(e) => onResizeStart(handle, e)}
            style={{
              position: 'absolute',
              width: handleSize,
              height: handleSize,
              backgroundColor: '#ffffff',
              border: `${Math.max(1, 1.5 / scale)}px solid ${accentColor}`,
              borderRadius: '50%',
              cursor,
              pointerEvents: 'auto',
              zIndex: 10000,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
              ...style,
            }}
          />
        ))}
    </div>
  );
}
