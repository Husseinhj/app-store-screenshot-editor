import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

interface UseRotateElementOptions {
  elementId: string;
  /** Pixel position of element center on the scaled canvas */
  centerPixelX: number;
  centerPixelY: number;
  scale: number;
}

export function useRotateElement({ elementId, centerPixelX, centerPixelY, scale }: UseRotateElementOptions) {
  const rafRef = useRef<number>(0);

  const handleRotateStart = useCallback(
    (e: React.MouseEvent) => {
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

      // Find canvas container to compute screen center
      const canvasEl = (e.target as HTMLElement).closest('.relative');
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();

      const screenCenterX = canvasRect.left + centerPixelX * scale;
      const screenCenterY = canvasRect.top + centerPixelY * scale;

      const startAngle = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX);
      const startRotation = el.transform.rotation || 0;

      const handleMouseMove = (ev: MouseEvent) => {
        const currentAngle = Math.atan2(ev.clientY - screenCenterY, ev.clientX - screenCenterX);
        let deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;
        let newRotation = startRotation + deltaDeg;

        // Normalize to 0-360
        newRotation = ((newRotation % 360) + 360) % 360;

        // Snap to 45° increments when Shift is held
        if (ev.shiftKey) {
          newRotation = Math.round(newRotation / 45) * 45;
        }

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          useProjectStore.getState().updateElementTransform(elementId, { rotation: newRotation });
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
    [elementId, centerPixelX, centerPixelY, scale]
  );

  return { handleRotateStart };
}
