export interface GuidelinePresetGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  label?: string;
}

export interface GuidelinePreset {
  id: string;
  name: string;
  description: string;
  guides: GuidelinePresetGuide[];
}

export const guidelinePresets: GuidelinePreset[] = [
  {
    id: 'safe-area',
    name: 'Safe Area',
    description: '4% margin on all edges',
    guides: [
      { type: 'vertical', position: 4, label: 'Left safe 4%' },
      { type: 'vertical', position: 96, label: 'Right safe 96%' },
      { type: 'horizontal', position: 4, label: 'Top safe 4%' },
      { type: 'horizontal', position: 96, label: 'Bottom safe 96%' },
    ],
  },
  {
    id: 'text-zone',
    name: 'Text Zone',
    description: 'Top text area and device area markers',
    guides: [
      { type: 'horizontal', position: 5, label: 'Top margin' },
      { type: 'horizontal', position: 30, label: 'Text area bottom' },
      { type: 'horizontal', position: 70, label: 'Device area top' },
      { type: 'horizontal', position: 95, label: 'Bottom margin' },
    ],
  },
  {
    id: 'rule-of-thirds',
    name: 'Rule of Thirds',
    description: 'Classic composition grid',
    guides: [
      { type: 'vertical', position: 33.33, label: '\u2153 V' },
      { type: 'vertical', position: 66.67, label: '\u2154 V' },
      { type: 'horizontal', position: 33.33, label: '\u2153 H' },
      { type: 'horizontal', position: 66.67, label: '\u2154 H' },
    ],
  },
  {
    id: 'center-cross',
    name: 'Center Cross',
    description: 'Vertical and horizontal center lines',
    guides: [
      { type: 'vertical', position: 50, label: 'Center V' },
      { type: 'horizontal', position: 50, label: 'Center H' },
    ],
  },
  {
    id: 'app-store-standard',
    name: 'App Store Standard',
    description: 'Safe margins, text zone, device zone',
    guides: [
      { type: 'vertical', position: 5, label: 'Left margin 5%' },
      { type: 'vertical', position: 95, label: 'Right margin 95%' },
      { type: 'horizontal', position: 5, label: 'Top margin 5%' },
      { type: 'horizontal', position: 25, label: 'Text zone bottom' },
      { type: 'horizontal', position: 75, label: 'Device zone bottom' },
      { type: 'horizontal', position: 95, label: 'Bottom margin 95%' },
    ],
  },
];
