import type { TextEffects } from '@/store/types';

export interface TextStylePreset {
  id: string;
  name: string;
  category: 'heading' | 'subtitle' | 'decorative' | 'minimal';
  fontFamily: string;
  fontWeight: number;
  color: string;
  lineHeight: number;
  letterSpacing?: number;
  effects?: TextEffects;
}

export const textStylePresets: TextStylePreset[] = [
  {
    id: 'clean-bold',
    name: 'Clean Bold',
    category: 'heading',
    fontFamily: 'Inter',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    effects: {
      shadow: { offsetX: 0, offsetY: 4, blur: 12, color: 'rgba(0,0,0,0.5)' },
    },
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    category: 'decorative',
    fontFamily: 'Montserrat',
    fontWeight: 700,
    color: '#00ffff',
    lineHeight: 1.2,
    effects: {
      glow: { blur: 20, color: '#00ffff' },
      stroke: { width: 1, color: 'rgba(0,0,0,0.8)' },
    },
  },
  {
    id: 'gradient-shine',
    name: 'Gradient Shine',
    category: 'heading',
    fontFamily: 'Poppins',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    effects: {
      gradientFill: {
        angle: 135,
        stops: [
          { color: '#667eea', position: 0 },
          { color: '#764ba2', position: 100 },
        ],
      },
    },
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    category: 'heading',
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: '#F4C542',
    lineHeight: 1.2,
    effects: {
      shadow: { offsetX: 0, offsetY: 3, blur: 8, color: 'rgba(0,0,0,0.4)' },
    },
  },
  {
    id: 'frost',
    name: 'Frost',
    category: 'minimal',
    fontFamily: 'Inter',
    fontWeight: 300,
    color: '#ffffff',
    lineHeight: 1.4,
    letterSpacing: 2,
    effects: {
      glow: { blur: 30, color: 'rgba(255,255,255,0.8)' },
    },
  },
  {
    id: 'outline-pop',
    name: 'Outline Pop',
    category: 'decorative',
    fontFamily: 'Poppins',
    fontWeight: 900,
    color: '#ffffff',
    lineHeight: 1.2,
    effects: {
      stroke: { width: 2, color: '#ffffff' },
    },
  },
  {
    id: 'sunset-text',
    name: 'Sunset Text',
    category: 'heading',
    fontFamily: 'Raleway',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.2,
    effects: {
      gradientFill: {
        angle: 90,
        stops: [
          { color: '#f97316', position: 0 },
          { color: '#ec4899', position: 100 },
        ],
      },
    },
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    category: 'decorative',
    fontFamily: 'Montserrat',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    effects: {
      glow: { blur: 15, color: 'rgba(255,200,50,0.6)' },
      shadow: { offsetX: 0, offsetY: 2, blur: 8, color: 'rgba(255,150,0,0.3)' },
    },
  },
  {
    id: 'ink-stamp',
    name: 'Ink Stamp',
    category: 'decorative',
    fontFamily: 'Playfair Display',
    fontWeight: 900,
    color: '#1a1a1a',
    lineHeight: 1.2,
    effects: {
      shadow: { offsetX: 3, offsetY: 3, blur: 0, color: 'rgba(0,0,0,0.3)' },
    },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    category: 'minimal',
    fontFamily: 'Inter',
    fontWeight: 300,
    color: '#999999',
    lineHeight: 1.6,
    letterSpacing: 4,
  },
  {
    id: 'retro',
    name: 'Retro',
    category: 'decorative',
    fontFamily: 'Poppins',
    fontWeight: 800,
    color: '#FFE600',
    lineHeight: 1.2,
    effects: {
      stroke: { width: 2, color: '#000000' },
      shadow: { offsetX: 3, offsetY: 3, blur: 0, color: '#000000' },
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'heading',
    fontFamily: 'Inter',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.2,
    effects: {
      gradientFill: {
        angle: 180,
        stops: [
          { color: '#0ea5e9', position: 0 },
          { color: '#2563eb', position: 100 },
        ],
      },
      glow: { blur: 12, color: 'rgba(14,165,233,0.4)' },
    },
  },
];
