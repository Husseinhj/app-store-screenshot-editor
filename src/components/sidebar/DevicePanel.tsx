import { useProjectStore } from '@/store/useProjectStore';
import { devices, devicesByPlatform } from '@/lib/devices';
import { SidebarSection } from './SidebarSection';
import type { DeviceType, FrameStyle } from '@/store/types';
import { Monitor, Smartphone, Code2, RectangleVertical, RectangleHorizontal } from 'lucide-react';

export function DevicePanel() {
  const platform = useProjectStore((s) => s.project.platform);
  const selectedId = useProjectStore((s) => s.project.selectedScreenshotId);
  const screenshots = useProjectStore((s) => s.project.screenshotsByPlatform[s.project.platform] ?? []);
  const setDevice = useProjectStore((s) => s.setDevice);
  const setFrameStyle = useProjectStore((s) => s.setFrameStyle);
  const setFrameColorVariant = useProjectStore((s) => s.setFrameColorVariant);
  const setShowDeviceFrame = useProjectStore((s) => s.setShowDeviceFrame);
  const setOrientation = useProjectStore((s) => s.setOrientation);

  const selected = screenshots.find((s: any) => s.id === selectedId);
  if (!selected) return null;

  const availableDevices = devicesByPlatform[platform];
  const currentDevice = devices[selected.device];
  const colorVariants = currentDevice.colorVariants;

  return (
    <SidebarSection title="Device">
      {/* Device selector */}
      <div className="space-y-1 mb-3">
        {availableDevices.map((deviceId: DeviceType) => {
          const def = devices[deviceId];
          return (
            <button
              key={deviceId}
              onClick={() => setDevice(deviceId)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                selected.device === deviceId
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

      {/* Orientation toggle — iPad only */}
      {platform === 'ipad' && (
        <div className="mb-3">
          <label className="mb-1.5 block text-[10px] text-white/40">Orientation</label>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-700 p-1">
            <button
              onClick={() => setOrientation('portrait')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                (selected.orientation ?? 'portrait') === 'portrait'
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <RectangleVertical size={12} />
              Portrait
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                (selected.orientation ?? 'portrait') === 'landscape'
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
          onClick={() => setShowDeviceFrame(!selected.showDeviceFrame)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            selected.showDeviceFrame ? 'bg-accent' : 'bg-surface-500'
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              selected.showDeviceFrame ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Frame style toggle (SVG Mockup vs CSS) */}
      {selected.showDeviceFrame && currentDevice.svgPath && (
        <div className="mb-3">
          <label className="mb-1.5 block text-[10px] text-white/40">Frame Style</label>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-700 p-1">
            <button
              onClick={() => setFrameStyle('svg')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                selected.frameStyle === 'svg'
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Smartphone size={12} />
              Realistic
            </button>
            <button
              onClick={() => setFrameStyle('css')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-colors ${
                selected.frameStyle === 'css'
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

      {/* Frame color variants */}
      {(() => {
        if (!selected.showDeviceFrame) return null;
        // In SVG mode: only show variants that have their own SVG mockup (+ the default which uses device SVG)
        // In CSS mode: show all variants (CSS colors always work)
        const isSvgMode = selected.frameStyle === 'svg' && currentDevice.svgPath;
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
                  onClick={() => setFrameColorVariant(variant.id)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all ${
                    selected.frameColorVariant === variant.id
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
    </SidebarSection>
  );
}
