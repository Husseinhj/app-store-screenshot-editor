import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { platformLabels } from '@/lib/devices';
import { Plus, Trash2, Copy, FolderOpen } from 'lucide-react';
import { NewProjectDialog } from './NewProjectDialog';
import type { Platform } from '@/store/types';

export function ProjectList() {
  const projectList = useProjectStore((s) => s.projectList);
  const openProject = useProjectStore((s) => s.openProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const duplicateProject = useProjectStore((s) => s.duplicateProject);
  const [showNew, setShowNew] = useState(false);

  const sorted = [...projectList].sort((a, b) => b.lastEditedAt - a.lastEditedAt);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const platformIcon = (platform: Platform) => {
    switch (platform) {
      case 'iphone': return '📱';
      case 'ipad': return '📋';
      case 'mac': return '💻';
      case 'apple-watch': return '⌚';
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface-900">
      <div className="border-b border-white/[0.06] bg-surface-800 px-8 py-6">
        <h1 className="text-xl font-semibold text-white">Projects</h1>
        <p className="mt-1 text-sm text-white/40">Create and manage your App Store screenshot projects</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* New project card */}
          <button
            onClick={() => setShowNew(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-surface-800/50 p-8 transition-colors hover:border-accent/50 hover:bg-surface-800"
          >
            <div className="rounded-full bg-accent/20 p-3">
              <Plus size={24} className="text-accent" />
            </div>
            <span className="text-sm font-medium text-white/60">New Project</span>
          </button>

          {/* Existing projects */}
          {sorted.map((meta) => (
            <div
              key={meta.id}
              className="group relative flex flex-col rounded-xl bg-surface-800 ring-1 ring-white/10 hover:ring-accent/40 transition-all cursor-pointer overflow-hidden"
              onClick={() => openProject(meta.id)}
            >
              {/* Thumbnail area */}
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
                <span className="text-4xl">{platformIcon(meta.platform)}</span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-medium text-white truncate">{meta.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/30">
                  <span className="rounded bg-surface-700 px-1.5 py-0.5">
                    {platformLabels[meta.platform]}
                  </span>
                  <span>{formatDate(meta.lastEditedAt)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateProject(meta.id); }}
                  className="rounded-md bg-surface-900/80 p-1.5 text-white/50 hover:text-white hover:bg-surface-700"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProject(meta.id); }}
                  className="rounded-md bg-surface-900/80 p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNew && <NewProjectDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}
