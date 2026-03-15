import { useRef, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { devices, devicesByPlatform, platformLabels } from '@/lib/devices';
import { SidebarSection } from './SidebarSection';
import type { DeviceType, DeviceFrameElement, CustomFrame, Platform } from '@/store/types';
import { Monitor, Smartphone, Code2, RectangleVertical, RectangleHorizontal, Upload, Trash2, Edit3, Maximize, Minimize, Square, Move, ChevronRight, ChevronDown } from 'lucide-react';
import type { ScreenshotFit } from '@/store/types';
import { nanoid } from 'nanoid';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

interface Props {
  element: DeviceFrameElement;
}

export function DevicePanel({ element }: Props) {
  const platform = useProjectStore((s) => s.project.platform);
  const updateDeviceElement = useProjectStore((s) => s.updateDeviceElement);
  const customFrames = useProjectStore((s) => s.customFrames);
  const addCustomFrame = useProjectStore((s) => s.addCustomFrame);
  const removeCustomFrame = useProjectStore((s) => s.removeCustomFrame);
  const updateCustomFrame = useProjectStore((s) => s.updateCustomFrame);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingFrame, setEditingFrame] = useState<string | null>(null);
  const [screenRect, setScreenRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [expandedPlatforms, setExpandedPlatforms] = useState<Platform[]>([platform]);

  const currentDevice = devices[element.device];
  const colorVariants = currentDevice.colorVariants;

  // Show current platform first, then others
  const sortedPlatforms = [platform, ...allPlatforms.filter((p) => p !== platform)];

  const togglePlatformGroup = (p: Platform) => {
    setExpandedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleImportSvg = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.svg')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const svgContent = reader.result as string;

      // Try to extract viewBox
      const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
      const viewBox = viewBoxMatch?.[1] ?? '0 0 100 100';

      const frame: CustomFrame = {
        id: nanoid(),
        name: file.name.replace('.svg', ''),
        svgContent,
        screenRect: { x: 10, y: 10, width: 80, height: 80 },
        viewBox,
      };

      addCustomFrame(frame);
      // Auto-select the custom frame on the device element
      updateDeviceElement(element.id, { customFrameId: frame.id });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpdateSvg = (frameId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const svgContent = reader.result as string;
        const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
        const viewBox = viewBoxMatch?.[1] ?? '0 0 100 100';
        updateCustomFrame(frameId, { svgContent, viewBox });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <SidebarSection title="Device">
      {/* Device selector — all platforms, grouped */}
      <div className="space-y-1 mb-3">
        {sortedPlatforms.map((p) => {
          const platformDevices = devicesByPlatform[p];
          const isExpanded = expandedPlatforms.includes(p);
          return (
            <div key={p}>
              <button
                onClick={() => togglePlatformGroup(p)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:text-white/60 hover:bg-surface-700 transition-colors"
              >
                {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                {platformLabels[p]}
                <span className="text-[9px] font-normal text-white/20 ml-auto">{platformDevices.length}</span>
              </button>
              {isExpanded && (
                <div className="space-y-0.5 mt-0.5 ml-2">
                  {platformDevices.map((deviceId: DeviceType) => {
                    const def = devices[deviceId];
                    return (
                      <button
                        key={deviceId}
                        onClick={() => updateDeviceElement(element.id, { device: deviceId, customFrameId: null })}
                        className={`w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                          element.device === deviceId && !element.customFrameId
                            ? 'bg-accent/20 text-white ring-1 ring-accent/50'
                            : 'text-white/60 hover:bg-surface-600 hover:text-white'
                        }`}
                      >
                        {def.label}
                        <span className="ml-2 text-[10px] text-white/30">
                          {def.nativeScreenWidth}x{def.nativeScreenHeight}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom frames section */}
      <div className="mb-3">
        <label className="mb-1.5 block text-[10px] text-white/40">Custom Frames</label>
        <div className="space-y-1">
          {customFrames.map((frame) => (
            <div key={frame.id} className="flex items-center gap-1">
              <button
                onClick={() => updateDeviceElement(element.id, { customFrameId: frame.id })}
                className={`flex-1 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  element.customFrameId === frame.id
                    ? 'bg-accent/20 text-white ring-1 ring-accent/50'
                    : 'text-white/60 hover:bg-surface-600 hover:text-white'
                }`}
              >
                {frame.name}
              </button>
              <button
                onClick={() => {
                  setEditingFrame(editingFrame === frame.id ? null : frame.id);
                  setScreenRect(frame.screenRect);
                }}
                className="rounded p-1 text-white/30 hover:text-white/60 hover:bg-surface-600"
                title="Edit screen rect"
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={() => handleUpdateSvg(frame.id)}
                className="rounded p-1 text-white/30 hover:text-white/60 hover:bg-surface-600"
                title="Replace SVG"
              >
                <Upload size={12} />
              </button>
              <button
                onClick={() => {
                  removeCustomFrame(frame.id);
                  if (element.customFrameId === frame.id) {
                    updateDeviceElement(element.id, { customFrameId: null });
                  }
                }}
                className="rounded p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                title="Delete frame"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {/* Edit screen rect inline */}
          {editingFrame && (
            <div className="rounded-lg bg-surface-700 p-2 mt-1 space-y-1.5">
              <label className="text-[10px] text-white/40">Screen Rect (SVG units)</label>
              <div className="grid grid-cols-2 gap-1">
                {(['x', 'y', 'width', 'height'] as const).map((field) => (
                  <div key={field}>
                    <label className="text-[9px] text-white/30 uppercase">{field}</label>
                    <input
                      type="number"
                      value={screenRect[field]}
                      onChange={(e) => setScreenRect({ ...screenRect, [field]: Number(e.target.value) })}
                      className="w-full rounded bg-surface-600 px-2 py-1 text-[10px] text-white outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  updateCustomFrame(editingFrame, { screenRect });
                  setEditingFrame(null);
                }}
                className="w-full rounded-md bg-accent/20 py-1 text-[10px] text-white hover:bg-accent/30"
              >
                Apply
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleImportSvg}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 text-[10px] text-white/40 hover:text-white/60 hover:border-white/30 transition-colors"
        >
          <Upload size={12} />
          Import SVG Frame
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Orientation toggle — iPad devices only */}
      {currentDevice.platform === 'ipad' && (
        <div className="mb-3">
          <label className="mb-1.5 block text-[10px] text-white/40">Orientation</label>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-700 p-1">
            <button
              onClick={() => updateDeviceElement(element.id, { orientation: 'portrait' })}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                (element.orientation ?? 'portrait') === 'portrait'
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <RectangleVertical size={12} />
              Portrait
            </button>
            <button
              onClick={() => updateDeviceElement(element.id, { orientation: 'landscape' })}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                (element.orientation ?? 'portrait') === 'landscape'
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <RectangleHorizontal size={12} />
              Landscape
            </button>
          </div>
        </div>
      )}

      {/* Show Device Frame toggle */}
      <div className="mb-3 flex items-center justify-between rounded-lg bg-surface-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-white/50" />
          <span className="text-xs text-white/70">Device Frame</span>
        </div>
        <button
          onClick={() => updateDeviceElement(element.id, { showDeviceFrame: !element.showDeviceFrame })}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            element.showDeviceFrame ? 'bg-accent' : 'bg-surface-500'
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              element.showDeviceFrame ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Frame style toggle (SVG Mockup vs CSS) — only for built-in devices */}
      {element.showDeviceFrame && !element.customFrameId && currentDevice.svgPath && (
        <div className="mb-3">
          <label className="mb-1.5 block text-[10px] text-white/40">Frame Style</label>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-700 p-1">
            <button
              onClick={() => updateDeviceElement(element.id, { frameStyle: 'svg' })}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                element.frameStyle === 'svg'
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Smartphone size={12} />
              Realistic
            </button>
            <button
              onClick={() => updateDeviceElement(element.id, { frameStyle: 'css' })}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                element.frameStyle === 'css'
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Code2 size={12} />
              Minimal
            </button>
          </div>
        </div>
      )}

      {/* Frame color variants — only for built-in devices */}
      {(() => {
        if (!element.showDeviceFrame || element.customFrameId) return null;
        const isSvgMode = element.frameStyle === 'svg' && currentDevice.svgPath;
        const visibleVariants = isSvgMode
          ? colorVariants.filter((v) => v.svgPath || v.id === 'default')
          : colorVariants;
        if (visibleVariants.length <= 1) return null;
        return (
          <div>
            <label className="mb-1.5 block text-[10px] text-white/40">Color</label>
            <div className="grid grid-cols-2 gap-1.5">
              {visibleVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => updateDeviceElement(element.id, { frameColorVariant: variant.id })}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all ${
                    element.frameColorVariant === variant.id
                      ? 'bg-accent/20 ring-1 ring-accent/50'
                      : 'bg-surface-700 hover:bg-surface-600'
                  }`}
                >
                  <div
                    className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/20"
                    style={{ backgroundColor: variant.swatchColor }}
                  />
                  <span className="text-[10px] text-white/70 truncate">{variant.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Screenshot Fit Mode */}
      {element.screenshotImageUrl && (
        <div className="mt-3">
          <label className="mb-1.5 block text-[10px] text-white/40">Screenshot Fit</label>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-surface-700 p-1">
            {([
              { value: 'contain' as ScreenshotFit, label: 'Fit', icon: Minimize },
              { value: 'cover' as ScreenshotFit, label: 'Fill', icon: Maximize },
              { value: 'stretch' as ScreenshotFit, label: 'Stretch', icon: Square },
              { value: 'fill' as ScreenshotFit, label: 'Center', icon: Move },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateDeviceElement(element.id, { screenshotFit: value })}
                className={`flex flex-col items-center gap-0.5 rounded-md py-1.5 text-[9px] font-medium transition-colors ${
                  (element.screenshotFit ?? 'contain') === value
                    ? 'bg-accent text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot Position & Scale */}
      {element.screenshotImageUrl && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-white/40">Screenshot Position</label>
            <button
              onClick={() => updateDeviceElement(element.id, {
                screenshotOffset: { x: 0, y: 0 },
                screenshotScale: 1,
              })}
              className="text-[9px] text-white/30 hover:text-white/60"
            >
              Reset
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[9px] text-white/30">Offset X</label>
              <input
                type="number"
                step={1}
                value={element.screenshotOffset?.x ?? 0}
                onChange={(e) => updateDeviceElement(element.id, {
                  screenshotOffset: { ...(element.screenshotOffset ?? { x: 0, y: 0 }), x: Number(e.target.value) }
                })}
                className="w-full rounded-md bg-surface-700 px-2 py-1 text-[10px] text-white outline-none ring-1 ring-white/10"
              />
            </div>
            <div>
              <label className="text-[9px] text-white/30">Offset Y</label>
              <input
                type="number"
                step={1}
                value={element.screenshotOffset?.y ?? 0}
                onChange={(e) => updateDeviceElement(element.id, {
                  screenshotOffset: { ...(element.screenshotOffset ?? { x: 0, y: 0 }), y: Number(e.target.value) }
                })}
                className="w-full rounded-md bg-surface-700 px-2 py-1 text-[10px] text-white outline-none ring-1 ring-white/10"
              />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-white/30">Scale ({Math.round((element.screenshotScale ?? 1) * 100)}%)</label>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              value={element.screenshotScale ?? 1}
              onChange={(e) => updateDeviceElement(element.id, { screenshotScale: Number(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
        </div>
      )}
    </SidebarSection>
  );
}
