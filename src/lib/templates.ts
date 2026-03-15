import type { BackgroundConfig, CanvasElementType, ElementTransform, TextEffects, GradientStop, ShapeType, Platform } from '@/store/types';

export interface TemplateElementSpec {
  type: CanvasElementType;
  transform: ElementTransform;
  zIndex: number;
  // Text overrides
  text?: {
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    alignment: 'left' | 'center' | 'right';
    lineHeight: number;
    effects?: TextEffects;
  };
  // Device overrides
  device?: {
    device: string; // will be set dynamically based on platform
    showDeviceFrame: boolean;
  };
  // Shape overrides
  shape?: {
    shapeType: ShapeType;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    borderRadius: number;
    opacity?: number;
    blur?: number;
  };
}

export type TemplateCategory = 'bold' | 'minimal' | 'editorial' | 'playful' | 'dark' | 'connected';

/**
 * Per-element transform overrides for non-iPhone platforms.
 * Key = element index in the `elements` array, value = partial transform override.
 */
export type PlatformTransformOverrides = Record<number, Partial<ElementTransform>>;

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  background: BackgroundConfig;
  elements: TemplateElementSpec[];
  /** Platform-specific element transform overrides (iPad, Mac, Watch). iPhone uses defaults. */
  platformOverrides?: Partial<Record<Platform, PlatformTransformOverrides>>;
  /** ID of a companion template designed to work alongside this one in adjacent screens. */
  pairedWith?: string;
}

/**
 * Resolve an element's transform for a given platform.
 * Merges base transform with any platform-specific overrides.
 */
export function getElementTransformForPlatform(
  template: DesignTemplate,
  elementIndex: number,
  platform: Platform,
): ElementTransform {
  const base = template.elements[elementIndex].transform;
  if (platform === 'iphone' || !template.platformOverrides) return { ...base };
  const overrides = template.platformOverrides[platform]?.[elementIndex];
  if (!overrides) return { ...base };
  return { ...base, ...overrides };
}

// ─── Template Definitions ────────────────────────────────────────────────────

export const designTemplates: DesignTemplate[] = [
  // 1. monochromeInk
  {
    id: 'monochromeInk',
    name: 'Monochrome Ink',
    description: 'Clean black and white with stark contrast',
    category: 'dark',
    background: {
      type: 'solid',
      solidColor: '#000000',
      gradient: { angle: 0, stops: [{ color: '#000000', position: 0 }, { color: '#000000', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 10, y: 3, width: 80, height: 12, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 900,
          color: '#ffffff',
          alignment: 'center',
          lineHeight: 1.1,
        },
      },
      {
        type: 'text',
        transform: { x: 15, y: 14, width: 70, height: 6, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 400,
          color: '#888888',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 20, y: 24, width: 60, height: 72, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 4, height: 10 }, 1: { y: 14 }, 2: { x: 15, y: 28, width: 70, height: 65 } },
      mac:            { 0: { x: 5, y: 15, width: 35, height: 25 }, 1: { x: 5, y: 40, width: 35 }, 2: { x: 45, y: 5, width: 52, height: 90 } },
      'apple-watch':  { 0: { y: 5, height: 15 }, 1: { y: 20, height: 8 }, 2: { x: 15, y: 32, width: 70, height: 62 } },
    },
  },

  // 2. popArt
  {
    id: 'popArt',
    name: 'Pop Art',
    description: 'Bold gradients with playful geometric accents',
    category: 'playful',
    background: {
      type: 'gradient',
      solidColor: '#ff006e',
      gradient: { angle: 135, stops: [{ color: '#ff006e', position: 0 }, { color: '#ffbe0b', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 5, y: 3, width: 90, height: 14, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Poppins',
          fontSize: 64,
          fontWeight: 800,
          color: '#ffffff',
          alignment: 'center',
          lineHeight: 1.1,
          effects: { stroke: { width: 2, color: '#000000' } },
        },
      },
      {
        type: 'text',
        transform: { x: 10, y: 15, width: 80, height: 5, rotation: 0 },
        zIndex: 4,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Poppins',
          fontSize: 24,
          fontWeight: 500,
          color: '#000000',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 18, y: 24, width: 64, height: 72, rotation: 5 },
        zIndex: 5,
        device: { device: 'auto', showDeviceFrame: true },
      },
      {
        type: 'shape',
        transform: { x: 70, y: 60, width: 30, height: 18, rotation: 0 },
        zIndex: 1,
        shape: { shapeType: 'circle', fillColor: '#00f5d4', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
      {
        type: 'shape',
        transform: { x: -5, y: 70, width: 25, height: 15, rotation: 0 },
        zIndex: 2,
        shape: { shapeType: 'circle', fillColor: '#9b5de5', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 4, height: 12 }, 1: { y: 16 }, 2: { x: 18, y: 28, width: 64, height: 65, rotation: 3 }, 3: { width: 30, height: 30 }, 4: { width: 25, height: 25 } },
      mac:            { 0: { x: 5, y: 12, width: 40, height: 20 }, 1: { x: 5, y: 32, width: 40 }, 2: { x: 48, y: 5, width: 50, height: 90, rotation: 0 }, 3: { x: 80, y: 50, width: 18, height: 62 }, 4: { x: -5, y: 60, width: 15, height: 52 } },
      'apple-watch':  { 0: { y: 5, height: 18 }, 1: { y: 22 }, 2: { x: 18, y: 35, width: 64, height: 58, rotation: 0 }, 3: { width: 8, height: 9 }, 4: { width: 6, height: 7 } },
    },
  },

  // 3. cardStack
  {
    id: 'cardStack',
    name: 'Card Stack',
    description: 'Layered cards with depth effect',
    category: 'bold',
    background: {
      type: 'gradient',
      solidColor: '#2d2d3a',
      gradient: { angle: 180, stops: [{ color: '#2d2d3a', position: 0 }, { color: '#1a1a2e', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 10, y: 3, width: 80, height: 10, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Inter',
          fontSize: 56,
          fontWeight: 600,
          color: '#ffffff',
          alignment: 'center',
          lineHeight: 1.2,
        },
      },
      {
        type: 'text',
        transform: { x: 15, y: 12, width: 70, height: 5, rotation: 0 },
        zIndex: 4,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          color: '#aaaaaa',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'shape',
        transform: { x: 21, y: 22, width: 55, height: 70, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.06)', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 16 },
      },
      {
        type: 'shape',
        transform: { x: 24, y: 24, width: 55, height: 70, rotation: 0 },
        zIndex: 1,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.08)', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 16 },
      },
      {
        type: 'device-frame',
        transform: { x: 22, y: 22, width: 56, height: 72, rotation: 0 },
        zIndex: 2,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 4 }, 1: { y: 14 }, 2: { x: 18, y: 22, width: 60, height: 68 }, 3: { x: 15, y: 20, width: 60, height: 72 }, 4: { x: 22, y: 24, width: 56, height: 65 } },
      mac:            { 0: { x: 5, y: 15, width: 35 }, 1: { x: 5, y: 30, width: 35 }, 2: { x: 43, y: 4, width: 55, height: 90 }, 3: { x: 40, y: 2, width: 55, height: 90 }, 4: { x: 45, y: 6, width: 52, height: 86 } },
      'apple-watch':  { 0: { y: 5 }, 1: { y: 18 }, 2: { x: 20, y: 30, width: 60, height: 60 }, 3: { x: 18, y: 28, width: 60, height: 62 }, 4: { x: 22, y: 32, width: 56, height: 58 } },
    },
  },

  // 4. midnightSapphire
  {
    id: 'midnightSapphire',
    name: 'Midnight Sapphire',
    description: 'Deep blue tones with golden accents',
    category: 'dark',
    background: {
      type: 'gradient',
      solidColor: '#0a1628',
      gradient: { angle: 180, stops: [{ color: '#0a1628', position: 0 }, { color: '#1e3a5f', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 10, y: 4, width: 80, height: 12, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Playfair Display',
          fontSize: 64,
          fontWeight: 700,
          color: '#F4C542',
          alignment: 'center',
          lineHeight: 1.1,
        },
      },
      {
        type: 'text',
        transform: { x: 15, y: 15, width: 70, height: 5, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          color: '#8899aa',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'shape',
        transform: { x: 17, y: 23, width: 66, height: 74, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(244,197,66,0.08)', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 20 },
      },
      {
        type: 'device-frame',
        transform: { x: 20, y: 25, width: 60, height: 70, rotation: 0 },
        zIndex: 1,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 5 }, 1: { y: 16 }, 2: { x: 14, y: 24, width: 72, height: 72 }, 3: { x: 20, y: 28, width: 60, height: 65 } },
      mac:            { 0: { x: 5, y: 15, width: 35 }, 1: { x: 5, y: 35, width: 35 }, 2: { x: 42, y: 3, width: 55, height: 94 }, 3: { x: 45, y: 6, width: 52, height: 88 } },
      'apple-watch':  { 0: { y: 5, height: 15 }, 1: { y: 22 }, 2: { x: 15, y: 28, width: 70, height: 66 }, 3: { x: 18, y: 30, width: 64, height: 62 } },
    },
  },

  // 5. editorial
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style layout with side-by-side text',
    category: 'editorial',
    background: {
      type: 'solid',
      solidColor: '#F5F0EB',
      gradient: { angle: 0, stops: [{ color: '#F5F0EB', position: 0 }, { color: '#F5F0EB', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 5, y: 8, width: 40, height: 25, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Playfair Display',
          fontSize: 72,
          fontWeight: 700,
          color: '#1a1a1a',
          alignment: 'left',
          lineHeight: 1.05,
        },
      },
      {
        type: 'text',
        transform: { x: 5, y: 32, width: 40, height: 8, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          color: '#666666',
          alignment: 'left',
          lineHeight: 1.4,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 48, y: 5, width: 50, height: 90, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      // editorial: text-left, device-right on all platforms — just adjust proportions
      ipad:           { 0: { x: 5, y: 10, width: 42, height: 20 }, 1: { x: 5, y: 30, width: 42 }, 2: { x: 50, y: 5, width: 48, height: 90 } },
      mac:            { 0: { x: 5, y: 12, width: 38, height: 30 }, 1: { x: 5, y: 45, width: 38 }, 2: { x: 48, y: 5, width: 50, height: 90 } },
      'apple-watch':  { 0: { x: 8, y: 5, width: 84, height: 18 }, 1: { x: 8, y: 24, width: 84 }, 2: { x: 15, y: 35, width: 70, height: 60 } },
    },
  },

  // 6. storyCard
  {
    id: 'storyCard',
    name: 'Story Card',
    description: 'Warm gradient with floating card container',
    category: 'editorial',
    background: {
      type: 'gradient',
      solidColor: '#ffecd2',
      gradient: { angle: 180, stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'shape',
        transform: { x: 10, y: 5, width: 80, height: 90, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'rectangle', fillColor: '#ffffff', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 24 },
      },
      {
        type: 'text',
        transform: { x: 15, y: 8, width: 70, height: 10, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Poppins',
          fontSize: 56,
          fontWeight: 600,
          color: '#2d2d2d',
          alignment: 'center',
          lineHeight: 1.2,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 18, y: 20, width: 64, height: 60, rotation: 0 },
        zIndex: 2,
        device: { device: 'auto', showDeviceFrame: true },
      },
      {
        type: 'text',
        transform: { x: 15, y: 82, width: 70, height: 6, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          color: '#666666',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { x: 8, y: 4, width: 84, height: 92 }, 1: { x: 12, y: 8, width: 76 }, 2: { x: 15, y: 22, width: 70, height: 55 }, 3: { y: 80 } },
      mac:            { 0: { x: 5, y: 5, width: 90, height: 90 }, 1: { x: 8, y: 8, width: 35 }, 2: { x: 48, y: 12, width: 48, height: 76 }, 3: { x: 8, y: 28, width: 35 } },
      'apple-watch':  { 0: { x: 5, y: 3, width: 90, height: 94 }, 1: { x: 10, y: 6, width: 80 }, 2: { x: 15, y: 25, width: 70, height: 50 }, 3: { y: 78 } },
    },
  },

  // 7. glassMorphism
  {
    id: 'glassMorphism',
    name: 'Glass Morphism',
    description: 'Frosted glass effect with vibrant gradient',
    category: 'bold',
    background: {
      type: 'gradient',
      solidColor: '#667eea',
      gradient: {
        angle: 135,
        stops: [
          { color: '#667eea', position: 0 },
          { color: '#764ba2', position: 50 },
          { color: '#f093fb', position: 100 },
        ],
      },
      imageUrl: null,
    },
    elements: [
      {
        type: 'shape',
        transform: { x: 10, y: 3, width: 80, height: 22, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.15)', strokeColor: 'rgba(255,255,255,0.2)', strokeWidth: 1, borderRadius: 20, blur: 12, opacity: 0.9 },
      },
      {
        type: 'text',
        transform: { x: 12, y: 5, width: 76, height: 10, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Inter',
          fontSize: 56,
          fontWeight: 700,
          color: '#ffffff',
          alignment: 'center',
          lineHeight: 1.2,
        },
      },
      {
        type: 'text',
        transform: { x: 15, y: 14, width: 70, height: 6, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.8)',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 18, y: 28, width: 64, height: 68, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { x: 8, y: 3, width: 84, height: 20 }, 1: { x: 10, y: 6, width: 80 }, 2: { x: 12, y: 15, width: 76 }, 3: { x: 15, y: 30, width: 70, height: 62 } },
      mac:            { 0: { x: 5, y: 5, width: 35, height: 30 }, 1: { x: 7, y: 8, width: 30 }, 2: { x: 7, y: 16, width: 30 }, 3: { x: 42, y: 5, width: 55, height: 90 } },
      'apple-watch':  { 0: { x: 8, y: 3, width: 84, height: 22 }, 1: { x: 10, y: 6, width: 80 }, 2: { x: 12, y: 15, width: 76 }, 3: { x: 15, y: 32, width: 70, height: 60 } },
    },
  },

  // 8. minimal
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white with subtle typography',
    category: 'minimal',
    background: {
      type: 'solid',
      solidColor: '#ffffff',
      gradient: { angle: 0, stops: [{ color: '#ffffff', position: 0 }, { color: '#ffffff', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 15, y: 5, width: 70, height: 10, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 300,
          color: '#333333',
          alignment: 'center',
          lineHeight: 1.2,
          effects: { letterSpacing: 2 },
        },
      },
      {
        type: 'text',
        transform: { x: 20, y: 14, width: 60, height: 5, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 300,
          color: '#999999',
          alignment: 'center',
          lineHeight: 1.3,
          effects: { letterSpacing: 1 },
        },
      },
      {
        type: 'device-frame',
        transform: { x: 25, y: 24, width: 50, height: 70, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 5 }, 1: { y: 15 }, 2: { x: 20, y: 28, width: 60, height: 65 } },
      mac:            { 0: { x: 5, y: 18, width: 35 }, 1: { x: 5, y: 38, width: 35 }, 2: { x: 45, y: 5, width: 52, height: 90 } },
      'apple-watch':  { 0: { y: 5 }, 1: { y: 18 }, 2: { x: 20, y: 30, width: 60, height: 60 } },
    },
  },

  // 9. modern
  {
    id: 'modern',
    name: 'Modern',
    description: 'Dark with gradient text and large device',
    category: 'dark',
    background: {
      type: 'solid',
      solidColor: '#0a0a0a',
      gradient: { angle: 0, stops: [{ color: '#0a0a0a', position: 0 }, { color: '#0a0a0a', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 10, y: 3, width: 80, height: 12, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Montserrat',
          fontSize: 64,
          fontWeight: 800,
          color: '#ffffff',
          alignment: 'center',
          lineHeight: 1.1,
          effects: {
            gradientFill: {
              angle: 90,
              stops: [
                { color: '#3b82f6', position: 0 },
                { color: '#8b5cf6', position: 100 },
              ],
            },
          },
        },
      },
      {
        type: 'text',
        transform: { x: 15, y: 14, width: 70, height: 5, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          color: '#666666',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 12, y: 22, width: 76, height: 80, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 4 }, 1: { y: 15 }, 2: { x: 10, y: 25, width: 80, height: 70 } },
      mac:            { 0: { x: 5, y: 12, width: 35 }, 1: { x: 5, y: 32, width: 35 }, 2: { x: 42, y: 3, width: 56, height: 94 } },
      'apple-watch':  { 0: { y: 5 }, 1: { y: 20 }, 2: { x: 10, y: 30, width: 80, height: 65 } },
    },
  },

  // 10. anime
  {
    id: 'anime',
    name: 'Anime',
    description: 'Vibrant colors with bold shadow effects',
    category: 'playful',
    background: {
      type: 'gradient',
      solidColor: '#06b6d4',
      gradient: { angle: 135, stops: [{ color: '#06b6d4', position: 0 }, { color: '#d946ef', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'text',
        transform: { x: 5, y: 2, width: 90, height: 14, rotation: 0 },
        zIndex: 4,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Poppins',
          fontSize: 64,
          fontWeight: 900,
          color: '#ffffff',
          alignment: 'center',
          lineHeight: 1.1,
          effects: { shadow: { offsetX: 3, offsetY: 3, blur: 0, color: 'rgba(0,0,0,0.4)' } },
        },
      },
      {
        type: 'text',
        transform: { x: 10, y: 14, width: 80, height: 5, rotation: 0 },
        zIndex: 5,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Poppins',
          fontSize: 24,
          fontWeight: 500,
          color: '#ffffffcc',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 18, y: 22, width: 64, height: 74, rotation: -3 },
        zIndex: 6,
        device: { device: 'auto', showDeviceFrame: true },
      },
      {
        type: 'shape',
        transform: { x: 75, y: 5, width: 8, height: 5, rotation: 0 },
        zIndex: 1,
        shape: { shapeType: 'circle', fillColor: '#ffe600', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
      {
        type: 'shape',
        transform: { x: 5, y: 15, width: 6, height: 4, rotation: 0 },
        zIndex: 2,
        shape: { shapeType: 'circle', fillColor: '#ff6b6b', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
      {
        type: 'shape',
        transform: { x: 80, y: 45, width: 10, height: 6, rotation: 0 },
        zIndex: 3,
        shape: { shapeType: 'circle', fillColor: 'rgba(255,255,255,0.5)', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { y: 4 }, 1: { y: 16 }, 2: { x: 18, y: 28, width: 64, height: 65, rotation: -2 }, 3: { width: 8, height: 8 }, 4: { width: 6, height: 6 }, 5: { width: 10, height: 10 } },
      mac:            { 0: { x: 5, y: 10, width: 40 }, 1: { x: 5, y: 30, width: 40 }, 2: { x: 48, y: 5, width: 50, height: 90, rotation: 0 }, 3: { x: 85, y: 3, width: 8, height: 18 }, 4: { x: 2, y: 12, width: 6, height: 14 }, 5: { x: 88, y: 40, width: 10, height: 22 } },
      'apple-watch':  { 0: { y: 5 }, 1: { y: 22 }, 2: { x: 18, y: 32, width: 64, height: 58, rotation: 0 }, 3: { width: 8, height: 9 }, 4: { width: 6, height: 7 }, 5: { width: 10, height: 11 } },
    },
  },

  // 11. material3
  {
    id: 'material3',
    name: 'Material 3',
    description: 'Soft pastel gradient with subtle decorations',
    category: 'minimal',
    background: {
      type: 'gradient',
      solidColor: '#e8d5f5',
      gradient: { angle: 135, stops: [{ color: '#e8d5f5', position: 0 }, { color: '#d4e4f7', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      {
        type: 'shape',
        transform: { x: 60, y: 0, width: 50, height: 30, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'circle', fillColor: 'rgba(139,92,246,0.1)', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
      {
        type: 'shape',
        transform: { x: -10, y: 70, width: 40, height: 25, rotation: 0 },
        zIndex: 1,
        shape: { shapeType: 'circle', fillColor: 'rgba(59,130,246,0.1)', strokeColor: 'transparent', strokeWidth: 0, borderRadius: 999 },
      },
      {
        type: 'text',
        transform: { x: 10, y: 6, width: 80, height: 10, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Roboto',
          fontSize: 52,
          fontWeight: 500,
          color: '#1a1a2e',
          alignment: 'center',
          lineHeight: 1.2,
        },
      },
      {
        type: 'text',
        transform: { x: 15, y: 15, width: 70, height: 5, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Roboto',
          fontSize: 24,
          fontWeight: 400,
          color: '#666677',
          alignment: 'center',
          lineHeight: 1.3,
        },
      },
      {
        type: 'device-frame',
        transform: { x: 22, y: 24, width: 56, height: 70, rotation: 0 },
        zIndex: 4,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
    platformOverrides: {
      ipad:           { 0: { width: 50, height: 50 }, 1: { width: 40, height: 40 }, 2: { y: 5 }, 3: { y: 16 }, 4: { x: 18, y: 28, width: 64, height: 62 } },
      mac:            { 0: { x: -5, y: -10, width: 35, height: 55 }, 1: { x: 75, y: 50, width: 30, height: 48 }, 2: { x: 5, y: 15, width: 35 }, 3: { x: 5, y: 32, width: 35 }, 4: { x: 45, y: 5, width: 52, height: 90 } },
      'apple-watch':  { 0: { width: 45, height: 55 }, 1: { width: 35, height: 45 }, 2: { y: 5 }, 3: { y: 18 }, 4: { x: 18, y: 30, width: 64, height: 60 } },
    },
  },

  // ─── Connected / Split-Screen Templates ──────────────────────────────────────

  {
    id: 'splitViewLeft',
    name: 'Split View (Left)',
    description: 'Device extends right — pair with Split View (Right) on next screen',
    category: 'connected',
    pairedWith: 'splitViewRight',
    background: {
      type: 'gradient',
      solidColor: '#0f172a',
      gradient: {
        angle: 135,
        stops: [
          { color: '#0f172a', position: 0 },
          { color: '#1e3a5f', position: 50 },
          { color: '#0f172a', position: 100 },
        ],
      },
      imageUrl: null,
    },
    elements: [
      // Glass blur text box on the left
      {
        type: 'shape',
        transform: { x: 4, y: 4, width: 42, height: 26, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.08)', strokeColor: 'rgba(255,255,255,0.15)', strokeWidth: 1, borderRadius: 16, blur: 14, opacity: 0.95 },
      },
      {
        type: 'text',
        transform: { x: 7, y: 7, width: 36, height: 10, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 800,
          color: '#ffffff',
          alignment: 'left',
          lineHeight: 1.15,
        },
      },
      {
        type: 'text',
        transform: { x: 7, y: 17, width: 36, height: 5, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.6)',
          alignment: 'left',
          lineHeight: 1.3,
        },
      },
      // Device frame — right half extends past right edge (full-size, 50% visible)
      {
        type: 'device-frame',
        transform: { x: 70, y: 10, width: 60, height: 85, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
  },
  {
    id: 'splitViewRight',
    name: 'Split View (Right)',
    description: 'Device extends left — pair with Split View (Left) on previous screen',
    category: 'connected',
    pairedWith: 'splitViewLeft',
    background: {
      type: 'gradient',
      solidColor: '#0f172a',
      gradient: {
        angle: 135,
        stops: [
          { color: '#0f172a', position: 0 },
          { color: '#1e3a5f', position: 50 },
          { color: '#0f172a', position: 100 },
        ],
      },
      imageUrl: null,
    },
    elements: [
      // Device frame — left half extends past left edge (full-size, 50% visible)
      {
        type: 'device-frame',
        transform: { x: -30, y: 10, width: 60, height: 85, rotation: 0 },
        zIndex: 0,
        device: { device: 'auto', showDeviceFrame: true },
      },
      // Glass blur text box on the right
      {
        type: 'shape',
        transform: { x: 54, y: 4, width: 42, height: 26, rotation: 0 },
        zIndex: 1,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.08)', strokeColor: 'rgba(255,255,255,0.15)', strokeWidth: 1, borderRadius: 16, blur: 14, opacity: 0.95 },
      },
      {
        type: 'text',
        transform: { x: 57, y: 7, width: 36, height: 10, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Your headline here</p>',
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 800,
          color: '#ffffff',
          alignment: 'left',
          lineHeight: 1.15,
        },
      },
      {
        type: 'text',
        transform: { x: 57, y: 17, width: 36, height: 5, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Subtitle text goes here</p>',
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.6)',
          alignment: 'left',
          lineHeight: 1.3,
        },
      },
    ],
  },
  {
    id: 'darkLightLeft',
    name: 'Dark / Light (Left)',
    description: 'Dark mode screen — pair with Dark / Light (Right) for light mode',
    category: 'connected',
    pairedWith: 'darkLightRight',
    background: {
      type: 'solid',
      solidColor: '#0a0a0a',
      gradient: { angle: 0, stops: [{ color: '#0a0a0a', position: 0 }, { color: '#0a0a0a', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      // Glass accent shape
      {
        type: 'shape',
        transform: { x: 3, y: 65, width: 35, height: 18, rotation: 0 },
        zIndex: 0,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.05)', strokeColor: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 14, blur: 10, opacity: 0.9 },
      },
      {
        type: 'text',
        transform: { x: 5, y: 5, width: 40, height: 10, rotation: 0 },
        zIndex: 1,
        text: {
          content: '<p>Dark Mode</p>',
          fontFamily: 'Inter',
          fontSize: 52,
          fontWeight: 800,
          color: '#ffffff',
          alignment: 'left',
          lineHeight: 1.15,
        },
      },
      {
        type: 'text',
        transform: { x: 5, y: 14, width: 40, height: 5, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Easy on the eyes</p>',
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.5)',
          alignment: 'left',
          lineHeight: 1.3,
        },
      },
      // Device — right half extends past right edge (full-size, 50% visible)
      {
        type: 'device-frame',
        transform: { x: 70, y: 8, width: 60, height: 88, rotation: 0 },
        zIndex: 3,
        device: { device: 'auto', showDeviceFrame: true },
      },
    ],
  },
  {
    id: 'darkLightRight',
    name: 'Dark / Light (Right)',
    description: 'Light mode screen — pair with Dark / Light (Left) for dark mode',
    category: 'connected',
    pairedWith: 'darkLightLeft',
    background: {
      type: 'solid',
      solidColor: '#f5f5f5',
      gradient: { angle: 0, stops: [{ color: '#f5f5f5', position: 0 }, { color: '#f5f5f5', position: 100 }] },
      imageUrl: null,
    },
    elements: [
      // Device — left half extends past left edge (full-size, 50% visible)
      {
        type: 'device-frame',
        transform: { x: -30, y: 8, width: 60, height: 88, rotation: 0 },
        zIndex: 0,
        device: { device: 'auto', showDeviceFrame: true },
      },
      // Glass accent shape
      {
        type: 'shape',
        transform: { x: 62, y: 65, width: 35, height: 18, rotation: 0 },
        zIndex: 1,
        shape: { shapeType: 'rectangle', fillColor: 'rgba(0,0,0,0.04)', strokeColor: 'rgba(0,0,0,0.08)', strokeWidth: 1, borderRadius: 14, blur: 10, opacity: 0.9 },
      },
      {
        type: 'text',
        transform: { x: 55, y: 5, width: 40, height: 10, rotation: 0 },
        zIndex: 2,
        text: {
          content: '<p>Light Mode</p>',
          fontFamily: 'Inter',
          fontSize: 52,
          fontWeight: 800,
          color: '#1a1a1a',
          alignment: 'right',
          lineHeight: 1.15,
        },
      },
      {
        type: 'text',
        transform: { x: 55, y: 14, width: 40, height: 5, rotation: 0 },
        zIndex: 3,
        text: {
          content: '<p>Clean and bright</p>',
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 400,
          color: 'rgba(0,0,0,0.4)',
          alignment: 'right',
          lineHeight: 1.3,
        },
      },
    ],
  },
];
