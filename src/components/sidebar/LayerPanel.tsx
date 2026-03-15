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
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { CanvasElement } from '@/store/types';
import { devices } from '@/lib/devices';

function getElementLabel(element: CanvasElement): string {
  switch (element.type) {
    case 'device-frame':
      return devices[element.device]?.label ?? element.device;
    case 'text': {
      // Strip HTML tags for display
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
  const bringForward = useProjectStore((s) => s.bringForward);
  const sendBackward = useProjectStore((s) => s.sendBackward);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
  const selectedScreenshot = screenshots.find((s) => s.id === project.selectedScreenshotId);

  if (!selectedScreenshot) return null;

  // Sort by zIndex descending (top layer first)
  const sortedElements = [...selectedScreenshot.elements].sort((a, b) => b.zIndex - a.zIndex);

  if (sortedElements.length === 0) return null;

  return (
    <SidebarSection title="Layers">
      <div className="space-y-0.5">
        {sortedElements.map((element) => {
          const isSelected = selectedElementIds.includes(element.id);
          return (
            <div
              key={element.id}
              onClick={() => selectElement(element.id)}
              className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-accent/20 ring-1 ring-accent/40'
                  : 'hover:bg-surface-700'
              }`}
            >
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

              {/* Action buttons — visible on hover or when active */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Z-order buttons */}
                <button
                  onClick={(e) => { e.stopPropagation(); bringForward(element.id); }}
                  className="rounded p-0.5 text-white/30 hover:text-white/70 hover:bg-surface-600"
                  title="Bring Forward"
                >
                  <ChevronUp size={10} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); sendBackward(element.id); }}
                  className="rounded p-0.5 text-white/30 hover:text-white/70 hover:bg-surface-600"
                  title="Send Backward"
                >
                  <ChevronDown size={10} />
                </button>

                {/* Visibility toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); updateBaseElement(element.id, { visible: !element.visible }); }}
                  className={`rounded p-0.5 hover:bg-surface-600 ${element.visible ? 'text-white/30 hover:text-white/70' : 'text-yellow-400/60 hover:text-yellow-400'}`}
                  title={element.visible ? 'Hide' : 'Show'}
                >
                  {element.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                </button>

                {/* Lock toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); updateBaseElement(element.id, { locked: !element.locked }); }}
                  className={`rounded p-0.5 hover:bg-surface-600 ${element.locked ? 'text-orange-400/60 hover:text-orange-400' : 'text-white/30 hover:text-white/70'}`}
                  title={element.locked ? 'Unlock' : 'Lock'}
                >
                  {element.locked ? <Lock size={10} /> : <Unlock size={10} />}
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                  className="rounded p-0.5 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SidebarSection>
  );
}
