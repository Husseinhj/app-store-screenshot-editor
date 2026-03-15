import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import { guidelinePresets } from '@/lib/guidelinePresets';
import { Trash2 } from 'lucide-react';

export function GuidelinesPanel() {
  const applyGuidelinePreset = useProjectStore((s) => s.applyGuidelinePreset);
  const clearAllUserGuides = useProjectStore((s) => s.clearAllUserGuides);
  const activeGuidelinePresetId = useProjectStore((s) => s.activeGuidelinePresetId);
  const userGuides = useProjectStore((s) => s.userGuides);

  return (
    <SidebarSection title="Guidelines">
      <div className="grid grid-cols-1 gap-1.5">
        {guidelinePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyGuidelinePreset(preset.id)}
            className={`flex flex-col items-start rounded px-2 py-1.5 text-left transition-all ${
              activeGuidelinePresetId === preset.id
                ? 'bg-accent/15 ring-1 ring-accent text-white'
                : 'bg-surface-700 ring-1 ring-white/10 text-white/70 hover:text-white hover:ring-white/20'
            }`}
          >
            <span className="text-[11px] font-medium">{preset.name}</span>
            <span className="text-[11px] text-white/40">{preset.description}</span>
          </button>
        ))}
      </div>

      {userGuides.length > 0 && (
        <button
          onClick={clearAllUserGuides}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-700 py-2 text-[11px] font-medium text-white/50 ring-1 ring-white/10 transition-colors hover:text-red-400 hover:ring-red-400/30"
        >
          <Trash2 size={12} />
          Clear All
        </button>
      )}
    </SidebarSection>
  );
}
