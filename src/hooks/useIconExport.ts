import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useProjectStore } from '@/store/useProjectStore';
import { getIconSizesForPlatforms, generateContentsJson } from '@/lib/appIconSizes';

export function useIconExport() {
  const [exporting, setExporting] = useState(false);

  const exportAppIcon = useCallback(async () => {
    setExporting(true);
    try {
      const { appIconProject } = useProjectStore.getState();
      const { selectedPlatforms } = appIconProject;

      // 1. Capture master 1024x1024
      const element = document.getElementById('icon-export-canvas');
      if (!element) return;

      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 100));

      const masterCanvas = await html2canvas(element, {
        scale: 1,
        width: 1024,
        height: 1024,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // 2. Create bitmap from master
      const masterBlob = await new Promise<Blob>((resolve) => {
        masterCanvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const masterBitmap = await createImageBitmap(masterBlob);

      // 3. Generate resized PNGs
      const sizes = getIconSizesForPlatforms(selectedPlatforms);
      const zip = new JSZip();
      const folder = zip.folder('AppIcon.appiconset')!;

      const blobCache = new Map<number, Blob>();

      for (const entry of sizes) {
        let blob = blobCache.get(entry.pixelSize);
        if (!blob) {
          const offscreen = new OffscreenCanvas(entry.pixelSize, entry.pixelSize);
          const ctx = offscreen.getContext('2d')!;
          ctx.drawImage(masterBitmap, 0, 0, entry.pixelSize, entry.pixelSize);
          blob = await offscreen.convertToBlob({ type: 'image/png' });
          blobCache.set(entry.pixelSize, blob);
        }
        folder.file(entry.filename, blob);
      }

      // 4. Add Contents.json
      const contentsJson = generateContentsJson(selectedPlatforms);
      folder.file('Contents.json', JSON.stringify(contentsJson, null, 2));

      // 5. Download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'AppIcon.appiconset.zip');
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportAppIcon };
}
