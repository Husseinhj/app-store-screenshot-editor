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

export interface TextConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface Screenshot {
  id: string;
  screenshotImageUrl: string | null;
  device: DeviceType;
  frameStyle: FrameStyle;
  frameColorVariant: string;
  showDeviceFrame: boolean;
  orientation: Orientation;
  text: TextConfig;
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
