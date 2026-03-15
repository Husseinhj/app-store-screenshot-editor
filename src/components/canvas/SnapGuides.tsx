import { useProjectStore } from '@/store/useProjectStore';

interface Props {
  canvasWidth: number;
  canvasHeight: number;
}

export function SnapGuides({ canvasWidth, canvasHeight }: Props) {
  const snapGuides = useProjectStore((s) => s.snapGuides);

  if (snapGuides.length === 0) return null;

  return (
    <>
      {snapGuides.map((guide, i) => {
        if (guide.type === 'vertical') {
          const x = (guide.position / 100) * canvasWidth;
          return (
            <div
              key={`v-${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: 0,
                width: 1,
                height: canvasHeight,
                backgroundColor: '#f0abfc',
                opacity: 0.7,
                pointerEvents: 'none',
                zIndex: 9998,
              }}
            />
          );
        } else {
          const y = (guide.position / 100) * canvasHeight;
          return (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                top: y,
                width: canvasWidth,
                height: 1,
                backgroundColor: '#f0abfc',
                opacity: 0.7,
                pointerEvents: 'none',
                zIndex: 9998,
              }}
            />
          );
        }
      })}
    </>
  );
}
