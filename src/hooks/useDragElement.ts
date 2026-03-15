import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

interface UseDragElementOptions {
  elementId: string;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  onDragStart?: () => void;
}

const SNAP_THRESHOLD = 1.5; // percentage

function computeSnapGuides(
  dragIds: string[],
  newPositions: Record<string, { x: number; y: number }>,
): { snappedPositions: Record<string, { x: number; y: number }>; guides: { type: 'horizontal' | 'vertical'; position: number }[] } {
  const state = useProjectStore.getState();
  const guides: { type: 'horizontal' | 'vertical'; position: number }[] = [];

  // Get all elements in current screenshot
  const screenshots = state.project.screenshotsByPlatform[state.project.platform] ?? [];
  const screenshot = screenshots.find((s) => s.id === state.project.selectedScreenshotId);
  if (!screenshot) return { snappedPositions: newPositions, guides };

  const otherElements = screenshot.elements.filter((e) => e.visible && !dragIds.includes(e.id));

  // Build snap targets
  const snapTargetsV: number[] = [0, 50, 100]; // vertical lines (x positions)
  const snapTargetsH: number[] = [0, 50, 100]; // horizontal lines (y positions)

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

  // For the first dragged element, compute its edges and check snapping
  const firstId = dragIds[0];
  const firstEl = screenshot.elements.find((e) => e.id === firstId);
  if (!firstEl) return { snappedPositions: newPositions, guides };

  const pos = newPositions[firstId];
  const w = firstEl.transform.width;
  const h = firstEl.transform.height;

  // Element edges
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

  // Check vertical snaps (x-axis)
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

  // Check horizontal snaps (y-axis)
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

  // Apply snap offset to all dragged elements
  const snappedPositions: Record<string, { x: number; y: number }> = {};
  for (const id of Object.keys(newPositions)) {
    snappedPositions[id] = {
      x: newPositions[id].x + (bestDistX < SNAP_THRESHOLD ? snapDx : 0),
      y: newPositions[id].y + (bestDistY < SNAP_THRESHOLD ? snapDy : 0),
    };
  }

  // Only keep the best matching guides
  const finalGuides: typeof guides = [];
  if (bestDistX < SNAP_THRESHOLD) {
    // Keep only the guide that matches the final snap
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

export function useDragElement({ elementId, canvasWidth, canvasHeight, scale, onDragStart }: UseDragElementOptions) {
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only left click
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const state = useProjectStore.getState();

      // Determine which elements to drag: all selected if current element is in selection, otherwise just this one
      const selectedIds = state.selectedElementIds;
      const dragIds = selectedIds.includes(elementId) ? [...selectedIds] : [elementId];

      // Gather start transforms for all dragged elements
      const startTransforms: Record<string, { x: number; y: number }> = {};
      for (const id of dragIds) {
        const el = (() => {
          for (const platform of ['iphone', 'ipad', 'mac', 'apple-watch'] as const) {
            const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
            for (const s of screenshots) {
              const found = s.elements.find((e) => e.id === id);
              if (found) return found;
            }
          }
          return null;
        })();
        if (!el || el.locked) continue;
        startTransforms[id] = { x: el.transform.x, y: el.transform.y };
      }

      if (Object.keys(startTransforms).length === 0) return;

      const startX = e.clientX;
      const startY = e.clientY;

      isDragging.current = false;
      onDragStart?.();

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!isDragging.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          isDragging.current = true;
        }

        if (!isDragging.current) return;

        // Convert screen pixels to canvas percentage
        const dxPercent = (dx / scale / canvasWidth) * 100;
        const dyPercent = (dy / scale / canvasHeight) * 100;

        // Compute new positions
        const newPositions: Record<string, { x: number; y: number }> = {};
        for (const id of Object.keys(startTransforms)) {
          newPositions[id] = {
            x: startTransforms[id].x + dxPercent,
            y: startTransforms[id].y + dyPercent,
          };
        }

        // Apply snap guides
        const { snappedPositions, guides } = computeSnapGuides(
          Object.keys(startTransforms),
          newPositions,
        );

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          for (const id of Object.keys(snappedPositions)) {
            useProjectStore.getState().updateElementTransform(id, {
              x: snappedPositions[id].x,
              y: snappedPositions[id].y,
            });
          }
          useProjectStore.getState().setSnapGuides(guides);
        });
      };

      const handleMouseUp = () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        useProjectStore.getState().setSnapGuides([]);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [elementId, canvasWidth, canvasHeight, scale, onDragStart]
  );

  return { handleMouseDown, isDragging };
}
