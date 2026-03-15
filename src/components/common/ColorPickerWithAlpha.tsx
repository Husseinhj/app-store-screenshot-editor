import { RgbaStringColorPicker } from 'react-colorful';
import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

type ColorFormat = 'hex' | 'rgba' | 'hsla';

// ─── Color conversion helpers ─────────────────────────────────────────────────

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) || 0;
  const g = parseInt(cleaned.slice(2, 4), 16) || 0;
  const b = parseInt(cleaned.slice(4, 6), 16) || 0;
  const a = cleaned.length === 8 ? parseInt(cleaned.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function parseRgba(color: string): { r: number; g: number; b: number; a: number } {
  if (color === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  // Try rgba/rgb
  const match = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (match) {
    return {
      r: Math.round(Number(match[1])),
      g: Math.round(Number(match[2])),
      b: Math.round(Number(match[3])),
      a: match[4] !== undefined ? Number(match[4]) : 1,
    };
  }
  // Try hsla/hsl
  const hslaMatch = color.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hslaMatch) {
    return hslaToRgba(
      Number(hslaMatch[1]),
      Number(hslaMatch[2]),
      Number(hslaMatch[3]),
      hslaMatch[4] !== undefined ? Number(hslaMatch[4]) : 1
    );
  }
  // Fallback: try hex
  if (color.startsWith('#')) return hexToRgba(color);
  return { r: 0, g: 0, b: 0, a: 1 };
}

function rgbaToString(c: { r: number; g: number; b: number; a: number }): string {
  if (c.a === 1) return rgbaToHex(c);
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

function rgbaToHex(c: { r: number; g: number; b: number; a: number }): string {
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  if (c.a < 1) {
    return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}${hex(Math.round(c.a * 255))}`;
  }
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`;
}

function rgbaToHsla(c: { r: number; g: number; b: number; a: number }): { h: number; s: number; l: number; a: number } {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: c.a,
  };
}

function hslaToRgba(h: number, s: number, l: number, a: number): { r: number; g: number; b: number; a: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
}

function toRgbaString(color: string): string {
  const c = parseRgba(color);
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

function formatColor(c: { r: number; g: number; b: number; a: number }, format: ColorFormat): string {
  switch (format) {
    case 'hex':
      return rgbaToHex(c);
    case 'rgba':
      return c.a < 1 ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})` : `rgb(${c.r}, ${c.g}, ${c.b})`;
    case 'hsla': {
      const hsla = rgbaToHsla(c);
      return hsla.a < 1
        ? `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`
        : `hsl(${hsla.h}, ${hsla.s}%, ${hsla.l}%)`;
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ColorPickerWithAlpha({ color, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ColorFormat>('hex');
  const [textValue, setTextValue] = useState('');
  const swatchRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Sync text input with incoming color prop
  useEffect(() => {
    if (color === 'transparent') {
      setTextValue('transparent');
    } else {
      const parsed = parseRgba(color);
      setTextValue(formatColor(parsed, format));
    }
  }, [color, format]);

  // Calculate popover position when opening
  useEffect(() => {
    if (open && swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      const popoverWidth = 240;
      const popoverHeight = 320;

      let top = rect.bottom + 6;
      let left = rect.left;

      // Ensure popover stays within viewport
      if (top + popoverHeight > window.innerHeight) {
        top = rect.top - popoverHeight - 6;
      }
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 8;
      }
      if (left < 8) left = 8;

      setPopoverPos({ top, left });
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        swatchRef.current && !swatchRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const handlePickerChange = useCallback(
    (rgbaStr: string) => {
      const c = parseRgba(rgbaStr);
      onChange(rgbaToString(c));
    },
    [onChange]
  );

  const handleTextCommit = useCallback(() => {
    const v = textValue.trim();
    if (v === 'transparent') {
      onChange('transparent');
      return;
    }
    const c = parseRgba(v);
    onChange(rgbaToString(c));
  }, [textValue, onChange]);

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      const c = parseRgba(color);
      c.a = Math.round(opacity) / 100;
      onChange(rgbaToString(c));
    },
    [color, onChange]
  );

  const parsed = parseRgba(color);
  const opacityPercent = Math.round(parsed.a * 100);
  const rgbaStr = toRgbaString(color);

  // Checkerboard pattern for transparent preview
  const swatchStyle: React.CSSProperties = {
    backgroundColor: color === 'transparent' ? 'transparent' : color,
    backgroundImage:
      parsed.a < 1
        ? 'linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)'
        : undefined,
    backgroundSize: parsed.a < 1 ? '8px 8px' : undefined,
    backgroundPosition: parsed.a < 1 ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
  };

  return (
    <div>
      {label && <label className="mb-1 block text-[10px] text-white/40">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          ref={swatchRef}
          onClick={() => setOpen(!open)}
          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20"
          style={swatchStyle}
        >
          {parsed.a < 1 && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
            />
          )}
        </button>
        <input
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={handleTextCommit}
          onKeyDown={(e) => e.key === 'Enter' && handleTextCommit()}
          className="w-32 rounded-lg bg-surface-700 px-2 py-1.5 text-[11px] text-white outline-none ring-1 ring-white/10 focus:ring-accent/50 font-mono"
        />
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as ColorFormat)}
          className="rounded-lg bg-surface-700 px-1 py-1.5 text-[10px] text-white/60 outline-none ring-1 ring-white/10 cursor-pointer"
        >
          <option value="hex">HEX</option>
          <option value="rgba">RGBA</option>
          <option value="hsla">HSLA</option>
        </select>
      </div>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[99999] rounded-xl bg-surface-800 p-3 shadow-2xl ring-1 ring-white/10"
            style={{
              top: popoverPos.top,
              left: popoverPos.left,
              width: 240,
            }}
          >
            <RgbaStringColorPicker
              color={rgbaStr}
              onChange={handlePickerChange}
              style={{ width: '100%' }}
            />
            <div className="mt-3 flex items-center gap-2">
              <label className="text-[10px] text-white/40 shrink-0">Opacity</label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={opacityPercent}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="text-[10px] text-white/50 w-8 text-right">{opacityPercent}%</span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
