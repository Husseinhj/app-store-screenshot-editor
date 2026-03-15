import { nanoid } from 'nanoid';
import type {
  CanvasElement,
  DeviceFrameElement,
  DeviceType,
  FrameStyle,
  ImageElement,
  Orientation,
  Platform,
  ShapeElement,
  ShapeType,
  TextElement,
} from '@/store/types';

// ─── Default text settings by platform ───────────────────────────────────────

const defaultTextByPlatform: Record<Platform, Pick<TextElement, 'content' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'color' | 'alignment' | 'lineHeight'>> = {
  iphone: {
    content: 'Your headline here',
    fontFamily: 'Inter',
    fontSize: 64,
    fontWeight: 700,
    color: '#ffffff',
    alignment: 'center',
    lineHeight: 1.2,
  },
  ipad: {
    content: 'Your headline here',
    fontFamily: 'Inter',
    fontSize: 80,
    fontWeight: 700,
    color: '#ffffff',
    alignment: 'center',
    lineHeight: 1.15,
  },
  mac: {
    content: 'Your headline here',
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 600,
    color: '#ffffff',
    alignment: 'center',
    lineHeight: 1.2,
  },
  'apple-watch': {
    content: 'Headline',
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: 600,
    color: '#ffffff',
    alignment: 'center',
    lineHeight: 1.1,
  },
};

// ─── Factory functions ───────────────────────────────────────────────────────

export function getNextZIndex(elements: CanvasElement[]): number {
  return elements.length === 0 ? 1 : Math.max(...elements.map((e) => e.zIndex)) + 1;
}

export function createDefaultTextElement(platform: Platform, elements: CanvasElement[] = []): TextElement {
  const defaults = defaultTextByPlatform[platform];
  return {
    id: nanoid(),
    type: 'text',
    transform: { x: 6, y: 2, width: 88, height: 26, rotation: 0 },
    zIndex: getNextZIndex(elements),
    locked: false,
    visible: true,
    flipX: false,
    flipY: false,
    ...defaults,
  };
}

export function createDefaultDeviceFrameElement(
  device: DeviceType,
  platform: Platform,
  elements: CanvasElement[] = [],
): DeviceFrameElement {
  return {
    id: nanoid(),
    type: 'device-frame',
    transform: { x: 15, y: 30, width: 70, height: 68, rotation: 0 },
    zIndex: getNextZIndex(elements),
    locked: false,
    visible: true,
    flipX: false,
    flipY: false,
    device,
    frameStyle: 'svg' as FrameStyle,
    frameColorVariant: 'default',
    showDeviceFrame: true,
    orientation: 'portrait' as Orientation,
    screenshotImageUrl: null,
    screenshotFit: 'contain',
    screenshotOffset: { x: 0, y: 0 },
    screenshotScale: 1,
  };
}

export function createDefaultImageElement(
  imageUrl: string,
  elements: CanvasElement[] = [],
  position?: { x: number; y: number },
): ImageElement {
  return {
    id: nanoid(),
    type: 'image',
    transform: {
      x: position?.x ?? 25,
      y: position?.y ?? 25,
      width: 50,
      height: 50,
      rotation: 0,
    },
    zIndex: getNextZIndex(elements),
    locked: false,
    visible: true,
    flipX: false,
    flipY: false,
    imageUrl,
    objectFit: 'contain',
    opacity: 1,
    borderRadius: 0,
  };
}

export function createDefaultShapeElement(
  shapeType: ShapeType,
  elements: CanvasElement[] = [],
): ShapeElement {
  return {
    id: nanoid(),
    type: 'shape',
    transform: { x: 30, y: 30, width: 40, height: 40, rotation: 0 },
    zIndex: getNextZIndex(elements),
    locked: false,
    visible: true,
    flipX: false,
    flipY: false,
    shapeType,
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 0,
    borderRadius: 0,
  };
}

export function createEmojiTextElement(
  emoji: string,
  platform: Platform,
  elements: CanvasElement[] = [],
): TextElement {
  return {
    id: nanoid(),
    type: 'text',
    transform: { x: 35, y: 35, width: 30, height: 30, rotation: 0 },
    zIndex: getNextZIndex(elements),
    locked: false,
    visible: true,
    flipX: false,
    flipY: false,
    content: emoji,
    fontFamily: 'Inter',
    fontSize: 120,
    fontWeight: 400,
    color: '#ffffff',
    alignment: 'center',
    lineHeight: 1,
  };
}

/** Get the default text settings for a platform (used by text element inspector) */
export { defaultTextByPlatform };
