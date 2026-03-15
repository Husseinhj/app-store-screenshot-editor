import { useProjectStore } from '@/store/useProjectStore';
import { TransformPanel } from '../sidebar/TransformPanel';
import { GroupTransformPanel } from '../sidebar/GroupTransformPanel';
import { TextPanel } from '../sidebar/TextPanel';
import { DevicePanel } from '../sidebar/DevicePanel';
import { ImageElementPanel } from '../sidebar/ImageElementPanel';
import { ShapePanel } from '../sidebar/ShapePanel';
import { BackgroundPanel } from '../sidebar/BackgroundPanel';
import { AlignPanel } from '../sidebar/AlignPanel';
import { GuidelinesPanel } from '../sidebar/GuidelinesPanel';
import { ChevronRight } from 'lucide-react';
import type { DeviceFrameElement, TextElement, ImageElement, ShapeElement } from '@/store/types';

interface Props {
  style?: React.CSSProperties;
  onCollapse?: () => void;
}

export function RightPanel({ style, onCollapse }: Props) {
  const selectedElement = useProjectStore((s) => s.getSelectedElement());
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const selectedScreenshotId = useProjectStore((s) => s.project.selectedScreenshotId);

  return (
    <div
      className="flex shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-surface-800"
      style={style}
    >
      {onCollapse && (
        <div className="flex items-center justify-start px-2 pt-1">
          <button
            onClick={onCollapse}
            className="rounded p-1 text-white/30 hover:text-white/60 hover:bg-surface-700"
            title="Collapse right panel"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {!selectedScreenshotId && (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-xs text-white/30 text-center">Select a screen to edit</p>
        </div>
      )}

      {selectedScreenshotId && !selectedElement && (
        <>
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] text-white/30">Click an element on canvas to edit it</p>
          </div>
          <BackgroundPanel />
          <GuidelinesPanel />
        </>
      )}

      {selectedElementIds.length > 0 && <AlignPanel />}

      {selectedElement && selectedElementIds.length === 1 && (
        <>
          <TransformPanel element={selectedElement} />
          {selectedElement.type === 'text' && (
            <TextPanel element={selectedElement as TextElement} />
          )}
          {selectedElement.type === 'device-frame' && (
            <DevicePanel element={selectedElement as DeviceFrameElement} />
          )}
          {selectedElement.type === 'image' && (
            <ImageElementPanel element={selectedElement as ImageElement} />
          )}
          {selectedElement.type === 'shape' && (
            <ShapePanel element={selectedElement as ShapeElement} />
          )}
        </>
      )}

      {selectedElementIds.length > 1 && <GroupTransformPanel />}
    </div>
  );
}
