import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import type { ImageElement } from '@/store/types';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  element: ImageElement;
}

export function ImageElementPanel({ element }: Props) {
  const updateImageElement = useProjectStore((s) => s.updateImageElement);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const { readFileAsCompressedDataUrl } = await import('@/lib/imageUtils');
      const url = await readFileAsCompressedDataUrl(file);
      updateImageElement(element.id, { imageUrl: url });
    },
    [element.id, updateImageElement]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  return (
    <SidebarSection title="Image">
      {/* Replace image */}
      <div
        {...getRootProps()}
        className={`mb-3 flex h-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragActive ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-white/40'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-[10px] text-white/40">
          {isDragActive ? 'Drop to replace' : 'Drop image to replace'}
        </p>
      </div>

      {/* Object fit */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-white/40">Fit</label>
        <div className="grid grid-cols-3 gap-1 rounded bg-surface-700 p-0.5">
          {(['cover', 'contain', 'fill'] as const).map((fit) => (
            <button
              key={fit}
              onClick={() => updateImageElement(element.id, { objectFit: fit })}
              className={`rounded py-1 text-[11px] font-medium transition-colors capitalize ${
                element.objectFit === fit
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] text-white/40">
          Opacity: {Math.round(element.opacity * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={element.opacity}
          onChange={(e) => updateImageElement(element.id, { opacity: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      {/* Border radius */}
      <div>
        <label className="mb-1 block text-[11px] text-white/40">
          Border Radius: {element.borderRadius}px
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={element.borderRadius}
          onChange={(e) => updateImageElement(element.id, { borderRadius: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>
    </SidebarSection>
  );
}
