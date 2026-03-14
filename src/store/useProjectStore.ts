import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import type {
  BackgroundConfig,
  CanvasView,
  DeviceType,
  FrameStyle,
  Platform,
  Project,
  Screenshot,
  ScreenshotsByPlatform,
  TextConfig,
} from './types';
import { devicesByPlatform } from '@/lib/devices';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

const defaultTextByPlatform: Record<Platform, TextConfig> = {
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

const defaultBackground: BackgroundConfig = {
  type: 'gradient',
  solidColor: '#6366f1',
  gradient: {
    angle: 135,
    stops: [
      { color: '#6366f1', position: 0 },
      { color: '#a855f7', position: 100 },
    ],
  },
  imageUrl: null,
};

const createScreenshot = (device: DeviceType, order: number, platform: Platform = 'iphone'): Screenshot => ({
  id: nanoid(),
  screenshotImageUrl: null,
  device,
  frameStyle: 'svg' as FrameStyle,
  frameColorVariant: 'default',
  showDeviceFrame: true,
  text: { ...defaultTextByPlatform[platform] },
  background: {
    ...defaultBackground,
    gradient: {
      ...defaultBackground.gradient,
      stops: defaultBackground.gradient.stops.map((s) => ({ ...s })),
    },
  },
  order,
});

function createInitialScreenshots(): ScreenshotsByPlatform {
  const result = {} as ScreenshotsByPlatform;
  for (const p of allPlatforms) {
    const device = devicesByPlatform[p][0];
    result[p] = [createScreenshot(device, 0, p)];
  }
  return result;
}

function getPlatformScreenshots(project: Project): Screenshot[] {
  return project.screenshotsByPlatform[project.platform] ?? [];
}

interface ProjectStore {
  project: Project;
  exportSizeIndex: number;
  canvasView: CanvasView;
  zoom: number;

  setProjectName: (name: string) => void;
  setPlatform: (platform: Platform) => void;

  addScreenshot: () => void;
  removeScreenshot: (id: string) => void;
  selectScreenshot: (id: string) => void;
  duplicateScreenshot: (id: string) => void;
  reorderScreenshots: (fromIndex: number, toIndex: number) => void;

  updateText: (updates: Partial<TextConfig>) => void;
  updateBackground: (updates: Partial<BackgroundConfig>) => void;
  setScreenshotImage: (imageUrl: string) => void;
  setDevice: (device: DeviceType) => void;
  setFrameStyle: (style: FrameStyle) => void;
  setFrameColorVariant: (variant: string) => void;
  setShowDeviceFrame: (show: boolean) => void;

  setExportSizeIndex: (index: number) => void;
  setCanvasView: (view: CanvasView) => void;
  setZoom: (zoom: number) => void;

  getSelectedScreenshot: () => Screenshot | null;
  getCurrentScreenshots: () => Screenshot[];
}

const initialScreenshots = createInitialScreenshots();

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      project: {
        id: nanoid(),
        name: 'My App Screenshots',
        platform: 'iphone' as Platform,
        screenshotsByPlatform: initialScreenshots,
        selectedScreenshotId: initialScreenshots['iphone'][0].id,
      },
      exportSizeIndex: 0,
      canvasView: 'single' as CanvasView,
      zoom: 100,

      setProjectName: (name) =>
        set(produce((state: ProjectStore) => { state.project.name = name; })),

      setPlatform: (platform) =>
        set(produce((state: ProjectStore) => {
          state.project.platform = platform;
          const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
          state.project.selectedScreenshotId = screenshots[0]?.id ?? null;
          state.exportSizeIndex = 0;
        })),

      addScreenshot: () =>
        set(produce((state: ProjectStore) => {
          const platform = state.project.platform;
          const screenshots = state.project.screenshotsByPlatform[platform];
          const device = devicesByPlatform[platform][0];
          const newScreenshot = createScreenshot(device, screenshots.length, platform);
          screenshots.push(newScreenshot);
          state.project.selectedScreenshotId = newScreenshot.id;
        })),

      removeScreenshot: (id) =>
        set(produce((state: ProjectStore) => {
          const screenshots = state.project.screenshotsByPlatform[state.project.platform];
          const idx = screenshots.findIndex((s) => s.id === id);
          if (idx === -1) return;
          screenshots.splice(idx, 1);
          if (state.project.selectedScreenshotId === id) {
            state.project.selectedScreenshotId =
              screenshots[Math.min(idx, screenshots.length - 1)]?.id ?? null;
          }
          screenshots.forEach((s, i) => { s.order = i; });
        })),

      selectScreenshot: (id) =>
        set(produce((state: ProjectStore) => { state.project.selectedScreenshotId = id; })),

      duplicateScreenshot: (id) =>
        set(produce((state: ProjectStore) => {
          const screenshots = state.project.screenshotsByPlatform[state.project.platform];
          const source = screenshots.find((s) => s.id === id);
          if (!source) return;
          const copy: Screenshot = {
            ...JSON.parse(JSON.stringify(source)),
            id: nanoid(),
            order: screenshots.length,
          };
          screenshots.push(copy);
          state.project.selectedScreenshotId = copy.id;
        })),

      reorderScreenshots: (fromIndex, toIndex) =>
        set(produce((state: ProjectStore) => {
          const screenshots = state.project.screenshotsByPlatform[state.project.platform];
          const [moved] = screenshots.splice(fromIndex, 1);
          screenshots.splice(toIndex, 0, moved);
          screenshots.forEach((s, i) => { s.order = i; });
        })),

      updateText: (updates) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) Object.assign(s.text, updates);
        })),

      updateBackground: (updates) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) Object.assign(s.background, updates);
        })),

      setScreenshotImage: (imageUrl) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) s.screenshotImageUrl = imageUrl;
        })),

      setDevice: (device) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) { s.device = device; s.frameColorVariant = 'default'; }
        })),

      setFrameStyle: (style) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) s.frameStyle = style;
        })),

      setFrameColorVariant: (variant) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) s.frameColorVariant = variant;
        })),

      setShowDeviceFrame: (show) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) s.showDeviceFrame = show;
        })),

      setExportSizeIndex: (index) => set({ exportSizeIndex: index }),
      setCanvasView: (view) => set({ canvasView: view }),
      setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),

      getSelectedScreenshot: () => {
        const state = get();
        return getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId) ?? null;
      },
      getCurrentScreenshots: () => {
        const state = get();
        return getPlatformScreenshots(state.project);
      },
    }),
    {
      name: 'app-store-screenshot-editor',
      partialize: (state) => ({
        project: state.project,
        exportSizeIndex: state.exportSizeIndex,
        canvasView: state.canvasView,
        zoom: state.zoom,
      }),
    }
  )
);
