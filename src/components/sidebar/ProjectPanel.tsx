import { useProjectStore } from '@/store/useProjectStore';
import { platformLabels } from '@/lib/devices';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import type { Platform } from '@/store/types';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const platforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

export function ProjectPanel() {
  const project = useProjectStore((s) => s.project);
  const setPlatform = useProjectStore((s) => s.setPlatform);
  const addScreenshot = useProjectStore((s) => s.addScreenshot);
  const removeScreenshot = useProjectStore((s) => s.removeScreenshot);
  const selectScreenshot = useProjectStore((s) => s.selectScreenshot);
  const duplicateScreenshot = useProjectStore((s) => s.duplicateScreenshot);
  const setScreenshotImage = useProjectStore((s) => s.setScreenshotImage);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [setScreenshotImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  return (
    <SidebarSection title="Project">
      {/* Platform selector */}
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-lg bg-surface-700 p-1">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${
              project.platform === p
                ? 'bg-accent text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {platformLabels[p]}
          </button>
        ))}
      </div>

      {/* Upload drop zone */}
      <div
        {...getRootProps()}
        className={`mb-3 flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragActive
            ? 'border-accent bg-accent/10'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-xs text-white/40">
          {isDragActive ? 'Drop image here' : 'Drop screenshot or click'}
        </p>
      </div>

      {/* Screenshot list */}
      <div className="space-y-1.5">
        {screenshots.map((s, i) => (
          <div
            key={s.id}
            onClick={() => selectScreenshot(s.id)}
            className={`group flex items-center gap-2 rounded-lg p-1.5 cursor-pointer transition-colors ${
              project.selectedScreenshotId === s.id
                ? 'bg-accent/20 ring-1 ring-accent/50'
                : 'hover:bg-surface-600'
            }`}
          >
            <div className="h-12 w-8 shrink-0 rounded overflow-hidden bg-surface-700">
              {s.screenshotImageUrl ? (
                <img src={s.screenshotImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white/20" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 truncate">Screen {i + 1}</p>
              <p className="text-[10px] text-white/40 truncate">{s.text.content}</p>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateScreenshot(s.id); }}
                className="rounded p-1 text-white/40 hover:bg-surface-500 hover:text-white"
              >
                <Copy size={12} />
              </button>
              {screenshots.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeScreenshot(s.id); }}
                  className="rounded p-1 text-white/40 hover:bg-red-500/20 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addScreenshot}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 text-xs text-white/50 hover:border-white/40 hover:text-white/70 transition-colors"
      >
        <Plus size={14} />
        Add Screen
      </button>
    </SidebarSection>
  );
}
