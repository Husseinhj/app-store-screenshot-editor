import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import type {
  AppView,
  BackgroundConfig,
  BaseElement,
  CanvasElement,
  CanvasView,
  CustomFrame,
  DeviceFrameElement,
  DeviceType,
  ElementTransform,
  ImageElement,
  Platform,
  Project,
  ProjectMeta,
  Screenshot,
  ScreenshotsByPlatform,
  ShapeElement,
  ShapeType,
  TextElement,
  UserGuide,
} from './types';
import { devices, devicesByPlatform, getOrientedFrameDimensions } from '@/lib/devices';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { textStylePresets } from '@/lib/textStylePresets';
import { guidelinePresets } from '@/lib/guidelinePresets';
import {
  createDefaultDeviceFrameElement,
  createDefaultImageElement,
  createDefaultShapeElement,
  createDefaultTextElement,
  createEmojiTextElement,
} from '@/lib/elements';
import { designTemplates, getElementTransformForPlatform } from '@/lib/templates';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

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

function createScreenshot(platform: Platform): Screenshot {
  const device = devicesByPlatform[platform][0];
  const textEl = createDefaultTextElement(platform);
  const deviceEl = createDefaultDeviceFrameElement(device, platform, [textEl]);
  return {
    id: nanoid(),
    name: '',
    notes: '',
    elements: [textEl, deviceEl],
    background: {
      ...defaultBackground,
      gradient: {
        ...defaultBackground.gradient,
        stops: defaultBackground.gradient.stops.map((s) => ({ ...s })),
      },
    },
    order: 0,
  };
}

function createInitialScreenshots(): ScreenshotsByPlatform {
  const result = {} as ScreenshotsByPlatform;
  for (const p of allPlatforms) {
    result[p] = [createScreenshot(p)];
  }
  return result;
}

function getPlatformScreenshots(project: Project): Screenshot[] {
  return project.screenshotsByPlatform[project.platform] ?? [];
}

function findScreenshotWithElement(project: Project, elementId: string): Screenshot | undefined {
  for (const platform of allPlatforms) {
    const screenshots = project.screenshotsByPlatform[platform] ?? [];
    const found = screenshots.find((s) => s.elements.some((e) => e.id === elementId));
    if (found) return found;
  }
  return undefined;
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface ProjectStore {
  // Multi-project
  appView: AppView;
  projectList: ProjectMeta[];
  activeProjectId: string | null;

  project: Project;
  exportSizeIndex: number;
  canvasView: CanvasView;
  zoom: number;
  selectedElementIds: string[];
  editingTextElementId: string | null;

  // Multi-project actions
  createProject: (name: string, platform: Platform) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;

  // Panel state
  leftPanelWidth: number;
  rightPanelWidth: number;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;

  // Custom frames
  customFrames: CustomFrame[];
  addCustomFrame: (frame: CustomFrame) => void;
  removeCustomFrame: (id: string) => void;
  updateCustomFrame: (id: string, updates: Partial<CustomFrame>) => void;

  // Project actions
  setProjectName: (name: string) => void;
  setPlatform: (platform: Platform) => void;

  // Screenshot CRUD
  addScreenshot: () => void;
  removeScreenshot: (id: string) => void;
  selectScreenshot: (id: string) => void;
  duplicateScreenshot: (id: string) => void;
  reorderScreenshots: (fromIndex: number, toIndex: number) => void;
  updateScreenshot: (id: string, updates: { name?: string; notes?: string }) => void;

  // Background (on screenshot level)
  updateBackground: (updates: Partial<BackgroundConfig>) => void;

  // Element CRUD
  addElement: (element: CanvasElement) => void;
  removeElement: (elementId: string) => void;
  updateElementTransform: (elementId: string, transform: Partial<ElementTransform>) => void;
  selectElement: (elementId: string | null) => void;
  toggleSelectElement: (elementId: string) => void;
  selectElements: (elementIds: string[]) => void;
  selectAllElements: () => void;
  bringForward: (elementId: string) => void;
  sendBackward: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;

  // Type-specific element updates
  updateTextElement: (elementId: string, updates: Partial<Omit<TextElement, keyof BaseElement>>) => void;
  updateDeviceElement: (elementId: string, updates: Partial<Omit<DeviceFrameElement, keyof BaseElement>>) => void;
  updateImageElement: (elementId: string, updates: Partial<Omit<ImageElement, keyof BaseElement>>) => void;
  updateShapeElement: (elementId: string, updates: Partial<Omit<ShapeElement, keyof BaseElement>>) => void;
  updateBaseElement: (elementId: string, updates: Partial<Pick<BaseElement, 'flipX' | 'flipY' | 'locked' | 'visible'>>) => void;

  // Quick-add helpers (adds to current selected screenshot)
  addTextElement: (content?: string) => void;
  addImageElement: (imageUrl: string, position?: { x: number; y: number }) => void;
  addDeviceFrameElement: () => void;
  addShapeElement: (shapeType: ShapeType) => void;
  addEmojiElement: (emoji: string) => void;

  // Inline editing
  setEditingTextElement: (elementId: string | null) => void;

  // View & zoom
  setExportSizeIndex: (index: number) => void;
  setCanvasView: (view: CanvasView) => void;
  setZoom: (zoom: number) => void;

  // Layer reorder
  reorderElementZIndices: (orderedIds: string[]) => void;

  // Clipboard (copy/paste)
  clipboard: CanvasElement[] | null;
  copySelectedElements: () => void;
  pasteElements: () => void;

  // Snap guides (transient, not persisted)
  snapGuides: { type: 'horizontal' | 'vertical'; position: number }[];
  setSnapGuides: (guides: { type: 'horizontal' | 'vertical'; position: number }[]) => void;

  // User-created guide lines (persisted)
  userGuides: UserGuide[];
  addUserGuide: (guide: UserGuide) => void;
  updateUserGuide: (id: string, position: number) => void;
  removeUserGuide: (id: string) => void;

  // Preset actions
  applyTextStylePreset: (elementId: string, presetId: string) => void;
  applyGuidelinePreset: (presetId: string) => void;
  clearAllUserGuides: () => void;
  activeGuidelinePresetId: string | null;

  // Template actions
  applyTemplate: (templateId: string) => void;

  // Getters
  getSelectedScreenshot: () => Screenshot | null;
  getCurrentScreenshots: () => Screenshot[];
  getSelectedElement: () => CanvasElement | null;
  getSelectedElements: () => CanvasElement[];
}

// ─── Store ───────────────────────────────────────────────────────────────────

const initialScreenshots = createInitialScreenshots();
const initialProjectId = nanoid();

// Helper: save/load per-project data in localStorage
function saveProjectData(projectId: string, project: Project) {
  try {
    localStorage.setItem(`project-${projectId}`, JSON.stringify(project));
  } catch { /* quota exceeded — ignore */ }
}
function loadProjectData(projectId: string): Project | null {
  try {
    const raw = localStorage.getItem(`project-${projectId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function deleteProjectData(projectId: string) {
  localStorage.removeItem(`project-${projectId}`);
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    temporal(
    (set, get) => ({
      // Multi-project
      appView: 'editor' as AppView,
      projectList: [{
        id: initialProjectId,
        name: 'My App Screenshots',
        platform: 'iphone' as Platform,
        lastEditedAt: Date.now(),
        thumbnailDataUrl: null,
      }],
      activeProjectId: initialProjectId,

      project: {
        id: initialProjectId,
        name: 'My App Screenshots',
        platform: 'iphone' as Platform,
        screenshotsByPlatform: initialScreenshots,
        selectedScreenshotId: initialScreenshots['iphone'][0].id,
      },
      exportSizeIndex: 0,
      canvasView: 'single' as CanvasView,
      zoom: 100,
      selectedElementIds: [],
      editingTextElementId: null,

      // ─── Multi-project actions ──────────────────────────────────────────

      createProject: (name, platform) => {
        const state = get();
        // Save current project before switching
        if (state.activeProjectId) {
          saveProjectData(state.activeProjectId, state.project);
          // Update meta
          set(produce((s: ProjectStore) => {
            const meta = s.projectList.find((p) => p.id === s.activeProjectId);
            if (meta) { meta.name = s.project.name; meta.lastEditedAt = Date.now(); }
          }));
        }

        const newId = nanoid();
        const screenshots = createInitialScreenshots();
        const newProject: Project = {
          id: newId,
          name,
          platform,
          screenshotsByPlatform: screenshots,
          selectedScreenshotId: screenshots[platform][0].id,
        };
        const meta: ProjectMeta = {
          id: newId,
          name,
          platform,
          lastEditedAt: Date.now(),
          thumbnailDataUrl: null,
        };
        saveProjectData(newId, newProject);
        set(produce((s: ProjectStore) => {
          s.projectList.push(meta);
          s.activeProjectId = newId;
          s.project = newProject;
          s.appView = 'editor';
          s.exportSizeIndex = 0;
          s.canvasView = 'single';
          s.zoom = 100;
          s.selectedElementIds = [];
          s.editingTextElementId = null;
        }));
      },

      openProject: (id) => {
        const state = get();
        if (state.activeProjectId === id) {
          set({ appView: 'editor' });
          return;
        }
        // Save current project
        if (state.activeProjectId) {
          saveProjectData(state.activeProjectId, state.project);
          set(produce((s: ProjectStore) => {
            const meta = s.projectList.find((p) => p.id === s.activeProjectId);
            if (meta) { meta.name = s.project.name; meta.lastEditedAt = Date.now(); }
          }));
        }
        // Load target project
        const loaded = loadProjectData(id);
        if (!loaded) return;
        set(produce((s: ProjectStore) => {
          s.activeProjectId = id;
          s.project = loaded;
          s.appView = 'editor';
          s.exportSizeIndex = 0;
          s.canvasView = 'single';
          s.zoom = 100;
          s.selectedElementIds = [];
          s.editingTextElementId = null;
          // Update meta last edited
          const meta = s.projectList.find((p) => p.id === id);
          if (meta) meta.lastEditedAt = Date.now();
        }));
      },

      closeProject: () => {
        const state = get();
        if (state.activeProjectId) {
          saveProjectData(state.activeProjectId, state.project);
          set(produce((s: ProjectStore) => {
            const meta = s.projectList.find((p) => p.id === s.activeProjectId);
            if (meta) { meta.name = s.project.name; meta.lastEditedAt = Date.now(); }
          }));
        }
        set({ appView: 'home' });
      },

      deleteProject: (id) =>
        set(produce((state: ProjectStore) => {
          state.projectList = state.projectList.filter((p) => p.id !== id);
          deleteProjectData(id);
          if (state.activeProjectId === id) {
            state.activeProjectId = null;
            state.appView = 'home';
          }
        })),

      duplicateProject: (id) => {
        const source = loadProjectData(id);
        if (!source) return;
        const state = get();
        const meta = state.projectList.find((p) => p.id === id);
        if (!meta) return;

        const newId = nanoid();
        const copy: Project = JSON.parse(JSON.stringify(source));
        copy.id = newId;
        copy.name = `${copy.name} (Copy)`;
        saveProjectData(newId, copy);

        set(produce((s: ProjectStore) => {
          s.projectList.push({
            id: newId,
            name: copy.name,
            platform: copy.platform,
            lastEditedAt: Date.now(),
            thumbnailDataUrl: meta.thumbnailDataUrl,
          });
        }));
      },

      // ─── Panel state ──────────────────────────────────────────────────
      leftPanelWidth: 260,
      rightPanelWidth: 280,
      leftPanelCollapsed: false,
      rightPanelCollapsed: false,
      setLeftPanelWidth: (width) => set({ leftPanelWidth: Math.max(200, Math.min(400, width)) }),
      setRightPanelWidth: (width) => set({ rightPanelWidth: Math.max(200, Math.min(400, width)) }),
      toggleLeftPanel: () => set((s) => ({ leftPanelCollapsed: !s.leftPanelCollapsed })),
      toggleRightPanel: () => set((s) => ({ rightPanelCollapsed: !s.rightPanelCollapsed })),

      // ─── Custom frames ─────────────────────────────────────────────────
      customFrames: [],

      addCustomFrame: (frame) =>
        set(produce((state: ProjectStore) => { state.customFrames.push(frame); })),

      removeCustomFrame: (id) =>
        set(produce((state: ProjectStore) => {
          state.customFrames = state.customFrames.filter((f) => f.id !== id);
        })),

      updateCustomFrame: (id, updates) =>
        set(produce((state: ProjectStore) => {
          const frame = state.customFrames.find((f) => f.id === id);
          if (frame) Object.assign(frame, updates);
        })),

      // ─── Project ────────────────────────────────────────────────────────

      setProjectName: (name) =>
        set(produce((state: ProjectStore) => { state.project.name = name; })),

      setPlatform: (platform) =>
        set(produce((state: ProjectStore) => {
          state.project.platform = platform;
          const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
          state.project.selectedScreenshotId = screenshots[0]?.id ?? null;
          state.exportSizeIndex = 0;
          state.selectedElementIds = [];
        })),

      // ─── Screenshot CRUD ────────────────────────────────────────────────

      addScreenshot: () =>
        set(produce((state: ProjectStore) => {
          const platform = state.project.platform;
          const screenshots = state.project.screenshotsByPlatform[platform];
          const newScreenshot = createScreenshot(platform);
          newScreenshot.order = screenshots.length;
          screenshots.push(newScreenshot);
          state.project.selectedScreenshotId = newScreenshot.id;
          state.selectedElementIds = [];
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
          state.selectedElementIds = [];
        })),

      selectScreenshot: (id) =>
        set(produce((state: ProjectStore) => {
          state.project.selectedScreenshotId = id;
          state.selectedElementIds = [];
        })),

      duplicateScreenshot: (id) =>
        set(produce((state: ProjectStore) => {
          const screenshots = state.project.screenshotsByPlatform[state.project.platform];
          const source = screenshots.find((s) => s.id === id);
          if (!source) return;
          const copy: Screenshot = JSON.parse(JSON.stringify(source));
          copy.id = nanoid();
          copy.order = screenshots.length;
          // Give all elements new IDs
          copy.elements.forEach((el) => { el.id = nanoid(); });
          screenshots.push(copy);
          state.project.selectedScreenshotId = copy.id;
          state.selectedElementIds = [];
        })),

      reorderScreenshots: (fromIndex, toIndex) =>
        set(produce((state: ProjectStore) => {
          const screenshots = state.project.screenshotsByPlatform[state.project.platform];
          const [moved] = screenshots.splice(fromIndex, 1);
          screenshots.splice(toIndex, 0, moved);
          screenshots.forEach((s, i) => { s.order = i; });
        })),

      updateScreenshot: (id, updates) =>
        set(produce((state: ProjectStore) => {
          for (const platform of allPlatforms) {
            const screenshots = state.project.screenshotsByPlatform[platform] ?? [];
            const s = screenshots.find((s) => s.id === id);
            if (s) {
              if (updates.name !== undefined) s.name = updates.name;
              if (updates.notes !== undefined) s.notes = updates.notes;
              return;
            }
          }
        })),

      // ─── Background ─────────────────────────────────────────────────────

      updateBackground: (updates) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) Object.assign(s.background, updates);
        })),

      // ─── Element CRUD ───────────────────────────────────────────────────

      addElement: (element) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (s) {
            s.elements.push(element);
            state.selectedElementIds = [element.id];
          }
        })),

      removeElement: (elementId) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const idx = s.elements.findIndex((e) => e.id === elementId);
          if (idx !== -1) s.elements.splice(idx, 1);
          state.selectedElementIds = state.selectedElementIds.filter((id) => id !== elementId);
        })),

      updateElementTransform: (elementId, transform) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (el) Object.assign(el.transform, transform);
        })),

      selectElement: (elementId) =>
        set({ selectedElementIds: elementId ? [elementId] : [] }),

      toggleSelectElement: (elementId) =>
        set((s) => ({
          selectedElementIds: s.selectedElementIds.includes(elementId)
            ? s.selectedElementIds.filter((id) => id !== elementId)
            : [...s.selectedElementIds, elementId],
        })),

      selectElements: (elementIds) =>
        set({ selectedElementIds: elementIds }),

      selectAllElements: () => {
        const state = get();
        const screenshot = getPlatformScreenshots(state.project).find(
          (s) => s.id === state.project.selectedScreenshotId
        );
        if (!screenshot) return;
        set({ selectedElementIds: screenshot.elements.map((e) => e.id) });
      },

      bringForward: (elementId) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (!el) return;
          const maxZ = Math.max(...s.elements.map((e) => e.zIndex));
          if (el.zIndex < maxZ) el.zIndex = maxZ + 1;
        })),

      sendBackward: (elementId) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (!el) return;
          const minZ = Math.min(...s.elements.map((e) => e.zIndex));
          if (el.zIndex > minZ) el.zIndex = minZ - 1;
        })),

      duplicateElement: (elementId) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (!el) return;
          const copy: CanvasElement = JSON.parse(JSON.stringify(el));
          copy.id = nanoid();
          copy.transform.x += 3;
          copy.transform.y += 3;
          copy.zIndex = Math.max(...s.elements.map((e) => e.zIndex)) + 1;
          s.elements.push(copy);
          state.selectedElementIds = [copy.id];
        })),

      // ─── Type-specific element updates ──────────────────────────────────

      updateTextElement: (elementId, updates) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (el && el.type === 'text') Object.assign(el, updates);
        })),

      updateDeviceElement: (elementId, updates) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (!el || el.type !== 'device-frame') return;

          // If orientation is changing, recalculate transform to match new aspect ratio
          if (updates.orientation && updates.orientation !== el.orientation) {
            const def = devices[el.device];
            if (def) {
              const newOriented = getOrientedFrameDimensions(def, updates.orientation);
              const newAspect = newOriented.frameWidth / newOriented.frameHeight;

              // Get canvas dimensions for percentage↔pixel math
              const exportSizes = getExportSizesForPlatform(state.project.platform);
              const exportSize = exportSizes[state.exportSizeIndex] ?? exportSizes[0];
              const canvasW = exportSize.width;
              const canvasH = exportSize.height;

              // Current visual dimensions in pixels
              const oldVisualW = (el.transform.width / 100) * canvasW;
              const oldVisualH = (el.transform.height / 100) * canvasH;
              const oldArea = oldVisualW * oldVisualH;

              // New dimensions preserving visual area
              const newVisualH = Math.sqrt(oldArea / newAspect);
              const newVisualW = newAspect * newVisualH;

              const newWidthPct = (newVisualW / canvasW) * 100;
              const newHeightPct = (newVisualH / canvasH) * 100;

              // Recenter both axes
              const centerX = el.transform.x + el.transform.width / 2;
              const centerY = el.transform.y + el.transform.height / 2;
              el.transform.width = newWidthPct;
              el.transform.height = newHeightPct;
              el.transform.x = centerX - newWidthPct / 2;
              el.transform.y = centerY - newHeightPct / 2;
            }
          }

          Object.assign(el, updates);
        })),

      updateImageElement: (elementId, updates) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (el && el.type === 'image') Object.assign(el, updates);
        })),

      updateShapeElement: (elementId, updates) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (el && el.type === 'shape') Object.assign(el, updates);
        })),

      updateBaseElement: (elementId, updates) =>
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (el) Object.assign(el, updates);
        })),

      // ─── Quick-add helpers ──────────────────────────────────────────────

      addTextElement: (content?: string) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (!s) return;
          const el = createDefaultTextElement(state.project.platform, s.elements);
          if (content) el.content = content;
          // Center new text elements
          el.transform = { x: 10, y: 40, width: 80, height: 20, rotation: 0 };
          s.elements.push(el);
          state.selectedElementIds = [el.id];
        })),

      addImageElement: (imageUrl, position) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (!s) return;
          const el = createDefaultImageElement(imageUrl, s.elements, position);
          s.elements.push(el);
          state.selectedElementIds = [el.id];
        })),

      addDeviceFrameElement: () =>
        set(produce((state: ProjectStore) => {
          const platform = state.project.platform;
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (!s) return;
          const device = devicesByPlatform[platform][0];
          const el = createDefaultDeviceFrameElement(device, platform, s.elements);
          s.elements.push(el);
          state.selectedElementIds = [el.id];
        })),

      addShapeElement: (shapeType) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (!s) return;
          const el = createDefaultShapeElement(shapeType, s.elements);
          s.elements.push(el);
          state.selectedElementIds = [el.id];
        })),

      addEmojiElement: (emoji) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
          if (!s) return;
          const el = createEmojiTextElement(emoji, state.project.platform, s.elements);
          s.elements.push(el);
          state.selectedElementIds = [el.id];
        })),

      // ─── Inline editing ─────────────────────────────────────────────────

      setEditingTextElement: (elementId) => set({ editingTextElementId: elementId }),

      // ─── View & zoom ───────────────────────────────────────────────────

      setExportSizeIndex: (index) => set({ exportSizeIndex: index }),
      setCanvasView: (view) => set({ canvasView: view }),
      setZoom: (zoom) => set({ zoom: Math.max(10, Math.min(400, zoom)) }),

      // ─── Layer reorder ────────────────────────────────────────────────

      reorderElementZIndices: (orderedIds) =>
        set(produce((state: ProjectStore) => {
          const s = getPlatformScreenshots(state.project).find(
            (s) => s.id === state.project.selectedScreenshotId
          );
          if (!s) return;
          orderedIds.forEach((id, i) => {
            const el = s.elements.find((e) => e.id === id);
            if (el) el.zIndex = i;
          });
        })),

      // ─── Clipboard (copy/paste) ───────────────────────────────────────

      clipboard: null,

      copySelectedElements: () => {
        const state = get();
        if (state.selectedElementIds.length === 0) return;
        const screenshot = getPlatformScreenshots(state.project).find(
          (s) => s.id === state.project.selectedScreenshotId
        );
        if (!screenshot) return;
        const selected = screenshot.elements.filter((e) =>
          state.selectedElementIds.includes(e.id)
        );
        const cloned: CanvasElement[] = JSON.parse(JSON.stringify(selected));
        set({ clipboard: cloned });
      },

      pasteElements: () =>
        set(produce((state: ProjectStore) => {
          if (!state.clipboard || state.clipboard.length === 0) return;
          const s = getPlatformScreenshots(state.project).find(
            (s) => s.id === state.project.selectedScreenshotId
          );
          if (!s) return;
          const maxZ = s.elements.length > 0 ? Math.max(...s.elements.map((e) => e.zIndex)) : 0;
          const newIds: string[] = [];
          state.clipboard.forEach((orig, i) => {
            const copy: CanvasElement = JSON.parse(JSON.stringify(orig));
            copy.id = nanoid();
            copy.transform.x += 3;
            copy.transform.y += 3;
            copy.zIndex = maxZ + 1 + i;
            s.elements.push(copy);
            newIds.push(copy.id);
          });
          state.selectedElementIds = newIds;
          // Update clipboard offsets for repeated paste
          state.clipboard.forEach((el) => {
            el.transform.x += 3;
            el.transform.y += 3;
          });
        })),

      // ─── Snap guides (transient) ──────────────────────────────────────

      snapGuides: [],
      setSnapGuides: (guides) => set({ snapGuides: guides }),

      // ─── User guides (persistent) ─────────────────────────────────────

      userGuides: [],
      addUserGuide: (guide) => set(produce((s: ProjectStore) => { s.userGuides.push(guide); })),
      updateUserGuide: (id, position) => set(produce((s: ProjectStore) => {
        const g = s.userGuides.find((g) => g.id === id);
        if (g) g.position = position;
      })),
      removeUserGuide: (id) => set(produce((s: ProjectStore) => {
        s.userGuides = s.userGuides.filter((g) => g.id !== id);
      })),

      // ─── Preset actions ────────────────────────────────────────────────

      activeGuidelinePresetId: null,

      applyTextStylePreset: (elementId, presetId) => {
        const preset = textStylePresets.find((p) => p.id === presetId);
        if (!preset) return;
        set(produce((state: ProjectStore) => {
          const s = findScreenshotWithElement(state.project, elementId);
          if (!s) return;
          const el = s.elements.find((e) => e.id === elementId);
          if (!el || el.type !== 'text') return;
          el.fontFamily = preset.fontFamily;
          el.fontWeight = preset.fontWeight;
          el.color = preset.color;
          el.lineHeight = preset.lineHeight;
          el.effects = preset.effects ? { ...preset.effects } : undefined;
          if (preset.letterSpacing !== undefined) {
            if (!el.effects) el.effects = {};
            el.effects.letterSpacing = preset.letterSpacing;
          }
        }));
      },

      applyGuidelinePreset: (presetId) => {
        const preset = guidelinePresets.find((p) => p.id === presetId);
        if (!preset) return;
        set(produce((state: ProjectStore) => {
          state.userGuides = preset.guides.map((g) => ({
            id: nanoid(),
            type: g.type,
            position: g.position,
            label: g.label,
          }));
          state.activeGuidelinePresetId = presetId;
        }));
      },

      clearAllUserGuides: () => set(produce((state: ProjectStore) => {
        state.userGuides = [];
        state.activeGuidelinePresetId = null;
      })),

      // ─── Template ────────────────────────────────────────────────────

      applyTemplate: (templateId) =>
        set(produce((state: ProjectStore) => {
          const template = designTemplates.find((t) => t.id === templateId);
          if (!template) return;
          const platform = state.project.platform;
          const s = getPlatformScreenshots(state.project).find(
            (s) => s.id === state.project.selectedScreenshotId
          );
          if (!s) return;

          // Collect existing screenshot URLs from device-frame elements
          const existingUrls = s.elements
            .filter((e): e is DeviceFrameElement => e.type === 'device-frame')
            .map((e) => e.screenshotImageUrl);

          // Choose default device for current platform
          const defaultDeviceMap: Record<Platform, DeviceType> = {
            iphone: 'iphone-17-pro-max',
            ipad: 'ipad-pro-13',
            mac: 'macbook-pro',
            'apple-watch': 'apple-watch-s11-46',
          };
          const defaultDevice = defaultDeviceMap[platform];

          // Font size scale by platform
          const fontScaleMap: Record<Platform, number> = {
            iphone: 1,
            ipad: 1.2,
            mac: 0.7,
            'apple-watch': 0.4,
          };
          const fontScale = fontScaleMap[platform];

          // Build new elements from template specs
          let deviceIndex = 0;
          const newElements: CanvasElement[] = template.elements.map((spec, specIndex) => {
            const base = {
              id: nanoid(),
              transform: getElementTransformForPlatform(template, specIndex, platform),
              zIndex: spec.zIndex,
              locked: false,
              visible: true,
              flipX: false,
              flipY: false,
            };

            if (spec.type === 'device-frame' && spec.device) {
              const el: DeviceFrameElement = {
                ...base,
                type: 'device-frame',
                device: defaultDevice,
                frameStyle: 'svg',
                frameColorVariant: 'default',
                showDeviceFrame: spec.device.showDeviceFrame,
                orientation: 'portrait',
                screenshotImageUrl: existingUrls[deviceIndex] ?? null,
                screenshotFit: 'contain',
                screenshotOffset: { x: 0, y: 0 },
                screenshotScale: 1,
              };
              deviceIndex++;
              return el;
            }

            if (spec.type === 'text' && spec.text) {
              const el: TextElement = {
                ...base,
                type: 'text',
                content: spec.text.content,
                fontFamily: spec.text.fontFamily,
                fontSize: Math.round(spec.text.fontSize * fontScale),
                fontWeight: spec.text.fontWeight,
                color: spec.text.color,
                alignment: spec.text.alignment,
                lineHeight: spec.text.lineHeight,
                effects: spec.text.effects ? { ...spec.text.effects } : undefined,
              };
              return el;
            }

            if (spec.type === 'shape' && spec.shape) {
              const el: ShapeElement = {
                ...base,
                type: 'shape',
                shapeType: spec.shape.shapeType,
                fillColor: spec.shape.fillColor,
                strokeColor: spec.shape.strokeColor,
                strokeWidth: spec.shape.strokeWidth,
                borderRadius: spec.shape.borderRadius,
                opacity: spec.shape.opacity ?? 1,
                blur: spec.shape.blur ?? 0,
              };
              return el;
            }

            // Fallback — should not happen with well-formed templates
            const el: TextElement = {
              ...base,
              type: 'text',
              content: '<p>Element</p>',
              fontFamily: 'Inter',
              fontSize: Math.round(48 * fontScale),
              fontWeight: 400,
              color: '#ffffff',
              alignment: 'center',
              lineHeight: 1.2,
            };
            return el;
          });

          // Apply template background and elements
          s.background = {
            type: template.background.type,
            solidColor: template.background.solidColor,
            gradient: {
              angle: template.background.gradient.angle,
              stops: template.background.gradient.stops.map((stop) => ({ ...stop })),
            },
            imageUrl: template.background.imageUrl,
          };
          s.elements = newElements;
          state.selectedElementIds = [];
        })),

      // ─── Getters ───────────────────────────────────────────────────────

      getSelectedScreenshot: () => {
        const state = get();
        return getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId) ?? null;
      },

      getCurrentScreenshots: () => {
        const state = get();
        return getPlatformScreenshots(state.project);
      },

      getSelectedElement: () => {
        const state = get();
        const { selectedElementIds } = state;
        if (selectedElementIds.length === 0) return null;
        const screenshot = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
        return screenshot?.elements.find((e) => e.id === selectedElementIds[0]) ?? null;
      },

      getSelectedElements: () => {
        const state = get();
        const { selectedElementIds } = state;
        if (selectedElementIds.length === 0) return [];
        const screenshot = getPlatformScreenshots(state.project).find((s) => s.id === state.project.selectedScreenshotId);
        if (!screenshot) return [];
        return screenshot.elements.filter((e) => selectedElementIds.includes(e.id));
      },
    }),
    {
      partialize: (state) => ({ project: state.project }),
      limit: 100,
      equality: (pastState, currentState) =>
        JSON.stringify(pastState) === JSON.stringify(currentState),
      handleSet: (handleSet) => {
        let timeout: ReturnType<typeof setTimeout>;
        return (state) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => handleSet(state), 300);
        };
      },
    }
    ),
    {
      name: 'app-store-screenshot-editor',
      version: 8,
      migrate: (persisted: any, version: number) => {
        if (version < 2) {
          // Migrate from v1 (flat Screenshot fields) to v2 (elements array)
          const state = persisted as any;
          if (state?.project?.screenshotsByPlatform) {
            for (const platform of Object.keys(state.project.screenshotsByPlatform)) {
              const screenshots = state.project.screenshotsByPlatform[platform];
              if (!Array.isArray(screenshots)) continue;
              for (const screenshot of screenshots) {
                if (screenshot.elements) continue; // already migrated

                const textEl: any = {
                  id: nanoid(),
                  type: 'text',
                  transform: { x: 6, y: 2, width: 88, height: 26 },
                  zIndex: 1,
                  locked: false,
                  visible: true,
                  content: screenshot.text?.content ?? 'Your headline here',
                  fontFamily: screenshot.text?.fontFamily ?? 'Inter',
                  fontSize: screenshot.text?.fontSize ?? 64,
                  fontWeight: screenshot.text?.fontWeight ?? 700,
                  color: screenshot.text?.color ?? '#ffffff',
                  alignment: screenshot.text?.alignment ?? 'center',
                  lineHeight: screenshot.text?.lineHeight ?? 1.2,
                };

                const deviceEl: any = {
                  id: nanoid(),
                  type: 'device-frame',
                  transform: { x: 15, y: 30, width: 70, height: 68 },
                  zIndex: 2,
                  locked: false,
                  visible: true,
                  device: screenshot.device ?? 'iphone-17-pro-max',
                  frameStyle: screenshot.frameStyle ?? 'svg',
                  frameColorVariant: screenshot.frameColorVariant ?? 'default',
                  showDeviceFrame: screenshot.showDeviceFrame ?? true,
                  orientation: screenshot.orientation ?? 'portrait',
                  screenshotImageUrl: screenshot.screenshotImageUrl ?? null,
                };

                screenshot.elements = [textEl, deviceEl];

                // Clean up old fields
                delete screenshot.text;
                delete screenshot.device;
                delete screenshot.frameStyle;
                delete screenshot.frameColorVariant;
                delete screenshot.showDeviceFrame;
                delete screenshot.orientation;
                delete screenshot.screenshotImageUrl;
              }
            }
          }
        }
        if (version < 3) {
          // Migrate from v2 to v3: add rotation, flipX, flipY
          const state = persisted as any;
          if (state?.project?.screenshotsByPlatform) {
            for (const platform of Object.keys(state.project.screenshotsByPlatform)) {
              const screenshots = state.project.screenshotsByPlatform[platform];
              if (!Array.isArray(screenshots)) continue;
              for (const screenshot of screenshots) {
                if (!screenshot.elements) continue;
                for (const el of screenshot.elements) {
                  if (el.transform && el.transform.rotation === undefined) {
                    el.transform.rotation = 0;
                  }
                  if (el.flipX === undefined) el.flipX = false;
                  if (el.flipY === undefined) el.flipY = false;
                }
              }
            }
          }
        }
        if (version < 4) {
          // Migrate from v3 to v4: add borderRadius to shapes, name/notes to screenshots
          const state = persisted as any;
          if (state?.project?.screenshotsByPlatform) {
            for (const platform of Object.keys(state.project.screenshotsByPlatform)) {
              const screenshots = state.project.screenshotsByPlatform[platform];
              if (!Array.isArray(screenshots)) continue;
              for (const screenshot of screenshots) {
                if (screenshot.name === undefined) screenshot.name = '';
                if (screenshot.notes === undefined) screenshot.notes = '';
                if (!screenshot.elements) continue;
                for (const el of screenshot.elements) {
                  if (el.type === 'shape' && el.borderRadius === undefined) {
                    el.borderRadius = 0;
                  }
                }
              }
            }
          }
        }
        if (version < 5) {
          // Migrate from v4 to v5: wrap plain text content in <p> tags for rich text
          const state = persisted as any;
          if (state?.project?.screenshotsByPlatform) {
            for (const platform of Object.keys(state.project.screenshotsByPlatform)) {
              const screenshots = state.project.screenshotsByPlatform[platform];
              if (!Array.isArray(screenshots)) continue;
              for (const screenshot of screenshots) {
                if (!screenshot.elements) continue;
                for (const el of screenshot.elements) {
                  if (el.type === 'text' && el.content && !el.content.startsWith('<')) {
                    // Wrap plain text lines in <p> tags
                    el.content = el.content
                      .split('\n')
                      .map((line: string) => `<p>${line || '<br>'}</p>`)
                      .join('');
                  }
                }
              }
            }
          }
          // Migrate selectedElementId to selectedElementIds
          if (state?.selectedElementId !== undefined) {
            delete state.selectedElementId;
          }
        }
        if (version < 6) {
          // Migrate from v5 to v6: wrap existing project into projectList + per-project storage
          const state = persisted as any;
          if (state?.project && !state.projectList) {
            const projectId = state.project.id || nanoid();
            state.project.id = projectId;
            state.projectList = [{
              id: projectId,
              name: state.project.name || 'My App Screenshots',
              platform: state.project.platform || 'iphone',
              lastEditedAt: Date.now(),
              thumbnailDataUrl: null,
            }];
            state.activeProjectId = projectId;
            state.appView = 'editor';
            // Save per-project data
            try {
              localStorage.setItem(`project-${projectId}`, JSON.stringify(state.project));
            } catch {}
          }
        }
        if (version < 7) {
          // Migrate from v6 to v7: add screenshotFit, screenshotOffset, screenshotScale to device-frame elements
          const state = persisted as any;
          if (state?.project?.screenshotsByPlatform) {
            for (const platform of Object.keys(state.project.screenshotsByPlatform)) {
              const screenshots = state.project.screenshotsByPlatform[platform];
              if (!Array.isArray(screenshots)) continue;
              for (const screenshot of screenshots) {
                if (!screenshot.elements) continue;
                for (const el of screenshot.elements) {
                  if (el.type === 'device-frame') {
                    if (el.screenshotFit === undefined) el.screenshotFit = 'contain';
                    if (el.screenshotOffset === undefined) el.screenshotOffset = { x: 0, y: 0 };
                    if (el.screenshotScale === undefined) el.screenshotScale = 1;
                  }
                }
              }
            }
          }
        }
        if (version < 8) {
          // Migrate from v7 to v8: add effects to text elements (no data needed, just version bump)
          // TextEffects are optional, so no migration of existing data required
        }
        return persisted;
      },
      partialize: (state) => ({
        project: state.project,
        exportSizeIndex: state.exportSizeIndex,
        canvasView: state.canvasView,
        zoom: state.zoom,
        leftPanelWidth: state.leftPanelWidth,
        rightPanelWidth: state.rightPanelWidth,
        leftPanelCollapsed: state.leftPanelCollapsed,
        rightPanelCollapsed: state.rightPanelCollapsed,
        customFrames: state.customFrames,
        appView: state.appView,
        projectList: state.projectList,
        activeProjectId: state.activeProjectId,
        userGuides: state.userGuides,
        activeGuidelinePresetId: state.activeGuidelinePresetId,
        // Note: clipboard, snapGuides, selectedElementIds, editingTextElementId are NOT persisted
      }),
    }
  )
);

// Auto-save active project to localStorage on changes (debounced)
let autoSaveTimeout: ReturnType<typeof setTimeout>;
useProjectStore.subscribe((state, prevState) => {
  if (state.project !== prevState.project && state.activeProjectId) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      saveProjectData(state.activeProjectId!, state.project);
      // Also update meta
      useProjectStore.setState(produce((s: ProjectStore) => {
        const meta = s.projectList.find((p) => p.id === s.activeProjectId);
        if (meta) {
          meta.name = s.project.name;
          meta.lastEditedAt = Date.now();
        }
      }));
    }, 500);
  }
});
