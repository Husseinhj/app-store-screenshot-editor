import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

interface UseDragScreenshotOptions {
  elementId: string;
  scale: number;
}

export function useDragScreenshot({ elementId, scale }: UseDragScreenshotOptions) {
  const rafRef = useRef<number>(0);

  const handleScreenshotMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();

      // Find the device-frame element
      const el = (() => {
        for (const platform of ['iphone', 'ipad', 'mac', 'apple-watch'] as const) {
          const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
          for (const s of screenshots) {
            const found = s.elements.find((e) => e.id === elementId);
            if (found && found.type === 'device-frame') return found;
          }
        }
        return null;
      })();

      if (!el || el.type !== 'device-frame' || !el.screenshotImageUrl) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startOffset = { ...el.screenshotOffset };

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startX) / scale;
        const dy = (ev.clientY - startY) / scale;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          useProjectStore.getState().updateDeviceElement(elementId, {
            screenshotOffset: {
              x: startOffset.x + dx,
              y: startOffset.y + dy,
            },
          });
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
    [elementId, scale]
  );

  return { handleScreenshotMouseDown };
}
