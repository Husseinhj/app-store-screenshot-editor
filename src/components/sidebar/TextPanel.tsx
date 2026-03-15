import { useEffect, useCallback, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { fonts, fontWeights } from '@/lib/fonts';
import { SidebarSection } from './SidebarSection';
import { ColorPickerWithAlpha } from '../common/ColorPickerWithAlpha';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline as UnderlineIcon, ChevronDown, ChevronRight } from 'lucide-react';
import type { TextElement, TextEffects } from '@/store/types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import UnderlineExt from '@tiptap/extension-underline';
import { FontSize } from '@/lib/tiptap-font-size';

interface Props {
  element: TextElement;
}

export function TextPanel({ element }: Props) {
  const updateTextElement = useProjectStore((s) => s.updateTextElement);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false }),
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ['paragraph'] }),
      UnderlineExt,
      FontSize,
    ],
    content: element.content,
    onUpdate: ({ editor }) => {
      updateTextElement(element.id, { content: editor.getHTML() });
    },
  });

  // Sync content when switching between elements
  useEffect(() => {
    if (editor && editor.getHTML() !== element.content) {
      editor.commands.setContent(element.content);
    }
  }, [element.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFontSizeForSelection = useCallback(
    (size: number) => {
      if (!editor) return;
      editor.chain().focus().setFontSize(`${size}px`).run();
    },
    [editor]
  );

  const setColorForSelection = useCallback(
    (color: string) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
    },
    [editor]
  );

  const setFontFamilyForSelection = useCallback(
    (family: string) => {
      if (!editor) return;
      editor.chain().focus().setFontFamily(family).run();
    },
    [editor]
  );

  // Get current marks for toolbar state
  const isBold = editor?.isActive('bold') ?? false;
  const isItalic = editor?.isActive('italic') ?? false;
  const isUnderline = editor?.isActive('underline') ?? false;

  const toggleBtnClass = (active: boolean) =>
    `rounded-lg px-2 py-1.5 transition-colors ${
      active
        ? 'bg-accent/20 text-white ring-1 ring-accent/50'
        : 'bg-surface-700 text-white/50 hover:text-white'
    }`;

  return (
    <SidebarSection title="Text">
      {/* Rich text editor */}
      <div className="mb-3 rounded-lg bg-surface-700 ring-1 ring-white/10 focus-within:ring-accent/50 overflow-hidden">
        <EditorContent
          editor={editor}
          className="tiptap-editor px-3 py-2 text-xs text-white min-h-[60px] max-h-[120px] overflow-auto"
        />
      </div>

      {/* Formatting toolbar */}
      <div className="mb-3 flex gap-1">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={toggleBtnClass(isBold)}
          title="Bold"
        >
          <Bold size={13} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={toggleBtnClass(isItalic)}
          title="Italic"
        >
          <Italic size={13} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={toggleBtnClass(isUnderline)}
          title="Underline"
        >
          <UnderlineIcon size={13} />
        </button>
      </div>

      {/* Font family + weight */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] text-white/40">Font</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={element.fontFamily}
            onChange={(e) => {
              updateTextElement(element.id, { fontFamily: e.target.value });
              setFontFamilyForSelection(e.target.value);
            }}
            className="w-full rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          >
            {fonts.map((f) => (
              <option key={f.family} value={f.family}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={element.fontWeight}
            onChange={(e) => updateTextElement(element.id, { fontWeight: Number(e.target.value) })}
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

      {/* Font size */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] text-white/40">Base Size</label>
          <input
            type="number"
            value={element.fontSize}
            onChange={(e) => updateTextElement(element.id, { fontSize: Number(e.target.value) })}
            min={12}
            max={200}
            className="w-full rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] text-white/40">Selection Size</label>
          <input
            type="number"
            placeholder="—"
            min={8}
            max={400}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 0) setFontSizeForSelection(val);
            }}
            className="w-full rounded-lg bg-surface-700 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-accent/50"
          />
        </div>
      </div>

      {/* Line height */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] text-white/40">
          Line Height: {element.lineHeight}
        </label>
        <input
          type="range"
          min={0.8}
          max={2.0}
          step={0.05}
          value={element.lineHeight}
          onChange={(e) => updateTextElement(element.id, { lineHeight: Number(e.target.value) })}
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
              onClick={() => updateTextElement(element.id, { alignment: value })}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                element.alignment === value
                  ? 'bg-accent/20 text-white ring-1 ring-accent/50'
                  : 'bg-surface-700 text-white/50 hover:text-white'
              }`}
            >
              <Icon size={14} className="mx-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Color — element-level */}
      <ColorPickerWithAlpha
        label="Base Color"
        color={element.color}
        onChange={(color) => updateTextElement(element.id, { color })}
      />

      <div className="mt-2">
        <ColorPickerWithAlpha
          label="Selection Color"
          color={element.color}
          onChange={(color) => setColorForSelection(color)}
        />
      </div>

      {/* ─── Effects ─────────────────────────────────────────────────── */}
      <TextEffectsSection element={element} updateTextElement={updateTextElement} />
    </SidebarSection>
  );
}

// ─── Text Effects Sub-Section ──────────────────────────────────────────────

function TextEffectsSection({
  element,
  updateTextElement,
}: {
  element: TextElement;
  updateTextElement: (id: string, updates: Partial<Omit<TextElement, 'id' | 'type' | 'transform' | 'zIndex' | 'locked' | 'visible' | 'flipX' | 'flipY'>>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const effects = element.effects ?? {};

  const setEffects = (patch: Partial<TextEffects>) => {
    updateTextElement(element.id, { effects: { ...effects, ...patch } });
  };

  const clearEffect = (key: keyof TextEffects) => {
    const next = { ...effects };
    delete next[key];
    updateTextElement(element.id, { effects: next });
  };

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1 text-[11px] font-medium text-white/60 hover:text-white/80"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Effects
      </button>

      {expanded && (
        <div className="mt-2 space-y-3">
          {/* Shadow */}
          <EffectToggle
            label="Shadow"
            enabled={!!effects.shadow}
            onToggle={(on) =>
              on
                ? setEffects({ shadow: { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.5)' } })
                : clearEffect('shadow')
            }
          >
            {effects.shadow && (
              <div className="mt-1.5 space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-white/40">Offset X</label>
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      value={effects.shadow.offsetX}
                      onChange={(e) =>
                        setEffects({ shadow: { ...effects.shadow!, offsetX: Number(e.target.value) } })
                      }
                      className="w-full accent-accent"
                    />
                    <span className="text-[10px] text-white/40">{effects.shadow.offsetX}px</span>
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-white/40">Offset Y</label>
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      value={effects.shadow.offsetY}
                      onChange={(e) =>
                        setEffects({ shadow: { ...effects.shadow!, offsetY: Number(e.target.value) } })
                      }
                      className="w-full accent-accent"
                    />
                    <span className="text-[10px] text-white/40">{effects.shadow.offsetY}px</span>
                  </div>
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] text-white/40">Blur: {effects.shadow.blur}px</label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={effects.shadow.blur}
                    onChange={(e) =>
                      setEffects({ shadow: { ...effects.shadow!, blur: Number(e.target.value) } })
                    }
                    className="w-full accent-accent"
                  />
                </div>
                <ColorPickerWithAlpha
                  label="Shadow Color"
                  color={effects.shadow.color}
                  onChange={(color) => setEffects({ shadow: { ...effects.shadow!, color } })}
                />
              </div>
            )}
          </EffectToggle>

          {/* Glow */}
          <EffectToggle
            label="Glow"
            enabled={!!effects.glow}
            onToggle={(on) =>
              on
                ? setEffects({ glow: { blur: 10, color: 'rgba(99,102,241,0.8)' } })
                : clearEffect('glow')
            }
          >
            {effects.glow && (
              <div className="mt-1.5 space-y-1.5">
                <div>
                  <label className="mb-0.5 block text-[10px] text-white/40">Blur: {effects.glow.blur}px</label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={effects.glow.blur}
                    onChange={(e) =>
                      setEffects({ glow: { ...effects.glow!, blur: Number(e.target.value) } })
                    }
                    className="w-full accent-accent"
                  />
                </div>
                <ColorPickerWithAlpha
                  label="Glow Color"
                  color={effects.glow.color}
                  onChange={(color) => setEffects({ glow: { ...effects.glow!, color } })}
                />
              </div>
            )}
          </EffectToggle>

          {/* Stroke / Outline */}
          <EffectToggle
            label="Outline"
            enabled={!!effects.stroke}
            onToggle={(on) =>
              on
                ? setEffects({ stroke: { width: 1, color: '#000000' } })
                : clearEffect('stroke')
            }
          >
            {effects.stroke && (
              <div className="mt-1.5 space-y-1.5">
                <div>
                  <label className="mb-0.5 block text-[10px] text-white/40">Width: {effects.stroke.width}px</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={effects.stroke.width}
                    onChange={(e) =>
                      setEffects({ stroke: { ...effects.stroke!, width: Number(e.target.value) } })
                    }
                    className="w-full accent-accent"
                  />
                </div>
                <ColorPickerWithAlpha
                  label="Stroke Color"
                  color={effects.stroke.color}
                  onChange={(color) => setEffects({ stroke: { ...effects.stroke!, color } })}
                />
              </div>
            )}
          </EffectToggle>

          {/* Gradient Fill */}
          <EffectToggle
            label="Gradient Fill"
            enabled={!!effects.gradientFill}
            onToggle={(on) =>
              on
                ? setEffects({
                    gradientFill: {
                      angle: 135,
                      stops: [
                        { color: '#6366f1', position: 0 },
                        { color: '#a855f7', position: 100 },
                      ],
                    },
                  })
                : clearEffect('gradientFill')
            }
          >
            {effects.gradientFill && (
              <div className="mt-1.5 space-y-1.5">
                <div>
                  <label className="mb-0.5 block text-[10px] text-white/40">
                    Angle: {effects.gradientFill.angle}&deg;
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={effects.gradientFill.angle}
                    onChange={(e) =>
                      setEffects({
                        gradientFill: { ...effects.gradientFill!, angle: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-accent"
                  />
                </div>
                <ColorPickerWithAlpha
                  label="Stop 1"
                  color={effects.gradientFill.stops[0]?.color ?? '#6366f1'}
                  onChange={(color) => {
                    const stops = [...effects.gradientFill!.stops];
                    stops[0] = { ...stops[0], color };
                    setEffects({ gradientFill: { ...effects.gradientFill!, stops } });
                  }}
                />
                <ColorPickerWithAlpha
                  label="Stop 2"
                  color={effects.gradientFill.stops[1]?.color ?? '#a855f7'}
                  onChange={(color) => {
                    const stops = [...effects.gradientFill!.stops];
                    stops[1] = { ...stops[1], color };
                    setEffects({ gradientFill: { ...effects.gradientFill!, stops } });
                  }}
                />
              </div>
            )}
          </EffectToggle>

          {/* Letter Spacing */}
          <div>
            <label className="mb-0.5 block text-[10px] text-white/40">
              Letter Spacing: {effects.letterSpacing ?? 0}px
            </label>
            <input
              type="range"
              min={-5}
              max={20}
              step={0.5}
              value={effects.letterSpacing ?? 0}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val === 0) {
                  clearEffect('letterSpacing');
                } else {
                  setEffects({ letterSpacing: val });
                }
              }}
              className="w-full accent-accent"
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="mb-0.5 block text-[10px] text-white/40">
              Opacity: {Math.round((effects.opacity ?? 1) * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((effects.opacity ?? 1) * 100)}
              onChange={(e) => {
                const val = Number(e.target.value) / 100;
                if (val === 1) {
                  clearEffect('opacity');
                } else {
                  setEffects({ opacity: val });
                }
              }}
              className="w-full accent-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EffectToggle({
  label,
  enabled,
  onToggle,
  children,
}: {
  label: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10px] text-white/40">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-accent"
        />
        {label}
      </label>
      {children}
    </div>
  );
}
