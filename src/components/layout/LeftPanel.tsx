import { ProjectPanel } from '../sidebar/ProjectPanel';
import { LayerPanel } from '../sidebar/LayerPanel';
import { AddElementsPanel } from '../sidebar/AddElementsPanel';
import { TemplatePanel } from '../sidebar/TemplatePanel';
import { ExportPanel } from '../sidebar/ExportPanel';
import { ChevronLeft } from 'lucide-react';

interface Props {
  style?: React.CSSProperties;
  onCollapse?: () => void;
}

export function LeftPanel({ style, onCollapse }: Props) {
  return (
    <div
      className="flex shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-surface-800"
      style={style}
    >
      {onCollapse && (
        <div className="flex items-center justify-end px-2 pt-1">
          <button
            onClick={onCollapse}
            className="rounded p-1 text-white/30 hover:text-white/60 hover:bg-surface-700"
            title="Collapse left panel"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      )}
      <ProjectPanel />
      <LayerPanel />
      <AddElementsPanel />
      <TemplatePanel />
      <ExportPanel />
    </div>
  );
}
