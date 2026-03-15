import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import { ArrowUp, ArrowDown, Copy, Trash2, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import type { CanvasElement } from '@/store/types';

interface Props {
  element: CanvasElement;
}

export function TransformPanel({ element }: Props) {
  const updateElementTransform = useProjectStore((s) => s.updateElementTransform);
  const updateBaseElement = useProjectStore((s) => s.updateBaseElement);
  const bringForward = useProjectStore((s) => s.bringForward);
  const sendBackward = useProjectStore((s) => s.sendBackward);
  const duplicateElement = useProjectStore((s) => s.duplicateElement);
  const removeElement = useProjectStore((s) => s.removeElement);

  return (
    <SidebarSection title="Transform">
      {/* Position & size */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="mb-1 block text-[10px] text-white/40">X %</label>
          <input
            type="number"
            value={Math.round(element.transform.x * 10) / 10}
            onChange={(e) => updateElementTransform(element.id, { x: Number(e.target.value) })}
            step={0.5}
            className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">Y %</label>
          <input
            type="number"
            value={Math.round(element.transform.y * 10) / 10}
            onChange={(e) => updateElementTransform(element.id, { y: Number(e.target.value) })}
            step={0.5}
            className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">W %</label>
          <input
            type="number"
            value={Math.round(element.transform.width * 10) / 10}
            onChange={(e) => updateElementTransform(element.id, { width: Math.max(3, Number(e.target.value)) })}
            step={0.5}
            min={3}
            className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">H %</label>
          <input
            type="number"
            value={Math.round(element.transform.height * 10) / 10}
            onChange={(e) => updateElementTransform(element.id, { height: Math.max(3, Number(e.target.value)) })}
            step={0.5}
            min={3}
            className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
      </div>

      {/* Rotation & Flip */}
      <div className="mb-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] text-white/40">
            <RotateCw size={10} className="inline mr-1" />
            Rotation
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={Math.round(element.transform.rotation || 0)}
              onChange={(e) => updateElementTransform(element.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 })}
              step={1}
              min={0}
              max={360}
              className="w-full rounded-lg bg-surface-700 px-3 py-1.5 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
            />
            <span className="text-[10px] text-white/30">°</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => updateBaseElement(element.id, { flipX: !element.flipX })}
            title="Flip Horizontal"
            className={`rounded p-1.5 transition-colors ${
              element.flipX
                ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                : 'text-white/40 hover:bg-surface-600 hover:text-white'
            }`}
          >
            <FlipHorizontal size={14} />
          </button>
          <button
            onClick={() => updateBaseElement(element.id, { flipY: !element.flipY })}
            title="Flip Vertical"
            className={`rounded p-1.5 transition-colors ${
              element.flipY
                ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                : 'text-white/40 hover:bg-surface-600 hover:text-white'
            }`}
          >
            <FlipVertical size={14} />
          </button>
        </div>
      </div>

      {/* Z-order + actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => bringForward(element.id)}
          title="Bring Forward"
          className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={() => sendBackward(element.id)}
          title="Send Backward"
          className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
        >
          <ArrowDown size={14} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => duplicateElement(element.id)}
          title="Duplicate"
          className="rounded p-1.5 text-white/40 hover:bg-surface-600 hover:text-white transition-colors"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => removeElement(element.id)}
          title="Delete"
          className="rounded p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </SidebarSection>
  );
}
