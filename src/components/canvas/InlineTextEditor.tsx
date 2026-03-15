import { useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import UnderlineExt from '@tiptap/extension-underline';
import { FontSize } from '@/lib/tiptap-font-size';
import { getTextEffectStyles } from '@/lib/textEffects';
import type { TextElement } from '@/store/types';

interface Props {
  element: TextElement;
  pixelWidth: number;
  pixelHeight: number;
}

export function InlineTextEditor({ element, pixelWidth, pixelHeight }: Props) {
  const updateTextElement = useProjectStore((s) => s.updateTextElement);
  const setEditingTextElement = useProjectStore((s) => s.setEditingTextElement);

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
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      updateTextElement(element.id, { content: editor.getHTML() });
    },
  });

  // Handle blur and escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setEditingTextElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [setEditingTextElement]);

  return (
    <div
      className="inline-text-editor"
      style={{
        width: pixelWidth,
        height: pixelHeight,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        color: element.color,
        textAlign: element.alignment,
        lineHeight: element.lineHeight,
        overflow: 'hidden',
        cursor: 'text',
        ...getTextEffectStyles(element.effects),
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <EditorContent
        editor={editor}
        className="inline-tiptap-editor"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
