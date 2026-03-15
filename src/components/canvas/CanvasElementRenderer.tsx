import type { CanvasElement } from '@/store/types';
import { useProjectStore } from '@/store/useProjectStore';
import { DeviceFrame } from './DeviceFrame';
import { HeadlineText } from './HeadlineText';
import { ImageRenderer } from './ImageRenderer';
import { ShapeRenderer } from './ShapeRenderer';



interface Props {
  element: CanvasElement;
  canvasWidth: number;
  canvasHeight: number;
}

export function CanvasElementRenderer({ element, canvasWidth, canvasHeight }: Props) {
  const customFrames = useProjectStore((s) => s.customFrames);
  const editingTextElementId = useProjectStore((s) => s.editingTextElementId);

  if (!element.visible) return null;

  const pixelX = (element.transform.x / 100) * canvasWidth;
  const pixelY = (element.transform.y / 100) * canvasHeight;
  const pixelW = (element.transform.width / 100) * canvasWidth;
  const pixelH = (element.transform.height / 100) * canvasHeight;

  const rotation = element.transform.rotation || 0;
  const scaleX = element.flipX ? -1 : 1;
  const scaleY = element.flipY ? -1 : 1;
  const needsTransform = rotation !== 0 || scaleX !== 1 || scaleY !== 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: pixelX,
        top: pixelY,
        width: pixelW,
        height: pixelH,
        zIndex: element.zIndex,
        pointerEvents: 'none',
        ...(needsTransform && {
          transform: `rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
          transformOrigin: 'center center',
        }),
      }}
    >
      {element.type === 'device-frame' && (
        <DeviceFrame
          device={element.device}
          screenshotUrl={element.screenshotImageUrl}
          maxHeight={pixelH}
          frameStyle={element.frameStyle}
          frameColorVariant={element.frameColorVariant}
          showFrame={element.showDeviceFrame}
          orientation={element.orientation}
          customFrame={element.customFrameId ? customFrames.find((f) => f.id === element.customFrameId) ?? null : null}
          screenshotFit={element.screenshotFit}
          screenshotOffset={element.screenshotOffset}
          screenshotScale={element.screenshotScale}
        />
      )}
      {element.type === 'text' && element.id !== editingTextElementId && (
        <div
          className="flex items-center justify-center"
          style={{ width: pixelW, height: pixelH }}
        >
          <HeadlineText
            text={{
              content: element.content,
              fontFamily: element.fontFamily,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              color: element.color,
              alignment: element.alignment,
              lineHeight: element.lineHeight,
            }}
            maxWidth={pixelW}
          />
        </div>
      )}
      {element.type === 'image' && (
        <ImageRenderer element={element} width={pixelW} height={pixelH} />
      )}
      {element.type === 'shape' && (
        <ShapeRenderer element={element} width={pixelW} height={pixelH} />
      )}
    </div>
  );
}
