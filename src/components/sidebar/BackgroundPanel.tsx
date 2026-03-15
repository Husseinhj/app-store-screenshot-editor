import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import { ColorPickerWithAlpha } from '../common/ColorPickerWithAlpha';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { BackgroundType, GradientConfig } from '@/store/types';

const bgTypes: { value: BackgroundType; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
];

const presetGradients: GradientConfig[] = [
  { angle: 135, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
  { angle: 135, stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }] },
  { angle: 135, stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }] },
  { angle: 135, stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 100 }] },
  { angle: 135, stops: [{ color: '#fa709a', position: 0 }, { color: '#fee140', position: 100 }] },
  { angle: 135, stops: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 100 }] },
  { angle: 135, stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
  { angle: 135, stops: [{ color: '#0c0c0c', position: 0 }, { color: '#1a1a2e', position: 100 }] },
  { angle: 180, stops: [{ color: '#1CB5E0', position: 0 }, { color: '#000046', position: 100 }] },
  { angle: 135, stops: [{ color: '#FF512F', position: 0 }, { color: '#F09819', position: 100 }] },
  { angle: 135, stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }] },
  { angle: 135, stops: [{ color: '#ee0979', position: 0 }, { color: '#ff6a00', position: 100 }] },
];

const presetSolids = [
  'transparent', '#000000', '#1a1a2e', '#16213e',
  '#0f3460', '#533483', '#e94560', '#0f4c75',
  '#3282b8', '#1b262c', '#2d4059', '#ea5455',
];

export function BackgroundPanel() {
  const selectedId = useProjectStore((s) => s.project.selectedScreenshotId);
  const screenshots = useProjectStore((s) => s.project.screenshotsByPlatform[s.project.platform] ?? []);
  const updateBackground = useProjectStore((s) => s.updateBackground);

  const selected = screenshots.find((s: any) => s.id === selectedId);
  if (!selected) return null;

  const { background } = selected;

  const onDropBgImage = useCallback(
    (files: File[]) => {
      if (!files[0]) return;
      const reader = new FileReader();
      reader.onload = () => {
        updateBackground({ type: 'image', imageUrl: reader.result as string });
      };
      reader.readAsDataURL(files[0]);
    },
    [updateBackground]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropBgImage,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  return (
    <SidebarSection title="Background">
      {/* Type toggle */}
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-surface-700 p-1">
        {bgTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => updateBackground({ type: t.value })}
            className={`rounded-md py-1.5 text-[10px] font-medium transition-colors ${
              background.type === t.value
                ? 'bg-accent text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Solid color */}
      {background.type === 'solid' && (
        <div>
          <label className="mb-1.5 block text-[10px] text-white/40">Presets</label>
          <div className="mb-3 grid grid-cols-6 gap-1.5">
            {presetSolids.map((color) => (
              <button
                key={color}
                onClick={() => updateBackground({ solidColor: color })}
                className={`h-7 rounded-lg ring-1 transition-all ${
                  background.solidColor === color ? 'ring-accent ring-2' : 'ring-white/10 hover:ring-white/30'
                }`}
                style={{
                  backgroundColor: color === 'transparent' ? 'transparent' : color,
                  backgroundImage:
                    color === 'transparent'
                      ? 'linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)'
                      : undefined,
                  backgroundSize: color === 'transparent' ? '8px 8px' : undefined,
                  backgroundPosition: color === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
                }}
              />
            ))}
          </div>
          <ColorPickerWithAlpha
            color={background.solidColor}
            onChange={(color) => updateBackground({ solidColor: color })}
          />
        </div>
      )}

      {/* Gradient */}
      {background.type === 'gradient' && (
        <div>
          {/* Presets */}
          <label className="mb-1.5 block text-[10px] text-white/40">Presets</label>
          <div className="mb-3 grid grid-cols-4 gap-1.5">
            {presetGradients.map((g, i) => (
              <button
                key={i}
                onClick={() => updateBackground({ gradient: { ...g, stops: g.stops.map(s => ({...s})) } })}
                className="h-8 rounded-lg ring-1 ring-white/10 hover:ring-white/30 transition-all"
                style={{
                  background: `linear-gradient(${g.angle}deg, ${g.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`,
                }}
              />
            ))}
          </div>

          {/* Angle */}
          <div className="mb-3">
            <label className="mb-1 block text-[10px] text-white/40">
              Angle: {background.gradient.angle}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={background.gradient.angle}
              onChange={(e) =>
                updateBackground({
                  gradient: { ...background.gradient, angle: Number(e.target.value) },
                })
              }
              className="w-full accent-accent"
            />
          </div>

          {/* Color stops */}
          <div className="space-y-3">
            {background.gradient.stops.map((stop, i) => (
              <ColorPickerWithAlpha
                key={i}
                label={`Stop ${i + 1} (${stop.position}%)`}
                color={stop.color}
                onChange={(color) => {
                  const newStops = [...background.gradient.stops];
                  newStops[i] = { ...newStops[i], color };
                  updateBackground({ gradient: { ...background.gradient, stops: newStops } });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image */}
      {background.type === 'image' && (
        <div
          {...getRootProps()}
          className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/20 hover:border-white/40"
        >
          <input {...getInputProps()} />
          {background.imageUrl ? (
            <img
              src={background.imageUrl}
              alt="Background"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <p className="text-xs text-white/40">Drop background image</p>
          )}
        </div>
      )}
    </SidebarSection>
  );
}
