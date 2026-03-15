import { useState, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { platformLabels } from '@/lib/devices';
import { designTemplates, type DesignTemplate } from '@/lib/templates';
import { showcaseApps, type ShowcaseApp, type ShowcaseScreenshot, type ShowcaseDevice } from '@/lib/showcases';
import { getTextEffectStyles } from '@/lib/textEffects';
import { NewProjectDialog } from './NewProjectDialog';
import {
  Plus,
  Trash2,
  Copy,
  Sparkles,
  ArrowRight,
  Layers,
  Palette,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Platform } from '@/store/types';

// ─── Utility ───────────────────────────────────────────────────────────────────

function formatRelativeDate(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

const platformIcon = (p: Platform) =>
  ({ iphone: '📱', ipad: '📋', mac: '💻', 'apple-watch': '⌚' })[p];

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection({ onNewProject }: { onNewProject: () => void }) {
  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-24 text-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 mb-6 text-xs font-medium text-white/60 ring-1 ring-white/10">
          <Sparkles size={12} className="text-indigo-400" />
          Professional App Store Screenshots
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          Design screenshots
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            that convert
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
          Create stunning App Store &amp; Play Store screenshots with device mockups,
          beautiful templates, and professional text effects.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            New Project
          </button>
          <a
            href="#templates"
            className="flex items-center gap-2 rounded-xl bg-white/8 px-6 py-3 text-sm font-medium text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/12 hover:text-white"
          >
            Browse Templates
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Smartphone, label: 'Device Mockups' },
            { icon: Palette, label: '11 Templates' },
            { icon: Layers, label: 'Multi-Platform' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-white/40 ring-1 ring-white/8"
            >
              <Icon size={13} className="text-white/30" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Showcase Section ──────────────────────────────────────────────────────────

function ShowcaseSection({ onCreateFromShowcase }: { onCreateFromShowcase: (app: ShowcaseApp) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 440;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">App Showcases</h2>
            <p className="mt-1 text-sm text-white/30">
              Get inspired &mdash; start from a pre-built app showcase
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="rounded-lg bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-lg bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          {showcaseApps.map((app) => (
            <ShowcaseCard key={app.id} app={app} onUse={() => onCreateFromShowcase(app)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mini Device Frames ────────────────────────────────────────────────────────

/** Shared screen content rendered inside any mini device */
function ScreenContent({
  headline,
  subtitle,
  textColor,
  headlineFontSize,
  subtitleFontSize,
}: {
  headline: string;
  subtitle: string;
  textColor: string;
  headlineFontSize: number;
  subtitleFontSize: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-[6%] text-center">
      <div className="font-bold leading-tight" style={{ fontSize: headlineFontSize, color: textColor }}>
        {headline}
      </div>
      <div className="mt-0.5 leading-tight" style={{ fontSize: subtitleFontSize, color: textColor, opacity: 0.6 }}>
        {subtitle}
      </div>
      <div
        className="mt-1 rounded-[2px]"
        style={{ width: '55%', height: '35%', background: `${textColor}10`, border: `0.5px solid ${textColor}20` }}
      />
    </div>
  );
}

function MiniIPhone({ width, screenBg, children, style }: { width: number; screenBg?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  const h = width * 2.05;
  const b = width * 0.05;
  const r = width * 0.18;

  return (
    <div style={{ width, height: h, position: 'relative', ...style }}>
      <div className="absolute inset-0" style={{ borderRadius: r, backgroundColor: '#1c1c1e', boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.08)' }} />
      <div className="absolute overflow-hidden" style={{ top: b, left: b, right: b, bottom: b, borderRadius: r - b * 0.8, background: screenBg ?? '#000' }}>
        {children}
      </div>
      <div className="absolute" style={{ top: b + width * 0.03, left: '50%', transform: 'translateX(-50%)', width: width * 0.28, height: width * 0.06, borderRadius: 99, backgroundColor: '#000' }} />
      <div className="absolute" style={{ bottom: b + 2, left: '50%', transform: 'translateX(-50%)', width: width * 0.32, height: Math.max(2, width * 0.02), borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)' }} />
    </div>
  );
}

function MiniIPad({ width, screenBg, children, style }: { width: number; screenBg?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  const h = width * 1.38;
  const b = width * 0.035;
  const r = width * 0.06;

  return (
    <div style={{ width, height: h, position: 'relative', ...style }}>
      <div className="absolute inset-0" style={{ borderRadius: r, backgroundColor: '#1a1a1a', boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.06)' }} />
      <div className="absolute overflow-hidden" style={{ top: b, left: b, right: b, bottom: b, borderRadius: r - b * 0.5, background: screenBg ?? '#000' }}>
        {children}
      </div>
      {/* Camera dot */}
      <div className="absolute rounded-full" style={{ top: b * 0.4, left: '50%', transform: 'translateX(-50%)', width: Math.max(3, width * 0.03), height: Math.max(3, width * 0.03), backgroundColor: '#111', border: '0.5px solid #333' }} />
    </div>
  );
}

function MiniMac({ width, screenBg, children, style }: { width: number; screenBg?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  const h = width * 0.68;
  const lidH = h * 0.88;
  const baseH = h * 0.12;
  const b = width * 0.03;
  const r = width * 0.03;

  return (
    <div style={{ width, height: h, position: 'relative', ...style }}>
      {/* Lid */}
      <div className="absolute" style={{ top: 0, left: width * 0.02, right: width * 0.02, height: lidH, borderRadius: `${r}px ${r}px 0 0`, backgroundColor: '#2d2d2d', boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.06)' }}>
        {/* Camera */}
        <div className="absolute rounded-full" style={{ top: b * 0.5, left: '50%', transform: 'translateX(-50%)', width: Math.max(3, width * 0.02), height: Math.max(3, width * 0.02), backgroundColor: '#111', border: '0.5px solid #444' }} />
        {/* Screen */}
        <div className="absolute overflow-hidden" style={{ top: b + 2, left: b, right: b, bottom: b * 0.6, borderRadius: Math.max(2, r * 0.5), background: screenBg ?? '#000' }}>
          {children}
        </div>
      </div>
      {/* Base */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: baseH, borderRadius: `0 0 ${r}px ${r}px`, background: 'linear-gradient(to bottom, #2d2d2d, #252525)', borderTop: '1px solid #3a3a3a' }}>
        <div className="absolute" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: width * 0.12, height: 2, borderRadius: 2, backgroundColor: '#3a3a3a' }} />
      </div>
    </div>
  );
}

function MiniWatch({ width, screenBg, children, style }: { width: number; screenBg?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  const h = width * 1.25;
  const b = width * 0.08;
  const r = width * 0.28;

  return (
    <div style={{ width, height: h, position: 'relative', ...style }}>
      {/* Case */}
      <div className="absolute inset-0" style={{ borderRadius: r, backgroundColor: '#1a1a1a', boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.06)' }} />
      {/* Digital Crown */}
      <div className="absolute" style={{ right: -2, top: '28%', width: 3, height: h * 0.14, borderRadius: 2, backgroundColor: '#333' }} />
      {/* Side button */}
      <div className="absolute" style={{ right: -1.5, top: '48%', width: 2, height: h * 0.07, borderRadius: 1, backgroundColor: '#333' }} />
      {/* Screen */}
      <div className="absolute overflow-hidden" style={{ top: b, left: b, right: b, bottom: b, borderRadius: r - b * 0.5, background: screenBg ?? '#000' }}>
        {children}
      </div>
    </div>
  );
}

/** Renders the appropriate device mockup for a showcase screenshot */
function MiniDevice({
  screenshot,
  baseWidth,
  style,
}: {
  screenshot: ShowcaseScreenshot;
  baseWidth: number;
  style?: React.CSSProperties;
}) {
  const { device, screenBg, headline, subtitle, textColor } = screenshot;

  // Scale and font sizes per device type
  const config: Record<ShowcaseDevice, { wMult: number; hFontMult: number; sFontMult: number }> = {
    iphone: { wMult: 1, hFontMult: 1, sFontMult: 1 },
    ipad:   { wMult: 1.35, hFontMult: 1.3, sFontMult: 1.2 },
    mac:    { wMult: 1.65, hFontMult: 1.1, sFontMult: 1 },
    watch:  { wMult: 0.55, hFontMult: 0.7, sFontMult: 0.6 },
  };

  const c = config[device];
  const w = baseWidth * c.wMult;
  const hFs = Math.max(4, 7 * c.hFontMult);
  const sFs = Math.max(3, 4 * c.sFontMult);

  const content = (
    <ScreenContent
      headline={headline}
      subtitle={subtitle}
      textColor={textColor}
      headlineFontSize={hFs}
      subtitleFontSize={sFs}
    />
  );

  switch (device) {
    case 'ipad':
      return <MiniIPad width={w} screenBg={screenBg} style={style}>{content}</MiniIPad>;
    case 'mac':
      return <MiniMac width={w} screenBg={screenBg} style={style}>{content}</MiniMac>;
    case 'watch':
      return <MiniWatch width={w} screenBg={screenBg} style={style}>{content}</MiniWatch>;
    default:
      return <MiniIPhone width={w} screenBg={screenBg} style={style}>{content}</MiniIPhone>;
  }
}

// ─── Showcase Card ─────────────────────────────────────────────────────────────

function ShowcaseCard({ app, onUse }: { app: ShowcaseApp; onUse: () => void }) {
  // Show platform badges
  const deviceTypes = [...new Set(app.screenshots.map((s) => s.device))];
  const deviceLabels: Record<ShowcaseDevice, string> = { iphone: 'iPhone', ipad: 'iPad', mac: 'Mac', watch: 'Watch' };

  return (
    <div className="group relative flex-shrink-0 w-[480px] snap-start rounded-2xl overflow-hidden bg-surface-800 ring-1 ring-white/8 hover:ring-white/20 transition-all">
      {/* Device screens area */}
      <div
        className="relative h-[280px] flex items-end justify-center px-4 pt-4 pb-3 overflow-hidden"
        style={{ background: app.cardGradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Devices — aligned at bottom */}
        <div className="relative z-10 flex items-end justify-center gap-2">
          {app.screenshots.map((screenshot, i) => {
            // Stagger heights: center items sit a bit higher
            const mid = (app.screenshots.length - 1) / 2;
            const dist = Math.abs(i - mid);
            const yOff = dist * 12;
            return (
              <MiniDevice
                key={i}
                screenshot={screenshot}
                baseWidth={72}
                style={{ transform: `translateY(${yOff}px)`, transition: 'transform 0.3s ease' }}
              />
            );
          })}
        </div>
      </div>

      {/* Info bar */}
      <div className="p-4 flex items-center gap-3">
        <span className="text-2xl">{app.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{app.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium"
              style={{ backgroundColor: `${app.accentColor}20`, color: app.accentColor }}
            >
              {app.category}
            </span>
            {deviceTypes.map((d) => (
              <span key={d} className="text-[9px] text-white/25">{deviceLabels[d]}</span>
            ))}
            <span className="text-[9px] text-white/20">&middot; {app.screenshots.length} screens</span>
          </div>
        </div>
        <button
          onClick={onUse}
          className="flex-shrink-0 rounded-lg px-3.5 py-1.5 text-[11px] font-medium text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white"
        >
          Use
        </button>
      </div>
    </div>
  );
}

// ─── Template Gallery ──────────────────────────────────────────────────────────

function TemplateGallerySection({
  onCreateFromTemplate,
}: {
  onCreateFromTemplate: (templateId: string) => void;
}) {
  const [filter, setFilter] = useState<string>('all');
  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Bold', value: 'bold' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Editorial', value: 'editorial' },
    { label: 'Playful', value: 'playful' },
    { label: 'Dark', value: 'dark' },
  ];

  const filtered =
    filter === 'all'
      ? designTemplates
      : designTemplates.filter((t) => t.category === filter);

  return (
    <section id="templates" className="px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Design Templates</h2>
          <p className="mt-1 text-sm text-white/30">
            Start with a professionally designed layout
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === cat.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((template) => (
            <TemplateGalleryCard
              key={template.id}
              template={template}
              onUse={() => onCreateFromTemplate(template.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Realistic preview data per template for the card thumbnail */
const templatePreviewData: Record<string, { headline: string; subtitle: string; screenAccent: string }> = {
  monochromeInk: { headline: 'Track Goals', subtitle: 'Stay focused daily', screenAccent: '#ffffff' },
  popArt: { headline: 'Create Art', subtitle: 'Unleash creativity', screenAccent: '#ff006e' },
  cardStack: { headline: 'Manage Tasks', subtitle: 'Simple & powerful', screenAccent: '#6366f1' },
  midnightSapphire: { headline: 'Smart Finance', subtitle: 'AI-powered insights', screenAccent: '#F4C542' },
  editorial: { headline: 'Read Stories', subtitle: 'Curated for you', screenAccent: '#1a1a1a' },
  storyCard: { headline: 'Share Moments', subtitle: 'Beautiful memories', screenAccent: '#e57373' },
  glassMorphism: { headline: 'Music Live', subtitle: 'Feel the rhythm', screenAccent: '#a78bfa' },
  minimal: { headline: 'Notes', subtitle: 'Clean & simple', screenAccent: '#999999' },
  modern: { headline: 'Pro Camera', subtitle: 'Shoot like a pro', screenAccent: '#3b82f6' },
  anime: { headline: 'Battle Arena', subtitle: 'Join the fight', screenAccent: '#06b6d4' },
  material3: { headline: 'Wellness', subtitle: 'Mind & body', screenAccent: '#8b5cf6' },
};

/** Mini app-like screen content for template preview */
function MiniAppScreen({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Status bar */}
      <div className="flex justify-between items-center px-[10%] pt-[6%]" style={{ height: '8%' }}>
        <div className="w-[18%] h-[2px] rounded-full bg-white/20" />
        <div className="w-[12%] h-[2px] rounded-full bg-white/20" />
      </div>
      {/* Title area */}
      <div className="px-[10%] pt-[5%]">
        <div className="w-[55%] h-[3px] rounded-full" style={{ backgroundColor: `${accent}40` }} />
        <div className="w-[35%] h-[2px] rounded-full mt-[3px]" style={{ backgroundColor: `${accent}20` }} />
      </div>
      {/* Content cards */}
      <div className="flex-1 px-[8%] pt-[6%] flex flex-col gap-[4px]">
        <div className="w-full rounded-[3px] flex-[3]" style={{ backgroundColor: `${accent}15`, border: `0.5px solid ${accent}10` }} />
        <div className="flex gap-[3px] flex-[2]">
          <div className="flex-1 rounded-[2px]" style={{ backgroundColor: `${accent}10` }} />
          <div className="flex-1 rounded-[2px]" style={{ backgroundColor: `${accent}10` }} />
        </div>
        <div className="w-full rounded-[3px] flex-[1.5]" style={{ backgroundColor: `${accent}08` }} />
      </div>
      {/* Bottom nav bar */}
      <div className="flex justify-around items-center px-[8%]" style={{ height: '10%' }}>
        <div className="w-[8%] aspect-square rounded-full" style={{ backgroundColor: `${accent}30` }} />
        <div className="w-[8%] aspect-square rounded-full" style={{ backgroundColor: `${accent}15` }} />
        <div className="w-[8%] aspect-square rounded-full" style={{ backgroundColor: `${accent}15` }} />
        <div className="w-[8%] aspect-square rounded-full" style={{ backgroundColor: `${accent}15` }} />
      </div>
    </div>
  );
}

function TemplateGalleryCard({
  template,
  onUse,
}: {
  template: DesignTemplate;
  onUse: () => void;
}) {
  const getBgCss = (): string => {
    if (template.background.type === 'solid') return template.background.solidColor;
    if (template.background.type === 'gradient') {
      const { angle, stops } = template.background.gradient;
      return `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
    }
    return '#000';
  };

  const headlineSpec = template.elements.find((e) => e.type === 'text');
  const subtitleSpec = template.elements.filter((e) => e.type === 'text')[1];
  const textColor = headlineSpec?.text?.color ?? '#ffffff';
  const textEffects = headlineSpec?.text?.effects;
  const deviceSpec = template.elements.find((e) => e.type === 'device-frame');
  const shapes = template.elements.filter((e) => e.type === 'shape');
  const preview = templatePreviewData[template.id] ?? { headline: template.name, subtitle: 'Beautiful design', screenAccent: '#6366f1' };

  // Determine if the text is positioned left (editorial-style)
  const isEditorialLayout = headlineSpec && headlineSpec.transform.x < 15 && headlineSpec.text?.alignment === 'left';
  // Determine phone position from template: centered, left-biased, or right-biased
  const deviceX = deviceSpec?.transform.x ?? 20;
  const deviceRotation = deviceSpec?.transform.rotation ?? 0;

  return (
    <button
      onClick={onUse}
      className="group relative flex flex-col overflow-hidden rounded-xl ring-1 ring-white/8 transition-all hover:ring-white/25 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500"
      style={{ aspectRatio: '9 / 16' }}
      title={template.description}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: getBgCss() }} />

      {/* Decorative shapes */}
      {shapes.map((shape, i) => {
        const fill = shape.shape?.fillColor ?? 'rgba(255,255,255,0.1)';
        const borderRadius = shape.shape?.shapeType === 'circle' ? '50%'
          : shape.shape?.borderRadius ? `${Math.min(shape.shape.borderRadius, 20)}px` : '4px';
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${shape.transform.x}%`,
              top: `${shape.transform.y}%`,
              width: `${shape.transform.width}%`,
              height: `${shape.transform.height}%`,
              backgroundColor: fill,
              borderRadius,
              border: shape.shape?.strokeWidth ? `1px solid ${shape.shape.strokeColor}` : undefined,
              opacity: 0.7,
              transform: shape.transform.rotation ? `rotate(${shape.transform.rotation}deg)` : undefined,
            }}
          />
        );
      })}

      {/* Content */}
      <div className="relative flex h-full w-full flex-col p-3">
        {/* Text area — positioned to match template layout */}
        <div
          className={isEditorialLayout ? 'mt-2 pr-[45%]' : 'mt-2 w-full'}
          style={{ textAlign: (headlineSpec?.text?.alignment ?? 'center') as 'left' | 'center' | 'right' }}
        >
          <div
            className="leading-tight"
            style={{
              color: textColor,
              fontFamily: headlineSpec?.text?.fontFamily ?? 'Inter',
              fontWeight: headlineSpec?.text?.fontWeight ?? 700,
              fontSize: 11,
              lineHeight: 1.15,
              maxWidth: isEditorialLayout ? '100%' : '92%',
              margin: isEditorialLayout ? 0 : '0 auto',
              ...getTextEffectStyles(textEffects),
            }}
          >
            {preview.headline}
          </div>
          {subtitleSpec && (
            <div
              className="mt-0.5"
              style={{
                color: subtitleSpec.text?.color ?? textColor,
                fontFamily: subtitleSpec.text?.fontFamily ?? 'Inter',
                fontWeight: subtitleSpec.text?.fontWeight ?? 400,
                fontSize: 5.5,
                lineHeight: 1.2,
                opacity: 0.65,
                maxWidth: isEditorialLayout ? '100%' : '90%',
                margin: isEditorialLayout ? 0 : '0 auto',
                ...getTextEffectStyles(subtitleSpec.text?.effects),
              }}
            >
              {preview.subtitle}
            </div>
          )}
        </div>

        {/* Realistic phone mockup — proper aspect ratio */}
        {deviceSpec && (
          <div
            className="absolute"
            style={{
              left: `${deviceX}%`,
              top: `${deviceSpec.transform.y}%`,
              width: `${Math.min(deviceSpec.transform.width, 65)}%`,
              bottom: '-6%',
              transform: deviceRotation ? `rotate(${deviceRotation}deg)` : undefined,
            }}
          >
            {/* Aspect ratio container */}
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
              <div
                className="relative h-full"
                style={{
                  aspectRatio: '9 / 19.5',
                  maxWidth: '100%',
                  borderRadius: '14% / 6.5%',
                  backgroundColor: '#1c1c1e',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.08)',
                }}
              >
                {/* Screen */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    top: '2.5%',
                    left: '5%',
                    right: '5%',
                    bottom: '2.5%',
                    borderRadius: '12% / 5.5%',
                    background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
                  }}
                >
                  <MiniAppScreen accent={preview.screenAccent} />
                </div>
                {/* Dynamic Island */}
                <div
                  className="absolute bg-black"
                  style={{
                    top: '3.5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '28%',
                    height: '2.8%',
                    borderRadius: 99,
                  }}
                />
                {/* Home indicator */}
                <div
                  className="absolute"
                  style={{
                    bottom: '2%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30%',
                    height: '0.8%',
                    borderRadius: 99,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
        <span className="text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 bg-indigo-500/90 px-4 py-1.5 rounded-full shadow-lg">
          Use Template
        </span>
      </div>
    </button>
  );
}

// ─── Your Projects Section ─────────────────────────────────────────────────────

function YourProjectsSection({ onNewProject }: { onNewProject: () => void }) {
  const projectList = useProjectStore((s) => s.projectList);
  const openProject = useProjectStore((s) => s.openProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const duplicateProject = useProjectStore((s) => s.duplicateProject);

  const sorted = [...projectList].sort((a, b) => b.lastEditedAt - a.lastEditedAt);

  if (sorted.length === 0) return null;

  return (
    <section className="px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Your Projects</h2>
            <p className="mt-1 text-sm text-white/30">
              {sorted.length} project{sorted.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 ring-1 ring-white/8 hover:bg-white/10 hover:text-white/70 transition-colors"
          >
            <Plus size={12} />
            New
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((meta) => (
            <div
              key={meta.id}
              className="group relative flex items-center gap-4 rounded-xl bg-surface-800 p-4 ring-1 ring-white/8 hover:ring-white/20 transition-all cursor-pointer"
              onClick={() => openProject(meta.id)}
            >
              {/* Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-surface-700 to-surface-600 text-2xl">
                {platformIcon(meta.platform)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{meta.name}</h3>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/30">
                  <span className="rounded bg-surface-700 px-1.5 py-0.5">
                    {platformLabels[meta.platform]}
                  </span>
                  <span>{formatRelativeDate(meta.lastEditedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateProject(meta.id);
                  }}
                  className="rounded-md bg-surface-700 p-1.5 text-white/40 hover:text-white hover:bg-surface-600"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(meta.id);
                  }}
                  className="rounded-md bg-surface-700 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main HomePage ─────────────────────────────────────────────────────────────

export function HomePage() {
  const [showNew, setShowNew] = useState(false);
  const [newDialogTemplate, setNewDialogTemplate] = useState<string | undefined>();
  const createProject = useProjectStore((s) => s.createProject);
  const applyTemplate = useProjectStore((s) => s.applyTemplate);

  const handleCreateFromShowcase = (app: ShowcaseApp) => {
    // Map showcase device types to platform keys
    const deviceToPlatform: Record<string, Platform> = {
      iphone: 'iphone',
      ipad: 'ipad',
      mac: 'mac',
      watch: 'apple-watch',
    };

    // Group showcase screenshots by platform
    const byPlatform: Record<Platform, typeof app.screenshots> = {
      iphone: [],
      ipad: [],
      mac: [],
      'apple-watch': [],
    };
    for (const ss of app.screenshots) {
      const plat = deviceToPlatform[ss.device] ?? 'iphone';
      byPlatform[plat].push(ss);
    }

    // Create project — this creates 1 default screenshot per platform
    createProject(app.name, app.platform);
    const store = useProjectStore.getState();

    // For each platform that has showcase screenshots, set up screens
    for (const [platform, shots] of Object.entries(byPlatform) as [Platform, typeof app.screenshots][]) {
      if (shots.length === 0) continue;

      // Switch to this platform
      store.setPlatform(platform);

      // Apply template + set text for the first screenshot (already exists)
      store.applyTemplate(app.templateId);
      const firstSs = store.getSelectedScreenshot();
      if (firstSs) {
        const textEls = firstSs.elements.filter((e) => e.type === 'text');
        if (textEls[0]) store.updateTextElement(textEls[0].id, { content: shots[0].headline });
        if (textEls[1]) store.updateTextElement(textEls[1].id, { content: shots[0].subtitle });
      }

      // Add additional screenshots for this platform
      for (let i = 1; i < shots.length; i++) {
        store.addScreenshot();
        store.applyTemplate(app.templateId);
        const ss = store.getSelectedScreenshot();
        if (ss) {
          const textEls = ss.elements.filter((e) => e.type === 'text');
          if (textEls[0]) store.updateTextElement(textEls[0].id, { content: shots[i].headline });
          if (textEls[1]) store.updateTextElement(textEls[1].id, { content: shots[i].subtitle });
        }
      }
    }

    // Switch back to the primary platform and select first screenshot
    store.setPlatform(app.platform);
  };

  const handleCreateFromTemplate = (templateId: string) => {
    createProject('Untitled Project', 'iphone');
    applyTemplate(templateId);
  };

  return (
    <div className="flex h-full flex-col bg-surface-900 overflow-auto">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-surface-900/80 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            Screenshot Editor
          </span>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-400"
        >
          <Plus size={13} />
          New Project
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <HeroSection onNewProject={() => setShowNew(true)} />
        <ShowcaseSection onCreateFromShowcase={handleCreateFromShowcase} />
        <TemplateGallerySection onCreateFromTemplate={handleCreateFromTemplate} />
        <YourProjectsSection onNewProject={() => setShowNew(true)} />

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-8 text-center">
          <p className="text-xs text-white/20">
            App Store Screenshot Editor &mdash; Design beautiful screenshots for every platform
          </p>
        </footer>
      </main>

      {showNew && <NewProjectDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}
