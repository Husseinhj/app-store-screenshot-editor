import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import {
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react';
import type { CanvasElement } from '@/store/types';

export function AlignPanel() {
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const getSelectedElements = useProjectStore((s) => s.getSelectedElements);
  const updateElementTransform = useProjectStore((s) => s.updateElementTransform);

  const isMulti = selectedElementIds.length > 1;

  const alignToCanvas = (direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    const elements = getSelectedElements();
    if (elements.length === 0) return;

    for (const el of elements) {
      const t = el.transform;
      switch (direction) {
        case 'left':
          updateElementTransform(el.id, { x: 0 });
          break;
        case 'center-h':
          updateElementTransform(el.id, { x: 50 - t.width / 2 });
          break;
        case 'right':
          updateElementTransform(el.id, { x: 100 - t.width });
          break;
        case 'top':
          updateElementTransform(el.id, { y: 0 });
          break;
        case 'center-v':
          updateElementTransform(el.id, { y: 50 - t.height / 2 });
          break;
        case 'bottom':
          updateElementTransform(el.id, { y: 100 - t.height });
          break;
      }
    }
  };

  const alignToEachOther = (direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    const elements = getSelectedElements();
    if (elements.length < 2) return;

    switch (direction) {
      case 'left': {
        const minX = Math.min(...elements.map((e) => e.transform.x));
        for (const el of elements) updateElementTransform(el.id, { x: minX });
        break;
      }
      case 'center-h': {
        const centers = elements.map((e) => e.transform.x + e.transform.width / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        for (const el of elements) updateElementTransform(el.id, { x: avgCenter - el.transform.width / 2 });
        break;
      }
      case 'right': {
        const maxRight = Math.max(...elements.map((e) => e.transform.x + e.transform.width));
        for (const el of elements) updateElementTransform(el.id, { x: maxRight - el.transform.width });
        break;
      }
      case 'top': {
        const minY = Math.min(...elements.map((e) => e.transform.y));
        for (const el of elements) updateElementTransform(el.id, { y: minY });
        break;
      }
      case 'center-v': {
        const centers = elements.map((e) => e.transform.y + e.transform.height / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        for (const el of elements) updateElementTransform(el.id, { y: avgCenter - el.transform.height / 2 });
        break;
      }
      case 'bottom': {
        const maxBottom = Math.max(...elements.map((e) => e.transform.y + e.transform.height));
        for (const el of elements) updateElementTransform(el.id, { y: maxBottom - el.transform.height });
        break;
      }
    }
  };

  const distributeHorizontally = () => {
    const elements = getSelectedElements();
    if (elements.length < 3) return;

    const sorted = [...elements].sort((a, b) => a.transform.x - b.transform.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalWidth = sorted.reduce((sum, el) => sum + el.transform.width, 0);
    const totalSpace = (last.transform.x + last.transform.width) - first.transform.x - totalWidth;
    const gap = totalSpace / (sorted.length - 1);

    let currentX = first.transform.x + first.transform.width + gap;
    for (let i = 1; i < sorted.length - 1; i++) {
      updateElementTransform(sorted[i].id, { x: currentX });
      currentX += sorted[i].transform.width + gap;
    }
  };

  const distributeVertically = () => {
    const elements = getSelectedElements();
    if (elements.length < 3) return;

    const sorted = [...elements].sort((a, b) => a.transform.y - b.transform.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalHeight = sorted.reduce((sum, el) => sum + el.transform.height, 0);
    const totalSpace = (last.transform.y + last.transform.height) - first.transform.y - totalHeight;
    const gap = totalSpace / (sorted.length - 1);

    let currentY = first.transform.y + first.transform.height + gap;
    for (let i = 1; i < sorted.length - 1; i++) {
      updateElementTransform(sorted[i].id, { y: currentY });
      currentY += sorted[i].transform.height + gap;
    }
  };

  const btnClass = 'flex-1 rounded-lg py-2 bg-surface-700 text-white/50 hover:text-white hover:bg-surface-600 transition-colors';

  return (
    <SidebarSection title="Align">
      {/* Align to canvas */}
      <div className="mb-3">
        <label className="mb-1.5 block text-[10px] text-white/40">Align to Canvas</label>
        <div className="grid grid-cols-3 gap-1">
          <button onClick={() => alignToCanvas('left')} className={btnClass} title="Align Left">
            <AlignStartVertical size={14} className="mx-auto" />
          </button>
          <button onClick={() => alignToCanvas('center-h')} className={btnClass} title="Align Center H">
            <AlignCenterVertical size={14} className="mx-auto" />
          </button>
          <button onClick={() => alignToCanvas('right')} className={btnClass} title="Align Right">
            <AlignEndVertical size={14} className="mx-auto" />
          </button>
          <button onClick={() => alignToCanvas('top')} className={btnClass} title="Align Top">
            <AlignStartHorizontal size={14} className="mx-auto" />
          </button>
          <button onClick={() => alignToCanvas('center-v')} className={btnClass} title="Align Center V">
            <AlignCenterHorizontal size={14} className="mx-auto" />
          </button>
          <button onClick={() => alignToCanvas('bottom')} className={btnClass} title="Align Bottom">
            <AlignEndHorizontal size={14} className="mx-auto" />
          </button>
        </div>
      </div>

      {/* Align to each other — only when multi-selected */}
      {isMulti && (
        <div className="mb-3">
          <label className="mb-1.5 block text-[10px] text-white/40">Align to Each Other</label>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => alignToEachOther('left')} className={btnClass} title="Align Lefts">
              <AlignStartVertical size={14} className="mx-auto" />
            </button>
            <button onClick={() => alignToEachOther('center-h')} className={btnClass} title="Align Centers H">
              <AlignCenterVertical size={14} className="mx-auto" />
            </button>
            <button onClick={() => alignToEachOther('right')} className={btnClass} title="Align Rights">
              <AlignEndVertical size={14} className="mx-auto" />
            </button>
            <button onClick={() => alignToEachOther('top')} className={btnClass} title="Align Tops">
              <AlignStartHorizontal size={14} className="mx-auto" />
            </button>
            <button onClick={() => alignToEachOther('center-v')} className={btnClass} title="Align Centers V">
              <AlignCenterHorizontal size={14} className="mx-auto" />
            </button>
            <button onClick={() => alignToEachOther('bottom')} className={btnClass} title="Align Bottoms">
              <AlignEndHorizontal size={14} className="mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* Distribute — only when 3+ elements selected */}
      {selectedElementIds.length >= 3 && (
        <div>
          <label className="mb-1.5 block text-[10px] text-white/40">Distribute</label>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={distributeHorizontally} className={btnClass + ' text-[10px]'}>
              Horizontal
            </button>
            <button onClick={distributeVertically} className={btnClass + ' text-[10px]'}>
              Vertical
            </button>
          </div>
        </div>
      )}
    </SidebarSection>
  );
}
