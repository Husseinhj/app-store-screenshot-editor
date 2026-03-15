import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import { ColorPickerWithAlpha } from '../common/ColorPickerWithAlpha';
import type { ShapeElement, ShapeType } from '@/store/types';
import { Square, Circle, Minus, ArrowRight } from 'lucide-react';

interface Props {
  element: ShapeElement;
}

const shapeTypes: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
  { type: 'rectangle', icon: <Square size={14} />, label: 'Rect' },
  { type: 'circle', icon: <Circle size={14} />, label: 'Circle' },
  { type: 'line', icon: <Minus size={14} />, label: 'Line' },
  { type: 'arrow', icon: <ArrowRight size={14} />, label: 'Arrow' },
];

export function ShapePanel({ element }: Props) {
  const updateShapeElement = useProjectStore((s) => s.updateShapeElement);

  return (
    <SidebarSection title="Shape">
      {/* Shape type selector */}
      <div className="mb-3">
        <label className="mb-1.5 block text-[11px] text-white/40">Type</label>
        <div className="grid grid-cols-4 gap-1 rounded bg-surface-700 p-0.5">
          {shapeTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => updateShapeElement(element.id, { shapeType: type })}
              className={`flex flex-col items-center gap-0.5 rounded py-1 text-[9px] font-medium transition-colors ${
                element.shapeType === type
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Corner radius (rectangle only) */}
      {element.shapeType === 'rectangle' && (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] text-white/40">
            Corner Radius: {element.borderRadius ?? 0}px
          </label>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={element.borderRadius ?? 0}
            onChange={(e) => updateShapeElement(element.id, { borderRadius: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>
      )}

      {/* Fill color */}
      <div className="mb-3">
        <ColorPickerWithAlpha
          label="Fill"
          color={element.fillColor}
          onChange={(color) => updateShapeElement(element.id, { fillColor: color })}
        />
      </div>

      {/* Stroke color */}
      <div className="mb-3">
        <ColorPickerWithAlpha
          label="Stroke"
          color={element.strokeColor}
          onChange={(color) => updateShapeElement(element.id, { strokeColor: color })}
        />
      </div>

      {/* Stroke width */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-white/40">
          Stroke Width: {element.strokeWidth}px
        </label>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={element.strokeWidth}
          onChange={(e) => updateShapeElement(element.id, { strokeWidth: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      {/* Opacity */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-white/40">
          Opacity: {Math.round((element.opacity ?? 1) * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round((element.opacity ?? 1) * 100)}
          onChange={(e) => updateShapeElement(element.id, { opacity: Number(e.target.value) / 100 })}
          className="w-full accent-accent"
        />
      </div>

      {/* Backdrop blur (rectangle + circle only) */}
      {(element.shapeType === 'rectangle' || element.shapeType === 'circle') && (
        <div>
          <label className="mb-1 block text-[11px] text-white/40">
            Backdrop Blur: {element.blur ?? 0}px
          </label>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={element.blur ?? 0}
            onChange={(e) => updateShapeElement(element.id, { blur: Number(e.target.value) })}
            className="w-full accent-accent"
          />
          {(element.blur ?? 0) > 0 && (
            <p className="mt-1 text-[9px] text-white/25">Glass effect — blurs content behind the shape</p>
          )}
        </div>
      )}
    </SidebarSection>
  );
}
