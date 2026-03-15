import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import { Type, Image, Smartphone, Square, Circle, Minus, ArrowRight } from 'lucide-react';
import { useCallback } from 'react';
import type { ShapeType } from '@/store/types';

const shapes: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
  { type: 'rectangle', icon: <Square size={16} />, label: 'Rect' },
  { type: 'circle', icon: <Circle size={16} />, label: 'Circle' },
  { type: 'line', icon: <Minus size={16} />, label: 'Line' },
  { type: 'arrow', icon: <ArrowRight size={16} />, label: 'Arrow' },
];

const emojis = [
  '😀', '😍', '🔥', '⭐', '💡', '🎯',
  '✅', '❌', '⚡', '🚀', '💎', '🎨',
  '📱', '💻', '🎮', '🎵', '📸', '🏆',
  '👍', '❤️', '✨', '🌟', '💪', '🎉',
];

export function AddElementsPanel() {
  const selectedScreenshotId = useProjectStore((s) => s.project.selectedScreenshotId);
  const addTextElement = useProjectStore((s) => s.addTextElement);
  const addImageElement = useProjectStore((s) => s.addImageElement);
  const addDeviceFrameElement = useProjectStore((s) => s.addDeviceFrameElement);
  const addShapeElement = useProjectStore((s) => s.addShapeElement);
  const addEmojiElement = useProjectStore((s) => s.addEmojiElement);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => addImageElement(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  }, [addImageElement]);

  if (!selectedScreenshotId) {
    return (
      <SidebarSection title="Add Elements">
        <p className="text-[10px] text-white/30">Select a screen first</p>
      </SidebarSection>
    );
  }

  return (
    <SidebarSection title="Add Elements">
      {/* Primary add buttons */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <AddButton icon={<Type size={16} />} label="Text" onClick={() => addTextElement()} />
        <AddButton icon={<Image size={16} />} label="Image" onClick={handleImageUpload} />
        <AddButton icon={<Smartphone size={16} />} label="Device" onClick={addDeviceFrameElement} />
      </div>

      {/* Shapes */}
      <label className="mb-1.5 block text-[10px] text-white/40">Shapes</label>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {shapes.map(({ type, icon, label }) => (
          <AddButton key={type} icon={icon} label={label} onClick={() => addShapeElement(type)} small />
        ))}
      </div>

      {/* Emoji */}
      <label className="mb-1.5 block text-[10px] text-white/40">Emoji</label>
      <div className="grid grid-cols-6 gap-1 max-h-[140px] overflow-y-auto">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addEmojiElement(emoji)}
            className="flex items-center justify-center rounded-md py-1.5 text-base hover:bg-surface-600 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </SidebarSection>
  );
}

function AddButton({ icon, label, onClick, small }: { icon: React.ReactNode; label: string; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-700 transition-colors hover:bg-surface-600 hover:text-white text-white/60 ${
        small ? 'py-1.5 px-1' : 'py-2.5 px-2'
      }`}
    >
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}
