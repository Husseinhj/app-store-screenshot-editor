import type { TextConfig, TextEffects } from '@/store/types';
import { getTextEffectStyles } from '@/lib/textEffects';

interface Props {
  text: TextConfig;
  maxWidth: number;
  effects?: TextEffects;
}

export function HeadlineText({ text, maxWidth, effects }: Props) {
  // Check if content contains HTML tags (rich text)
  const isHtml = /<[a-z][\s\S]*>/i.test(text.content);

  const gradientExportData = effects?.gradientFill
    ? JSON.stringify({
        angle: effects.gradientFill.angle,
        stops: effects.gradientFill.stops,
      })
    : undefined;

  return (
    <div
      className="headline-rich-text"
      data-gradient-export={gradientExportData}
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
        ...getTextEffectStyles(effects),
      }}
      {...(isHtml
        ? { dangerouslySetInnerHTML: { __html: text.content } }
        : { children: text.content })}
    />
  );
}
