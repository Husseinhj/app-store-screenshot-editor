import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import type { CanvasElement, ElementTransform } from '@/store/types';
import type { ResizeHandle } from './useResizeElement';

interface UseGroupTransformOptions {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

/** Compute bounding box (in percentage coords) from an array of elements */
export function computeGroupBBox(elements: CanvasElement[]) {
  if (elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    const t = el.transform;
    minX = Math.min(minX, t.x);
    minY = Math.min(minY, t.y);
    maxX = Math.max(maxX, t.x + t.width);
    maxY = Math.max(maxY, t.y + t.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

const MIN_SIZE = 3; // minimum 3% of canvas

export function useGroupTransform({ canvasWidth, canvasHeight, scale }: UseGroupTransformOptions) {
  const rafRef = useRef<number>(0);

  // ─── Group Resize ───────────────────────────────────────────────────
  const handleGroupResizeStart = useCallback(
    (handle: ResizeHandle, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();
      const { selectedElementIds } = state;
      const elements = state.getSelectedElements();
      if (elements.length < 2) return;

      // Snapshot starting transforms and bounding box
      const startTransforms = new Map<string, ElementTransform>();
      for (const el of elements) {
        if (el.locked) continue;
        startTransforms.set(el.id, { ...el.transform });
      }

      const bbox = computeGroupBBox(elements);
      const startBBox = { ...bbox };
      const startX = e.clientX;
      const startY = e.clientY;

      document.body.classList.add('canvas-no-select');

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ((ev.clientX - startX) / scale / canvasWidth) * 100;
        const dy = ((ev.clientY - startY) / scale / canvasHeight) * 100;

        // Compute new bbox based on handle direction
        let newX = startBBox.x;
        let newY = startBBox.y;
        let newW = startBBox.width;
        let newH = startBBox.height;

        if (handle.includes('w')) {
          newX = startBBox.x + dx;
          newW = startBBox.width - dx;
        } else if (handle.includes('e')) {
          newW = startBBox.width + dx;
        }

        if (handle.startsWith('n')) {
          newY = startBBox.y + dy;
          newH = startBBox.height - dy;
        } else if (handle.startsWith('s')) {
          newH = startBBox.height + dy;
        }

        // Enforce minimum size
        if (newW < MIN_SIZE || newH < MIN_SIZE) return;

        // Scale factors
        const scaleXFactor = newW / startBBox.width;
        const scaleYFactor = newH / startBBox.height;

        // Anchor point: the corner opposite to the handle
        const anchorX = handle.includes('w') ? startBBox.x + startBBox.width : startBBox.x;
        const anchorY = handle.startsWith('n') ? startBBox.y + startBBox.height : startBBox.y;
        const newAnchorX = handle.includes('w') ? newX + newW : newX;
        const newAnchorY = handle.startsWith('n') ? newY + newH : newY;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const store = useProjectStore.getState();
          for (const [id, start] of startTransforms) {
            // Compute new position and size relative to anchor
            const relX = start.x - anchorX;
            const relY = start.y - anchorY;

            const update: Partial<ElementTransform> = {
              x: newAnchorX + relX * scaleXFactor,
              y: newAnchorY + relY * scaleYFactor,
              width: Math.max(MIN_SIZE, start.width * scaleXFactor),
              height: Math.max(MIN_SIZE, start.height * scaleYFactor),
            };
            store.updateElementTransform(id, update);
          }
        });
      };

      const handleMouseUp = () => {
        cancelAnimationFrame(rafRef.current);
        document.body.classList.remove('canvas-no-select');
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [canvasWidth, canvasHeight, scale]
  );

  // ─── Group Rotate ───────────────────────────────────────────────────
  const handleGroupRotateStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();
      const elements = state.getSelectedElements();
      if (elements.length < 2) return;

      const bbox = computeGroupBBox(elements);

      // BBox center in percentage
      const bboxCenterXPct = bbox.x + bbox.width / 2;
      const bboxCenterYPct = bbox.y + bbox.height / 2;

      // BBox center in screen pixels (relative to canvas container)
      const canvasEl = (e.target as HTMLElement).closest('.relative');
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      const screenCenterX = canvasRect.left + (bboxCenterXPct / 100) * canvasWidth * scale;
      const screenCenterY = canvasRect.top + (bboxCenterYPct / 100) * canvasHeight * scale;

      const startAngle = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX);

      // Snapshot each element's center position and rotation
      const startData = new Map<string, { centerX: number; centerY: number; rotation: number }>();
      for (const el of elements) {
        if (el.locked) continue;
        const cx = el.transform.x + el.transform.width / 2;
        const cy = el.transform.y + el.transform.height / 2;
        startData.set(el.id, { centerX: cx, centerY: cy, rotation: el.transform.rotation || 0 });
      }

      document.body.classList.add('canvas-no-select');

      const handleMouseMove = (ev: MouseEvent) => {
        const currentAngle = Math.atan2(ev.clientY - screenCenterY, ev.clientX - screenCenterX);
        let deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;

        // Snap to 45° when shift held
        if (ev.shiftKey) {
          deltaDeg = Math.round(deltaDeg / 45) * 45;
        }

        const deltaRad = (deltaDeg * Math.PI) / 180;
        const cosD = Math.cos(deltaRad);
        const sinD = Math.sin(deltaRad);

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const store = useProjectStore.getState();
          for (const [id, start] of startData) {
            // Rotate element center around bbox center
            const relX = start.centerX - bboxCenterXPct;
            const relY = start.centerY - bboxCenterYPct;
            const newRelX = relX * cosD - relY * sinD;
            const newRelY = relX * sinD + relY * cosD;
            const newCenterX = bboxCenterXPct + newRelX;
            const newCenterY = bboxCenterYPct + newRelY;

            // Get element width/height to derive x, y from center
            const el = store.getSelectedElements().find((e) => e.id === id);
            if (!el) continue;

            let newRotation = start.rotation + deltaDeg;
            newRotation = ((newRotation % 360) + 360) % 360;

            store.updateElementTransform(id, {
              x: newCenterX - el.transform.width / 2,
              y: newCenterY - el.transform.height / 2,
              rotation: newRotation,
            });
          }
        });
      };

      const handleMouseUp = () => {
        cancelAnimationFrame(rafRef.current);
        document.body.classList.remove('canvas-no-select');
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [canvasWidth, canvasHeight, scale]
  );

  return { handleGroupResizeStart, handleGroupRotateStart };
}
