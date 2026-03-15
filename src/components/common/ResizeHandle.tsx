import { useCallback, useRef } from 'react';

interface Props {
  side: 'left' | 'right';
  onResize: (delta: number) => void;
  onDoubleClick: () => void;
}

export function ResizeHandle({ side, onResize, onDoubleClick }: Props) {
  const rafRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;

      const handleMouseMove = (ev: MouseEvent) => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const delta = ev.clientX - startX;
          // For left panel, positive delta = wider; for right panel, negative delta = wider
          onResize(side === 'left' ? delta : -delta);
        });
      };

      const handleMouseUp = () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [side, onResize]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      className="group relative w-1 shrink-0 cursor-col-resize"
    >
      {/* Wider hit area */}
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      {/* Visual indicator */}
      <div className="absolute inset-y-0 left-0 right-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
    </div>
  );
}
