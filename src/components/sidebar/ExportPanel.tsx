import { useProjectStore } from '@/store/useProjectStore';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { SidebarSection } from './SidebarSection';
import { useExport } from '@/hooks/useExport';
import { Download, Archive } from 'lucide-react';

export function ExportPanel() {
  const platform = useProjectStore((s) => s.project.platform);
  const exportSizeIndex = useProjectStore((s) => s.exportSizeIndex);
  const setExportSizeIndex = useProjectStore((s) => s.setExportSizeIndex);
  const { exportCurrent, exportAll, exportAllPlatforms, exporting } = useExport();

  const sizes = getExportSizesForPlatform(platform);

  return (
    <SidebarSection title="Export">
      {/* Size selector */}
      <div className="mb-3 space-y-1">
        {sizes.map((size, i) => (
          <button
            key={size.label}
            onClick={() => setExportSizeIndex(i)}
            className={`w-full rounded px-2 py-1 text-left text-[11px] transition-colors ${
              exportSizeIndex === i
                ? 'bg-accent/15 text-white ring-1 ring-accent/40'
                : 'text-white/60 hover:bg-surface-600 hover:text-white'
            }`}
          >
            <span>{size.label}</span>
            <span className="ml-2 text-[10px] text-white/30">
              {size.width}×{size.height}
            </span>
          </button>
        ))}
      </div>

      {/* Export buttons */}
      <div className="space-y-2">
        <button
          onClick={exportCurrent}
          disabled={exporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? 'Exporting...' : 'Export Current'}
        </button>
        <button
          onClick={exportAll}
          disabled={exporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-600 py-2.5 text-xs font-medium text-white/70 transition-colors hover:bg-surface-500 hover:text-white disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? 'Exporting...' : 'Export All (ZIP)'}
        </button>
        <button
          onClick={exportAllPlatforms}
          disabled={exporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-700 py-2.5 text-xs font-medium text-white/50 transition-colors hover:bg-surface-600 hover:text-white disabled:opacity-50"
        >
          <Archive size={14} />
          {exporting ? 'Exporting...' : 'Export All Platforms (ZIP)'}
        </button>
      </div>
    </SidebarSection>
  );
}
