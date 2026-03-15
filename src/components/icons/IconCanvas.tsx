import { useProjectStore } from '@/store/useProjectStore';
import { FreeformCanvas } from '../canvas/FreeformCanvas';
import { InteractiveIconCanvas } from './InteractiveIconCanvas';
import { IconGuidelinesOverlay } from './IconGuidelinesOverlay';
import type { Screenshot } from '@/store/types';

interface Props {
  screenshot: Screenshot;
  activeGuideline: string | null;
}

export function IconCanvas({ screenshot, activeGuideline }: Props) {
  const selectElement = useProjectStore((s) => s.selectAppIconElement);

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-900 p-8">
      {/* Visible canvas — scaled to fit, interactive */}
      <div className="relative">
        <div
          className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/[0.06]"
          style={{ width: 500, height: 500 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) selectElement(null);
          }}
        >
          <div
            style={{
              width: 1024,
              height: 1024,
              transform: 'scale(0.48828125)',
              transformOrigin: 'top left',
            }}
          >
            <InteractiveIconCanvas
              screenshot={screenshot}
              width={1024}
              height={1024}
              scale={500 / 1024}
            />
          </div>
        </div>

        {/* Guidelines overlay on top of the canvas */}
        {activeGuideline && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '1rem',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <IconGuidelinesOverlay
              preset={activeGuideline}
              canvasSize={500}
            />
          </div>
        )}

        <div className="mt-2 text-center text-[10px] text-white/30">
          1024 × 1024
        </div>
      </div>

      {/* Hidden export canvas at full 1024x1024 */}
      <div
        id="icon-export-canvas"
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          width: 1024,
          height: 1024,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <FreeformCanvas screenshot={screenshot} width={1024} height={1024} />
      </div>
    </div>
  );
}
