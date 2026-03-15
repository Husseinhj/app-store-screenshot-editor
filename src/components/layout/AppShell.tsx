import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Toolbar } from './Toolbar';
import { CanvasArea } from '../canvas/CanvasArea';
import { ExportRenderer } from '../export/ExportRenderer';
import { ResizeHandle } from '../common/ResizeHandle';
import { HomePage } from '../home/HomePage';
import { AppStorePreview } from '../preview/AppStorePreview';
import { useProjectStore } from '@/store/useProjectStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useCallback } from 'react';

export function AppShell() {
  const appView = useProjectStore((s) => s.appView);

  if (appView === 'home') {
    return <HomePage />;
  }

  return <EditorLayout />;
}

function EditorLayout() {
  const leftWidth = useProjectStore((s) => s.leftPanelWidth);
  const rightWidth = useProjectStore((s) => s.rightPanelWidth);
  const leftCollapsed = useProjectStore((s) => s.leftPanelCollapsed);
  const rightCollapsed = useProjectStore((s) => s.rightPanelCollapsed);
  const setLeftPanelWidth = useProjectStore((s) => s.setLeftPanelWidth);
  const setRightPanelWidth = useProjectStore((s) => s.setRightPanelWidth);
  const toggleLeftPanel = useProjectStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useProjectStore((s) => s.toggleRightPanel);

  const leftStartWidth = useRef(leftWidth);
  const rightStartWidth = useRef(rightWidth);

  const handleLeftResizeStart = useCallback(() => {
    leftStartWidth.current = useProjectStore.getState().leftPanelWidth;
  }, []);

  const handleRightResizeStart = useCallback(() => {
    rightStartWidth.current = useProjectStore.getState().rightPanelWidth;
  }, []);

  const handleLeftResize = useCallback(
    (delta: number) => {
      setLeftPanelWidth(leftStartWidth.current + delta);
    },
    [setLeftPanelWidth]
  );

  const handleRightResize = useCallback(
    (delta: number) => {
      setRightPanelWidth(rightStartWidth.current + delta);
    },
    [setRightPanelWidth]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        {leftCollapsed ? (
          <div className="flex shrink-0 flex-col items-center border-r border-white/[0.06] bg-surface-800 w-8">
            <button
              onClick={toggleLeftPanel}
              className="mt-2 rounded p-1 text-white/40 hover:text-white/70 hover:bg-surface-700"
              title="Expand left panel"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <>
            <LeftPanel style={{ width: leftWidth }} onCollapse={toggleLeftPanel} />
            <ResizeHandle
              side="left"
              onResize={handleLeftResize}
              onDoubleClick={() => { handleLeftResizeStart(); toggleLeftPanel(); }}
            />
          </>
        )}

        <CanvasArea />

        {/* Right panel */}
        {rightCollapsed ? (
          <div className="flex shrink-0 flex-col items-center border-l border-white/[0.06] bg-surface-800 w-8">
            <button
              onClick={toggleRightPanel}
              className="mt-2 rounded p-1 text-white/40 hover:text-white/70 hover:bg-surface-700"
              title="Expand right panel"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        ) : (
          <>
            <ResizeHandle
              side="right"
              onResize={handleRightResize}
              onDoubleClick={() => { handleRightResizeStart(); toggleRightPanel(); }}
            />
            <RightPanel style={{ width: rightWidth }} onCollapse={toggleRightPanel} />
          </>
        )}
      </div>
      <ExportRenderer />
      {useProjectStore((s) => s.showAppStorePreview) && <AppStorePreview />}
    </div>
  );
}
