import { useProjectStore } from '@/store/useProjectStore';
import { getExportSizesForPlatform, getOrientedExportSize } from '@/lib/exportSizes';
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
        return screenshots.map((screenshot) => {
          const oriented = getOrientedExportSize(exportSize, screenshot.orientation ?? 'portrait');
          return (
            <div
              key={screenshot.id}
              id={`export-${screenshot.id}`}
              style={{
                width: oriented.width,
                height: oriented.height,
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <ScreenshotCard screenshot={screenshot} width={oriented.width} height={oriented.height} />
            </div>
          );
        });
      })()}

      {/* Cross-platform export elements — one set per platform */}
      {allPlatforms.map((platform) => {
        const screenshots = project.screenshotsByPlatform[platform] ?? [];
        const sizes = getExportSizesForPlatform(platform);
        const size = sizes[0];
        if (!size) return null;

        return screenshots.map((screenshot) => {
          const oriented = getOrientedExportSize(size, screenshot.orientation ?? 'portrait');
          return (
            <div
              key={`${platform}-${screenshot.id}`}
              id={`export-${platform}-${screenshot.id}`}
              style={{
                width: oriented.width,
                height: oriented.height,
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <ScreenshotCard screenshot={screenshot} width={oriented.width} height={oriented.height} />
            </div>
          );
        });
      })}
    </div>
  );
}
