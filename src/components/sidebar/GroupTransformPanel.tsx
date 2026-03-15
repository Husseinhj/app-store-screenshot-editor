import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import { ArrowUp, ArrowDown, Copy, Trash2, FlipHorizontal, FlipVertical } from 'lucide-react';
import { computeGroupBBox } from '@/hooks/useGroupTransform';

export function GroupTransformPanel() {
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const flipSelectedElements = useProjectStore((s) => s.flipSelectedElements);
  const bringForward = useProjectStore((s) => s.bringForward);
  const sendBackward = useProjectStore((s) => s.sendBackward);
  const duplicateElement = useProjectStore((s) => s.duplicateElement);
  const removeElement = useProjectStore((s) => s.removeElement);

  // Get selected elements without causing infinite re-render
  const selectedElements = useMemo(
    () => useProjectStore.getState().getSelectedElements(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedElementIds]
  );

  if (selectedElements.length < 2) return null;

  const bbox = computeGroupBBox(selectedElements);

  return (
    <SidebarSection title={`Group (${selectedElements.length} elements)`}>
      {/* Bounding box position & size (read-only) */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="mb-1 block text-[10px] text-white/40">X %</label>
          <div className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white/60">
            {Math.round(bbox.x * 10) / 10}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">Y %</label>
          <div className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white/60">
            {Math.round(bbox.y * 10) / 10}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">W %</label>
          <div className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white/60">
            {Math.round(bbox.width * 10) / 10}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">H %</label>
          <div className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white/60">
            {Math.round(bbox.height * 10) / 10}
          </div>
        </div>
      </div>

      {/* Flip */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] text-white/40">Flip</span>
        <div className="flex gap-1">
          <button
            onClick={() => flipSelectedElements('x')}
            title="Flip Horizontal"
            className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
          >
            <FlipHorizontal size={14} />
          </button>
          <button
            onClick={() => flipSelectedElements('y')}
            title="Flip Vertical"
            className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
          >
            <FlipVertical size={14} />
          </button>
        </div>
      </div>

      {/* Z-order + actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => selectedElementIds.forEach((id) => bringForward(id))}
          title="Bring Forward"
          className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={() => selectedElementIds.forEach((id) => sendBackward(id))}
          title="Send Backward"
          className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
        >
          <ArrowDown size={14} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => selectedElementIds.forEach((id) => duplicateElement(id))}
          title="Duplicate All"
          className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => selectedElementIds.forEach((id) => removeElement(id))}
          title="Delete All"
          className="rounded p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </SidebarSection>
  );
}
