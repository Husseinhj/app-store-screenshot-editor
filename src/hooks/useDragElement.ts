import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

interface UseDragElementOptions {
  elementId: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  onDragStart?: () => void;
}

export function useDragElement({ elementId, canvasWidth, canvasHeight, scale, onDragStart }: UseDragElementOptions) {
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only left click
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();

      // Determine which elements to drag: all selected if current element is in selection, otherwise just this one
      const selectedIds = state.selectedElementIds;
      const dragIds = selectedIds.includes(elementId) ? [...selectedIds] : [elementId];

      // Gather start transforms for all dragged elements
      const startTransforms: Record<string, { x: number; y: number }> = {};
      for (const id of dragIds) {
        const el = (() => {
          for (const platform of ['iphone', 'ipad', 'mac', 'apple-watch'] as const) {
            const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
            for (const s of screenshots) {
              const found = s.elements.find((e) => e.id === id);
              if (found) return found;
            }
          }
          return null;
        })();
        if (!el || el.locked) continue;
        startTransforms[id] = { x: el.transform.x, y: el.transform.y };
      }

      if (Object.keys(startTransforms).length === 0) return;

      const startX = e.clientX;
      const startY = e.clientY;

      isDragging.current = false;
      onDragStart?.();

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!isDragging.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          isDragging.current = true;
        }

        if (!isDragging.current) return;

        // Convert screen pixels to canvas percentage
        const dxPercent = (dx / scale / canvasWidth) * 100;
        const dyPercent = (dy / scale / canvasHeight) * 100;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          for (const id of Object.keys(startTransforms)) {
            useProjectStore.getState().updateElementTransform(id, {
              x: startTransforms[id].x + dxPercent,
              y: startTransforms[id].y + dyPercent,
            });
          }
        });
      };

      const handleMouseUp = () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [elementId, canvasWidth, canvasHeight, scale, onDragStart]
  );

  return { handleMouseDown, isDragging };
}
