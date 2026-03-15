import { Download, ZoomIn, ZoomOut, Undo2, Redo2, Home, Eye } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useExport } from '@/hooks/useExport';
import { useStore } from 'zustand';

export function Toolbar() {
  const projectName = useProjectStore((s) => s.project.name);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const zoom = useProjectStore((s) => s.zoom);
  const setZoom = useProjectStore((s) => s.setZoom);
  const closeProject = useProjectStore((s) => s.closeProject);
  const { exportAllPlatforms, exporting } = useExport();

  const canUndo = useStore(useProjectStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useProjectStore.temporal, (s) => s.futureStates.length > 0);
  const undo = () => useProjectStore.temporal.getState().undo();
  const redo = () => useProjectStore.temporal.getState().redo();

  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-surface-800 px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={closeProject}
          className="rounded p-1.5 text-white/40 hover:text-white/70 hover:bg-surface-700 transition-colors"
          title="Back to Projects"
        >
          <Home size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-accent rounded-md" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40 w-48"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-surface-700 px-2 py-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded p-1 text-white/60 hover:bg-surface-600 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/60"
            title="Undo (Cmd+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="rounded p-1 text-white/60 hover:bg-surface-600 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/60"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-surface-700 px-2 py-1">
          <button
            onClick={() => setZoom(zoom - 25)}
            className="rounded p-1 text-white/60 hover:bg-surface-600 hover:text-white"
          >
            <ZoomOut size={14} />
          </button>
          <span className="min-w-[3rem] text-center text-xs text-white/60">{zoom}%</span>
          <button
            onClick={() => setZoom(zoom + 25)}
            className="rounded p-1 text-white/60 hover:bg-surface-600 hover:text-white"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <button
          onClick={() => useProjectStore.getState().openAppStorePreview()}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-surface-600 hover:text-white"
          title="App Store Preview (⌘⇧P)"
        >
          <Eye size={14} />
          Preview
        </button>

        <button
          onClick={exportAllPlatforms}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? 'Exporting...' : 'Export All'}
        </button>
      </div>
    </div>
  );
}
