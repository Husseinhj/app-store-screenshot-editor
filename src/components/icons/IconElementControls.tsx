import { useProjectStore } from '@/store/useProjectStore';
import { ColorPickerWithAlpha } from '../common/ColorPickerWithAlpha';
import type { CanvasElement, ImageElement, TextElement, ShapeElement } from '@/store/types';
import { Maximize, AlignCenter } from 'lucide-react';

export function IconElementControls() {
  const selectedIds = useProjectStore((s) => s.selectedAppIconElementIds);
  const elements = useProjectStore((s) => s.appIconProject.elements);
  const updateTransform = useProjectStore((s) => s.updateAppIconElementTransform);
  const updateElement = useProjectStore((s) => s.updateAppIconElement);

  if (selectedIds.length !== 1) return null;

  const element = elements.find((e) => e.id === selectedIds[0]);
  if (!element) return null;

  const { transform } = element;

  // Compute current padding (only if element is symmetrically placed)
  const currentPadding = Math.min(
    transform.x,
    transform.y,
    100 - transform.x - transform.width,
    100 - transform.y - transform.height
  );
  const paddingValue = Math.max(0, Math.round(currentPadding));

  const applyPadding = (padding: number) => {
    updateTransform(element.id, {
      x: padding,
      y: padding,
      width: 100 - 2 * padding,
      height: 100 - 2 * padding,
    });
  };

  const fitToCanvas = () => {
    updateTransform(element.id, { x: 0, y: 0, width: 100, height: 100 });
  };

  const centerElement = () => {
    updateTransform(element.id, {
      x: (100 - transform.width) / 2,
      y: (100 - transform.height) / 2,
    });
  };

  return (
    <div className="border-b border-white/[0.06] px-3 py-2.5">
      <h3 className="mb-2 text-[11px] font-medium text-white/60">Element Properties</h3>

      {/* Quick padding */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-white/40">
          Padding: {paddingValue}%
        </label>
        <input
          type="range"
          min={0}
          max={40}
          value={paddingValue}
          onChange={(e) => applyPadding(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {/* Position & Size */}
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        <NumberField label="X" value={transform.x} onChange={(v) => updateTransform(element.id, { x: v })} />
        <NumberField label="Y" value={transform.y} onChange={(v) => updateTransform(element.id, { y: v })} />
        <NumberField label="W" value={transform.width} onChange={(v) => updateTransform(element.id, { width: v })} />
        <NumberField label="H" value={transform.height} onChange={(v) => updateTransform(element.id, { height: v })} />
      </div>

      {/* Quick actions */}
      <div className="mb-3 flex gap-1.5">
        <button
          onClick={fitToCanvas}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-surface-700 py-1.5 text-[11px] text-white/60 hover:bg-surface-600 hover:text-white/80 transition-colors"
        >
          <Maximize size={12} />
          Fill
        </button>
        <button
          onClick={centerElement}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-surface-700 py-1.5 text-[11px] text-white/60 hover:bg-surface-600 hover:text-white/80 transition-colors"
        >
          <AlignCenter size={12} />
          Center
        </button>
      </div>

      {/* Type-specific controls */}
      {element.type === 'image' && (
        <ImageControls element={element as ImageElement} onUpdate={(u) => updateElement(element.id, u)} />
      )}
      {element.type === 'text' && (
        <TextControls element={element as TextElement} onUpdate={(u) => updateElement(element.id, u)} />
      )}
      {element.type === 'shape' && (
        <ShapeControls element={element as ShapeElement} onUpdate={(u) => updateElement(element.id, u)} />
      )}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-0.5 block text-[9px] text-white/30">{label}</label>
      <input
        type="number"
        value={Math.round(value * 10) / 10}
        onChange={(e) => onChange(Number(e.target.value))}
        step={0.5}
        className="w-full rounded bg-surface-700 px-1.5 py-1 text-[11px] text-white/80 border border-white/[0.06] focus:border-accent/50 focus:outline-none"
      />
    </div>
  );
}

function ImageControls({ element, onUpdate }: { element: ImageElement; onUpdate: (u: Partial<CanvasElement>) => void }) {
  return (
    <div className="space-y-2">
      {/* Opacity */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">
          Opacity: {Math.round((element.opacity ?? 1) * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((element.opacity ?? 1) * 100)}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) / 100 } as any)}
          className="w-full accent-accent"
        />
      </div>

      {/* Object fit */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">Fit</label>
        <div className="grid grid-cols-3 gap-1 rounded bg-surface-700 p-0.5">
          {(['cover', 'contain', 'fill'] as const).map((fit) => (
            <button
              key={fit}
              onClick={() => onUpdate({ objectFit: fit } as any)}
              className={`rounded py-1 text-[10px] font-medium transition-colors ${
                element.objectFit === fit
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">
          Corner Radius: {element.borderRadius ?? 0}px
        </label>
        <input
          type="range"
          min={0}
          max={512}
          value={element.borderRadius ?? 0}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) } as any)}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}

function TextControls({ element, onUpdate }: { element: TextElement; onUpdate: (u: Partial<CanvasElement>) => void }) {
  return (
    <div className="space-y-2">
      {/* Font size */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">
          Font Size: {element.fontSize}px
        </label>
        <input
          type="range"
          min={12}
          max={512}
          value={element.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) } as any)}
          className="w-full accent-accent"
        />
      </div>

      {/* Font weight */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">Weight</label>
        <div className="grid grid-cols-3 gap-1 rounded bg-surface-700 p-0.5">
          {([400, 600, 700] as const).map((w) => (
            <button
              key={w}
              onClick={() => onUpdate({ fontWeight: w } as any)}
              className={`rounded py-1 text-[10px] font-medium transition-colors ${
                element.fontWeight === w
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {w === 400 ? 'Regular' : w === 600 ? 'Semi' : 'Bold'}
            </button>
          ))}
        </div>
      </div>

      {/* Text color */}
      <ColorPickerWithAlpha
        label="Text Color"
        color={element.color}
        onChange={(color) => onUpdate({ color } as any)}
      />
    </div>
  );
}

function ShapeControls({ element, onUpdate }: { element: ShapeElement; onUpdate: (u: Partial<CanvasElement>) => void }) {
  return (
    <div className="space-y-2">
      {/* Border radius */}
      {element.shapeType === 'rectangle' && (
        <div>
          <label className="mb-1 block text-[11px] text-white/40">
            Corner Radius: {element.borderRadius}px
          </label>
          <input
            type="range"
            min={0}
            max={512}
            value={element.borderRadius}
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) } as any)}
            className="w-full accent-accent"
          />
        </div>
      )}

      {/* Fill color */}
      <ColorPickerWithAlpha
        label="Fill"
        color={element.fillColor}
        onChange={(color) => onUpdate({ fillColor: color } as any)}
      />

      {/* Stroke */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">
          Stroke: {element.strokeWidth}px
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={element.strokeWidth}
          onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) } as any)}
          className="w-full accent-accent"
        />
      </div>
      {element.strokeWidth > 0 && (
        <ColorPickerWithAlpha
          label="Stroke Color"
          color={element.strokeColor}
          onChange={(color) => onUpdate({ strokeColor: color } as any)}
        />
      )}
    </div>
  );
}
