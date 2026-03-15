import { useProjectStore } from '@/store/useProjectStore';
import { ICON_PLATFORM_LABELS, getPlatformMask, getIconSizesForPlatforms } from '@/lib/appIconSizes';
import { FreeformCanvas } from '../canvas/FreeformCanvas';
import type { IconPlatform, Screenshot } from '@/store/types';
import { useIconExport } from '@/hooks/useIconExport';
import { Download, Loader2 } from 'lucide-react';

const allIconPlatforms: IconPlatform[] = ['ios', 'ipados', 'macos', 'watchos', 'visionos'];

const previewSizes = [
  { label: '1024', size: 120 },
  { label: '180', size: 60 },
  { label: '80', size: 40 },
  { label: '32', size: 24 },
];

export function IconPreviewPanel({ screenshot }: { screenshot: Screenshot }) {
  const selectedPlatforms = useProjectStore((s) => s.appIconProject.selectedPlatforms);
  const setSelectedPlatforms = useProjectStore((s) => s.setAppIconSelectedPlatforms);
  const { exporting, exportAppIcon } = useIconExport();

  const togglePlatform = (platform: IconPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const totalSizes = getIconSizesForPlatforms(selectedPlatforms).length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Platform checkboxes */}
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="mb-2 text-[11px] font-medium text-white/60">Platforms</h3>
        <div className="space-y-1.5">
          {allIconPlatforms.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(p)}
                onChange={() => togglePlatform(p)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-surface-700 text-accent focus:ring-accent/40 focus:ring-offset-0"
              />
              <span className="text-[12px] text-white/70 group-hover:text-white/90">
                {ICON_PLATFORM_LABELS[p]}
              </span>
              <span className="ml-auto text-[10px] text-white/30">
                {getIconSizesForPlatforms([p]).length} {getIconSizesForPlatforms([p]).length === 1 ? 'size' : 'sizes'}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-white/30">
          {totalSizes} icon {totalSizes === 1 ? 'file' : 'files'} will be exported
        </div>
      </div>

      {/* Previews per platform */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h3 className="mb-3 text-[11px] font-medium text-white/60">Preview</h3>
        <div className="space-y-4">
          {selectedPlatforms.map((platform) => {
            const mask = getPlatformMask(platform);
            const borderRadius = mask === 'circle' ? '50%' : '22.37%';

            return (
              <div key={platform}>
                <div className="mb-2 text-[11px] font-medium text-white/50">
                  {ICON_PLATFORM_LABELS[platform]}
                </div>
                <div className="flex items-end gap-3">
                  {previewSizes.map(({ label, size }) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <div
                        className="overflow-hidden bg-surface-700 shadow-lg"
                        style={{
                          width: size,
                          height: size,
                          borderRadius,
                        }}
                      >
                        <div
                          style={{
                            width: 1024,
                            height: 1024,
                            transform: `scale(${size / 1024})`,
                            transformOrigin: 'top left',
                          }}
                        >
                          <FreeformCanvas screenshot={screenshot} width={1024} height={1024} />
                        </div>
                      </div>
                      <span className="text-[9px] text-white/30">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export button */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <button
          onClick={exportAppIcon}
          disabled={exporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download size={14} />
              Export AppIcon.appiconset
            </>
          )}
        </button>
        <p className="mt-1.5 text-center text-[10px] text-white/30">
          ZIP file ready for Xcode asset catalog
        </p>
      </div>
    </div>
  );
}
