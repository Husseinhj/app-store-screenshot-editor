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
  { handle: 'nw', cursor: 'nw-resize', style: { top: -4, left: -4 } },
  { handle: 'n', cursor: 'n-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
  { handle: 'ne', cursor: 'ne-resize', style: { top: -4, right: -4 } },
  { handle: 'e', cursor: 'e-resize', style: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
  { handle: 'se', cursor: 'se-resize', style: { bottom: -4, right: -4 } },
  { handle: 's', cursor: 's-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
  { handle: 'sw', cursor: 'sw-resize', style: { bottom: -4, left: -4 } },
  { handle: 'w', cursor: 'w-resize', style: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
];

export function SelectionBox({ x, y, width, height, scale, rotation, onResizeStart, onRotateStart, multiSelect }: Props) {
  const borderWidth = Math.max(1, 2 / scale);
  const handleSize = Math.max(6, 8 / scale);
  const rotateHandleDistance = Math.max(20, 28 / scale);
  const rotateHandleSize = Math.max(8, 10 / scale);

  const borderColor = multiSelect ? '#22c55e' : '#3b82f6';

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
      {/* Selection border */}
      <div
        style={{
          position: 'absolute',
          inset: -borderWidth,
          border: `${borderWidth}px solid ${borderColor}`,
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
          {/* Rotation circle */}
          <div
            onMouseDown={onRotateStart}
            style={{
              width: rotateHandleSize,
              height: rotateHandleSize,
              backgroundColor: '#ffffff',
              border: `${Math.max(1, 1.5 / scale)}px solid ${borderColor}`,
              borderRadius: '50%',
              cursor: 'grab',
              pointerEvents: 'auto',
              zIndex: 10001,
            }}
          />
          {/* Connecting line */}
          <div
            style={{
              width: Math.max(1, 1.5 / scale),
              height: rotateHandleDistance - rotateHandleSize / 2,
              backgroundColor: borderColor,
              pointerEvents: 'none',
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
              border: `${Math.max(1, 1.5 / scale)}px solid ${borderColor}`,
              borderRadius: 2,
              cursor,
              pointerEvents: 'auto',
              zIndex: 10000,
              ...style,
            }}
          />
        ))}
    </div>
  );
}
