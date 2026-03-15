import type { TextConfig } from '@/store/types';

interface Props {
  text: TextConfig;
  maxWidth: number;
}

export function HeadlineText({ text, maxWidth }: Props) {
  // Check if content contains HTML tags (rich text)
  const isHtml = /<[a-z][\s\S]*>/i.test(text.content);

  return (
    <div
      className="headline-rich-text"
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
      {...(isHtml
        ? { dangerouslySetInnerHTML: { __html: text.content } }
        : { children: text.content })}
    />
  );
}
