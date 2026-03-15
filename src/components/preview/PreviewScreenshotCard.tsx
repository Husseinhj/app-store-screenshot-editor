import type { Screenshot } from '@/store/types';
import { FreeformCanvas } from '../canvas/FreeformCanvas';

interface Props {
  screenshot: Screenshot;
  exportWidth: number;
  exportHeight: number;
  previewHeight: number;
}

export function PreviewScreenshotCard({ screenshot, exportWidth, exportHeight, previewHeight }: Props) {
  const aspectRatio = exportWidth / exportHeight;
  const previewWidth = previewHeight * aspectRatio;
  const scale = previewWidth / exportWidth;

  return (
    <div
      className="flex-shrink-0"
      style={{
        width: previewWidth,
        height: previewHeight,
        borderRadius: 12,
        overflow: 'hidden',
        scrollSnapAlign: 'start',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          width: exportWidth,
          height: exportHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <FreeformCanvas screenshot={screenshot} width={exportWidth} height={exportHeight} />
      </div>
    </div>
  );
}
