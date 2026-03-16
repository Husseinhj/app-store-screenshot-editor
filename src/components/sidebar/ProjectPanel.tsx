import { useProjectStore } from '@/store/useProjectStore';
import { platformLabels } from '@/lib/devices';
import { Plus, Copy, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import type { DeviceFrameElement, Platform, Screenshot } from '@/store/types';
import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const platforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

/** Find the first device-frame element in a screenshot */
function getDeviceElement(screenshot: Screenshot): DeviceFrameElement | undefined {
  return screenshot.elements.find((e) => e.type === 'device-frame') as DeviceFrameElement | undefined;
}

/** Find the first text element content in a screenshot */
function getTextContent(screenshot: Screenshot): string {
  const textEl = screenshot.elements.find((e) => e.type === 'text');
  return textEl && textEl.type === 'text' ? textEl.content : '';
}

export function ProjectPanel() {
  const project = useProjectStore((s) => s.project);
  const setPlatform = useProjectStore((s) => s.setPlatform);
  const addScreenshot = useProjectStore((s) => s.addScreenshot);
  const removeScreenshot = useProjectStore((s) => s.removeScreenshot);
  const selectScreenshot = useProjectStore((s) => s.selectScreenshot);
  const duplicateScreenshot = useProjectStore((s) => s.duplicateScreenshot);
  const reorderScreenshots = useProjectStore((s) => s.reorderScreenshots);
  const updateDeviceElement = useProjectStore((s) => s.updateDeviceElement);
  const updateScreenshot = useProjectStore((s) => s.updateScreenshot);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];

  // ─── Drag reorder state ─────────────────────────────────────────────────────
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    // Make drag ghost semi-transparent
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4';
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex === null || index === dragIndex) {
      setDropIndex(null);
      return;
    }
    setDropIndex(index);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      reorderScreenshots(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
    dragNodeRef.current = null;
  };

  // ─── Notes expand state ─────────────────────────────────────────────────────
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Image upload ───────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const { readFileAsCompressedDataUrl } = await import('@/lib/imageUtils');
      const url = await readFileAsCompressedDataUrl(file);
      const state = useProjectStore.getState();
      const currentScreenshots = state.project.screenshotsByPlatform[state.project.platform] ?? [];
      const selected = currentScreenshots.find((s) => s.id === state.project.selectedScreenshotId);
      if (!selected) return;
      const deviceEl = getDeviceElement(selected);
      if (deviceEl) {
        updateDeviceElement(deviceEl.id, { screenshotImageUrl: url });
      }
    },
    [updateDeviceElement]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  return (
    <SidebarSection title="Project">
      {/* Platform selector */}
      <div className="mb-3 grid grid-cols-4 gap-1 rounded bg-surface-700 p-0.5">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`rounded px-1 py-1 text-[11px] font-medium transition-colors ${
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
      <div className="space-y-1">
        {screenshots.map((s, i) => {
          const deviceEl = getDeviceElement(s);
          const textContent = getTextContent(s);
          const isSelected = project.selectedScreenshotId === s.id;
          const showDropAbove = dropIndex === i && dragIndex !== null && dragIndex > i;
          const showDropBelow = dropIndex === i && dragIndex !== null && dragIndex < i;
          const notesExpanded = expandedNotes.has(s.id);

          return (
            <div key={s.id}>
              {showDropAbove && (
                <div className="h-0.5 mx-2 bg-accent rounded-full mb-1" />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                onClick={() => selectScreenshot(s.id)}
                className={`group rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-accent/15 ring-1 ring-accent/40'
                    : 'hover:bg-surface-600'
                }`}
              >
                <div className="flex items-center gap-1.5 p-1.5">
                  {/* Drag handle */}
                  <div className="shrink-0 cursor-grab text-white/20 hover:text-white/50 active:cursor-grabbing">
                    <GripVertical size={12} />
                  </div>

                  {/* Thumbnail */}
                  <div className="h-12 w-8 shrink-0 rounded overflow-hidden bg-surface-700">
                    {deviceEl?.screenshotImageUrl ? (
                      <img src={deviceEl.screenshotImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Name + content preview */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateScreenshot(s.id, { name: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={`Screen ${i + 1}`}
                      className="w-full bg-transparent text-xs text-white/80 outline-none placeholder:text-white/40 truncate"
                    />
                    <p className="text-[10px] text-white/40 truncate">{textContent}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleNotes(s.id); }}
                      className={`rounded p-1 transition-colors ${
                        notesExpanded ? 'text-accent' : 'text-white/40 hover:bg-surface-500 hover:text-white'
                      }`}
                      title="Notes"
                    >
                      <ChevronDown size={12} className={`transition-transform ${notesExpanded ? '' : '-rotate-90'}`} />
                    </button>
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

                {/* Notes (expandable) */}
                {notesExpanded && (
                  <div className="px-2 pb-2">
                    <textarea
                      value={s.notes}
                      onChange={(e) => updateScreenshot(s.id, { notes: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Add notes..."
                      rows={2}
                      className="w-full resize-none rounded bg-surface-700 px-2 py-1 text-[11px] text-white/60 outline-none ring-0 focus:ring-1 focus:ring-accent/50 placeholder:text-white/20"
                    />
                  </div>
                )}
              </div>
              {showDropBelow && (
                <div className="h-0.5 mx-2 bg-accent rounded-full mt-1" />
              )}
            </div>
          );
        })}
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
