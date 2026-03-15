import type { Platform } from '@/store/types';

export type ShowcaseDevice = 'iphone' | 'ipad' | 'mac' | 'watch';

export interface ShowcaseScreenshot {
  headline: string;
  subtitle: string;
  /** CSS gradient or solid for the mini screen background */
  screenBg: string;
  /** Text color for this screen */
  textColor: string;
  /** Which device shape to render */
  device: ShowcaseDevice;
}

export interface ShowcaseApp {
  id: string;
  name: string;
  category: string;
  tagline: string;
  icon: string;
  templateId: string;
  /** Default platform when creating a project from this showcase */
  platform: Platform;
  accentColor: string;
  cardGradient: string;
  screenshots: ShowcaseScreenshot[];
}

export const showcaseApps: ShowcaseApp[] = [
  {
    id: 'social-media',
    name: 'ConnectHub',
    category: 'Social Media',
    tagline: 'Share moments that matter',
    icon: '💬',
    templateId: 'glassMorphism',
    platform: 'iphone',
    accentColor: '#8b5cf6',
    cardGradient: 'linear-gradient(135deg, #7c3aed, #4f46e5, #6366f1)',
    screenshots: [
      { headline: 'Share Your Story', subtitle: 'Beautiful moments shared', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #4338ca 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Stay Connected', subtitle: 'Real-time messaging', screenBg: 'linear-gradient(180deg, #6d28d9 0%, #4f46e5 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Discover Trends', subtitle: 'See what\'s trending', screenBg: 'linear-gradient(180deg, #5b21b6 0%, #3730a3 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Go Live', subtitle: 'Stream to the world', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #312e81 100%)', textColor: '#ffffff', device: 'watch' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'ShopFlow',
    category: 'E-Commerce',
    tagline: 'Smart shopping, simplified',
    icon: '🛍️',
    templateId: 'minimal',
    platform: 'iphone',
    accentColor: '#10b981',
    cardGradient: 'linear-gradient(135deg, #f0fdf4, #d1fae5, #a7f3d0)',
    screenshots: [
      { headline: 'Browse Collections', subtitle: 'Curated picks for you', screenBg: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)', textColor: '#1a1a1a', device: 'iphone' },
      { headline: 'Desktop Shopping', subtitle: 'Full catalog experience', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'mac' },
      { headline: 'One-Tap Checkout', subtitle: 'Fast & secure', screenBg: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'iphone' },
      { headline: 'Order Status', subtitle: 'Quick glance updates', screenBg: 'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)', textColor: '#1a1a1a', device: 'watch' },
    ],
  },
  {
    id: 'game',
    name: 'RealmQuest',
    category: 'Gaming',
    tagline: 'Epic adventures await',
    icon: '🎮',
    templateId: 'anime',
    platform: 'iphone',
    accentColor: '#f43f5e',
    cardGradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
    screenshots: [
      { headline: 'Enter the Realm', subtitle: 'Endless adventure', screenBg: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Battle Legends', subtitle: 'Challenge worldwide', screenBg: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Collect & Evolve', subtitle: 'Unique characters', screenBg: 'linear-gradient(180deg, #6366f1 0%, #ec4899 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Desktop Arena', subtitle: 'Full-screen battles', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #db2777 100%)', textColor: '#ffffff', device: 'mac' },
    ],
  },
  {
    id: 'trading',
    name: 'TradeVault',
    category: 'Finance',
    tagline: 'Invest with confidence',
    icon: '📈',
    templateId: 'midnightSapphire',
    platform: 'iphone',
    accentColor: '#3b82f6',
    cardGradient: 'linear-gradient(135deg, #0f172a, #1e3a5f, #172554)',
    screenshots: [
      { headline: 'Smart Portfolio', subtitle: 'AI-powered insights', screenBg: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', textColor: '#e2e8f0', device: 'iphone' },
      { headline: 'Pro Trading', subtitle: 'Advanced charts', screenBg: 'linear-gradient(180deg, #172554 0%, #1e40af 100%)', textColor: '#e2e8f0', device: 'mac' },
      { headline: 'Real-Time Markets', subtitle: 'Live data', screenBg: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'ipad' },
      { headline: 'Price Alerts', subtitle: 'Never miss a move', screenBg: 'linear-gradient(180deg, #0c4a6e 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'watch' },
    ],
  },
  {
    id: 'taxi',
    name: 'RideSwift',
    category: 'Travel',
    tagline: 'Your ride, your way',
    icon: '🚗',
    templateId: 'modern',
    platform: 'iphone',
    accentColor: '#f59e0b',
    cardGradient: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #0a0a0a)',
    screenshots: [
      { headline: 'Book in Seconds', subtitle: 'Tap, ride, arrive', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Live Tracking', subtitle: 'Know your ride', screenBg: 'linear-gradient(180deg, #111827 0%, #0a0a0a 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Ride Status', subtitle: 'ETA on your wrist', screenBg: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)', textColor: '#f59e0b', device: 'watch' },
      { headline: 'Split the Fare', subtitle: 'Easy payments', screenBg: 'linear-gradient(180deg, #1f2937 0%, #0a0a0a 100%)', textColor: '#ffffff', device: 'ipad' },
    ],
  },
];
