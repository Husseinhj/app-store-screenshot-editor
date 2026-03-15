import { useCallback, useMemo, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useDropzone } from 'react-dropzone';
import { IconCanvas } from './IconCanvas';
import { IconPreviewPanel } from './IconPreviewPanel';
import { IconBackgroundPanel } from './IconBackgroundPanel';
import { IconElementControls } from './IconElementControls';
import { ICON_GUIDELINE_PRESETS } from './IconGuidelinesOverlay';
import { ArrowLeft, ImagePlus, Type, Square, Trash2, Grid3X3 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Screenshot, CanvasElement, ImageElement, TextElement, ShapeElement } from '@/store/types';

export function AppIconEditor() {
  const closeEditor = useProjectStore((s) => s.closeAppIconEditor);
  const appIconProject = useProjectStore((s) => s.appIconProject);
  const addElement = useProjectStore((s) => s.addAppIconElement);
  const removeElement = useProjectStore((s) => s.removeAppIconElement);
  const selectedIds = useProjectStore((s) => s.selectedAppIconElementIds);
  const selectElement = useProjectStore((s) => s.selectAppIconElement);
  const removeSelected = useProjectStore((s) => s.removeSelectedAppIconElements);

  const [activeGuideline, setActiveGuideline] = useState<string | null>(null);

  // Build a virtual Screenshot for the canvas
  const screenshot: Screenshot = useMemo(
    () => ({
      id: 'icon-canvas',
      name: 'Icon',
      notes: '',
      elements: appIconProject.elements,
      background: appIconProject.background,
      order: 0,
    }),
    [appIconProject.elements, appIconProject.background]
  );

  // Drop zone for adding images
  const onDrop = useCallback(
    (files: File[]) => {
      if (!files[0]) return;
      const reader = new FileReader();
      reader.onload = () => {
        const el: ImageElement = {
          id: nanoid(),
          type: 'image',
          transform: { x: 10, y: 10, width: 80, height: 80, rotation: 0 },
          zIndex: appIconProject.elements.length + 1,
          locked: false,
          visible: true,
          flipX: false,
          flipY: false,
          imageUrl: reader.result as string,
          objectFit: 'cover',
          opacity: 1,
          borderRadius: 0,
        };
        addElement(el);
      };
      reader.readAsDataURL(files[0]);
    },
    [addElement, appIconProject.elements.length]
  );

  const { getRootProps, getInputProps, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const addText = () => {
    const el: TextElement = {
      id: nanoid(),
      type: 'text',
      transform: { x: 15, y: 35, width: 70, height: 30, rotation: 0 },
      zIndex: appIconProject.elements.length + 1,
      locked: false,
      visible: true,
      flipX: false,
      flipY: false,
      content: 'App',
      fontFamily: 'Inter',
      fontSize: 180,
      fontWeight: 700,
      color: '#ffffff',
      alignment: 'center',
      lineHeight: 1.1,
    };
    addElement(el);
  };

  const addShape = () => {
    const el: ShapeElement = {
      id: nanoid(),
      type: 'shape',
      transform: { x: 20, y: 20, width: 60, height: 60, rotation: 0 },
      zIndex: appIconProject.elements.length + 1,
      locked: false,
      visible: true,
      flipX: false,
      flipY: false,
      shapeType: 'rectangle',
      fillColor: '#ffffff33',
      strokeColor: 'transparent',
      strokeWidth: 0,
      borderRadius: 20,
    };
    addElement(el);
  };

  return (
    <div className="flex h-screen flex-col bg-surface-900" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-surface-800 px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={closeEditor}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] text-white/60 hover:bg-surface-700 hover:text-white/90 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <span className="text-[12px] font-medium text-white/80">App Icon Generator</span>
        </div>

        {/* Guidelines toggle */}
        <div className="flex items-center gap-1">
          {ICON_GUIDELINE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActiveGuideline(activeGuideline === preset.id ? null : preset.id)}
              className={`rounded px-2 py-1 text-[11px] transition-colors ${
                activeGuideline === preset.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-surface-700'
              }`}
              title={preset.name}
            >
              {preset.id === 'grid' ? <Grid3X3 size={13} /> : preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — controls */}
        <div className="flex w-[260px] shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-surface-800">
          {/* Background */}
          <IconBackgroundPanel />

          {/* Add elements */}
          <div className="border-b border-white/[0.06] px-3 py-2.5">
            <h3 className="mb-2 text-[11px] font-medium text-white/60">Add elements</h3>
            <div className="flex gap-1.5">
              <button
                onClick={openFilePicker}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-surface-700 py-1.5 text-[11px] text-white/60 hover:bg-surface-600 hover:text-white/80 transition-colors"
              >
                <ImagePlus size={13} />
                Image
              </button>
              <button
                onClick={addText}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-surface-700 py-1.5 text-[11px] text-white/60 hover:bg-surface-600 hover:text-white/80 transition-colors"
              >
                <Type size={13} />
                Text
              </button>
              <button
                onClick={addShape}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-surface-700 py-1.5 text-[11px] text-white/60 hover:bg-surface-600 hover:text-white/80 transition-colors"
              >
                <Square size={13} />
                Shape
              </button>
            </div>
          </div>

          {/* Element list */}
          <div className="border-b border-white/[0.06] px-3 py-2.5">
            <h3 className="mb-2 text-[11px] font-medium text-white/60">
              Elements ({appIconProject.elements.length})
            </h3>
            {appIconProject.elements.length === 0 ? (
              <p className="text-[11px] text-white/30">
                Add an image, text, or shape to design your icon
              </p>
            ) : (
              <div className="space-y-0.5">
                {[...appIconProject.elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el) => (
                    <div
                      key={el.id}
                      onClick={() => selectElement(el.id)}
                      className={`flex items-center justify-between rounded px-2 py-1 text-[11px] cursor-pointer transition-colors ${
                        selectedIds.includes(el.id)
                          ? 'bg-accent/15 text-white ring-1 ring-accent/40'
                          : 'text-white/60 hover:bg-surface-700 hover:text-white/80'
                      }`}
                    >
                      <span className="truncate">
                        {el.type === 'text'
                          ? (el as TextElement).content || 'Text'
                          : el.type === 'image'
                            ? 'Image'
                            : 'Shape'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="ml-2 rounded p-0.5 text-white/30 hover:text-red-400 hover:bg-surface-600"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Element properties — shown when an element is selected */}
          <IconElementControls />

          {/* Delete selected */}
          {selectedIds.length > 0 && (
            <div className="mt-auto border-t border-white/[0.06] px-3 py-2.5">
              <button
                onClick={removeSelected}
                className="flex w-full items-center justify-center gap-1.5 rounded bg-red-500/10 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={12} />
                Delete selected
              </button>
            </div>
          )}
        </div>

        {/* Center — canvas */}
        <IconCanvas screenshot={screenshot} activeGuideline={activeGuideline} />

        {/* Right panel — previews + export */}
        <div className="w-[320px] shrink-0 border-l border-white/[0.06] bg-surface-800">
          <IconPreviewPanel screenshot={screenshot} />
        </div>
      </div>
    </div>
  );
}
