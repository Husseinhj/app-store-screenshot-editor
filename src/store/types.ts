export type DeviceType =
  | 'iphone-17-pro-max'
  | 'iphone-17-pro'
  | 'iphone-17'
  | 'iphone-air'
  | 'iphone-16-pro-max'
  | 'iphone-16-pro'
  | 'iphone-16'
  | 'iphone-16-plus'
  | 'ipad-pro-13'
  | 'ipad-pro-11'
  | 'ipad-mini'
  | 'macbook-pro'
  | 'apple-watch-se'
  | 'apple-watch-s11-42'
  | 'apple-watch-s11-46'
  | 'apple-watch-ultra-2';

export type FrameStyle = 'svg' | 'css';

export type Orientation = 'portrait' | 'landscape';

export type Platform = 'iphone' | 'ipad' | 'mac' | 'apple-watch';

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientConfig {
  angle: number; // 0-360
  stops: GradientStop[];
}

export interface BackgroundConfig {
  type: BackgroundType;
  solidColor: string;
  gradient: GradientConfig;
  imageUrl: string | null;
}

// Legacy type kept for reference by panels
export interface TextConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
}

// ─── Canvas Element System ───────────────────────────────────────────────────

export type CanvasElementType = 'device-frame' | 'text' | 'image' | 'shape';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

/** Position and size as percentages of the export canvas (0–100).
 *  Allows negative values or values > 100 for off-canvas positioning. */
export interface ElementTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees, 0-360
}

export interface BaseElement {
  id: string;
  type: CanvasElementType;
  transform: ElementTransform;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  flipX: boolean;
  flipY: boolean;
}

export interface CustomFrame {
  id: string;
  name: string;
  svgContent: string;
  screenRect: { x: number; y: number; width: number; height: number };
  viewBox: string;
}

export interface DeviceFrameElement extends BaseElement {
  type: 'device-frame';
  device: DeviceType;
  frameStyle: FrameStyle;
  frameColorVariant: string;
  showDeviceFrame: boolean;
  orientation: Orientation;
  screenshotImageUrl: string | null;
  customFrameId?: string | null;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  imageUrl: string;
  objectFit: 'cover' | 'contain' | 'fill';
  opacity: number;
  borderRadius: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
}

export type CanvasElement = DeviceFrameElement | TextElement | ImageElement | ShapeElement;

// ─── Screenshot & Project ────────────────────────────────────────────────────

export interface Screenshot {
  id: string;
  name: string;
  notes: string;
  elements: CanvasElement[];
  background: BackgroundConfig;
  order: number;
}

export interface ExportSize {
  label: string;
  width: number;
  height: number;
  platform: Platform;
}

export type ScreenshotsByPlatform = Record<Platform, Screenshot[]>;

export type CanvasView = 'single' | 'platform-grid' | 'all-platforms';

export interface Project {
  id: string;
  name: string;
  platform: Platform;
  screenshotsByPlatform: ScreenshotsByPlatform;
  selectedScreenshotId: string | null;
}

export interface ProjectMeta {
  id: string;
  name: string;
  platform: Platform;
  lastEditedAt: number;
  thumbnailDataUrl: string | null;
}

export type AppView = 'home' | 'editor';
