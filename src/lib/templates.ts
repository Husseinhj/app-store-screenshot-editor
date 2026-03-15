import type { BackgroundConfig, CanvasElementType, ElementTransform, TextEffects, GradientStop, ShapeType } from '@/store/types';

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
  };
}

export type TemplateCategory = 'bold' | 'minimal' | 'editorial' | 'playful' | 'dark';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  background: BackgroundConfig;
  elements: TemplateElementSpec[];
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
        shape: { shapeType: 'rectangle', fillColor: 'rgba(255,255,255,0.15)', strokeColor: 'rgba(255,255,255,0.2)', strokeWidth: 1, borderRadius: 20 },
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
  },
];
