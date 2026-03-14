import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { CanvasArea } from '../canvas/CanvasArea';
import { ExportRenderer } from '../export/ExportRenderer';

export function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <CanvasArea />
      </div>
      <ExportRenderer />
    </div>
  );
}
