import type { TextEffects } from '@/store/types';
import type React from 'react';

export function getTextEffectStyles(effects?: TextEffects): React.CSSProperties {
  if (!effects) return {};
  const style: React.CSSProperties = {};
  const shadows: string[] = [];

  if (effects.shadow) {
    shadows.push(`${effects.shadow.offsetX}px ${effects.shadow.offsetY}px ${effects.shadow.blur}px ${effects.shadow.color}`);
  }
  if (effects.glow) {
    shadows.push(`0 0 ${effects.glow.blur}px ${effects.glow.color}`);
    shadows.push(`0 0 ${effects.glow.blur * 2}px ${effects.glow.color}`);
  }
  if (shadows.length > 0) {
    style.textShadow = shadows.join(', ');
  }
  if (effects.stroke) {
    style.WebkitTextStroke = `${effects.stroke.width}px ${effects.stroke.color}`;
  }
  if (effects.gradientFill) {
    const stops = effects.gradientFill.stops.map(s => `${s.color} ${s.position}%`).join(', ');
    style.background = `linear-gradient(${effects.gradientFill.angle}deg, ${stops})`;
    style.WebkitBackgroundClip = 'text';
    style.WebkitTextFillColor = 'transparent';
    style.backgroundClip = 'text';
  }
  if (effects.opacity !== undefined) {
    style.opacity = effects.opacity;
  }
  if (effects.letterSpacing !== undefined) {
    style.letterSpacing = `${effects.letterSpacing}px`;
  }
  return style;
}
