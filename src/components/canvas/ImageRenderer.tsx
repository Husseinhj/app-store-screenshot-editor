import type { ImageElement } from '@/store/types';
import { ImagePlus } from 'lucide-react';

interface Props {
  element: ImageElement;
  width: number;
  height: number;
}

export function ImageRenderer({ element, width, height }: Props) {
  return (
    <div
      style={{
        width,
        height,
        opacity: element.opacity,
        borderRadius: element.borderRadius,
        overflow: 'hidden',
      }}
    >
      {element.imageUrl ? (
        <img
          src={element.imageUrl}
          alt="Image"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: element.objectFit,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black/30">
          <div className="text-center text-white/30">
            <ImagePlus size={Math.max(16, width * 0.08)} className="mx-auto mb-1" />
            <p style={{ fontSize: Math.max(8, width * 0.03) }}>Image</p>
          </div>
        </div>
      )}
    </div>
  );
}
