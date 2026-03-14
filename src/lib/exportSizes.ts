import { ExportSize, Orientation, Platform } from '@/store/types';

export const exportSizes: ExportSize[] = [
  { label: 'iPhone 6.9" Display', width: 1320, height: 2868, platform: 'iphone' },
  { label: 'iPhone 6.7" Display', width: 1290, height: 2796, platform: 'iphone' },
  { label: 'iPhone 6.5" Display', width: 1242, height: 2688, platform: 'iphone' },
  { label: 'iPhone 5.5" Display', width: 1242, height: 2208, platform: 'iphone' },
  { label: 'iPad Pro 13" Display', width: 2064, height: 2752, platform: 'ipad' },
  { label: 'iPad Pro 11" Display', width: 1668, height: 2388, platform: 'ipad' },
  { label: 'Mac 1280×800', width: 1280, height: 800, platform: 'mac' },
  { label: 'Mac 1440×900', width: 1440, height: 900, platform: 'mac' },
  { label: 'Apple Watch Series 11', width: 416, height: 496, platform: 'apple-watch' },
];

export const getExportSizesForPlatform = (platform: Platform): ExportSize[] =>
  exportSizes.filter((s) => s.platform === platform);

export const getDefaultExportSize = (platform: Platform): ExportSize =>
  getExportSizesForPlatform(platform)[0];

/** Returns export size with width/height swapped for landscape iPad */
export function getOrientedExportSize(size: ExportSize, orientation: Orientation): ExportSize {
  if (size.platform !== 'ipad') return size;
  const w = Math.min(size.width, size.height);
  const h = Math.max(size.width, size.height);
  return orientation === 'landscape'
    ? { ...size, width: h, height: w }
    : { ...size, width: w, height: h };
}
