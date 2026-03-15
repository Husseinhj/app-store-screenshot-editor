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
  /** Optional screenshot image URL to show inside the device frame */
  screenshotUrl?: string;
  /** Optional second screenshot for split/connected templates (paired device on adjacent screen) */
  pairedScreenshotUrl?: string;
  /** Optional per-screenshot template override (e.g. 'splitViewLeft' / 'splitViewRight') */
  templateId?: string;
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
      // iPhone (5)
      { headline: 'Share Your Story', subtitle: 'Beautiful moments shared', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #4338ca 100%)', textColor: '#ffffff', device: 'iphone', screenshotUrl: '/showcases/instagram-profile.png' },
      { headline: 'Discover Trends', subtitle: 'See what\'s trending', screenBg: 'linear-gradient(180deg, #5b21b6 0%, #3730a3 100%)', textColor: '#ffffff', device: 'iphone', screenshotUrl: '/showcases/instagram-feed.png' },
      { headline: 'Direct Messages', subtitle: 'Chat with friends', screenBg: 'linear-gradient(180deg, #6d28d9 0%, #4f46e5 100%)', textColor: '#ffffff', device: 'iphone', screenshotUrl: '/showcases/instagram-explore.png' },
      { headline: 'Create Reels', subtitle: 'Short videos that shine', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #6366f1 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Your Profile', subtitle: 'Express yourself', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #4338ca 100%)', textColor: '#ffffff', device: 'iphone' },
      // iPad (5)
      { headline: 'Stay Connected', subtitle: 'Real-time messaging', screenBg: 'linear-gradient(180deg, #6d28d9 0%, #4f46e5 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Feed Gallery', subtitle: 'Immersive browsing', screenBg: 'linear-gradient(180deg, #5b21b6 0%, #3730a3 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Stories View', subtitle: 'Full-screen stories', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #4338ca 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Explore Tab', subtitle: 'Discover new content', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #6d28d9 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Group Chats', subtitle: 'Stay in the loop', screenBg: 'linear-gradient(180deg, #6d28d9 0%, #3730a3 100%)', textColor: '#ffffff', device: 'ipad' },
      // Mac (5)
      { headline: 'Social Dashboard', subtitle: 'All your feeds in one place', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #3730a3 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Content Studio', subtitle: 'Create & schedule posts', screenBg: 'linear-gradient(180deg, #5b21b6 0%, #4338ca 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Analytics Hub', subtitle: 'Track your growth', screenBg: 'linear-gradient(180deg, #6d28d9 0%, #3730a3 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Message Center', subtitle: 'All conversations', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Notifications', subtitle: 'Never miss a mention', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #4f46e5 100%)', textColor: '#ffffff', device: 'mac' },
      // Watch (5)
      { headline: 'Go Live', subtitle: 'Stream to the world', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #312e81 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Quick Reply', subtitle: 'Respond instantly', screenBg: 'linear-gradient(180deg, #6d28d9 0%, #4338ca 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'New Likes', subtitle: 'Real-time alerts', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Story Camera', subtitle: 'Quick snap & share', screenBg: 'linear-gradient(180deg, #5b21b6 0%, #3730a3 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Activity Feed', subtitle: 'Glanceable updates', screenBg: 'linear-gradient(180deg, #4c1d95 0%, #6366f1 100%)', textColor: '#ffffff', device: 'watch' },
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
      // iPhone (5)
      { headline: 'Browse Collections', subtitle: 'Curated picks for you', screenBg: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)', textColor: '#1a1a1a', device: 'iphone', screenshotUrl: '/showcases/amazon-categories.png', pairedScreenshotUrl: '/showcases/amazon-deals.png' },
      { headline: 'One-Tap Checkout', subtitle: 'Fast & secure', screenBg: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'iphone', screenshotUrl: '/showcases/amazon-deals.png' },
      { headline: 'Wishlist & Favorites', subtitle: 'Save for later', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)', textColor: '#1a1a1a', device: 'iphone' },
      { headline: 'Flash Deals', subtitle: 'Limited time offers', screenBg: 'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)', textColor: '#1a1a1a', device: 'iphone' },
      { headline: 'Order Tracking', subtitle: 'Real-time updates', screenBg: 'linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 100%)', textColor: '#1a1a1a', device: 'iphone' },
      // iPad (5)
      { headline: 'Tablet Shopping', subtitle: 'Immersive catalog view', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'ipad' },
      { headline: 'Product Gallery', subtitle: 'Zoom & explore', screenBg: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'ipad' },
      { headline: 'Compare Items', subtitle: 'Side by side', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)', textColor: '#1a1a1a', device: 'ipad' },
      { headline: 'Shopping Cart', subtitle: 'Review & checkout', screenBg: 'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)', textColor: '#1a1a1a', device: 'ipad' },
      { headline: 'Style Boards', subtitle: 'Curate your looks', screenBg: 'linear-gradient(180deg, #ffffff 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'ipad' },
      // Mac (5)
      { headline: 'Desktop Shopping', subtitle: 'Full catalog experience', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'mac' },
      { headline: 'Seller Dashboard', subtitle: 'Manage your store', screenBg: 'linear-gradient(180deg, #ecfdf5 0%, #a7f3d0 100%)', textColor: '#1a1a1a', device: 'mac' },
      { headline: 'Inventory Manager', subtitle: 'Stock at a glance', screenBg: 'linear-gradient(180deg, #d1fae5 0%, #ecfdf5 100%)', textColor: '#1a1a1a', device: 'mac' },
      { headline: 'Sales Analytics', subtitle: 'Track performance', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #a7f3d0 100%)', textColor: '#1a1a1a', device: 'mac' },
      { headline: 'Bulk Orders', subtitle: 'Wholesale purchasing', screenBg: 'linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%)', textColor: '#1a1a1a', device: 'mac' },
      // Watch (5)
      { headline: 'Order Status', subtitle: 'Quick glance updates', screenBg: 'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)', textColor: '#1a1a1a', device: 'watch' },
      { headline: 'Price Drop', subtitle: 'Instant alerts', screenBg: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'watch' },
      { headline: 'Delivery ETA', subtitle: 'Package on the way', screenBg: 'linear-gradient(180deg, #f0fdf4 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'watch' },
      { headline: 'Quick Buy', subtitle: 'Reorder favorites', screenBg: 'linear-gradient(180deg, #d1fae5 0%, #f0fdf4 100%)', textColor: '#1a1a1a', device: 'watch' },
      { headline: 'Store Finder', subtitle: 'Nearby locations', screenBg: 'linear-gradient(180deg, #a7f3d0 0%, #d1fae5 100%)', textColor: '#1a1a1a', device: 'watch' },
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
      // iPhone (5)
      { headline: 'Enter the Realm', subtitle: 'Endless adventure', screenBg: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Collect & Evolve', subtitle: 'Unique characters', screenBg: 'linear-gradient(180deg, #6366f1 0%, #ec4899 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Guild Wars', subtitle: 'Team up & conquer', screenBg: 'linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Loot & Craft', subtitle: 'Forge epic gear', screenBg: 'linear-gradient(180deg, #ec4899 0%, #8b5cf6 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'PvP Arena', subtitle: 'Climb the ranks', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #06b6d4 100%)', textColor: '#ffffff', device: 'iphone' },
      // iPad (5)
      { headline: 'Battle Legends', subtitle: 'Challenge worldwide', screenBg: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'World Map', subtitle: 'Explore vast lands', screenBg: 'linear-gradient(180deg, #06b6d4 0%, #6366f1 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Character Builder', subtitle: 'Customize your hero', screenBg: 'linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Dungeon Raids', subtitle: 'Co-op adventures', screenBg: 'linear-gradient(180deg, #ec4899 0%, #6366f1 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Leaderboards', subtitle: 'Top players worldwide', screenBg: 'linear-gradient(180deg, #6366f1 0%, #ec4899 100%)', textColor: '#ffffff', device: 'ipad' },
      // Mac (5)
      { headline: 'Desktop Arena', subtitle: 'Full-screen battles', screenBg: 'linear-gradient(180deg, #7c3aed 0%, #db2777 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Strategy Planner', subtitle: 'Plan your conquest', screenBg: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Guild Manager', subtitle: 'Lead your alliance', screenBg: 'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Inventory', subtitle: 'Manage your loot', screenBg: 'linear-gradient(180deg, #6366f1 0%, #06b6d4 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Replay Theater', subtitle: 'Watch epic moments', screenBg: 'linear-gradient(180deg, #ec4899 0%, #7c3aed 100%)', textColor: '#ffffff', device: 'mac' },
      // Watch (5)
      { headline: 'Quest Timer', subtitle: 'Never miss a raid', screenBg: 'linear-gradient(180deg, #06b6d4 0%, #6366f1 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Raid Alert', subtitle: 'Boss incoming!', screenBg: 'linear-gradient(180deg, #ec4899 0%, #8b5cf6 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Stamina Bar', subtitle: 'Energy tracker', screenBg: 'linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Quick Battle', subtitle: 'Fight on the go', screenBg: 'linear-gradient(180deg, #6366f1 0%, #ec4899 100%)', textColor: '#ffffff', device: 'watch' },
      { headline: 'Daily Rewards', subtitle: 'Claim your loot', screenBg: 'linear-gradient(180deg, #06b6d4 0%, #ec4899 100%)', textColor: '#ffffff', device: 'watch' },
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
      // iPhone (5)
      { headline: 'Smart Portfolio', subtitle: 'AI-powered insights', screenBg: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', textColor: '#e2e8f0', device: 'iphone' },
      { headline: 'Watchlist', subtitle: 'Track your favorites', screenBg: 'linear-gradient(180deg, #172554 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'iphone' },
      { headline: 'Market News', subtitle: 'Stay informed', screenBg: 'linear-gradient(180deg, #1e3a5f 0%, #172554 100%)', textColor: '#e2e8f0', device: 'iphone' },
      { headline: 'Quick Trade', subtitle: 'Execute in seconds', screenBg: 'linear-gradient(180deg, #0f172a 0%, #172554 100%)', textColor: '#e2e8f0', device: 'iphone' },
      { headline: 'Performance', subtitle: 'Track your gains', screenBg: 'linear-gradient(180deg, #172554 0%, #1e3a5f 100%)', textColor: '#e2e8f0', device: 'iphone' },
      // iPad (5)
      { headline: 'Real-Time Markets', subtitle: 'Live data', screenBg: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'ipad' },
      { headline: 'Chart Analysis', subtitle: 'Technical indicators', screenBg: 'linear-gradient(180deg, #172554 0%, #1e3a5f 100%)', textColor: '#e2e8f0', device: 'ipad' },
      { headline: 'Portfolio View', subtitle: 'Asset allocation', screenBg: 'linear-gradient(180deg, #0f172a 0%, #172554 100%)', textColor: '#e2e8f0', device: 'ipad' },
      { headline: 'Research Hub', subtitle: 'Deep analysis tools', screenBg: 'linear-gradient(180deg, #1e3a5f 0%, #172554 100%)', textColor: '#e2e8f0', device: 'ipad' },
      { headline: 'Order Book', subtitle: 'Market depth view', screenBg: 'linear-gradient(180deg, #172554 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'ipad' },
      // Mac (5)
      { headline: 'Pro Trading', subtitle: 'Advanced charts', screenBg: 'linear-gradient(180deg, #172554 0%, #1e40af 100%)', textColor: '#e2e8f0', device: 'mac' },
      { headline: 'Multi-Screen', subtitle: 'Dual chart layout', screenBg: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', textColor: '#e2e8f0', device: 'mac' },
      { headline: 'Risk Manager', subtitle: 'Position sizing', screenBg: 'linear-gradient(180deg, #1e3a5f 0%, #172554 100%)', textColor: '#e2e8f0', device: 'mac' },
      { headline: 'Algo Builder', subtitle: 'Automate strategies', screenBg: 'linear-gradient(180deg, #172554 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'mac' },
      { headline: 'Tax Reports', subtitle: 'Export & compliance', screenBg: 'linear-gradient(180deg, #0f172a 0%, #172554 100%)', textColor: '#e2e8f0', device: 'mac' },
      // Watch (5)
      { headline: 'Price Alerts', subtitle: 'Never miss a move', screenBg: 'linear-gradient(180deg, #0c4a6e 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'watch' },
      { headline: 'Quick Glance', subtitle: 'Portfolio at a look', screenBg: 'linear-gradient(180deg, #172554 0%, #0c4a6e 100%)', textColor: '#e2e8f0', device: 'watch' },
      { headline: 'Market Pulse', subtitle: 'Live index data', screenBg: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)', textColor: '#e2e8f0', device: 'watch' },
      { headline: 'Crypto Watch', subtitle: 'BTC & ETH live', screenBg: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', textColor: '#e2e8f0', device: 'watch' },
      { headline: 'Trade Alert', subtitle: 'Order filled', screenBg: 'linear-gradient(180deg, #0c4a6e 0%, #172554 100%)', textColor: '#e2e8f0', device: 'watch' },
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
      // iPhone (5)
      { headline: 'Book in Seconds', subtitle: 'Tap, ride, arrive', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', textColor: '#ffffff', device: 'iphone', screenshotUrl: '/showcases/uber-courier.png', pairedScreenshotUrl: '/showcases/uber-one.png' },
      { headline: 'Live Tracking', subtitle: 'Know your ride', screenBg: 'linear-gradient(180deg, #111827 0%, #0a0a0a 100%)', textColor: '#ffffff', device: 'iphone', screenshotUrl: '/showcases/uber-one.png' },
      { headline: 'Ride History', subtitle: 'All your trips', screenBg: 'linear-gradient(180deg, #1a1a2e 0%, #111827 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Choose Your Ride', subtitle: 'Economy to premium', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)', textColor: '#ffffff', device: 'iphone' },
      { headline: 'Rate & Tip', subtitle: 'Thank your driver', screenBg: 'linear-gradient(180deg, #111827 0%, #1a1a2e 100%)', textColor: '#ffffff', device: 'iphone' },
      // iPad (5)
      { headline: 'Split the Fare', subtitle: 'Easy payments', screenBg: 'linear-gradient(180deg, #1f2937 0%, #0a0a0a 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Route Planner', subtitle: 'Multi-stop trips', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Schedule Ride', subtitle: 'Book ahead', screenBg: 'linear-gradient(180deg, #111827 0%, #0a0a0a 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Ride Pass', subtitle: 'Unlimited rides', screenBg: 'linear-gradient(180deg, #1a1a2e 0%, #111827 100%)', textColor: '#ffffff', device: 'ipad' },
      { headline: 'Safety Center', subtitle: 'Share your trip', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #1f2937 100%)', textColor: '#ffffff', device: 'ipad' },
      // Mac (5)
      { headline: 'Fleet Manager', subtitle: 'Desktop control center', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Driver Dashboard', subtitle: 'Earnings & stats', screenBg: 'linear-gradient(180deg, #111827 0%, #1a1a2e 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Zone Heatmap', subtitle: 'Demand analytics', screenBg: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Dispatch View', subtitle: 'Real-time operations', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #1f2937 100%)', textColor: '#ffffff', device: 'mac' },
      { headline: 'Revenue Reports', subtitle: 'Daily & weekly', screenBg: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', textColor: '#ffffff', device: 'mac' },
      // Watch (5)
      { headline: 'Ride Status', subtitle: 'ETA on your wrist', screenBg: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)', textColor: '#f59e0b', device: 'watch' },
      { headline: 'Quick Book', subtitle: 'One tap ride', screenBg: 'linear-gradient(180deg, #111827 0%, #0a0a0a 100%)', textColor: '#f59e0b', device: 'watch' },
      { headline: 'Driver Near', subtitle: 'Arriving in 2 min', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', textColor: '#f59e0b', device: 'watch' },
      { headline: 'Trip Complete', subtitle: 'Receipt & rating', screenBg: 'linear-gradient(180deg, #1a1a2e 0%, #111827 100%)', textColor: '#f59e0b', device: 'watch' },
      { headline: 'Saved Places', subtitle: 'Home & work', screenBg: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)', textColor: '#f59e0b', device: 'watch' },
    ],
  },
];
