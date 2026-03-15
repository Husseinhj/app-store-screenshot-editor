import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Smartphone, Tablet, Monitor, Watch } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { getDefaultExportSize } from '@/lib/exportSizes';
import { PreviewScreenshotCard } from './PreviewScreenshotCard';
import type { Platform } from '@/store/types';

const platformTabs: { platform: Platform; label: string; icon: typeof Smartphone }[] = [
  { platform: 'iphone', label: 'iPhone', icon: Smartphone },
  { platform: 'ipad', label: 'iPad', icon: Tablet },
  { platform: 'mac', label: 'Mac', icon: Monitor },
  { platform: 'apple-watch', label: 'Watch', icon: Watch },
];

/** Preview card height per platform (pixels) */
const previewHeights: Record<Platform, number> = {
  iphone: 500,
  ipad: 420,
  mac: 340,
  'apple-watch': 260,
};

export function AppStorePreview() {
  const closePreview = useProjectStore((s) => s.closeAppStorePreview);
  const previewPlatform = useProjectStore((s) => s.previewPlatform);
  const setPreviewPlatform = useProjectStore((s) => s.setPreviewPlatform);
  const projectName = useProjectStore((s) => s.project.name);
  const screenshotsByPlatform = useProjectStore((s) => s.project.screenshotsByPlatform);

  const screenshots = screenshotsByPlatform[previewPlatform] ?? [];
  const exportSize = getDefaultExportSize(previewPlatform);
  const previewHeight = previewHeights[previewPlatform];

  // Lock body scroll & handle Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePreview();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [closePreview]);

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 9999, backgroundColor: '#000', animation: 'fadeIn 200ms ease-out' }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={closePreview}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            title="Close preview (Esc)"
          >
            <X size={18} />
          </button>
          <span className="text-sm font-medium text-white/70">App Store Preview</span>
        </div>

        {/* Platform tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
          {platformTabs.map(({ platform, label, icon: Icon }) => {
            const isActive = previewPlatform === platform;
            const hasScreenshots = (screenshotsByPlatform[platform] ?? []).length > 0;
            return (
              <button
                key={platform}
                onClick={() => setPreviewPlatform(platform)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : hasScreenshots
                      ? 'text-white/50 hover:text-white/70 hover:bg-white/5'
                      : 'text-white/20 cursor-default'
                }`}
                disabled={!hasScreenshots}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* ── Product Page Content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* App Info */}
          <div className="flex items-start gap-4 mb-8">
            {/* App icon */}
            <div
              className="h-16 w-16 flex-shrink-0 rounded-[14px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl text-white font-bold shadow-lg"
            >
              {projectName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{projectName}</h1>
              <p className="text-sm text-white/40 mt-0.5">Your App Subtitle</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-xs text-white/30 ml-1">5.0</span>
                </div>
                <span className="text-[10px] text-white/20">4+ Age</span>
                <span className="text-[10px] text-white/20">Free</span>
              </div>
            </div>
            <button className="flex-shrink-0 rounded-full bg-[#0A84FF] px-6 py-1.5 text-sm font-bold text-white">
              GET
            </button>
          </div>

          {/* Screenshot Carousel */}
          {screenshots.length > 0 ? (
            <div
              className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6"
              style={{
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {screenshots.map((ss) => (
                <PreviewScreenshotCard
                  key={ss.id}
                  screenshot={ss}
                  exportWidth={exportSize.width}
                  exportHeight={exportSize.height}
                  previewHeight={previewHeight}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-2xl border border-white/5 bg-white/3">
              <p className="text-sm text-white/20">No screenshots for this platform</p>
            </div>
          )}

          {/* Description */}
          <div className="mt-8 border-t border-white/8 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Description</h2>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              This is a preview of how your screenshots will appear on the App Store product page.
              The actual layout may vary slightly depending on the device and App Store version.
            </p>
          </div>

          {/* What's New */}
          <div className="mt-6 border-t border-white/8 pt-6">
            <h2 className="text-lg font-bold text-white mb-3">What's New</h2>
            <p className="text-xs text-white/30 mb-1">Version 1.0</p>
            <p className="text-sm text-white/50 leading-relaxed">
              Initial release with all the features you love.
            </p>
          </div>

          {/* Information */}
          <div className="mt-6 border-t border-white/8 pt-6 pb-12">
            <h2 className="text-lg font-bold text-white mb-4">Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/30">Provider</p>
                <p className="text-white/60">Your Company</p>
              </div>
              <div>
                <p className="text-white/30">Size</p>
                <p className="text-white/60">42.3 MB</p>
              </div>
              <div>
                <p className="text-white/30">Category</p>
                <p className="text-white/60">Productivity</p>
              </div>
              <div>
                <p className="text-white/30">Compatibility</p>
                <p className="text-white/60">
                  {previewPlatform === 'iphone' && 'iPhone'}
                  {previewPlatform === 'ipad' && 'iPad'}
                  {previewPlatform === 'mac' && 'macOS 14.0+'}
                  {previewPlatform === 'apple-watch' && 'watchOS 10.0+'}
                </p>
              </div>
              <div>
                <p className="text-white/30">Languages</p>
                <p className="text-white/60">English</p>
              </div>
              <div>
                <p className="text-white/30">Price</p>
                <p className="text-white/60">Free</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframe animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
