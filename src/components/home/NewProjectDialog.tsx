import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { platformLabels } from '@/lib/devices';
import { X } from 'lucide-react';
import type { Platform } from '@/store/types';

const platforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

interface Props {
  onClose: () => void;
}

export function NewProjectDialog({ onClose }: Props) {
  const createProject = useProjectStore((s) => s.createProject);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform>('iphone');

  const handleCreate = () => {
    const projectName = name.trim() || 'Untitled Project';
    createProject(projectName, platform);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface-800 ring-1 ring-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="rounded p-1 text-white/30 hover:text-white/60">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App Screenshots"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="w-full rounded-lg bg-surface-700 px-3 py-2.5 text-sm text-white outline-none ring-0 focus:ring-1 focus:ring-accent/50 placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/50">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${
                    platform === p
                      ? 'bg-accent/15 text-white ring-1 ring-accent/40'
                      : 'bg-surface-700 text-white/60 hover:text-white hover:bg-surface-600'
                  }`}
                >
                  {platformLabels[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs text-white/50 hover:text-white/80"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
