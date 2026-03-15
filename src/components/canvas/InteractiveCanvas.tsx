import { useState, useCallback, useRef } from 'react';
import type { Screenshot, CanvasElement, TextElement } from '@/store/types';
import { useProjectStore } from '@/store/useProjectStore';
import { BackgroundLayer } from './BackgroundLayer';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { SelectionBox } from './SelectionBox';
import { InlineTextEditor } from './InlineTextEditor';
import { SnapGuides } from './SnapGuides';
import { UserGuides } from './UserGuides';
import { useDragElement } from '@/hooks/useDragElement';
import { useDragScreenshot } from '@/hooks/useDragScreenshot';
import { useResizeElement } from '@/hooks/useResizeElement';
import { useRotateElement } from '@/hooks/useRotateElement';

interface Props {
  screenshot: Screenshot;
  width: number;
  height: number;
  scale: number;
}

export function InteractiveCanvas({ screenshot, width, height, scale }: Props) {
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const selectElement = useProjectStore((s) => s.selectElement);
  const toggleSelectElement = useProjectStore((s) => s.toggleSelectElement);
  const selectElements = useProjectStore((s) => s.selectElements);
  const editingTextElementId = useProjectStore((s) => s.editingTextElementId);
  const setEditingTextElement = useProjectStore((s) => s.setEditingTextElement);

  const sortedElements = [...screenshot.elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const selectedElements = screenshot.elements.filter((e) => selectedElementIds.includes(e.id));
  const editingTextElement = editingTextElementId
    ? screenshot.elements.find((e) => e.id === editingTextElementId && e.type === 'text') as TextElement | undefined
    : undefined;

  // Marquee selection state
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const marqueeStartRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleBackgroundMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target !== e.currentTarget && target.dataset.canvasBg !== 'true') return;

      // Start marquee selection
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = (e.clientX - rect.left) / scale;
      const startY = (e.clientY - rect.top) / scale;

      marqueeStartRef.current = { clientX: e.clientX, clientY: e.clientY };

      // Prevent browser text selection during marquee drag
      document.body.classList.add('canvas-no-select');

      // Don't clear selection yet — only clear if it's a simple click (no drag)
      const handleMouseMove = (ev: MouseEvent) => {
        const currentX = (ev.clientX - rect.left) / scale;
        const currentY = (ev.clientY - rect.top) / scale;

        const dx = Math.abs(ev.clientX - marqueeStartRef.current!.clientX);
        const dy = Math.abs(ev.clientY - marqueeStartRef.current!.clientY);
        if (dx < 3 && dy < 3) return; // Dead zone

        setMarquee({ startX, startY, currentX, currentY });
      };

      const handleMouseUp = (ev: MouseEvent) => {
        document.body.classList.remove('canvas-no-select');
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        const dx = Math.abs(ev.clientX - marqueeStartRef.current!.clientX);
        const dy = Math.abs(ev.clientY - marqueeStartRef.current!.clientY);

        if (dx < 3 && dy < 3) {
          // Simple click on background → deselect all and exit inline editing
          selectElement(null);
          setEditingTextElement(null);
        } else {
          // Marquee drag → select intersecting elements
          const endX = (ev.clientX - rect.left) / scale;
          const endY = (ev.clientY - rect.top) / scale;

          const minX = Math.min(startX, endX);
          const maxX = Math.max(startX, endX);
          const minY = Math.min(startY, endY);
          const maxY = Math.max(startY, endY);

          // Convert to percentage for comparison with element transforms
          const minXPct = (minX / width) * 100;
          const maxXPct = (maxX / width) * 100;
          const minYPct = (minY / height) * 100;
          const maxYPct = (maxY / height) * 100;

          const intersecting = screenshot.elements
            .filter((el) => el.visible)
            .filter((el) => {
              const elLeft = el.transform.x;
              const elRight = el.transform.x + el.transform.width;
              const elTop = el.transform.y;
              const elBottom = el.transform.y + el.transform.height;
              return elRight > minXPct && elLeft < maxXPct && elBottom > minYPct && elTop < maxYPct;
            })
            .map((el) => el.id);

          if (intersecting.length > 0) {
            selectElements(intersecting);
          } else {
            selectElement(null);
          }
        }

        setMarquee(null);
        marqueeStartRef.current = null;
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [scale, width, height, screenshot.elements, selectElement, selectElements, setEditingTextElement]
  );

  // Compute marquee rectangle in pixels
  const marqueeRect = marquee
    ? {
        left: Math.min(marquee.startX, marquee.currentX),
        top: Math.min(marquee.startY, marquee.currentY),
        width: Math.abs(marquee.currentX - marquee.startX),
        height: Math.abs(marquee.currentY - marquee.startY),
      }
    : null;

  return (
    <div
      ref={canvasRef}
      className="relative"
      style={{ width, height }}
      onMouseDown={handleBackgroundMouseDown}
    >
      {/* Content layer — clipped to canvas bounds */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <BackgroundLayer background={screenshot.background} width={width} height={height} />

        {sortedElements.map((el) => (
          <ElementWithInteraction
            key={el.id}
            elementId={el.id}
            canvasWidth={width}
            canvasHeight={height}
            scale={scale}
            isSelected={selectedElementIds.includes(el.id)}
          >
            <CanvasElementRenderer
              element={el}
              canvasWidth={width}
              canvasHeight={height}
            />
          </ElementWithInteraction>
        ))}

        {/* Inline text editor overlay */}
        {editingTextElement && (
          <div
            style={{
              position: 'absolute',
              left: (editingTextElement.transform.x / 100) * width,
              top: (editingTextElement.transform.y / 100) * height,
              width: (editingTextElement.transform.width / 100) * width,
              height: (editingTextElement.transform.height / 100) * height,
              zIndex: 10002,
              transform: editingTextElement.transform.rotation
                ? `rotate(${editingTextElement.transform.rotation}deg)`
                : undefined,
              transformOrigin: 'center center',
            }}
          >
            <InlineTextEditor
              element={editingTextElement}
              pixelWidth={(editingTextElement.transform.width / 100) * width}
              pixelHeight={(editingTextElement.transform.height / 100) * height}
            />
          </div>
        )}

        {/* Snap guides */}
        <SnapGuides canvasWidth={width} canvasHeight={height} />
        <UserGuides canvasWidth={width} canvasHeight={height} scale={scale} />

        {/* Marquee selection rectangle */}
        {marqueeRect && (
          <div
            style={{
              position: 'absolute',
              left: marqueeRect.left,
              top: marqueeRect.top,
              width: marqueeRect.width,
              height: marqueeRect.height,
              border: '1px dashed #3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              pointerEvents: 'none',
              zIndex: 99999,
            }}
          />
        )}
      </div>

      {/* Selection overlay — NOT clipped, so handles extend beyond canvas */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {selectedElements.map((el) => (
          <SelectedElementOverlay
            key={el.id}
            elementId={el.id}
            transform={el.transform}
            flipX={el.flipX}
            flipY={el.flipY}
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
function ElementWithInteraction({
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
  const selectElement = useProjectStore((s) => s.selectElement);
  const toggleSelectElement = useProjectStore((s) => s.toggleSelectElement);
  const setEditingTextElement = useProjectStore((s) => s.setEditingTextElement);
  const editingTextElementId = useProjectStore((s) => s.editingTextElementId);

  const { handleMouseDown } = useDragElement({
    elementId,
    canvasWidth,
    canvasHeight,
    scale,
    onDragStart: () => {
      if (!isSelected) selectElement(elementId);
    },
  });

  const { handleScreenshotMouseDown } = useDragScreenshot({
    elementId,
    scale,
  });

  // Get element transform from store to position the hit target
  const element = useProjectStore((s) => {
    for (const platform of ['iphone', 'ipad', 'mac', 'apple-watch'] as const) {
      const screenshots = s.project.screenshotsByPlatform[platform] ?? [];
      for (const scr of screenshots) {
        const found = scr.elements.find((e) => e.id === elementId);
        if (found) return found;
      }
    }
    return null;
  });

  if (!element) return children;

  const pixelX = (element.transform.x / 100) * canvasWidth;
  const pixelY = (element.transform.y / 100) * canvasHeight;
  const pixelW = (element.transform.width / 100) * canvasWidth;
  const pixelH = (element.transform.height / 100) * canvasHeight;
  const rotation = element.transform.rotation || 0;
  const scaleX = element.flipX ? -1 : 1;
  const scaleY = element.flipY ? -1 : 1;
  const needsTransform = rotation !== 0 || scaleX !== 1 || scaleY !== 1;

  // Hide hit target if this text element is being inline-edited
  const isEditing = editingTextElementId === elementId;

  return (
    <>
      {children}
      {/* Transparent hit target for drag + click */}
      {!isEditing && (
        <div
          onMouseDown={(e) => {
            // Alt+drag on device-frame with screenshot → reposition screenshot
            if (e.altKey && element.type === 'device-frame' && (element as any).screenshotImageUrl) {
              if (!isSelected) selectElement(elementId);
              handleScreenshotMouseDown(e);
              return;
            }
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
              // Multi-select toggle
              e.stopPropagation();
              toggleSelectElement(elementId);
            } else {
              if (!isSelected) selectElement(elementId);
              handleMouseDown(e);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (element.type === 'text') {
              setEditingTextElement(elementId);
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
      )}
    </>
  );
}

/** Selection box with resize handles for the selected element */
function SelectedElementOverlay({
  elementId,
  transform,
  flipX,
  flipY,
  canvasWidth,
  canvasHeight,
  scale,
  multiSelect,
}: {
  elementId: string;
  transform: { x: number; y: number; width: number; height: number; rotation: number };
  flipX: boolean;
  flipY: boolean;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  multiSelect: boolean;
}) {
  const { handleResizeStart } = useResizeElement({
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

  const { handleRotateStart } = useRotateElement({
    elementId,
    centerPixelX: pixelX + pixelW / 2,
    centerPixelY: pixelY + pixelH / 2,
    scale,
  });

  return (
    <SelectionBox
      x={pixelX}
      y={pixelY}
      width={pixelW}
      height={pixelH}
      scale={scale}
      rotation={rotation}
      onResizeStart={multiSelect ? undefined : handleResizeStart}
      onRotateStart={multiSelect ? undefined : handleRotateStart}
      multiSelect={multiSelect}
    />
  );
}
