import { useState } from 'react';
import { SidebarSection } from './SidebarSection';
import { designTemplates, type DesignTemplate, type TemplateCategory } from '@/lib/templates';
import { useProjectStore } from '@/store/useProjectStore';

const categories: { label: string; value: TemplateCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Bold', value: 'bold' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Playful', value: 'playful' },
  { label: 'Dark', value: 'dark' },
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

  // Find first text element to get headline color
  const headlineSpec = template.elements.find((e) => e.type === 'text');
  const textColor = headlineSpec?.text?.color ?? '#ffffff';

  return (
    <button
      onClick={() => applyTemplate(template.id)}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 transition-all hover:border-white/30 hover:ring-1 hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      style={{ aspectRatio: '9 / 16' }}
      title={template.description}
    >
      {/* Background preview */}
      <div className="absolute inset-0" style={bgStyle} />

      {/* Content preview */}
      <div className="relative flex h-full w-full flex-col items-center justify-between p-2">
        {/* Mini headline area */}
        <div className="mt-3 w-full text-center">
          <div
            className="mx-auto truncate text-[7px] font-bold leading-tight"
            style={{ color: textColor, maxWidth: '90%' }}
          >
            {template.name}
          </div>
        </div>

        {/* Device placeholder */}
        <div className="mb-2 flex flex-1 items-center justify-center w-full">
          <div
            className="rounded-md bg-white/15"
            style={{ width: '55%', height: '65%' }}
          />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
        <span className="text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
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
