import { devices, getFrameColors, getSvgPathForVariant, type DeviceDefinition, type FrameColorVariant } from '@/lib/devices';
import type { DeviceType, FrameStyle } from '@/store/types';
import { ImagePlus } from 'lucide-react';

interface Props {
  device: DeviceType;
  screenshotUrl: string | null;
  maxHeight: number;
  frameStyle?: FrameStyle;
  frameColorVariant?: string;
  showFrame?: boolean;
}

export function DeviceFrame({
  device,
  screenshotUrl,
  maxHeight,
  frameStyle = 'svg',
  frameColorVariant = 'default',
  showFrame = true,
}: Props) {
  const def = devices[device];
  const colors = getFrameColors(def, frameColorVariant);

  if (!showFrame) {
    return <FramelessView def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} />;
  }

  // SVG mockup mode — use real device SVG images
  const svgPath = getSvgPathForVariant(def, frameColorVariant);
  if (frameStyle === 'svg' && svgPath && def.svgScreenRect) {
    return <SvgFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} svgPathOverride={svgPath} />;
  }

  // CSS mode fallback
  if (def.platform === 'mac') {
    return <MacFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} />;
  }
  if (def.platform === 'apple-watch') {
    return <WatchFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} />;
  }
  if (def.platform === 'ipad') {
    return <TabletFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} />;
  }
  return <PhoneFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} />;
}

/* ══════════════════════════════════════════════════════════════════════════════
   SVG Mockup Frame — renders the real device SVG with screenshot overlaid
   ══════════════════════════════════════════════════════════════════════════════ */
function SvgFrame({
  def,
  screenshotUrl,
  maxHeight,
  svgPathOverride,
}: {
  def: DeviceDefinition;
  screenshotUrl: string | null;
  maxHeight: number;
  svgPathOverride?: string;
}) {
  const frameSvgPath = svgPathOverride ?? def.svgPath!;
  const vb = def.svgViewBox;
  const sr = def.svgScreenRect!;

  // Scale to fit maxHeight
  const scale = maxHeight / vb.height;
  const renderW = vb.width * scale;
  const renderH = vb.height * scale;

  // Screen area in rendered pixels
  const screenX = sr.x * scale;
  const screenY = sr.y * scale;
  const screenW = sr.width * scale;
  const screenH = sr.height * scale;
  const screenR = sr.borderRadius * scale;

  return (
    <div className="relative" style={{ width: renderW, height: renderH }}>
      {/* Screenshot placed BEHIND the SVG frame, clipped to screen area */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: screenX,
          top: screenY,
          width: screenW,
          height: screenH,
          borderRadius: screenR,
        }}
      >
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt="Screenshot"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black">
            <div className="text-center text-white/20">
              <ImagePlus size={Math.max(14, screenW * 0.06)} className="mx-auto mb-1" />
              <p style={{ fontSize: Math.max(8, screenW * 0.025) }}>Drop screenshot</p>
            </div>
          </div>
        )}
      </div>

      {/* SVG device frame on top — the transparent screen area lets screenshot show through */}
      <img
        key={frameSvgPath}
        src={frameSvgPath}
        alt={def.label}
        className="absolute inset-0 w-full h-full pointer-events-none"
        draggable={false}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CSS Frames (fallback when SVG not available or user selects CSS mode)
   ══════════════════════════════════════════════════════════════════════════════ */

function PhoneFrame({
  def, screenshotUrl, maxHeight, colors,
}: {
  def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant;
}) {
  const aspectRatio = def.frameWidth / def.frameHeight;
  const frameHeight = maxHeight;
  const frameWidth = frameHeight * aspectRatio;
  const scale = frameWidth / def.frameWidth;

  const bodyR = def.frameBorderRadius * scale;
  const screenR = def.screenBorderRadius * scale;
  const bezelT = frameHeight * def.screenInset.top / 100;
  const bezelL = frameWidth * def.screenInset.left / 100;
  const bezelR = frameWidth * def.screenInset.right / 100;
  const bezelB = frameHeight * def.screenInset.bottom / 100;
  const screenW = frameWidth - bezelL - bezelR;
  const diWidth = screenW * 0.32;
  const diHeight = diWidth * 0.27;

  return (
    <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
      <div className="absolute inset-0" style={{
        borderRadius: bodyR,
        backgroundColor: colors.frameColor,
        boxShadow: `inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 0 0.5px ${colors.borderColor}, 0 2px 8px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.4)`,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: bodyR, border: '0.5px solid rgba(255,255,255,0.1)' }} />
      {/* Buttons */}
      <div style={{ position: 'absolute', right: -2.5, top: '20%', width: 3, height: frameHeight * 0.07, borderRadius: '0 2px 2px 0', backgroundColor: colors.buttonColor }} />
      <div style={{ position: 'absolute', left: -2.5, top: '16%', width: 3, height: frameHeight * 0.032, borderRadius: '2px 0 0 2px', backgroundColor: colors.buttonColor }} />
      <div style={{ position: 'absolute', left: -2.5, top: '22%', width: 3, height: frameHeight * 0.05, borderRadius: '2px 0 0 2px', backgroundColor: colors.buttonColor }} />
      <div style={{ position: 'absolute', left: -2.5, top: '28.5%', width: 3, height: frameHeight * 0.05, borderRadius: '2px 0 0 2px', backgroundColor: colors.buttonColor }} />
      <div className="absolute overflow-hidden" style={{ top: bezelT, left: bezelL, right: bezelR, bottom: bezelB, borderRadius: screenR, backgroundColor: '#000' }}>
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Screenshot" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-white/20">
              <ImagePlus size={Math.max(16, frameWidth * 0.07)} className="mx-auto mb-2" />
              <p style={{ fontSize: Math.max(9, frameWidth * 0.026) }}>Drop screenshot</p>
            </div>
          </div>
        )}
        {def.hasDynamicIsland && (
          <div className="absolute" style={{ top: diHeight * 0.55, left: '50%', transform: 'translateX(-50%)', width: diWidth, height: diHeight, borderRadius: diHeight, backgroundColor: '#000' }} />
        )}
        <div className="absolute" style={{ bottom: Math.max(4, 6 * scale), left: '50%', transform: 'translateX(-50%)', width: screenW * 0.36, height: Math.max(3, 4 * scale), borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.25)' }} />
      </div>
    </div>
  );
}

function TabletFrame({
  def, screenshotUrl, maxHeight, colors,
}: {
  def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant;
}) {
  const aspectRatio = def.frameWidth / def.frameHeight;
  const frameHeight = maxHeight;
  const frameWidth = frameHeight * aspectRatio;
  const scale = frameWidth / def.frameWidth;
  const bodyR = def.frameBorderRadius * scale;
  const screenR = def.screenBorderRadius * scale;
  const bezelT = frameHeight * def.screenInset.top / 100;
  const bezelL = frameWidth * def.screenInset.left / 100;
  const bezelR = frameWidth * def.screenInset.right / 100;
  const bezelB = frameHeight * def.screenInset.bottom / 100;

  return (
    <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
      <div className="absolute inset-0" style={{ borderRadius: bodyR, backgroundColor: colors.frameColor, boxShadow: `inset 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 0 0.5px ${colors.borderColor}, 0 20px 60px rgba(0,0,0,0.5)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: bodyR, border: '0.5px solid rgba(255,255,255,0.06)' }} />
      <div className="absolute rounded-full" style={{ top: bezelT * 0.4, left: '50%', transform: 'translateX(-50%)', width: Math.max(4, 6 * scale), height: Math.max(4, 6 * scale), backgroundColor: '#111', border: '0.5px solid #333' }} />
      <div className="absolute overflow-hidden" style={{ top: bezelT, left: bezelL, right: bezelR, bottom: bezelB, borderRadius: screenR, backgroundColor: '#000' }}>
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Screenshot" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-white/20">
              <ImagePlus size={Math.max(16, frameWidth * 0.04)} className="mx-auto mb-2" />
              <p style={{ fontSize: Math.max(10, frameWidth * 0.018) }}>Drop screenshot</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FramelessView({ def, screenshotUrl, maxHeight }: { def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number }) {
  const aspectRatio = def.nativeScreenWidth / def.nativeScreenHeight;
  let imgHeight = maxHeight * 0.92;
  let imgWidth = imgHeight * aspectRatio;
  if (aspectRatio > 1) { imgWidth = maxHeight * 1.2; imgHeight = imgWidth / aspectRatio; }
  const borderRadius = Math.min(imgWidth, imgHeight) * 0.06;

  return (
    <div className="relative overflow-hidden" style={{ width: imgWidth, height: imgHeight, borderRadius, boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' }}>
      {screenshotUrl ? (
        <img src={screenshotUrl} alt="Screenshot" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black/80">
          <div className="text-center text-white/30">
            <ImagePlus size={Math.max(16, imgWidth * 0.06)} className="mx-auto mb-2" />
            <p style={{ fontSize: Math.max(10, imgWidth * 0.025) }}>Drop screenshot</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MacFrame({ def, screenshotUrl, maxHeight, colors }: { def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant }) {
  const aspectRatio = def.frameWidth / def.frameHeight;
  const frameHeight = maxHeight;
  const frameWidth = frameHeight * aspectRatio;

  return (
    <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
      <div className="absolute rounded-t-xl" style={{ top: 0, left: frameWidth * 0.04, right: frameWidth * 0.04, bottom: frameHeight * 0.08, backgroundColor: colors.frameColor, border: `2px solid ${colors.borderColor}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#111]" style={{ top: frameHeight * 0.01, width: 8, height: 8, border: '1px solid #444' }} />
        <div className="absolute overflow-hidden" style={{ top: `${def.screenInset.top * 0.9}%`, left: '3%', right: '3%', bottom: '3%', borderRadius: def.screenBorderRadius }}>
          {screenshotUrl ? (
            <img src={screenshotUrl} alt="Screenshot" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/80">
              <div className="text-center text-white/30"><ImagePlus size={24} className="mx-auto mb-2" /><p className="text-xs">Drop screenshot</p></div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute rounded-b-xl" style={{ bottom: 0, left: 0, right: 0, height: frameHeight * 0.08, background: `linear-gradient(to bottom, ${colors.frameColor}, ${colors.frameColor}dd)`, borderLeft: `2px solid ${colors.borderColor}`, borderRight: `2px solid ${colors.borderColor}`, borderBottom: `2px solid ${colors.borderColor}` }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-lg" style={{ width: frameWidth * 0.15, height: 4, backgroundColor: colors.borderColor }} />
      </div>
    </div>
  );
}

function WatchFrame({ def, screenshotUrl, maxHeight, colors }: { def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant }) {
  // Watch case is roughly square (not including band). Use ~0.82 aspect ratio for the case body.
  const caseAspect = 0.82;
  const frameHeight = maxHeight * 0.55;
  const frameWidth = frameHeight * caseAspect;
  const cornerRadius = frameWidth * 0.32;
  const bezel = frameWidth * 0.08;

  return (
    <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
      {/* Case body */}
      <div className="absolute inset-0" style={{
        backgroundColor: colors.frameColor,
        borderRadius: cornerRadius,
        border: `2.5px solid ${colors.borderColor}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
      }} />
      {/* Digital Crown */}
      <div style={{ position: 'absolute', right: -5, top: '30%', width: 5, height: frameHeight * 0.14, borderRadius: 3, backgroundColor: colors.buttonColor, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
      {/* Side button */}
      <div style={{ position: 'absolute', right: -3.5, top: '50%', width: 3.5, height: frameHeight * 0.07, borderRadius: 2, backgroundColor: colors.buttonColor }} />
      {/* Screen area */}
      <div className="absolute overflow-hidden" style={{
        top: bezel,
        left: bezel,
        right: bezel,
        bottom: bezel,
        borderRadius: cornerRadius - bezel * 0.6,
      }}>
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Screenshot" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/80">
            <div className="text-center text-white/30"><ImagePlus size={16} className="mx-auto mb-1" /><p style={{ fontSize: 8 }}>Drop</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
