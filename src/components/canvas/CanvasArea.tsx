import { useProjectStore } from '@/store/useProjectStore';
import { ScreenshotCard } from './ScreenshotCard';
import { InteractiveCanvas } from './InteractiveCanvas';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { platformLabels } from '@/lib/devices';
import { ImagePlus, Grid2x2, Layers, Monitor, Ruler } from 'lucide-react';
import { Rulers, RULER_SIZE } from './Rulers';
import type { CanvasView, Platform, Screenshot } from '@/store/types';
import { useCallback, useEffect, useRef } from 'react';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

export function CanvasArea() {
  const project = useProjectStore((s) => s.project);
  const exportSizeIndex = useProjectStore((s) => s.exportSizeIndex);
  const canvasView = useProjectStore((s) => s.canvasView);
  const setCanvasView = useProjectStore((s) => s.setCanvasView);
  const selectScreenshot = useProjectStore((s) => s.selectScreenshot);
  const zoom = useProjectStore((s) => s.zoom);
  const setZoom = useProjectStore((s) => s.setZoom);
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const removeElement = useProjectStore((s) => s.removeElement);
  const addTextElement = useProjectStore((s) => s.addTextElement);
  const addImageElement = useProjectStore((s) => s.addImageElement);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
  const selectedScreenshot = screenshots.find((s) => s.id === project.selectedScreenshotId);
  const exportSizes = getExportSizesForPlatform(project.platform);
  const exportSize = exportSizes[exportSizeIndex] ?? exportSizes[0];

  const zoomFactor = zoom / 100;
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard: skip keyboard shortcuts when inline editing text
      const isEditingText = !!useProjectStore.getState().editingTextElementId;

      // Delete/Backspace to remove selected elements (only when not in an input or editing text)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0 && !isEditingText) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        selectedElementIds.forEach((id) => removeElement(id));
      }
      // Escape to exit inline editing or deselect
      if (e.key === 'Escape') {
        if (isEditingText) {
          useProjectStore.getState().setEditingTextElement(null);
        } else {
          useProjectStore.getState().selectElement(null);
        }
      }
      // Select all: Cmd+A / Ctrl+A
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        useProjectStore.getState().selectAllElements();
      }
      // Undo: Cmd+Z / Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        useProjectStore.temporal.getState().undo();
      }
      // Redo: Cmd+Shift+Z / Ctrl+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
      }
      // Copy: Cmd+C / Ctrl+C
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !e.shiftKey && !isEditingText) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          useProjectStore.getState().copySelectedElements();
        }
      }
      // Paste: Cmd+V / Ctrl+V
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !e.shiftKey && !isEditingText) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        const clipboard = useProjectStore.getState().clipboard;
        if (clipboard && clipboard.length > 0) {
          e.preventDefault();
          useProjectStore.getState().pasteElements();
        }
        // If no internal clipboard, let the default paste handler create text element
      }
      // Duplicate: Cmd+D / Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && !isEditingText) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          selectedElementIds.forEach((id) => useProjectStore.getState().duplicateElement(id));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, removeElement]);

  // Trackpad zoom (pinch)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const currentZoom = useProjectStore.getState().zoom;
        const newZoom = Math.round(currentZoom + delta * 0.5);
        useProjectStore.getState().setZoom(newZoom);
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Paste text
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim()) {
        e.preventDefault();
        addTextElement(text.trim());
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addTextElement]);

  // Drag-drop images
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;

          // Check if dropped on a device-frame element
          const container = containerRef.current;
          if (container && selectedScreenshot) {
            const rect = container.getBoundingClientRect();
            const dropX = ((e.clientX - rect.left) / rect.width) * 100;
            const dropY = ((e.clientY - rect.top) / rect.height) * 100;

            // Check if drop position is over a device-frame element
            const deviceEl = selectedScreenshot.elements.find((el) => {
              if (el.type !== 'device-frame') return false;
              return (
                dropX >= el.transform.x &&
                dropX <= el.transform.x + el.transform.width &&
                dropY >= el.transform.y &&
                dropY <= el.transform.y + el.transform.height
              );
            });

            if (deviceEl && deviceEl.type === 'device-frame') {
              useProjectStore.getState().updateDeviceElement(deviceEl.id, { screenshotImageUrl: url });
              return;
            }
          }

          // Otherwise create a new image element
          addImageElement(url);
        };
        reader.readAsDataURL(file);
      });
    },
    [addImageElement, selectedScreenshot]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-900">
      {/* View switcher bar + add element toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-surface-800/50 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <ViewButton icon={<Monitor size={13} />} label="Single" active={canvasView === 'single'} onClick={() => setCanvasView('single')} />
          <ViewButton icon={<Grid2x2 size={13} />} label="Platform" active={canvasView === 'platform-grid'} onClick={() => setCanvasView('platform-grid')} />
          <ViewButton icon={<Layers size={13} />} label="All Platforms" active={canvasView === 'all-platforms'} onClick={() => setCanvasView('all-platforms')} />
        </div>

        {/* Delete selected element(s) */}
        {canvasView === 'single' && selectedElementIds.length > 0 && (
          <button
            onClick={() => selectedElementIds.forEach((id) => removeElement(id))}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Delete{selectedElementIds.length > 1 ? ` (${selectedElementIds.length})` : ''}
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target === e.currentTarget || target.dataset.canvasOuter === 'true') {
            useProjectStore.getState().selectElement(null);
            useProjectStore.getState().setEditingTextElement(null);
          }
        }}
      >
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
            onDoubleClick={(id) => { selectScreenshot(id); setCanvasView('single'); }}
            zoomFactor={zoomFactor}
          />
        )}
        {canvasView === 'all-platforms' && (
          <AllPlatformsView
            project={project}
            selectedId={project.selectedScreenshotId}
            onSelect={selectScreenshot}
            onDoubleClick={(id, platform) => {
              useProjectStore.getState().setPlatform(platform);
              selectScreenshot(id);
              setCanvasView('single');
            }}
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

// ─── Single Screenshot View (Interactive) ────────────────────────────────────
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
    <div className="flex flex-col items-center justify-center min-h-full" data-canvas-outer="true">
      <div
        className="relative"
        style={{
          width: previewWidth * zoomFactor + RULER_SIZE,
          height: previewHeight * zoomFactor + RULER_SIZE,
        }}
      >
        {/* Rulers */}
        <Rulers canvasWidth={exportSize.width} canvasHeight={exportSize.height} scale={scale} />

        {/* Canvas area offset by ruler size */}
        <div
          className="relative"
          style={{
            position: 'absolute',
            top: RULER_SIZE,
            left: RULER_SIZE,
            width: previewWidth * zoomFactor,
            height: previewHeight * zoomFactor,
          }}
        >
          {/* Visual frame with rounded corners and shadow */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 25px 80px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              width: exportSize.width,
              height: exportSize.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <InteractiveCanvas
              screenshot={screenshot}
              width={exportSize.width}
              height={exportSize.height}
              scale={scale}
            />
          </div>
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
  onDoubleClick,
  zoomFactor,
}: {
  screenshots: Screenshot[];
  exportSize: { width: number; height: number; label: string };
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string) => void;
  zoomFactor: number;
}) {
  if (screenshots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-white/40 text-sm">
        No screenshots yet
      </div>
    );
  }

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
            onDoubleClick={() => onDoubleClick(s.id)}
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
          <span className="text-[10px] text-white/40">{s.name || `Screen ${i + 1}`}</span>
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
  onDoubleClick,
  zoomFactor,
}: {
  project: { screenshotsByPlatform: Record<string, Screenshot[]>; platform: Platform };
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string, platform: Platform) => void;
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
                      onDoubleClick={() => onDoubleClick(s.id, platform)}
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
                    <span className="text-[10px] text-white/30">{s.name || `${i + 1}`}</span>
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
