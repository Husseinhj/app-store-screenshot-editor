import { useState, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import {
  Smartphone,
  Type,
  Image,
  Square,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
} from 'lucide-react';
import type { CanvasElement } from '@/store/types';
import { devices } from '@/lib/devices';

function getElementLabel(element: CanvasElement): string {
  switch (element.type) {
    case 'device-frame':
      return devices[element.device]?.label ?? element.device;
    case 'text': {
      const plain = element.content.replace(/<[^>]*>/g, '').trim();
      return plain.length > 20 ? plain.slice(0, 20) + '…' : plain || 'Text';
    }
    case 'image':
      return 'Image';
    case 'shape':
      return element.shapeType.charAt(0).toUpperCase() + element.shapeType.slice(1);
  }
}

function getElementIcon(element: CanvasElement) {
  switch (element.type) {
    case 'device-frame':
      return <Smartphone size={12} />;
    case 'text':
      return <Type size={12} />;
    case 'image':
      return <Image size={12} />;
    case 'shape':
      return <Square size={12} />;
  }
}

export function LayerPanel() {
  const project = useProjectStore((s) => s.project);
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const selectElement = useProjectStore((s) => s.selectElement);
  const updateBaseElement = useProjectStore((s) => s.updateBaseElement);
  const removeElement = useProjectStore((s) => s.removeElement);
  const reorderElementZIndices = useProjectStore((s) => s.reorderElementZIndices);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
  const selectedScreenshot = screenshots.find((s) => s.id === project.selectedScreenshotId);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverPos, setDragOverPos] = useState<'above' | 'below'>('above');

  if (!selectedScreenshot) return null;

  // Sort by zIndex descending (top layer first in visual list)
  const sortedElements = [...selectedScreenshot.elements].sort((a, b) => b.zIndex - a.zIndex);

  if (sortedElements.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id === draggedId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverId(id);
    setDragOverPos(e.clientY < midY ? 'above' : 'below');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || !dragOverId || draggedId === dragOverId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Build new order array (displayed top-to-bottom = highest to lowest zIndex)
    const currentOrder = sortedElements.map((el) => el.id);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(dragOverId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    const newOrder = currentOrder.filter((id) => id !== draggedId);
    const insertIndex = dragOverPos === 'above' ? currentOrder.indexOf(dragOverId) : currentOrder.indexOf(dragOverId) + 1;
    const adjustedInsert = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
    newOrder.splice(Math.min(adjustedInsert, newOrder.length), 0, draggedId);

    // Reverse since display is descending but reorderElementZIndices expects ascending (index 0 = lowest z)
    const ascendingOrder = [...newOrder].reverse();
    reorderElementZIndices(ascendingOrder);

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <SidebarSection title="Layers">
      <div className="space-y-0">
        {sortedElements.map((element) => {
          const isSelected = selectedElementIds.includes(element.id);
          const isDragged = draggedId === element.id;
          const showInsertAbove = dragOverId === element.id && dragOverPos === 'above' && draggedId !== element.id;
          const showInsertBelow = dragOverId === element.id && dragOverPos === 'below' && draggedId !== element.id;

          return (
            <div key={element.id}>
              {/* Insert indicator above */}
              {showInsertAbove && (
                <div className="h-0.5 mx-1 bg-accent rounded-full" />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragOver={(e) => handleDragOver(e, element.id)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onClick={() => selectElement(element.id)}
                className={`group flex items-center gap-1 rounded-lg px-1 py-1.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-accent/20 ring-1 ring-accent/40'
                    : 'hover:bg-surface-700'
                } ${isDragged ? 'opacity-40' : ''}`}
              >
                {/* Drag handle */}
                <span className="shrink-0 cursor-grab text-white/20 group-hover:text-white/40">
                  <GripVertical size={10} />
                </span>

                {/* Type icon */}
                <span className={`shrink-0 ${element.visible ? 'text-white/50' : 'text-white/20'}`}>
                  {getElementIcon(element)}
                </span>

                {/* Label */}
                <span
                  className={`flex-1 truncate text-[11px] ${
                    element.visible ? 'text-white/70' : 'text-white/30 line-through'
                  } ${element.locked ? 'italic' : ''}`}
                >
                  {getElementLabel(element)}
                </span>

                {/* Action buttons — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateBaseElement(element.id, { visible: !element.visible }); }}
                    className={`rounded p-0.5 hover:bg-surface-600 ${element.visible ? 'text-white/30 hover:text-white/70' : 'text-yellow-400/60 hover:text-yellow-400'}`}
                    title={element.visible ? 'Hide' : 'Show'}
                  >
                    {element.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateBaseElement(element.id, { locked: !element.locked }); }}
                    className={`rounded p-0.5 hover:bg-surface-600 ${element.locked ? 'text-orange-400/60 hover:text-orange-400' : 'text-white/30 hover:text-white/70'}`}
                    title={element.locked ? 'Unlock' : 'Lock'}
                  >
                    {element.locked ? <Lock size={10} /> : <Unlock size={10} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                    className="rounded p-0.5 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              {/* Insert indicator below */}
              {showInsertBelow && (
                <div className="h-0.5 mx-1 bg-accent rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </SidebarSection>
  );
}
