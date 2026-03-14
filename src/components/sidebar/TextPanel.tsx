import { useProjectStore } from '@/store/useProjectStore';
import { fonts, fontWeights } from '@/lib/fonts';
import { SidebarSection } from './SidebarSection';
import { HexColorPicker } from 'react-colorful';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState } from 'react';

export function TextPanel() {
  const selectedId = useProjectStore((s) => s.project.selectedScreenshotId);
  const screenshots = useProjectStore((s) => s.project.screenshotsByPlatform[s.project.platform] ?? []);
  const updateText = useProjectStore((s) => s.updateText);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const selected = screenshots.find((s: any) => s.id === selectedId);
  if (!selected) return null;

  const { text } = selected;

  return (
    <SidebarSection title="Text">
      {/* Content */}
      <textarea
        value={text.content}
        onChange={(e) => updateText({ content: e.target.value })}
        placeholder="Enter headline..."
        rows={2}
        className="mb-3 w-full resize-none rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50 placeholder:text-white/30"
      />

      {/* Font family */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] text-white/40">Font</label>
        <select
          value={text.fontFamily}
          onChange={(e) => updateText({ fontFamily: e.target.value })}
          className="w-full rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
        >
          {fonts.map((f) => (
            <option key={f.family} value={f.family}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font size & weight */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] text-white/40">Size</label>
          <input
            type="number"
            value={text.fontSize}
            onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
            min={12}
            max={200}
            className="w-full rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">Weight</label>
          <select
            value={text.fontWeight}
            onChange={(e) => updateText({ fontWeight: Number(e.target.value) })}
            className="w-full rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          >
            {fontWeights.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Line height */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] text-white/40">
          Line Height: {text.lineHeight}
        </label>
        <input
          type="range"
          min={0.8}
          max={2.0}
          step={0.05}
          value={text.lineHeight}
          onChange={(e) => updateText({ lineHeight: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      {/* Alignment */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] text-white/40">Alignment</label>
        <div className="flex gap-1">
          {[
            { value: 'left' as const, icon: AlignLeft },
            { value: 'center' as const, icon: AlignCenter },
            { value: 'right' as const, icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateText({ alignment: value })}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                text.alignment === value
                  ? 'bg-accent/20 text-white ring-1 ring-accent/50'
                  : 'bg-surface-700 text-white/50 hover:text-white'
              }`}
            >
              <Icon size={14} className="mx-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="mb-1 block text-[10px] text-white/40">Color</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/20"
            style={{ backgroundColor: text.color }}
          />
          <input
            type="text"
            value={text.color}
            onChange={(e) => updateText({ color: e.target.value })}
            className="flex-1 rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
        {showColorPicker && (
          <div className="mt-2">
            <HexColorPicker
              color={text.color}
              onChange={(color) => updateText({ color })}
            />
          </div>
        )}
      </div>
    </SidebarSection>
  );
}
