import type { BackgroundConfig } from '@/store/types';

interface Props {
  background: BackgroundConfig;
  width: number;
  height: number;
}

export function BackgroundLayer({ background, width, height }: Props) {
  let style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width,
    height,
  };

  switch (background.type) {
    case 'solid':
      style.backgroundColor = background.solidColor;
      break;
    case 'gradient': {
      const stops = background.gradient.stops
        .map((s) => `${s.color} ${s.position}%`)
        .join(', ');
      style.background = `linear-gradient(${background.gradient.angle}deg, ${stops})`;
      break;
    }
    case 'image':
      if (background.imageUrl) {
        style.backgroundImage = `url(${background.imageUrl})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
      }
      break;
  }

  return <div data-canvas-bg="true" style={style} />;
}
