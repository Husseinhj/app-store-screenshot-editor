import { ProjectPanel } from '../sidebar/ProjectPanel';
import { DevicePanel } from '../sidebar/DevicePanel';
import { TextPanel } from '../sidebar/TextPanel';
import { BackgroundPanel } from '../sidebar/BackgroundPanel';
import { ExportPanel } from '../sidebar/ExportPanel';
import { useProjectStore } from '@/store/useProjectStore';

export function Sidebar() {
  const selectedId = useProjectStore((s) => s.project.selectedScreenshotId);

  return (
    <div className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-surface-800">
      <ProjectPanel />
      {selectedId && (
        <>
          <DevicePanel />
          <TextPanel />
          <BackgroundPanel />
          <ExportPanel />
        </>
      )}
    </div>
  );
}
