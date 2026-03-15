import { DeviceType, Orientation, Platform } from '@/store/types';

export interface FrameColorVariant {
  id: string;
  label: string;
  frameColor: string;
  borderColor: string;
  buttonColor: string;
  swatchColor: string;
  /** Optional SVG path override for this color variant (Realistic mode) */
  svgPath?: string;
}

export interface SvgScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

export interface DeviceDefinition {
  id: DeviceType;
  label: string;
  platform: Platform;
  // Frame dims for CSS mode aspect ratio
  frameWidth: number;
  frameHeight: number;
  // Screen inset % for CSS mode
  screenInset: { top: number; left: number; right: number; bottom: number };
  screenBorderRadius: number;
  frameBorderRadius: number;
  nativeScreenWidth: number;
  nativeScreenHeight: number;
  frameColor: string;
  hasDynamicIsland: boolean;
  colorVariants: FrameColorVariant[];
  // SVG mockup
  svgPath: string | null;
  svgViewBox: { width: number; height: number };
  svgScreenRect: SvgScreenRect | null;
}

export function getFrameColors(def: DeviceDefinition, variantId: string) {
  return def.colorVariants.find((v) => v.id === variantId) ?? def.colorVariants[0];
}

/** Get the SVG path for a specific variant, falling back to the device default */
export function getSvgPathForVariant(def: DeviceDefinition, variantId: string): string | null {
  const variant = def.colorVariants.find((v) => v.id === variantId);
  return variant?.svgPath ?? def.svgPath;
}

/** Returns frame dimensions oriented for portrait/landscape (iPad only). CSS mode uses these. */
export function getOrientedFrameDimensions(
  def: DeviceDefinition,
  orientation: Orientation,
): { frameWidth: number; frameHeight: number; screenInset: DeviceDefinition['screenInset'] } {
  if (def.platform !== 'ipad' || orientation === 'landscape') {
    return { frameWidth: def.frameWidth, frameHeight: def.frameHeight, screenInset: def.screenInset };
  }
  // Portrait: swap width/height and rotate insets (clockwise 90°)
  return {
    frameWidth: def.frameHeight,
    frameHeight: def.frameWidth,
    screenInset: {
      top: def.screenInset.left,
      right: def.screenInset.top,
      bottom: def.screenInset.right,
      left: def.screenInset.bottom,
    },
  };
}

// ─── Color Variants ──────────────────────────────────────────────────────────

const iphone17ProMaxVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Black', frameColor: '#1c1c1e', borderColor: '#2c2c2e', buttonColor: '#2c2c2e', swatchColor: '#1c1c1e' },
  { id: 'cosmic-orange', label: 'Cosmic Orange', frameColor: '#c47a3a', borderColor: '#a66830', buttonColor: '#b07035', swatchColor: '#d4874a', svgPath: '/devices/iPhone 17 Pro Max - Cosmic Orange.svg' },
  { id: 'deep-blue', label: 'Deep Blue', frameColor: '#2a3a5c', borderColor: '#1e2e4a', buttonColor: '#243450', swatchColor: '#3a4a6c', svgPath: '/devices/iPhone 17 Pro Max - Deep Blue.svg' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#d0d0d0', svgPath: '/devices/iPhone 17 Pro Max - Silver.svg' },
];

const iphone17ProVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Black', frameColor: '#1c1c1e', borderColor: '#2c2c2e', buttonColor: '#2c2c2e', swatchColor: '#1c1c1e', svgPath: '/devices/iPhone 17 Pro - Black.svg' },
  { id: 'cosmic-orange', label: 'Cosmic Orange', frameColor: '#c47a3a', borderColor: '#a66830', buttonColor: '#b07035', swatchColor: '#d4874a', svgPath: '/devices/iPhone 17 Pro - Cosmic Orange.svg' },
  { id: 'deep-blue', label: 'Deep Blue', frameColor: '#2a3a5c', borderColor: '#1e2e4a', buttonColor: '#243450', swatchColor: '#3a4a6c', svgPath: '/devices/iPhone 17 Pro - Deep Blue.svg' },
  { id: 'white', label: 'White', frameColor: '#f0efe9', borderColor: '#d8d7d1', buttonColor: '#e0dfd9', swatchColor: '#f0efe9', svgPath: '/devices/iPhone 17 Pro - White.svg' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#d0d0d0', svgPath: '/devices/iPhone 17 Pro - Silver.svg' },
];

const iphone17Variants: FrameColorVariant[] = [
  { id: 'default', label: 'Black', frameColor: '#1c1c1e', borderColor: '#2c2c2e', buttonColor: '#2c2c2e', swatchColor: '#1c1c1e' },
  { id: 'lavender', label: 'Lavender', frameColor: '#b8a9c9', borderColor: '#a090b0', buttonColor: '#a898b8', swatchColor: '#c8b9d9', svgPath: '/devices/iPhone 17 - Lavender.svg' },
  { id: 'light-gold', label: 'Light Gold', frameColor: '#d4c4a0', borderColor: '#bca888', buttonColor: '#c8b898', swatchColor: '#e0d0b0', svgPath: '/devices/iPhone 17 - Light Gold.svg' },
  { id: 'mist-blue', label: 'Mist Blue', frameColor: '#a8c0d0', borderColor: '#90a8b8', buttonColor: '#98b0c0', swatchColor: '#b8d0e0', svgPath: '/devices/iPhone 17 - Mist Blue.svg' },
  { id: 'sage', label: 'Sage', frameColor: '#a8b8a0', borderColor: '#90a088', buttonColor: '#98a898', swatchColor: '#b8c8b0', svgPath: '/devices/iPhone 17 - Sage.svg' },
  { id: 'sky-blue', label: 'Sky Blue', frameColor: '#88b0d8', borderColor: '#7098c0', buttonColor: '#78a0c8', swatchColor: '#98c0e8', svgPath: '/devices/iPhone 17 - Sky Blue.svg' },
];

const iphoneAirVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Space Black', frameColor: '#1c1c1e', borderColor: '#2c2c2e', buttonColor: '#2c2c2e', swatchColor: '#1c1c1e', svgPath: '/devices/iPhone Air - Space Black.svg' },
  { id: 'cloud-white', label: 'Cloud White', frameColor: '#f0efe9', borderColor: '#d8d7d1', buttonColor: '#e0dfd9', swatchColor: '#f5f4ee', svgPath: '/devices/iPhone Air - Cloud White.svg' },
];

const iphone16ProVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Black Titanium', frameColor: '#1c1c1e', borderColor: '#2c2c2e', buttonColor: '#2c2c2e', swatchColor: '#1c1c1e' },
  { id: 'natural', label: 'Natural Titanium', frameColor: '#8a8580', borderColor: '#7a7570', buttonColor: '#807b76', swatchColor: '#9a9590' },
  { id: 'white', label: 'White Titanium', frameColor: '#f0efe9', borderColor: '#d8d7d1', buttonColor: '#e0dfd9', swatchColor: '#f0efe9' },
  { id: 'desert', label: 'Desert Titanium', frameColor: '#bfb4a8', borderColor: '#a89c90', buttonColor: '#b0a498', swatchColor: '#cfc4b8' },
];

const iphoneStandardVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Black', frameColor: '#1c1c1e', borderColor: '#2c2c2e', buttonColor: '#2c2c2e', swatchColor: '#1c1c1e' },
  { id: 'white', label: 'White', frameColor: '#f0efe9', borderColor: '#d8d7d1', buttonColor: '#e0dfd9', swatchColor: '#f0efe9' },
  { id: 'pink', label: 'Pink', frameColor: '#f2c4c4', borderColor: '#daa8a8', buttonColor: '#e0b0b0', swatchColor: '#f2c4c4' },
  { id: 'blue', label: 'Blue', frameColor: '#a8c4e0', borderColor: '#90aac8', buttonColor: '#98b4d0', swatchColor: '#a8c4e0' },
];

const ipadPro13Variants: FrameColorVariant[] = [
  { id: 'default', label: 'Space Black', frameColor: '#1a1a1a', borderColor: '#333', buttonColor: '#333', swatchColor: '#1a1a1a' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#c0c0c0', svgPath: '/devices/iPad Pro M4 13 - Silver.svg' },
  { id: 'space-gray', label: 'Space Gray', frameColor: '#4a4a4a', borderColor: '#3a3a3a', buttonColor: '#404040', swatchColor: '#5a5a5a', svgPath: '/devices/iPad Pro M4 13 - Space Gray.svg' },
];

const ipadPro11Variants: FrameColorVariant[] = [
  { id: 'default', label: 'Space Black', frameColor: '#1a1a1a', borderColor: '#333', buttonColor: '#333', swatchColor: '#1a1a1a' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#c0c0c0', svgPath: '/devices/iPad Pro M4 11 - Silver.svg' },
  { id: 'space-gray', label: 'Space Gray', frameColor: '#4a4a4a', borderColor: '#3a3a3a', buttonColor: '#404040', swatchColor: '#5a5a5a', svgPath: '/devices/iPad Pro M4 11 - Space Gray.svg' },
];

const ipadMiniVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Space Gray', frameColor: '#1a1a1a', borderColor: '#333', buttonColor: '#333', swatchColor: '#1a1a1a' },
  { id: 'starlight', label: 'Starlight', frameColor: '#e8e0d0', borderColor: '#d0c8b8', buttonColor: '#d8d0c0', swatchColor: '#f0e8d8', svgPath: '/devices/iPad mini - Starlight.svg' },
];

const macVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Space Black', frameColor: '#1e1e1e', borderColor: '#333', buttonColor: '#333', swatchColor: '#1e1e1e' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#c0c0c0' },
];

const watchSEVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Midnight', frameColor: '#0a0a0a', borderColor: '#222', buttonColor: '#222', swatchColor: '#0a0a0a' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#c0c0c0' },
  { id: 'starlight', label: 'Starlight', frameColor: '#e8e0d0', borderColor: '#d0c8b8', buttonColor: '#d8d0c0', swatchColor: '#f0e8d8' },
];

const watchS11Variants: FrameColorVariant[] = [
  { id: 'default', label: 'Jet Black', frameColor: '#0a0a0a', borderColor: '#1a1a1a', buttonColor: '#1a1a1a', swatchColor: '#0a0a0a' },
  { id: 'silver', label: 'Silver', frameColor: '#c0c0c0', borderColor: '#a8a8a8', buttonColor: '#b0b0b0', swatchColor: '#c0c0c0' },
  { id: 'rose-gold', label: 'Rose Gold', frameColor: '#e0b8a0', borderColor: '#c8a088', buttonColor: '#d0a898', swatchColor: '#e0b8a0' },
];

const watchUltraVariants: FrameColorVariant[] = [
  { id: 'default', label: 'Natural Titanium', frameColor: '#a8a0a0', borderColor: '#908888', buttonColor: '#989090', swatchColor: '#b8b0b0' },
];

// ─── Device Definitions ──────────────────────────────────────────────────────

export const devices: Record<DeviceType, DeviceDefinition> = {
  // ─── iPhones ───────────────────────────────────────────────────────
  'iphone-17-pro-max': {
    id: 'iphone-17-pro-max',
    label: 'iPhone 17 Pro Max',
    platform: 'iphone',
    frameWidth: 490, frameHeight: 1000,
    screenInset: { top: 1.4, left: 2.6, right: 2.6, bottom: 1.4 },
    screenBorderRadius: 55, frameBorderRadius: 60,
    nativeScreenWidth: 1320, nativeScreenHeight: 2868,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphone17ProMaxVariants,
    svgPath: '/devices/iPhone 17 Pro Max.svg',
    svgViewBox: { width: 490, height: 1000 },
    svgScreenRect: { x: 23, y: 20, width: 444, height: 960, borderRadius: 61 },
  },
  'iphone-17-pro': {
    id: 'iphone-17-pro',
    label: 'iPhone 17 Pro',
    platform: 'iphone',
    frameWidth: 450, frameHeight: 920,
    screenInset: { top: 1.4, left: 2.8, right: 2.8, bottom: 1.4 },
    screenBorderRadius: 50, frameBorderRadius: 55,
    nativeScreenWidth: 1206, nativeScreenHeight: 2622,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphone17ProVariants,
    svgPath: '/devices/iPhone 17 Pro.svg',
    svgViewBox: { width: 450, height: 920 },
    svgScreenRect: { x: 22, y: 21, width: 406, height: 878, borderRadius: 60 },
  },
  'iphone-17': {
    id: 'iphone-17',
    label: 'iPhone 17',
    platform: 'iphone',
    frameWidth: 450, frameHeight: 920,
    screenInset: { top: 1.4, left: 2.8, right: 2.8, bottom: 1.4 },
    screenBorderRadius: 50, frameBorderRadius: 55,
    nativeScreenWidth: 1206, nativeScreenHeight: 2622,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphone17Variants,
    svgPath: '/devices/iPhone 17.svg',
    svgViewBox: { width: 450, height: 920 },
    svgScreenRect: { x: 22, y: 21, width: 406, height: 878, borderRadius: 61 },
  },
  'iphone-air': {
    id: 'iphone-air',
    label: 'iPhone Air',
    platform: 'iphone',
    frameWidth: 460, frameHeight: 960,
    screenInset: { top: 1.4, left: 2.5, right: 2.5, bottom: 1.4 },
    screenBorderRadius: 52, frameBorderRadius: 57,
    nativeScreenWidth: 1290, nativeScreenHeight: 2796,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphoneAirVariants,
    svgPath: '/devices/iPhone Air.svg',
    svgViewBox: { width: 460, height: 960 },
    svgScreenRect: { x: 18, y: 22, width: 424, height: 916, borderRadius: 61 },
  },
  'iphone-16-pro-max': {
    id: 'iphone-16-pro-max',
    label: 'iPhone 16 Pro Max',
    platform: 'iphone',
    frameWidth: 489, frameHeight: 1000,
    screenInset: { top: 1.4, left: 2.6, right: 2.6, bottom: 1.4 },
    screenBorderRadius: 55, frameBorderRadius: 60,
    nativeScreenWidth: 1320, nativeScreenHeight: 2868,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphone16ProVariants,
    svgPath: '/devices/iPhone 16 Pro Max.svg',
    svgViewBox: { width: 489, height: 1000 },
    svgScreenRect: { x: 23, y: 20, width: 443, height: 960, borderRadius: 59 },
  },
  'iphone-16-pro': {
    id: 'iphone-16-pro',
    label: 'iPhone 16 Pro',
    platform: 'iphone',
    frameWidth: 450, frameHeight: 920,
    screenInset: { top: 1.4, left: 2.8, right: 2.8, bottom: 1.4 },
    screenBorderRadius: 50, frameBorderRadius: 55,
    nativeScreenWidth: 1206, nativeScreenHeight: 2622,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphone16ProVariants,
    svgPath: '/devices/iPhone 16 Pro.svg',
    svgViewBox: { width: 450, height: 920 },
    svgScreenRect: { x: 22, y: 21, width: 406, height: 878, borderRadius: 60 },
  },
  'iphone-16': {
    id: 'iphone-16',
    label: 'iPhone 16',
    platform: 'iphone',
    frameWidth: 453, frameHeight: 912,
    screenInset: { top: 1.5, left: 3.0, right: 3.0, bottom: 1.5 },
    screenBorderRadius: 48, frameBorderRadius: 53,
    nativeScreenWidth: 1179, nativeScreenHeight: 2556,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphoneStandardVariants,
    svgPath: '/devices/iPhone 16.svg',
    svgViewBox: { width: 453, height: 912 },
    svgScreenRect: { x: 28, y: 28, width: 397, height: 856, borderRadius: 53 },
  },
  'iphone-16-plus': {
    id: 'iphone-16-plus',
    label: 'iPhone 16 Plus',
    platform: 'iphone',
    frameWidth: 490, frameHeight: 990,
    screenInset: { top: 1.4, left: 2.6, right: 2.6, bottom: 1.4 },
    screenBorderRadius: 53, frameBorderRadius: 58,
    nativeScreenWidth: 1290, nativeScreenHeight: 2796,
    frameColor: '#1c1c1e', hasDynamicIsland: true,
    colorVariants: iphoneStandardVariants,
    svgPath: '/devices/iPhone 16 Plus.svg',
    svgViewBox: { width: 490, height: 990 },
    svgScreenRect: { x: 28, y: 27, width: 434, height: 936, borderRadius: 53 },
  },
  // ─── iPads ─────────────────────────────────────────────────────────
  'ipad-pro-13': {
    id: 'ipad-pro-13',
    label: 'iPad Pro 13" (M4)',
    platform: 'ipad',
    frameWidth: 1500, frameHeight: 1150,
    screenInset: { top: 2.2, left: 2.0, right: 2.0, bottom: 2.2 },
    screenBorderRadius: 18, frameBorderRadius: 24,
    nativeScreenWidth: 2064, nativeScreenHeight: 2752,
    frameColor: '#1a1a1a', hasDynamicIsland: false,
    colorVariants: ipadPro13Variants,
    svgPath: '/devices/iPad Pro M4 13.svg',
    svgViewBox: { width: 1500, height: 1150 },
    svgScreenRect: { x: 59, y: 56, width: 1382, height: 1038, borderRadius: 20 },
  },
  'ipad-pro-11': {
    id: 'ipad-pro-11',
    label: 'iPad Pro 11" (M4)',
    platform: 'ipad',
    frameWidth: 1320, frameHeight: 940,
    screenInset: { top: 2.2, left: 2.2, right: 2.2, bottom: 2.2 },
    screenBorderRadius: 18, frameBorderRadius: 24,
    nativeScreenWidth: 1668, nativeScreenHeight: 2388,
    frameColor: '#1a1a1a', hasDynamicIsland: false,
    colorVariants: ipadPro11Variants,
    svgPath: '/devices/iPad Pro M4 11.svg',
    svgViewBox: { width: 1320, height: 940 },
    svgScreenRect: { x: 52, y: 50.5, width: 1216, height: 839, borderRadius: 19 },
  },
  'ipad-mini': {
    id: 'ipad-mini',
    label: 'iPad mini',
    platform: 'ipad',
    frameWidth: 1275, frameHeight: 890,
    screenInset: { top: 2.5, left: 2.5, right: 2.5, bottom: 2.5 },
    screenBorderRadius: 16, frameBorderRadius: 22,
    nativeScreenWidth: 1488, nativeScreenHeight: 2266,
    frameColor: '#1a1a1a', hasDynamicIsland: false,
    colorVariants: ipadMiniVariants,
    svgPath: '/devices/iPad mini.svg',
    svgViewBox: { width: 1275, height: 890 },
    svgScreenRect: { x: 68, y: 70, width: 1139, height: 750, borderRadius: 14 },
  },
  // ─── Mac ───────────────────────────────────────────────────────────
  'macbook-pro': {
    id: 'macbook-pro',
    label: 'MacBook Pro',
    platform: 'mac',
    frameWidth: 900, frameHeight: 580,
    screenInset: { top: 3.8, left: 6.5, right: 6.5, bottom: 10.0 },
    screenBorderRadius: 6, frameBorderRadius: 10,
    nativeScreenWidth: 1440, nativeScreenHeight: 900,
    frameColor: '#2d2d2d', hasDynamicIsland: false,
    colorVariants: macVariants,
    svgPath: null,
    svgViewBox: { width: 0, height: 0 },
    svgScreenRect: null,
  },
  // ─── Watch ─────────────────────────────────────────────────────────
  'apple-watch-se': {
    id: 'apple-watch-se',
    label: 'Apple Watch SE',
    platform: 'apple-watch',
    frameWidth: 250, frameHeight: 400,
    screenInset: { top: 8.8, left: 7.1, right: 7.1, bottom: 8.8 },
    screenBorderRadius: 36, frameBorderRadius: 80,
    nativeScreenWidth: 416, nativeScreenHeight: 496,
    frameColor: '#1a1a1a', hasDynamicIsland: false,
    colorVariants: watchSEVariants,
    svgPath: '/devices/Apple Watch SE.svg',
    svgViewBox: { width: 250, height: 400 },
    svgScreenRect: { x: 42, y: 99.5, width: 166, height: 201, borderRadius: 23 },
  },
  'apple-watch-s11-42': {
    id: 'apple-watch-s11-42',
    label: 'Apple Watch S11 (42mm)',
    platform: 'apple-watch',
    frameWidth: 260, frameHeight: 400,
    screenInset: { top: 7.5, left: 6.5, right: 6.5, bottom: 7.5 },
    screenBorderRadius: 40, frameBorderRadius: 80,
    nativeScreenWidth: 416, nativeScreenHeight: 496,
    frameColor: '#0a0a0a', hasDynamicIsland: false,
    colorVariants: watchS11Variants,
    svgPath: '/devices/Apple Watch S11 42mm.svg',
    svgViewBox: { width: 260, height: 400 },
    svgScreenRect: { x: 34.5, y: 86.5, width: 191, height: 227, borderRadius: 43 },
  },
  'apple-watch-s11-46': {
    id: 'apple-watch-s11-46',
    label: 'Apple Watch S11 (46mm)',
    platform: 'apple-watch',
    frameWidth: 280, frameHeight: 440,
    screenInset: { top: 7.5, left: 6.5, right: 6.5, bottom: 7.5 },
    screenBorderRadius: 44, frameBorderRadius: 80,
    nativeScreenWidth: 416, nativeScreenHeight: 496,
    frameColor: '#0a0a0a', hasDynamicIsland: false,
    colorVariants: watchS11Variants,
    svgPath: '/devices/Apple Watch S11 46mm.svg',
    svgViewBox: { width: 280, height: 440 },
    svgScreenRect: { x: 34, y: 94, width: 212, height: 252, borderRadius: 49 },
  },
  'apple-watch-ultra-2': {
    id: 'apple-watch-ultra-2',
    label: 'Apple Watch Ultra 2',
    platform: 'apple-watch',
    frameWidth: 300, frameHeight: 470,
    screenInset: { top: 8.0, left: 7.0, right: 7.0, bottom: 8.0 },
    screenBorderRadius: 40, frameBorderRadius: 60,
    nativeScreenWidth: 502, nativeScreenHeight: 410,
    frameColor: '#a8a0a0', hasDynamicIsland: false,
    colorVariants: watchUltraVariants,
    svgPath: '/devices/Apple Watch Ultra 2.svg',
    svgViewBox: { width: 300, height: 470 },
    svgScreenRect: { x: 45.5, y: 107.5, width: 209, height: 255, borderRadius: 51 },
  },
};

export const devicesByPlatform: Record<Platform, DeviceType[]> = {
  iphone: [
    'iphone-17-pro-max', 'iphone-17-pro', 'iphone-17',
    'iphone-air',
    'iphone-16-pro-max', 'iphone-16-pro', 'iphone-16', 'iphone-16-plus',
  ],
  ipad: ['ipad-pro-13', 'ipad-pro-11', 'ipad-mini'],
  mac: ['macbook-pro'],
  'apple-watch': ['apple-watch-se', 'apple-watch-s11-42', 'apple-watch-s11-46', 'apple-watch-ultra-2'],
};

export const platformLabels: Record<Platform, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  mac: 'Mac',
  'apple-watch': 'Watch',
};
