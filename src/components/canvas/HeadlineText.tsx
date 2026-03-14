import type { TextConfig } from '@/store/types';

interface Props {
  text: TextConfig;
  maxWidth: number;
}

export function HeadlineText({ text, maxWidth }: Props) {
  return (
    <div
      style={{
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        fontWeight: text.fontWeight,
        color: text.color,
        textAlign: text.alignment,
        lineHeight: text.lineHeight,
        maxWidth,
        width: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text.content}
    </div>
  );
}
