import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useProjectStore } from '@/store/useProjectStore';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { platformLabels } from '@/lib/devices';
import type { Platform } from '@/store/types';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const captureElement = useCallback(async (elementId: string): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Export element not found:', elementId);
      return null;
    }

    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 1,
      width: element.offsetWidth,
      height: element.offsetHeight,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, []);

  const exportCurrent = useCallback(async () => {
    const state = useProjectStore.getState();
    const { project, exportSizeIndex } = state;
    const selectedId = project.selectedScreenshotId;
    if (!selectedId) return;

    const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
    const sizes = getExportSizesForPlatform(project.platform);
    const size = sizes[exportSizeIndex] ?? sizes[0];
    const screenshot = screenshots.find((s) => s.id === selectedId);
    if (!screenshot) return;

    setExporting(true);
    try {
      const idx = screenshots.indexOf(screenshot) + 1;
      const filename = `${project.name}-screen-${idx}-${size.width}x${size.height}.png`;
      const blob = await captureElement(`export-${selectedId}`);
      if (blob) saveAs(blob, filename);
    } finally {
      setExporting(false);
    }
  }, [captureElement]);

  const exportAll = useCallback(async () => {
    const state = useProjectStore.getState();
    const { project, exportSizeIndex } = state;
    const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
    const sizes = getExportSizesForPlatform(project.platform);
    const size = sizes[exportSizeIndex] ?? sizes[0];

    setExporting(true);
    try {
      const zip = new JSZip();
      const platformName = platformLabels[project.platform];

      for (let i = 0; i < screenshots.length; i++) {
        const s = screenshots[i];
        const blob = await captureElement(`export-${s.id}`);
        if (blob) {
          zip.file(`${platformName}/screen-${i + 1}-${size.width}x${size.height}.png`, blob);
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${project.name}-screenshots.zip`);
    } finally {
      setExporting(false);
    }
  }, [captureElement]);

  const exportAllPlatforms = useCallback(async () => {
    const state = useProjectStore.getState();
    const { project } = state;

    setExporting(true);
    try {
      const zip = new JSZip();

      for (const platform of allPlatforms) {
        const screenshots = project.screenshotsByPlatform[platform] ?? [];
        const sizes = getExportSizesForPlatform(platform);
        const size = sizes[0];
        if (!size || screenshots.length === 0) continue;

        const platformName = platformLabels[platform];

        for (let i = 0; i < screenshots.length; i++) {
          const s = screenshots[i];
          const blob = await captureElement(`export-${platform}-${s.id}`);
          if (blob) {
            zip.file(`${platformName}/screen-${i + 1}-${size.width}x${size.height}.png`, blob);
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${project.name}-all-platforms.zip`);
    } finally {
      setExporting(false);
    }
  }, [captureElement]);

  return { exportCurrent, exportAll, exportAllPlatforms, exporting };
}
