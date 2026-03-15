import type { Screenshot } from '@/store/types';
import { FreeformCanvas } from './FreeformCanvas';

interface Props {
  screenshot: Screenshot;
  width: number;
  height: number;
}

export function ScreenshotCard({ screenshot, width, height }: Props) {
  return <FreeformCanvas screenshot={screenshot} width={width} height={height} />;
}
