import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

interface UseIconDragElementOptions {
  elementId: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  onDragStart?: () => void;
}

const SNAP_THRESHOLD = 1.5; // percentage

function computeIconSnapGuides(
  dragIds: string[],
  newPositions: Record<string, { x: number; y: number }>,
): { snappedPositions: Record<string, { x: number; y: number }>; guides: { type: 'horizontal' | 'vertical'; position: number }[] } {
  const state = useProjectStore.getState();
  const guides: { type: 'horizontal' | 'vertical'; position: number }[] = [];

  const elements = state.appIconProject.elements;
  const otherElements = elements.filter((e) => e.visible && !dragIds.includes(e.id));

  // Build snap targets: canvas edges + center
  const snapTargetsV: number[] = [0, 50, 100];
  const snapTargetsH: number[] = [0, 50, 100];

  for (const el of otherElements) {
    const l = el.transform.x;
    const r = el.transform.x + el.transform.width;
    const cx = el.transform.x + el.transform.width / 2;
    const t = el.transform.y;
    const b = el.transform.y + el.transform.height;
    const cy = el.transform.y + el.transform.height / 2;
    snapTargetsV.push(l, r, cx);
    snapTargetsH.push(t, b, cy);
  }

  // First dragged element for edge computation
  const firstId = dragIds[0];
  const firstEl = elements.find((e) => e.id === firstId);
  if (!firstEl) return { snappedPositions: newPositions, guides };

  const pos = newPositions[firstId];
  const w = firstEl.transform.width;
  const h = firstEl.transform.height;

  const edges = {
    left: pos.x,
    right: pos.x + w,
    centerX: pos.x + w / 2,
    top: pos.y,
    bottom: pos.y + h,
    centerY: pos.y + h / 2,
  };

  let snapDx = 0;
  let snapDy = 0;
  let bestDistX = SNAP_THRESHOLD;
  let bestDistY = SNAP_THRESHOLD;

  for (const target of snapTargetsV) {
    for (const edge of [edges.left, edges.right, edges.centerX]) {
      const dist = Math.abs(edge - target);
      if (dist < bestDistX) {
        bestDistX = dist;
        snapDx = target - edge;
        guides.push({ type: 'vertical', position: target });
      }
    }
  }

  for (const target of snapTargetsH) {
    for (const edge of [edges.top, edges.bottom, edges.centerY]) {
      const dist = Math.abs(edge - target);
      if (dist < bestDistY) {
        bestDistY = dist;
        snapDy = target - edge;
        guides.push({ type: 'horizontal', position: target });
      }
    }
  }

  const snappedPositions: Record<string, { x: number; y: number }> = {};
  for (const id of Object.keys(newPositions)) {
    snappedPositions[id] = {
      x: newPositions[id].x + (bestDistX < SNAP_THRESHOLD ? snapDx : 0),
      y: newPositions[id].y + (bestDistY < SNAP_THRESHOLD ? snapDy : 0),
    };
  }

  // Keep only matching final guides
  const finalGuides: typeof guides = [];
  if (bestDistX < SNAP_THRESHOLD) {
    const snappedEdges = [
      snappedPositions[firstId].x,
      snappedPositions[firstId].x + w,
      snappedPositions[firstId].x + w / 2,
    ];
    for (const target of snapTargetsV) {
      if (snappedEdges.some((e) => Math.abs(e - target) < 0.01)) {
        finalGuides.push({ type: 'vertical', position: target });
      }
    }
  }
  if (bestDistY < SNAP_THRESHOLD) {
    const snappedEdges = [
      snappedPositions[firstId].y,
      snappedPositions[firstId].y + h,
      snappedPositions[firstId].y + h / 2,
    ];
    for (const target of snapTargetsH) {
      if (snappedEdges.some((e) => Math.abs(e - target) < 0.01)) {
        finalGuides.push({ type: 'horizontal', position: target });
      }
    }
  }

  return { snappedPositions, guides: finalGuides };
}

export function useIconDragElement({ elementId, canvasWidth, canvasHeight, scale, onDragStart }: UseIconDragElementOptions) {
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();
      const selectedIds = state.selectedAppIconElementIds;
      const dragIds = selectedIds.includes(elementId) ? [...selectedIds] : [elementId];

      // Gather start transforms
      const startTransforms: Record<string, { x: number; y: number }> = {};
      for (const id of dragIds) {
        const el = state.appIconProject.elements.find((e) => e.id === id);
        if (!el || el.locked) continue;
        startTransforms[id] = { x: el.transform.x, y: el.transform.y };
      }

      if (Object.keys(startTransforms).length === 0) return;

      const startX = e.clientX;
      const startY = e.clientY;

      isDragging.current = false;
      onDragStart?.();

      document.body.classList.add('canvas-no-select');

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!isDragging.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          isDragging.current = true;
        }

        if (!isDragging.current) return;

        const dxPercent = (dx / scale / canvasWidth) * 100;
        const dyPercent = (dy / scale / canvasHeight) * 100;

        const newPositions: Record<string, { x: number; y: number }> = {};
        for (const id of Object.keys(startTransforms)) {
          newPositions[id] = {
            x: startTransforms[id].x + dxPercent,
            y: startTransforms[id].y + dyPercent,
          };
        }

        const { snappedPositions, guides } = computeIconSnapGuides(
          Object.keys(startTransforms),
          newPositions,
        );

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const store = useProjectStore.getState();
          for (const id of Object.keys(snappedPositions)) {
            store.updateAppIconElementTransform(id, {
              x: snappedPositions[id].x,
              y: snappedPositions[id].y,
            });
          }
          store.setIconSnapGuides(guides);
        });
      };

      const handleMouseUp = () => {
        cancelAnimationFrame(rafRef.current);
        document.body.classList.remove('canvas-no-select');
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        useProjectStore.getState().setIconSnapGuides([]);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [elementId, canvasWidth, canvasHeight, scale, onDragStart]
  );

  return { handleMouseDown, isDragging };
}
