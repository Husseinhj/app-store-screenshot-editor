import type { Screenshot } from '@/store/types';
import { BackgroundLayer } from './BackgroundLayer';
import { CanvasElementRenderer } from './CanvasElementRenderer';

interface Props {
  screenshot: Screenshot;
  width: number;
  height: number;
}

export function FreeformCanvas({ screenshot, width, height }: Props) {
  const sortedElements = [...screenshot.elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative" style={{ width, height, overflow: 'hidden' }}>
      <BackgroundLayer background={screenshot.background} width={width} height={height} />
      {sortedElements.map((el) => (
        <CanvasElementRenderer
          key={el.id}
          element={el}
          canvasWidth={width}
          canvasHeight={height}
        />
      ))}
    </div>
  );
}
