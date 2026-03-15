import { useState } from 'react';
import { SidebarSection } from './SidebarSection';
import { designTemplates, type DesignTemplate, type TemplateCategory } from '@/lib/templates';
import { useProjectStore } from '@/store/useProjectStore';
import { getTextEffectStyles } from '@/lib/textEffects';

const categories: { label: string; value: TemplateCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Bold', value: 'bold' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Playful', value: 'playful' },
  { label: 'Dark', value: 'dark' },
  { label: 'Connected', value: 'connected' },
];

function TemplateCard({ template }: { template: DesignTemplate }) {
  const applyTemplate = useProjectStore((s) => s.applyTemplate);

  // Determine background CSS
  const bgStyle: React.CSSProperties = {};
  if (template.background.type === 'solid') {
    bgStyle.backgroundColor = template.background.solidColor;
  } else if (template.background.type === 'gradient') {
    const { angle, stops } = template.background.gradient;
    const stopStr = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    bgStyle.background = `linear-gradient(${angle}deg, ${stopStr})`;
  }

  // Find text elements for preview
  const headlineSpec = template.elements.find((e) => e.type === 'text');
  const subtitleSpec = template.elements.filter((e) => e.type === 'text')[1];
  const textColor = headlineSpec?.text?.color ?? '#ffffff';
  const textEffects = headlineSpec?.text?.effects;

  // Find shape elements for decoration preview
  const shapes = template.elements.filter((e) => e.type === 'shape');

  // Find device element for preview
  const deviceSpec = template.elements.find((e) => e.type === 'device-frame');

  // Build headline style with effects
  const headlineStyle: React.CSSProperties = {
    color: textColor,
    fontFamily: headlineSpec?.text?.fontFamily ?? 'Inter',
    fontWeight: headlineSpec?.text?.fontWeight ?? 700,
    fontSize: 9,
    lineHeight: 1.1,
    maxWidth: '90%',
    ...getTextEffectStyles(textEffects),
  };

  return (
    <button
      onClick={() => applyTemplate(template.id)}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 transition-all hover:border-white/30 hover:ring-1 hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      style={{ aspectRatio: '9 / 16' }}
      title={template.description}
    >
      {/* Background preview */}
      <div className="absolute inset-0" style={bgStyle} />

      {/* Decorative shapes */}
      {shapes.map((shape, i) => {
        const fill = shape.shape?.fillColor ?? 'rgba(255,255,255,0.1)';
        const borderRadius = shape.shape?.shapeType === 'circle'
          ? '50%'
          : shape.shape?.borderRadius
            ? `${Math.min(shape.shape.borderRadius, 20)}px`
            : '4px';
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
              border: shape.shape?.strokeWidth
                ? `1px solid ${shape.shape.strokeColor}`
                : undefined,
              opacity: shape.shape?.opacity ?? 0.7,
              backdropFilter: shape.shape?.blur ? `blur(${Math.min(shape.shape.blur, 4)}px)` : undefined,
              WebkitBackdropFilter: shape.shape?.blur ? `blur(${Math.min(shape.shape.blur, 4)}px)` : undefined,
              transform: shape.transform.rotation ? `rotate(${shape.transform.rotation}deg)` : undefined,
            }}
          />
        );
      })}

      {/* Content preview */}
      <div className="relative flex h-full w-full flex-col items-center justify-between p-2">
        {/* Mini headline area */}
        <div
          className="mt-2 w-full"
          style={{
            textAlign: headlineSpec?.text?.alignment ?? 'center',
          }}
        >
          <div
            className="mx-auto truncate leading-tight"
            style={headlineStyle}
          >
            {template.name}
          </div>
          {subtitleSpec && (
            <div
              className="mx-auto mt-0.5 truncate"
              style={{
                color: subtitleSpec.text?.color ?? textColor,
                fontFamily: subtitleSpec.text?.fontFamily ?? 'Inter',
                fontWeight: subtitleSpec.text?.fontWeight ?? 400,
                fontSize: 5,
                lineHeight: 1.2,
                maxWidth: '90%',
                opacity: 0.7,
                ...getTextEffectStyles(subtitleSpec.text?.effects),
              }}
            >
              Subtitle
            </div>
          )}
        </div>

        {/* Device placeholder */}
        {deviceSpec && (
          <div
            className="flex items-center justify-center"
            style={{
              position: 'absolute',
              left: `${deviceSpec.transform.x}%`,
              top: `${deviceSpec.transform.y}%`,
              width: `${deviceSpec.transform.width}%`,
              height: `${deviceSpec.transform.height}%`,
              transform: deviceSpec.transform.rotation ? `rotate(${deviceSpec.transform.rotation}deg)` : undefined,
            }}
          >
            <div
              className="w-full h-full rounded-[3px] border border-white/20"
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {/* Screen content mock */}
              <div className="w-full h-full rounded-[2px] overflow-hidden p-[2px]">
                <div className="w-full h-full rounded-[1px] bg-gradient-to-b from-white/5 to-white/2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Paired template badge */}
      {template.pairedWith && (
        <div className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/30 backdrop-blur-sm px-1.5 py-0.5 text-[7px] text-white/50 ring-1 ring-white/10">
          Paired
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
        <span className="text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
          Apply
        </span>
      </div>
    </button>
  );
}

export function TemplatePanel() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');

  const filtered =
    activeCategory === 'all'
      ? designTemplates
      : designTemplates.filter((t) => t.category === activeCategory);

  return (
    <SidebarSection title="TEMPLATES" defaultOpen={false}>
      {/* Category filter */}
      <div className="mb-3 flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-indigo-500 text-white'
                : 'bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-4 text-center text-xs text-white/30">
          No templates in this category
        </p>
      )}
    </SidebarSection>
  );
}
