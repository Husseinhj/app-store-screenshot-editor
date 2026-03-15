import { useEffect, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { fonts, fontWeights } from '@/lib/fonts';
import { SidebarSection } from './SidebarSection';
import { ColorPickerWithAlpha } from '../common/ColorPickerWithAlpha';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import type { TextElement } from '@/store/types';
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
    </SidebarSection>
  );
}
