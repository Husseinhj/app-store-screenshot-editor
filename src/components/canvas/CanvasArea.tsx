import { useProjectStore } from '@/store/useProjectStore';
import { ScreenshotCard } from './ScreenshotCard';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { platformLabels, devicesByPlatform } from '@/lib/devices';
import { ImagePlus, Grid2x2, Layers, Monitor } from 'lucide-react';
import type { CanvasView, Platform, Screenshot } from '@/store/types';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

export function CanvasArea() {
  const project = useProjectStore((s) => s.project);
  const exportSizeIndex = useProjectStore((s) => s.exportSizeIndex);
  const canvasView = useProjectStore((s) => s.canvasView);
  const setCanvasView = useProjectStore((s) => s.setCanvasView);
  const selectScreenshot = useProjectStore((s) => s.selectScreenshot);
  const zoom = useProjectStore((s) => s.zoom);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
  const selectedScreenshot = screenshots.find((s) => s.id === project.selectedScreenshotId);
  const exportSizes = getExportSizesForPlatform(project.platform);
  const exportSize = exportSizes[exportSizeIndex] ?? exportSizes[0];

  const zoomFactor = zoom / 100;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-900">
      {/* View switcher bar */}
      <div className="flex items-center justify-center gap-1 border-b border-white/5 bg-surface-800/50 px-3 py-1.5">
        <ViewButton icon={<Monitor size={13} />} label="Single" active={canvasView === 'single'} onClick={() => setCanvasView('single')} />
        <ViewButton icon={<Grid2x2 size={13} />} label="Platform" active={canvasView === 'platform-grid'} onClick={() => setCanvasView('platform-grid')} />
        <ViewButton icon={<Layers size={13} />} label="All Platforms" active={canvasView === 'all-platforms'} onClick={() => setCanvasView('all-platforms')} />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {canvasView === 'single' && (
          <SingleView
            screenshot={selectedScreenshot ?? null}
            exportSize={exportSize}
            zoomFactor={zoomFactor}
          />
        )}
        {canvasView === 'platform-grid' && (
          <PlatformGridView
            screenshots={screenshots}
            exportSize={exportSize}
            selectedId={project.selectedScreenshotId}
            onSelect={selectScreenshot}
            zoomFactor={zoomFactor}
          />
        )}
        {canvasView === 'all-platforms' && (
          <AllPlatformsView
            project={project}
            selectedId={project.selectedScreenshotId}
            onSelect={selectScreenshot}
            zoomFactor={zoomFactor}
          />
        )}
      </div>
    </div>
  );
}

function ViewButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
        active ? 'bg-accent/20 text-white ring-1 ring-accent/40' : 'text-white/40 hover:text-white/70 hover:bg-surface-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Single Screenshot View ──────────────────────────────────────────────────
function SingleView({
  screenshot,
  exportSize,
  zoomFactor,
}: {
  screenshot: Screenshot | null;
  exportSize: { width: number; height: number; label: string };
  zoomFactor: number;
}) {
  if (!screenshot) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-white/40">
          <ImagePlus size={48} className="mx-auto mb-3" />
          <p className="text-sm">Add a screenshot to get started</p>
        </div>
      </div>
    );
  }

  const maxPreviewHeight = 560;
  const maxPreviewWidth = 420;
  const aspectRatio = exportSize.width / exportSize.height;

  let previewWidth: number;
  let previewHeight: number;

  if (aspectRatio > 1) {
    previewWidth = Math.min(maxPreviewWidth * 1.5, 680);
    previewHeight = previewWidth / aspectRatio;
    if (previewHeight > maxPreviewHeight) {
      previewHeight = maxPreviewHeight;
      previewWidth = previewHeight * aspectRatio;
    }
  } else {
    previewHeight = maxPreviewHeight;
    previewWidth = previewHeight * aspectRatio;
    if (previewWidth > maxPreviewWidth) {
      previewWidth = maxPreviewWidth;
      previewHeight = previewWidth / aspectRatio;
    }
  }

  const scale = (previewWidth / exportSize.width) * zoomFactor;

  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: previewWidth * zoomFactor,
          height: previewHeight * zoomFactor,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: exportSize.width,
            height: exportSize.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <ScreenshotCard screenshot={screenshot} width={exportSize.width} height={exportSize.height} />
        </div>
      </div>
      <div className="mt-3 text-[11px] text-white/30">
        {exportSize.width} × {exportSize.height} — {exportSize.label}
      </div>
    </div>
  );
}

// ─── Platform Grid: all screenshots for current platform ─────────────────────
function PlatformGridView({
  screenshots,
  exportSize,
  selectedId,
  onSelect,
  zoomFactor,
}: {
  screenshots: Screenshot[];
  exportSize: { width: number; height: number; label: string };
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoomFactor: number;
}) {
  if (screenshots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-white/40 text-sm">
        No screenshots yet
      </div>
    );
  }

  // Thumbnail sizing — fit nicely in a grid
  const thumbHeight = 280 * zoomFactor;
  const aspectRatio = exportSize.width / exportSize.height;
  const thumbWidth = thumbHeight * aspectRatio;
  const scale = thumbWidth / exportSize.width;

  return (
    <div className="flex flex-wrap gap-5 justify-center">
      {screenshots.map((s, i) => (
        <div key={s.id} className="flex flex-col items-center gap-2">
          <div
            onClick={() => onSelect(s.id)}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
              selectedId === s.id ? 'ring-2 ring-accent shadow-lg shadow-accent/20' : 'ring-1 ring-white/10 hover:ring-white/20'
            }`}
            style={{ width: thumbWidth, height: thumbHeight }}
          >
            <div
              style={{
                width: exportSize.width,
                height: exportSize.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <ScreenshotCard screenshot={s} width={exportSize.width} height={exportSize.height} />
            </div>
          </div>
          <span className="text-[10px] text-white/40">Screen {i + 1}</span>
        </div>
      ))}
    </div>
  );
}

// ─── All Platforms View ──────────────────────────────────────────────────────
function AllPlatformsView({
  project,
  selectedId,
  onSelect,
  zoomFactor,
}: {
  project: { screenshotsByPlatform: Record<string, Screenshot[]>; platform: Platform };
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoomFactor: number;
}) {
  return (
    <div className="space-y-8">
      {allPlatforms.map((platform) => {
        const screenshots = project.screenshotsByPlatform[platform] ?? [];
        const sizes = getExportSizesForPlatform(platform);
        const exportSize = sizes[0];
        if (!exportSize) return null;

        const thumbHeight = 200 * zoomFactor;
        const aspectRatio = exportSize.width / exportSize.height;
        const thumbWidth = thumbHeight * aspectRatio;
        const scale = thumbWidth / exportSize.width;

        return (
          <div key={platform}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                {platformLabels[platform]}
              </h3>
              <span className="text-[10px] text-white/30">
                {exportSize.width}×{exportSize.height} · {screenshots.length} screen{screenshots.length !== 1 ? 's' : ''}
              </span>
            </div>
            {screenshots.length === 0 ? (
              <div className="text-[11px] text-white/20 pl-2">No screenshots</div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {screenshots.map((s, i) => (
                  <div key={s.id} className="flex flex-col items-center gap-1.5">
                    <div
                      onClick={() => {
                        useProjectStore.getState().setPlatform(platform);
                        onSelect(s.id);
                      }}
                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                        selectedId === s.id && project.platform === platform
                          ? 'ring-2 ring-accent shadow-lg shadow-accent/20'
                          : 'ring-1 ring-white/10 hover:ring-white/20'
                      }`}
                      style={{ width: thumbWidth, height: thumbHeight }}
                    >
                      <div
                        style={{
                          width: exportSize.width,
                          height: exportSize.height,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <ScreenshotCard screenshot={s} width={exportSize.width} height={exportSize.height} />
                      </div>
                    </div>
                    <span className="text-[10px] text-white/30">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
