import { useCallback, useRef } from 'react';
import type { Screenshot } from '@/store/types';
import { useProjectStore } from '@/store/useProjectStore';
import { BackgroundLayer } from '../canvas/BackgroundLayer';
import { CanvasElementRenderer } from '../canvas/CanvasElementRenderer';
import { SelectionBox } from '../canvas/SelectionBox';
import { useIconDragElement } from '@/hooks/useIconDragElement';
import { useIconResizeElement, type ResizeHandle } from '@/hooks/useIconResizeElement';

interface Props {
  screenshot: Screenshot;
  width: number;
  height: number;
  scale: number;
}

export function InteractiveIconCanvas({ screenshot, width, height, scale }: Props) {
  const selectedIds = useProjectStore((s) => s.selectedAppIconElementIds);
  const selectElement = useProjectStore((s) => s.selectAppIconElement);
  const iconSnapGuides = useProjectStore((s) => s.iconSnapGuides);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sortedElements = [...screenshot.elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const selectedElements = screenshot.elements.filter((e) => selectedIds.includes(e.id));

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target !== e.currentTarget && target.dataset.canvasBg !== 'true') return;
      selectElement(null);
    },
    [selectElement]
  );

  return (
    <div
      ref={canvasRef}
      className="relative"
      style={{ width, height }}
      onMouseDown={handleBackgroundClick}
    >
      {/* Content layer — clipped to canvas bounds */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <BackgroundLayer background={screenshot.background} width={width} height={height} />

        {sortedElements.map((el) => (
          <IconElementWithInteraction
            key={el.id}
            elementId={el.id}
            canvasWidth={width}
            canvasHeight={height}
            scale={scale}
            isSelected={selectedIds.includes(el.id)}
          >
            <CanvasElementRenderer
              element={el}
              canvasWidth={width}
              canvasHeight={height}
            />
          </IconElementWithInteraction>
        ))}

        {/* Snap guides */}
        {iconSnapGuides.length > 0 && (
          <IconSnapGuidesOverlay
            guides={iconSnapGuides}
            canvasWidth={width}
            canvasHeight={height}
          />
        )}
      </div>

      {/* Selection overlay — NOT clipped, so handles extend beyond canvas */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {selectedElements.map((el) => (
          <IconSelectedOverlay
            key={el.id}
            elementId={el.id}
            transform={el.transform}
            canvasWidth={width}
            canvasHeight={height}
            scale={scale}
            multiSelect={selectedElements.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

/** Transparent hit target over each element for click-to-select and drag */
function IconElementWithInteraction({
  elementId,
  canvasWidth,
  canvasHeight,
  scale,
  isSelected,
  children,
}: {
  elementId: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  isSelected: boolean;
  children: React.ReactNode;
}) {
  const selectElement = useProjectStore((s) => s.selectAppIconElement);

  const { handleMouseDown } = useIconDragElement({
    elementId,
    canvasWidth,
    canvasHeight,
    scale,
    onDragStart: () => {
      if (!isSelected) selectElement(elementId);
    },
  });

  const element = useProjectStore((s) =>
    s.appIconProject.elements.find((e) => e.id === elementId) ?? null
  );

  if (!element) return children;

  const pixelX = (element.transform.x / 100) * canvasWidth;
  const pixelY = (element.transform.y / 100) * canvasHeight;
  const pixelW = (element.transform.width / 100) * canvasWidth;
  const pixelH = (element.transform.height / 100) * canvasHeight;
  const rotation = element.transform.rotation || 0;
  const scaleX = element.flipX ? -1 : 1;
  const scaleY = element.flipY ? -1 : 1;
  const needsTransform = rotation !== 0 || scaleX !== 1 || scaleY !== 1;

  return (
    <>
      {children}
      {/* Transparent hit target for drag + click */}
      <div
        onMouseDown={(e) => {
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            // Multi-select toggle
            e.stopPropagation();
            const store = useProjectStore.getState();
            const ids = store.selectedAppIconElementIds;
            if (ids.includes(elementId)) {
              store.selectAppIconElements(ids.filter((id) => id !== elementId));
            } else {
              store.selectAppIconElements([...ids, elementId]);
            }
          } else {
            if (!isSelected) selectElement(elementId);
            handleMouseDown(e);
          }
        }}
        style={{
          position: 'absolute',
          left: pixelX,
          top: pixelY,
          width: pixelW,
          height: pixelH,
          zIndex: element.zIndex + 1000,
          cursor: element.locked ? 'default' : 'move',
          ...(needsTransform && {
            transform: `rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
            transformOrigin: 'center center',
          }),
        }}
      />
    </>
  );
}

/** Selection box with resize handles */
function IconSelectedOverlay({
  elementId,
  transform,
  canvasWidth,
  canvasHeight,
  scale,
  multiSelect,
}: {
  elementId: string;
  transform: { x: number; y: number; width: number; height: number; rotation: number };
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  multiSelect: boolean;
}) {
  const { handleResizeStart } = useIconResizeElement({
    elementId,
    canvasWidth,
    canvasHeight,
    scale,
  });

  const pixelX = (transform.x / 100) * canvasWidth;
  const pixelY = (transform.y / 100) * canvasHeight;
  const pixelW = (transform.width / 100) * canvasWidth;
  const pixelH = (transform.height / 100) * canvasHeight;
  const rotation = transform.rotation || 0;

  return (
    <SelectionBox
      x={pixelX}
      y={pixelY}
      width={pixelW}
      height={pixelH}
      scale={scale}
      rotation={rotation}
      onResizeStart={multiSelect ? undefined : handleResizeStart as (handle: import('@/hooks/useResizeElement').ResizeHandle, e: React.MouseEvent) => void}
      multiSelect={multiSelect}
    />
  );
}

/** Simple snap guides rendered as lines */
function IconSnapGuidesOverlay({
  guides,
  canvasWidth,
  canvasHeight,
}: {
  guides: { type: 'horizontal' | 'vertical'; position: number }[];
  canvasWidth: number;
  canvasHeight: number;
}) {
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: canvasWidth,
        height: canvasHeight,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {guides.map((g, i) =>
        g.type === 'vertical' ? (
          <line
            key={`v-${i}`}
            x1={(g.position / 100) * canvasWidth}
            y1={0}
            x2={(g.position / 100) * canvasWidth}
            y2={canvasHeight}
            stroke="#f97316"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        ) : (
          <line
            key={`h-${i}`}
            x1={0}
            y1={(g.position / 100) * canvasHeight}
            x2={canvasWidth}
            y2={(g.position / 100) * canvasHeight}
            stroke="#f97316"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        )
      )}
    </svg>
  );
}
