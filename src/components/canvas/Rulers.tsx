import { useRef, useEffect } from 'react';

const RULER_SIZE = 20;
const RULER_BG = '#1a1a1e';
const TICK_COLOR = 'rgba(255, 255, 255, 0.25)';
const LABEL_COLOR = 'rgba(255, 255, 255, 0.35)';
const FONT = '9px monospace';

interface RulerProps {
  length: number; // canvas dimension in export pixels
  scale: number; // combined scale factor (preview + zoom)
  orientation: 'horizontal' | 'vertical';
}

function getTickInterval(scale: number): { major: number; minor: number } {
  // Screen pixels between major ticks at current scale
  const candidates = [10, 25, 50, 100, 200, 500, 1000, 2000];
  for (const interval of candidates) {
    if (interval * scale >= 40) {
      return { major: interval, minor: interval / 5 };
    }
  }
  return { major: 2000, minor: 400 };
}

function Ruler({ length, scale, orientation }: RulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHorizontal = orientation === 'horizontal';

  const screenLength = length * scale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = isHorizontal ? screenLength : RULER_SIZE;
    const h = isHorizontal ? RULER_SIZE : screenLength;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = RULER_BG;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.5;
    if (isHorizontal) {
      ctx.beginPath();
      ctx.moveTo(0, h - 0.5);
      ctx.lineTo(w, h - 0.5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(w - 0.5, 0);
      ctx.lineTo(w - 0.5, h);
      ctx.stroke();
    }

    const { major, minor } = getTickInterval(scale);

    // Draw ticks
    ctx.strokeStyle = TICK_COLOR;
    ctx.fillStyle = LABEL_COLOR;
    ctx.font = FONT;
    ctx.textBaseline = 'top';

    for (let px = 0; px <= length; px += minor) {
      const screenPos = px * scale;
      const isMajor = px % major === 0;
      const isMid = !isMajor && px % (major / 2) === 0;

      const tickLen = isMajor ? RULER_SIZE * 0.6 : isMid ? RULER_SIZE * 0.4 : RULER_SIZE * 0.2;

      ctx.lineWidth = isMajor ? 0.8 : 0.5;
      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(screenPos, RULER_SIZE - tickLen);
        ctx.lineTo(screenPos, RULER_SIZE);
      } else {
        ctx.moveTo(RULER_SIZE - tickLen, screenPos);
        ctx.lineTo(RULER_SIZE, screenPos);
      }
      ctx.stroke();

      // Label at major ticks
      if (isMajor && px > 0) {
        const label = `${px}`;
        if (isHorizontal) {
          ctx.textAlign = 'center';
          ctx.fillText(label, screenPos, 1);
        } else {
          ctx.save();
          ctx.translate(2, screenPos);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = 'center';
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      }
    }
  }, [length, scale, orientation, isHorizontal, screenLength]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: isHorizontal ? screenLength : RULER_SIZE,
        height: isHorizontal ? RULER_SIZE : screenLength,
      }}
    />
  );
}

interface RulersProps {
  canvasWidth: number; // export pixels
  canvasHeight: number; // export pixels
  scale: number; // combined scale
}

export function Rulers({ canvasWidth, canvasHeight, scale }: RulersProps) {
  return (
    <>
      {/* Corner square */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: RULER_SIZE,
          height: RULER_SIZE,
          backgroundColor: RULER_BG,
          zIndex: 10,
          borderRight: '0.5px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
        }}
      />
      {/* Horizontal ruler */}
      <div style={{ position: 'absolute', top: 0, left: RULER_SIZE, zIndex: 9 }}>
        <Ruler length={canvasWidth} scale={scale} orientation="horizontal" />
      </div>
      {/* Vertical ruler */}
      <div style={{ position: 'absolute', top: RULER_SIZE, left: 0, zIndex: 9 }}>
        <Ruler length={canvasHeight} scale={scale} orientation="vertical" />
      </div>
    </>
  );
}

export { RULER_SIZE };
