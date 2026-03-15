import { ProjectPanel } from '../sidebar/ProjectPanel';
import { DevicePanel } from '../sidebar/DevicePanel';
import { TextPanel } from '../sidebar/TextPanel';
import { BackgroundPanel } from '../sidebar/BackgroundPanel';
import { ExportPanel } from '../sidebar/ExportPanel';
import { useProjectStore } from '@/store/useProjectStore';
import type { DeviceFrameElement, TextElement } from '@/store/types';

export function Sidebar() {
  const selectedId = useProjectStore((s) => s.project.selectedScreenshotId);
  const selectedElement = useProjectStore((s) => s.getSelectedElement());

  return (
    <div className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-surface-800">
      <ProjectPanel />
      {selectedId && (
        <>
          {selectedElement?.type === 'device-frame' && (
            <DevicePanel element={selectedElement as DeviceFrameElement} />
          )}
          {selectedElement?.type === 'text' && (
            <TextPanel element={selectedElement as TextElement} />
          )}
          {!selectedElement && (
            <>
              <BackgroundPanel />
            </>
          )}
          <ExportPanel />
        </>
      )}
    </div>
  );
}
