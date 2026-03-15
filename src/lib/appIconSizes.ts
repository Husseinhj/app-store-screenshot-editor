import type { IconPlatform } from '@/store/types';

export interface AppIconSize {
  idiom: string;
  platform: IconPlatform;
  size: string;
  scale: string;
  pixelSize: number;
  filename: string;
  role?: string;
  subtype?: string;
}

// ─── iOS (iPhone) ────────────────────────────────────────────────────────────

const iosSizes: AppIconSize[] = [
  { idiom: 'iphone', platform: 'ios', size: '60x60', scale: '3x', pixelSize: 180, filename: 'icon-iphone-60x60@3x.png' },
  { idiom: 'iphone', platform: 'ios', size: '60x60', scale: '2x', pixelSize: 120, filename: 'icon-iphone-60x60@2x.png' },
  { idiom: 'iphone', platform: 'ios', size: '40x40', scale: '3x', pixelSize: 120, filename: 'icon-iphone-40x40@3x.png' },
  { idiom: 'iphone', platform: 'ios', size: '40x40', scale: '2x', pixelSize: 80, filename: 'icon-iphone-40x40@2x.png' },
  { idiom: 'iphone', platform: 'ios', size: '29x29', scale: '3x', pixelSize: 87, filename: 'icon-iphone-29x29@3x.png' },
  { idiom: 'iphone', platform: 'ios', size: '29x29', scale: '2x', pixelSize: 58, filename: 'icon-iphone-29x29@2x.png' },
  { idiom: 'iphone', platform: 'ios', size: '38x38', scale: '3x', pixelSize: 114, filename: 'icon-iphone-38x38@3x.png' },
  { idiom: 'iphone', platform: 'ios', size: '38x38', scale: '2x', pixelSize: 76, filename: 'icon-iphone-38x38@2x.png' },
  { idiom: 'ios-marketing', platform: 'ios', size: '1024x1024', scale: '1x', pixelSize: 1024, filename: 'icon-ios-marketing-1024x1024@1x.png' },
];

// ─── iPadOS ──────────────────────────────────────────────────────────────────

const ipadosSizes: AppIconSize[] = [
  { idiom: 'ipad', platform: 'ipados', size: '83.5x83.5', scale: '2x', pixelSize: 167, filename: 'icon-ipad-83.5x83.5@2x.png' },
  { idiom: 'ipad', platform: 'ipados', size: '76x76', scale: '2x', pixelSize: 152, filename: 'icon-ipad-76x76@2x.png' },
  { idiom: 'ipad', platform: 'ipados', size: '40x40', scale: '2x', pixelSize: 80, filename: 'icon-ipad-40x40@2x.png' },
  { idiom: 'ipad', platform: 'ipados', size: '29x29', scale: '2x', pixelSize: 58, filename: 'icon-ipad-29x29@2x.png' },
  { idiom: 'ipad', platform: 'ipados', size: '38x38', scale: '2x', pixelSize: 76, filename: 'icon-ipad-38x38@2x.png' },
  { idiom: 'ipad', platform: 'ipados', size: '1024x1024', scale: '1x', pixelSize: 1024, filename: 'icon-ipad-1024x1024@1x.png' },
];

// ─── macOS ───────────────────────────────────────────────────────────────────

const macosSizes: AppIconSize[] = [
  { idiom: 'mac', platform: 'macos', size: '512x512', scale: '2x', pixelSize: 1024, filename: 'icon-mac-512x512@2x.png' },
  { idiom: 'mac', platform: 'macos', size: '512x512', scale: '1x', pixelSize: 512, filename: 'icon-mac-512x512@1x.png' },
  { idiom: 'mac', platform: 'macos', size: '256x256', scale: '2x', pixelSize: 512, filename: 'icon-mac-256x256@2x.png' },
  { idiom: 'mac', platform: 'macos', size: '256x256', scale: '1x', pixelSize: 256, filename: 'icon-mac-256x256@1x.png' },
  { idiom: 'mac', platform: 'macos', size: '128x128', scale: '2x', pixelSize: 256, filename: 'icon-mac-128x128@2x.png' },
  { idiom: 'mac', platform: 'macos', size: '128x128', scale: '1x', pixelSize: 128, filename: 'icon-mac-128x128@1x.png' },
  { idiom: 'mac', platform: 'macos', size: '32x32', scale: '2x', pixelSize: 64, filename: 'icon-mac-32x32@2x.png' },
  { idiom: 'mac', platform: 'macos', size: '32x32', scale: '1x', pixelSize: 32, filename: 'icon-mac-32x32@1x.png' },
  { idiom: 'mac', platform: 'macos', size: '16x16', scale: '2x', pixelSize: 32, filename: 'icon-mac-16x16@2x.png' },
  { idiom: 'mac', platform: 'macos', size: '16x16', scale: '1x', pixelSize: 16, filename: 'icon-mac-16x16@1x.png' },
];

// ─── watchOS ─────────────────────────────────────────────────────────────────

const watchosSizes: AppIconSize[] = [
  { idiom: 'watch', platform: 'watchos', size: '1024x1024', scale: '1x', pixelSize: 1024, filename: 'icon-watch-1024x1024@1x.png', role: 'appLauncher', subtype: 'watchOS' },
  { idiom: 'watch', platform: 'watchos', size: '108x108', scale: '2x', pixelSize: 216, filename: 'icon-watch-108x108@2x.png', role: 'appLauncher', subtype: '49mm' },
  { idiom: 'watch', platform: 'watchos', size: '98x98', scale: '2x', pixelSize: 196, filename: 'icon-watch-98x98@2x.png', role: 'appLauncher', subtype: '45mm' },
  { idiom: 'watch', platform: 'watchos', size: '86x86', scale: '2x', pixelSize: 172, filename: 'icon-watch-86x86@2x.png', role: 'appLauncher', subtype: '41mm' },
  { idiom: 'watch', platform: 'watchos', size: '50x50', scale: '2x', pixelSize: 100, filename: 'icon-watch-50x50@2x.png', role: 'appLauncher', subtype: '38mm' },
  { idiom: 'watch', platform: 'watchos', size: '54x54', scale: '2x', pixelSize: 108, filename: 'icon-watch-54x54@2x.png', role: 'companionSettings', subtype: '3x' },
  { idiom: 'watch', platform: 'watchos', size: '29x29', scale: '2x', pixelSize: 58, filename: 'icon-watch-29x29@2x.png', role: 'companionSettings', subtype: '2x' },
  { idiom: 'watch', platform: 'watchos', size: '44x44', scale: '2x', pixelSize: 88, filename: 'icon-watch-44x44@2x.png', role: 'longLook', subtype: '42mm' },
  { idiom: 'watch', platform: 'watchos', size: '40x40', scale: '2x', pixelSize: 80, filename: 'icon-watch-40x40@2x.png', role: 'longLook', subtype: '38mm' },
  { idiom: 'watch', platform: 'watchos', size: '27x27', scale: '2x', pixelSize: 54, filename: 'icon-watch-27x27@2x.png', role: 'notificationCenter', subtype: '42mm' },
  { idiom: 'watch', platform: 'watchos', size: '24x24', scale: '2x', pixelSize: 48, filename: 'icon-watch-24x24@2x.png', role: 'notificationCenter', subtype: '38mm' },
  { idiom: 'watch', platform: 'watchos', size: '51x51', scale: '2x', pixelSize: 102, filename: 'icon-watch-51x51@2x.png', role: 'shortLook', subtype: '49mm' },
];

// ─── visionOS ────────────────────────────────────────────────────────────────

const visionosSizes: AppIconSize[] = [
  { idiom: 'reality', platform: 'visionos', size: '1024x1024', scale: '1x', pixelSize: 1024, filename: 'icon-visionos-1024x1024@1x.png' },
];

// ─── Combined ────────────────────────────────────────────────────────────────

export const APP_ICON_SIZES: AppIconSize[] = [
  ...iosSizes,
  ...ipadosSizes,
  ...macosSizes,
  ...watchosSizes,
  ...visionosSizes,
];

const platformMap: Record<IconPlatform, AppIconSize[]> = {
  ios: iosSizes,
  ipados: ipadosSizes,
  macos: macosSizes,
  watchos: watchosSizes,
  visionos: visionosSizes,
};

/** Get icon sizes for selected platforms */
export function getIconSizesForPlatforms(platforms: IconPlatform[]): AppIconSize[] {
  const sizes: AppIconSize[] = [];
  for (const p of platforms) {
    sizes.push(...(platformMap[p] ?? []));
  }
  return sizes;
}

/** Get deduplicated pixel sizes needed for export */
export function getUniquePixelSizes(platforms: IconPlatform[]): number[] {
  const sizes = getIconSizesForPlatforms(platforms);
  return [...new Set(sizes.map((s) => s.pixelSize))].sort((a, b) => b - a);
}

/** Generate Xcode-compatible Contents.json */
export function generateContentsJson(platforms: IconPlatform[]) {
  const sizes = getIconSizesForPlatforms(platforms);

  const images = sizes.map((s) => {
    const entry: Record<string, string> = {
      filename: s.filename,
      idiom: s.idiom,
      scale: s.scale,
      size: s.size,
    };
    if (s.role) entry.role = s.role;
    if (s.subtype) entry.subtype = s.subtype;
    return entry;
  });

  return {
    images,
    info: {
      author: 'xcode',
      version: 1,
    },
  };
}

/** Platform display info */
export const ICON_PLATFORM_LABELS: Record<IconPlatform, string> = {
  ios: 'iOS',
  ipados: 'iPadOS',
  macos: 'macOS',
  watchos: 'watchOS',
  visionos: 'visionOS',
};

/** Platform mask type for preview */
export function getPlatformMask(platform: IconPlatform): 'squircle' | 'circle' {
  if (platform === 'watchos' || platform === 'visionos') return 'circle';
  return 'squircle';
}
