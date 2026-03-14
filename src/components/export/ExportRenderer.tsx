import { useProjectStore } from '@/store/useProjectStore';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { ScreenshotCard } from '../canvas/ScreenshotCard';
import type { Platform } from '@/store/types';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

export function ExportRenderer() {
  const project = useProjectStore((s) => s.project);
  const exportSizeIndex = useProjectStore((s) => s.exportSizeIndex);

  return (
    <div
      style={{
        position: 'fixed',
        left: '-99999px',
        top: '-99999px',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Current platform export elements */}
      {(() => {
        const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
        const exportSizes = getExportSizesForPlatform(project.platform);
        const exportSize = exportSizes[exportSizeIndex] ?? exportSizes[0];
        return screenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            id={`export-${screenshot.id}`}
            style={{
              width: exportSize.width,
              height: exportSize.height,
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          >
            <ScreenshotCard screenshot={screenshot} width={exportSize.width} height={exportSize.height} />
          </div>
        ));
      })()}

      {/* Cross-platform export elements — one set per platform */}
      {allPlatforms.map((platform) => {
        const screenshots = project.screenshotsByPlatform[platform] ?? [];
        const sizes = getExportSizesForPlatform(platform);
        const size = sizes[0];
        if (!size) return null;

        return screenshots.map((screenshot) => (
          <div
            key={`${platform}-${screenshot.id}`}
            id={`export-${platform}-${screenshot.id}`}
            style={{
              width: size.width,
              height: size.height,
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          >
            <ScreenshotCard screenshot={screenshot} width={size.width} height={size.height} />
          </div>
        ));
      })}
    </div>
  );
}
