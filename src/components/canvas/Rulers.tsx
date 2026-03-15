import { useRef, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useProjectStore } from '@/store/useProjectStore';

const RULER_SIZE = 20;
const RULER_BG = '#1a1a1e';
const TICK_COLOR = 'rgba(255, 255, 255, 0.25)';
const LABEL_COLOR = 'rgba(255, 255, 255, 0.35)';
const FONT = '9px monospace';

function getTickInterval(scale: number): { major: number; minor: number } {
  const candidates = [10, 25, 50, 100, 200, 500, 1000, 2000];
  for (const interval of candidates) {
    if (interval * scale >= 40) {
      return { major: interval, minor: interval / 5 };
    }
  }
  return { major: 2000, minor: 400 };
}

interface WorkspaceRulersProps {
  /** The scrollable container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Pixel offset from scrollable content origin to the canvas origin (left edge) */
  canvasOffsetX: number;
  /** Pixel offset from scrollable content origin to the canvas origin (top edge) */
  canvasOffsetY: number;
  /** Combined scale (preview scale × zoom) */
  scale: number;
  /** Canvas width in export pixels */
  canvasWidth: number;
  /** Canvas height in export pixels */
  canvasHeight: number;
}

function drawRuler(
  canvas: HTMLCanvasElement,
  orientation: 'horizontal' | 'vertical',
  viewportLength: number,
  scrollOffset: number,
  canvasOriginOffset: number,
  scale: number,
  canvasLengthPx: number,
) {
  const dpr = window.devicePixelRatio || 1;
  const isHorizontal = orientation === 'horizontal';

  const w = isHorizontal ? viewportLength : RULER_SIZE;
  const h = isHorizontal ? RULER_SIZE : viewportLength;

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

  // The canvas origin in ruler viewport coordinates
  const originInViewport = canvasOriginOffset - scrollOffset;

  // Determine range of export-pixel values visible in the viewport
  const startExportPx = (0 - originInViewport) / scale;
  const endExportPx = (viewportLength - originInViewport) / scale;

  // Align to minor tick grid
  const firstTick = Math.floor(startExportPx / minor) * minor;
  const lastTick = Math.ceil(endExportPx / minor) * minor;

  ctx.strokeStyle = TICK_COLOR;
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = FONT;
  ctx.textBaseline = 'top';

  // Highlight the canvas region
  const canvasStartVP = originInViewport;
  const canvasEndVP = originInViewport + canvasLengthPx;

  // Subtle highlight for canvas region
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  if (isHorizontal) {
    const x0 = Math.max(0, canvasStartVP);
    const x1 = Math.min(viewportLength, canvasEndVP);
    if (x1 > x0) ctx.fillRect(x0, 0, x1 - x0, RULER_SIZE);
  } else {
    const y0 = Math.max(0, canvasStartVP);
    const y1 = Math.min(viewportLength, canvasEndVP);
    if (y1 > y0) ctx.fillRect(0, y0, RULER_SIZE, y1 - y0);
  }

  // Draw ticks
  ctx.fillStyle = LABEL_COLOR;

  for (let px = firstTick; px <= lastTick; px += minor) {
    const screenPos = originInViewport + px * scale;

    // Skip if outside viewport
    if (screenPos < -10 || screenPos > viewportLength + 10) continue;

    const isMajor = Math.abs(px % major) < 0.001;
    const isMid = !isMajor && Math.abs(px % (major / 2)) < 0.001;

    // Dim ticks outside canvas bounds
    const isOutside = px < 0 || px * scale > canvasLengthPx;

    const tickLen = isMajor ? RULER_SIZE * 0.6 : isMid ? RULER_SIZE * 0.4 : RULER_SIZE * 0.2;

    ctx.strokeStyle = isOutside ? 'rgba(255, 255, 255, 0.12)' : TICK_COLOR;
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
    if (isMajor) {
      const label = px === 0 ? '0' : `${Math.round(px)}`;
      ctx.fillStyle = isOutside ? 'rgba(255, 255, 255, 0.18)' : LABEL_COLOR;
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

  // Draw canvas boundary markers (small triangles at 0 and canvasLength)
  const markers = [0, canvasLengthPx / scale];
  ctx.fillStyle = 'rgba(139, 92, 246, 0.5)'; // purple accent
  for (const m of markers) {
    const pos = originInViewport + m * scale;
    if (pos < 0 || pos > viewportLength) continue;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(pos - 3, RULER_SIZE);
      ctx.lineTo(pos + 3, RULER_SIZE);
      ctx.lineTo(pos, RULER_SIZE - 4);
    } else {
      ctx.moveTo(RULER_SIZE, pos - 3);
      ctx.lineTo(RULER_SIZE, pos + 3);
      ctx.lineTo(RULER_SIZE - 4, pos);
    }
    ctx.fill();
  }
}

export function WorkspaceRulers({
  containerRef,
  canvasOffsetX,
  canvasOffsetY,
  scale,
  canvasWidth,
  canvasHeight,
}: WorkspaceRulersProps) {
  const hCanvasRef = useRef<HTMLCanvasElement>(null);
  const vCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    // Ruler spans the same width/height as the scroll container viewport
    const viewportW = rect.width;
    const viewportH = rect.height;

    const canvasScreenW = canvasWidth * scale;
    const canvasScreenH = canvasHeight * scale;

    if (hCanvasRef.current) {
      drawRuler(
        hCanvasRef.current,
        'horizontal',
        viewportW,
        scrollLeft,
        canvasOffsetX,
        scale,
        canvasScreenW,
      );
    }

    if (vCanvasRef.current) {
      drawRuler(
        vCanvasRef.current,
        'vertical',
        viewportH,
        scrollTop,
        canvasOffsetY,
        scale,
        canvasScreenH,
      );
    }
  }, [containerRef, canvasOffsetX, canvasOffsetY, scale, canvasWidth, canvasHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scheduleRedraw = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    };

    // Initial draw
    scheduleRedraw();

    // Redraw on scroll
    container.addEventListener('scroll', scheduleRedraw, { passive: true });

    // Redraw on resize
    const resizeObserver = new ResizeObserver(scheduleRedraw);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('scroll', scheduleRedraw);
      resizeObserver.disconnect();
    };
  }, [containerRef, draw]);

  // Also redraw when scale/offsets change
  useEffect(() => {
    draw();
  }, [draw]);

  // Convert a viewport X position (relative to scroll container) to canvas percentage
  const viewportXToCanvasPct = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return 50;
      const rect = container.getBoundingClientRect();
      const viewportX = clientX - rect.left;
      const canvasPixelX = (viewportX + container.scrollLeft - canvasOffsetX) / scale;
      return (canvasPixelX / canvasWidth) * 100;
    },
    [containerRef, canvasOffsetX, scale, canvasWidth]
  );

  const viewportYToCanvasPct = useCallback(
    (clientY: number) => {
      const container = containerRef.current;
      if (!container) return 50;
      const rect = container.getBoundingClientRect();
      const viewportY = clientY - rect.top;
      const canvasPixelY = (viewportY + container.scrollTop - canvasOffsetY) / scale;
      return (canvasPixelY / canvasHeight) * 100;
    },
    [containerRef, canvasOffsetY, scale, canvasHeight]
  );

  // Guide creation from ruler drag
  const handleHorizontalRulerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Clicking horizontal ruler → create vertical guide
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const guideId = nanoid();
      const positionPct = viewportXToCanvasPct(e.clientX);

      useProjectStore.getState().addUserGuide({
        id: guideId,
        type: 'vertical',
        position: positionPct,
      });

      const handleMouseMove = (ev: MouseEvent) => {
        const pct = viewportXToCanvasPct(ev.clientX);
        useProjectStore.getState().updateUserGuide(guideId, pct);
      };

      const handleMouseUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // Remove if dragged back onto ruler (mouse is still in the ruler area)
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          if (ev.clientY < rect.top) {
            useProjectStore.getState().removeUserGuide(guideId);
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [containerRef, viewportXToCanvasPct]
  );

  const handleVerticalRulerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Clicking vertical ruler → create horizontal guide
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const guideId = nanoid();
      const positionPct = viewportYToCanvasPct(e.clientY);

      useProjectStore.getState().addUserGuide({
        id: guideId,
        type: 'horizontal',
        position: positionPct,
      });

      const handleMouseMove = (ev: MouseEvent) => {
        const pct = viewportYToCanvasPct(ev.clientY);
        useProjectStore.getState().updateUserGuide(guideId, pct);
      };

      const handleMouseUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // Remove if dragged back onto ruler (mouse is still in the ruler area)
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          if (ev.clientX < rect.left) {
            useProjectStore.getState().removeUserGuide(guideId);
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [containerRef, viewportYToCanvasPct]
  );

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
          zIndex: 52,
          borderRight: '0.5px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)',
          pointerEvents: 'none',
        }}
      />
      {/* Horizontal ruler canvas */}
      <canvas
        ref={hCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: RULER_SIZE,
          right: 0,
          zIndex: 51,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
      {/* Horizontal ruler interactive overlay — click to create vertical guides */}
      <div
        onMouseDown={handleHorizontalRulerMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: RULER_SIZE,
          right: 0,
          height: RULER_SIZE,
          zIndex: 53,
          cursor: 'col-resize',
        }}
      />
      {/* Vertical ruler canvas */}
      <canvas
        ref={vCanvasRef}
        style={{
          position: 'absolute',
          top: RULER_SIZE,
          left: 0,
          bottom: 0,
          zIndex: 51,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
      {/* Vertical ruler interactive overlay — click to create horizontal guides */}
      <div
        onMouseDown={handleVerticalRulerMouseDown}
        style={{
          position: 'absolute',
          top: RULER_SIZE,
          left: 0,
          width: RULER_SIZE,
          bottom: 0,
          zIndex: 53,
          cursor: 'row-resize',
        }}
      />
    </>
  );
}

export { RULER_SIZE };
