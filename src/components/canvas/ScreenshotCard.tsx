import type { Screenshot } from '@/store/types';
import { BackgroundLayer } from './BackgroundLayer';
import { HeadlineText } from './HeadlineText';
import { DeviceFrame } from './DeviceFrame';

interface Props {
  screenshot: Screenshot;
  width: number;
  height: number;
}

export function ScreenshotCard({ screenshot, width, height }: Props) {
  // Layout: top section for text (~30%), device frame (~70%)
  const textAreaHeight = height * 0.28;
  const deviceAreaHeight = height * 0.72;

  return (
    <div className="relative" style={{ width, height, overflow: 'hidden' }}>
      <BackgroundLayer background={screenshot.background} width={width} height={height} />
      <div className="absolute inset-0 flex flex-col">
        {/* Headline area */}
        <div
          className="flex items-center justify-center px-[6%]"
          style={{ height: textAreaHeight }}
        >
          <HeadlineText text={screenshot.text} maxWidth={width * 0.88} />
        </div>

        {/* Device frame area */}
        <div
          className="flex items-start justify-center"
          style={{ height: deviceAreaHeight }}
        >
          <DeviceFrame
            device={screenshot.device}
            screenshotUrl={screenshot.screenshotImageUrl}
            maxHeight={deviceAreaHeight * 0.95}
            frameStyle={screenshot.frameStyle}
            frameColorVariant={screenshot.frameColorVariant}
            showFrame={screenshot.showDeviceFrame}
          />
        </div>
      </div>
    </div>
  );
}
