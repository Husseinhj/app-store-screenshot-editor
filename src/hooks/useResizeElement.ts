import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import type { ElementTransform } from '@/store/types';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface UseResizeElementOptions {
  elementId: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

const MIN_SIZE = 3; // minimum 3% of canvas

export function useResizeElement({ elementId, canvasWidth, canvasHeight, scale }: UseResizeElementOptions) {
  const rafRef = useRef<number>(0);

  const handleResizeStart = useCallback(
    (handle: ResizeHandle, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();
      const el = (() => {
        for (const platform of ['iphone', 'ipad', 'mac', 'apple-watch'] as const) {
          const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
          for (const s of screenshots) {
            const found = s.elements.find((e) => e.id === elementId);
            if (found) return found;
          }
        }
        return null;
      })();
      if (!el || el.locked) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const start: ElementTransform = { ...el.transform };

      // Pre-compute rotation for local-axis conversion
      const rotationRad = -((start.rotation || 0) * Math.PI) / 180;
      const cosR = Math.cos(rotationRad);
      const sinR = Math.sin(rotationRad);

      // Prevent browser text selection during resize
      document.body.classList.add('canvas-no-select');

      const handleMouseMove = (ev: MouseEvent) => {
        const rawDx = ((ev.clientX - startX) / scale / canvasWidth) * 100;
        const rawDy = ((ev.clientY - startY) / scale / canvasHeight) * 100;

        // Rotate mouse delta into element's local coordinate space
        const dx = rawDx * cosR - rawDy * sinR;
        const dy = rawDx * sinR + rawDy * cosR;

        const update: Partial<ElementTransform> = {};

        // Horizontal
        if (handle.includes('w')) {
          const newX = start.x + dx;
          const newW = start.width - dx;
          if (newW >= MIN_SIZE) {
            update.x = newX;
            update.width = newW;
          }
        } else if (handle.includes('e')) {
          const newW = start.width + dx;
          if (newW >= MIN_SIZE) {
            update.width = newW;
          }
        }

        // Vertical
        if (handle.startsWith('n')) {
          const newY = start.y + dy;
          const newH = start.height - dy;
          if (newH >= MIN_SIZE) {
            update.y = newY;
            update.height = newH;
          }
        } else if (handle.startsWith('s')) {
          const newH = start.height + dy;
          if (newH >= MIN_SIZE) {
            update.height = newH;
          }
        }

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          useProjectStore.getState().updateElementTransform(elementId, update);
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
    [elementId, canvasWidth, canvasHeight, scale]
  );

  return { handleResizeStart };
}
