import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useProjectStore } from '@/store/useProjectStore';
import { getExportSizesForPlatform } from '@/lib/exportSizes';
import { platformLabels } from '@/lib/devices';
import type { Platform } from '@/store/types';

const allPlatforms: Platform[] = ['iphone', 'ipad', 'mac', 'apple-watch'];

/**
 * Pre-render gradient text elements to canvas before html2canvas capture.
 * html2canvas doesn't support -webkit-background-clip: text, so gradient text
 * renders as a colored background block. This function replaces gradient text
 * with a canvas-rendered version that html2canvas can capture correctly.
 */
function prepareGradientTextsForExport(container: HTMLElement): () => void {
  const gradientEls = container.querySelectorAll<HTMLElement>('[data-gradient-export]');
  const restoreOps: Array<() => void> = [];

  for (const el of gradientEls) {
    const gradientData = JSON.parse(el.dataset.gradientExport!);
    const computed = window.getComputedStyle(el);
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    if (width === 0 || height === 0) continue;

    // Create high-res canvas
    const dpr = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.scale(dpr, dpr);

    // Compute gradient endpoints from CSS angle
    // CSS gradient angles: 0deg = bottom-to-top, 90deg = left-to-right
    const { angle, stops } = gradientData;
    const rad = ((angle - 90) * Math.PI) / 180;
    const diagLen = Math.sqrt(width * width + height * height);
    const cx = width / 2;
    const cy = height / 2;
    const x0 = cx - (Math.cos(rad) * diagLen) / 2;
    const y0 = cy - (Math.sin(rad) * diagLen) / 2;
    const x1 = cx + (Math.cos(rad) * diagLen) / 2;
    const y1 = cy + (Math.sin(rad) * diagLen) / 2;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const stop of stops) {
      gradient.addColorStop(stop.position / 100, stop.color);
    }

    // Get text properties from computed styles
    const fontFamily = computed.fontFamily;
    const fontSize = parseFloat(computed.fontSize);
    const fontWeight = computed.fontWeight;
    const rawLineHeight = parseFloat(computed.lineHeight);
    const lineHeight = isNaN(rawLineHeight) ? fontSize * 1.2 : rawLineHeight;
    const textAlign = computed.textAlign as CanvasTextAlign;

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = gradient;
    ctx.textAlign =
      textAlign === 'start' ? 'left' : textAlign === 'end' ? 'right' : (textAlign as CanvasTextAlign);
    ctx.textBaseline = 'top';

    // Get plain text content (strip HTML tags)
    const plainText = el.textContent || '';

    // Word wrap
    const lines: string[] = [];
    // Handle explicit newlines from white-space: pre-wrap
    const paragraphs = plainText.split('\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }
      const words = paragraph.split(/\s+/).filter(Boolean);
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > width && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    // Draw lines
    const alignedTextAlign = ctx.textAlign;
    const xPos =
      alignedTextAlign === 'center' ? width / 2 : alignedTextAlign === 'right' ? width : 0;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], xPos, i * lineHeight);
    }

    // Save original state and replace content with canvas
    const origStyle = el.getAttribute('style') || '';
    const origHTML = el.innerHTML;

    el.innerHTML = '';
    el.style.background = 'none';
    el.style.webkitBackgroundClip = 'unset';
    el.style.webkitTextFillColor = 'unset';
    el.style.backgroundClip = 'unset';
    el.appendChild(canvas);

    restoreOps.push(() => {
      el.innerHTML = origHTML;
      el.setAttribute('style', origStyle);
    });
  }

  return () => restoreOps.forEach((fn) => fn());
}

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

    // Pre-render gradient text to canvas (html2canvas doesn't support background-clip: text)
    const restoreGradientTexts = prepareGradientTextsForExport(element);

    const canvas = await html2canvas(element, {
      scale: 1,
      width: element.offsetWidth,
      height: element.offsetHeight,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    // Restore original gradient text DOM
    restoreGradientTexts();

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
