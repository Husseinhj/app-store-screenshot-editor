import { devices, getFrameColors, getSvgPathForVariant, getOrientedFrameDimensions, type DeviceDefinition, type FrameColorVariant } from '@/lib/devices';
import type { DeviceType, FrameStyle, Orientation, CustomFrame, ScreenshotFit } from '@/store/types';
import { ImagePlus } from 'lucide-react';

interface Props {
  device: DeviceType;
  screenshotUrl: string | null;
  maxHeight: number;
  maxWidth?: number;
  frameStyle?: FrameStyle;
  frameColorVariant?: string;
  showFrame?: boolean;
  orientation?: Orientation;
  customFrame?: CustomFrame | null;
  screenshotFit?: ScreenshotFit;
  screenshotOffset?: { x: number; y: number };
  screenshotScale?: number;
}

/** Map ScreenshotFit to CSS objectFit value */
function getObjectFit(fit: ScreenshotFit): React.CSSProperties['objectFit'] {
  switch (fit) {
    case 'contain': return 'contain';
    case 'cover': return 'cover';
    case 'fill': return 'cover';
    case 'stretch': return 'fill';
    default: return 'contain';
  }
}

function getScreenshotImgStyle(
  fit: ScreenshotFit,
  offset: { x: number; y: number },
  scale: number,
): React.CSSProperties {
  const objectFit = getObjectFit(fit);
  const hasTransform = offset.x !== 0 || offset.y !== 0 || scale !== 1;
  return {
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition: 'center',
    ...(hasTransform && {
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: 'center center',
    }),
  };
}

/** Clamp maxHeight so the device fits within maxWidth too (if provided) */
function constrainMaxHeight(def: DeviceDefinition, maxHeight: number, maxWidth?: number, orientation?: Orientation): number {
  if (!maxWidth) return maxHeight;

  // Use SVG viewBox dimensions if available and valid (more accurate for SVG rendering)
  const vb = def.svgViewBox;
  const hasValidVb = vb && vb.width > 0 && vb.height > 0;
  const isPortraitIpad = def.platform === 'ipad' && orientation === 'portrait';

  let deviceAspect: number;
  if (hasValidVb && isPortraitIpad) {
    // Portrait iPad: SVG is landscape, rotated 90° → container is portrait (h×w)
    deviceAspect = vb.height / vb.width; // swapped
  } else if (hasValidVb) {
    deviceAspect = vb.width / vb.height;
  } else {
    const oriented = isPortraitIpad
      ? getOrientedFrameDimensions(def, 'portrait')
      : def;
    deviceAspect = oriented.frameWidth / oriented.frameHeight;
  }

  // What height would produce a frame exactly maxWidth wide?
  const heightForMaxWidth = maxWidth / deviceAspect;
  return Math.min(maxHeight, heightForMaxWidth);
}

export function DeviceFrame({
  device,
  screenshotUrl,
  maxHeight: rawMaxHeight,
  maxWidth,
  frameStyle = 'svg',
  frameColorVariant = 'default',
  showFrame = true,
  orientation = 'portrait',
  customFrame,
  screenshotFit = 'contain',
  screenshotOffset = { x: 0, y: 0 },
  screenshotScale = 1,
}: Props) {
  const def = devices[device];
  const colors = getFrameColors(def, frameColorVariant);
  const imgStyle = getScreenshotImgStyle(screenshotFit, screenshotOffset, screenshotScale);

  // Constrain height so device also fits within maxWidth
  const maxHeight = constrainMaxHeight(def, rawMaxHeight, maxWidth, orientation);

  // Custom frame rendering
  if (customFrame && showFrame) {
    return <CustomFrameView customFrame={customFrame} screenshotUrl={screenshotUrl} maxHeight={maxHeight} imgStyle={imgStyle} />;
  }

  if (!showFrame) {
    return <FramelessView def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} orientation={orientation} imgStyle={imgStyle} />;
  }

  // SVG mockup mode — use real device SVG images
  const svgPath = getSvgPathForVariant(def, frameColorVariant);
  if (frameStyle === 'svg' && svgPath && def.svgScreenRect) {
    return <SvgFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} svgPathOverride={svgPath} orientation={orientation} imgStyle={imgStyle} screenshotFit={screenshotFit} screenshotOffset={screenshotOffset} screenshotScale={screenshotScale} />;
  }

  // CSS mode fallback
  if (def.platform === 'mac') {
    return <MacFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} imgStyle={imgStyle} />;
  }
  if (def.platform === 'apple-watch') {
    return <WatchFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} imgStyle={imgStyle} />;
  }
  if (def.platform === 'ipad') {
    return <TabletFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} orientation={orientation} imgStyle={imgStyle} />;
  }
  return <PhoneFrame def={def} screenshotUrl={screenshotUrl} maxHeight={maxHeight} colors={colors} imgStyle={imgStyle} />;
}

/* ══════════════════════════════════════════════════════════════════════════════
   SVG Mockup Frame — renders the real device SVG with screenshot overlaid
   ══════════════════════════════════════════════════════════════════════════════ */
function SvgFrame({
  def,
  screenshotUrl,
  maxHeight,
  svgPathOverride,
  orientation = 'portrait',
  imgStyle,
  screenshotFit = 'contain',
  screenshotOffset = { x: 0, y: 0 },
  screenshotScale = 1,
}: {
  def: DeviceDefinition;
  screenshotUrl: string | null;
  maxHeight: number;
  svgPathOverride?: string;
  orientation?: Orientation;
  imgStyle: React.CSSProperties;
  screenshotFit?: ScreenshotFit;
  screenshotOffset?: { x: number; y: number };
  screenshotScale?: number;
}) {
  const frameSvgPath = svgPathOverride ?? def.svgPath!;
  const vb = def.svgViewBox;
  const sr = def.svgScreenRect!;
  const isPortraitIpad = def.platform === 'ipad' && orientation === 'portrait';

  // iPad SVGs are landscape-native. For portrait, we rotate the whole frame 90° CW.
  // The outer container becomes portrait-shaped (swapped width/height).
  // Note: maxHeight is already constrained by maxWidth via constrainMaxHeight()
  const scale = isPortraitIpad
    ? maxHeight / vb.width  // portrait: container height maps to SVG width (the shorter dim)
    : maxHeight / vb.height;

  const renderW = vb.width * scale;
  const renderH = vb.height * scale;

  // Screen area in rendered pixels (in the landscape SVG coordinate space)
  const screenX = sr.x * scale;
  const screenY = sr.y * scale;
  const screenW = sr.width * scale;
  const screenH = sr.height * scale;
  const screenR = sr.borderRadius * scale;

  // For portrait iPad: outer container is portrait-shaped
  const containerW = isPortraitIpad ? renderH : renderW;
  const containerH = isPortraitIpad ? renderW : renderH;

  return (
    <div className="relative" style={{ width: containerW, height: containerH }}>
      {isPortraitIpad ? (
        // Portrait iPad: rotate the landscape SVG 90° CW
        <div
          className="absolute"
          style={{
            width: renderW,
            height: renderH,
            transform: `rotate(90deg)`,
            transformOrigin: 'top left',
            left: containerW, // after rotation, shift right by containerW to position correctly
            top: 0,
          }}
        >
          {/* Screenshot — counter-rotated so it stays upright inside the rotated frame.
              The clip container is landscape (screenW × screenH). We size the image to
              portrait dims (screenH × screenW), center it, and rotate -90° so it visually
              fills the landscape clip area while appearing upright to the viewer. */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: screenX,
              top: screenY,
              width: screenW,
              height: screenH,
              borderRadius: screenR,
              backgroundColor: '#000',
            }}
          >
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt="Screenshot"
                draggable={false}
                style={{
                  position: 'absolute',
                  width: screenH,
                  height: screenW,
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(-90deg) translate(${screenshotOffset.x}px, ${screenshotOffset.y}px) scale(${screenshotScale})`,
                  objectFit: getObjectFit(screenshotFit),
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black">
                <div className="text-center text-white/20" style={{ transform: 'rotate(-90deg)' }}>
                  <ImagePlus size={Math.max(14, screenH * 0.06)} className="mx-auto mb-1" />
                  <p style={{ fontSize: Math.max(8, screenH * 0.025) }}>Drop screenshot</p>
                </div>
              </div>
            )}
          </div>
          {/* SVG frame */}
          <img
            key={frameSvgPath}
            src={frameSvgPath}
            alt={def.label}
            className="absolute inset-0 w-full h-full pointer-events-none"
            draggable={false}
          />
        </div>
      ) : (
        // Landscape iPad or non-iPad: render normally
        <>
          <div
            className="absolute overflow-hidden"
            style={{
              left: screenX,
              top: screenY,
              width: screenW,
              height: screenH,
              borderRadius: screenR,
              backgroundColor: '#000',
            }}
          >
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt="Screenshot"
                draggable={false}
                style={imgStyle}
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
          <img
            key={frameSvgPath}
            src={frameSvgPath}
            alt={def.label}
            className="absolute inset-0 w-full h-full pointer-events-none"
            draggable={false}
          />
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CSS Frames (fallback when SVG not available or user selects CSS mode)
   ══════════════════════════════════════════════════════════════════════════════ */

function PhoneFrame({
  def, screenshotUrl, maxHeight, colors, imgStyle,
}: {
  def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant; imgStyle: React.CSSProperties;
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
          <img src={screenshotUrl} alt="Screenshot" draggable={false} style={imgStyle} />
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
  def, screenshotUrl, maxHeight, colors, orientation = 'portrait', imgStyle,
}: {
  def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant; orientation?: Orientation; imgStyle: React.CSSProperties;
}) {
  const oriented = getOrientedFrameDimensions(def, orientation ?? 'portrait');
  const aspectRatio = oriented.frameWidth / oriented.frameHeight;
  const frameHeight = maxHeight;
  const frameWidth = frameHeight * aspectRatio;
  const scale = frameWidth / oriented.frameWidth;
  const bodyR = def.frameBorderRadius * scale;
  const screenR = def.screenBorderRadius * scale;
  const bezelT = frameHeight * oriented.screenInset.top / 100;
  const bezelL = frameWidth * oriented.screenInset.left / 100;
  const bezelR = frameWidth * oriented.screenInset.right / 100;
  const bezelB = frameHeight * oriented.screenInset.bottom / 100;
  const isPortrait = orientation === 'portrait';

  return (
    <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
      <div className="absolute inset-0" style={{ borderRadius: bodyR, backgroundColor: colors.frameColor, boxShadow: `inset 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 0 0.5px ${colors.borderColor}, 0 20px 60px rgba(0,0,0,0.5)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: bodyR, border: '0.5px solid rgba(255,255,255,0.06)' }} />
      {/* Camera dot — top-center in portrait, right-center in landscape */}
      {isPortrait ? (
        <div className="absolute rounded-full" style={{ top: bezelT * 0.4, left: '50%', transform: 'translateX(-50%)', width: Math.max(4, 6 * scale), height: Math.max(4, 6 * scale), backgroundColor: '#111', border: '0.5px solid #333' }} />
      ) : (
        <div className="absolute rounded-full" style={{ right: bezelR * 0.4, top: '50%', transform: 'translateY(-50%)', width: Math.max(4, 6 * scale), height: Math.max(4, 6 * scale), backgroundColor: '#111', border: '0.5px solid #333' }} />
      )}
      <div className="absolute overflow-hidden" style={{ top: bezelT, left: bezelL, right: bezelR, bottom: bezelB, borderRadius: screenR, backgroundColor: '#000' }}>
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Screenshot" draggable={false} style={imgStyle} />
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

function FramelessView({ def, screenshotUrl, maxHeight, orientation = 'portrait', imgStyle }: { def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; orientation?: Orientation; imgStyle: React.CSSProperties }) {
  // For portrait iPad, swap screen dimensions so the aspect ratio is portrait
  const isPortraitIpad = def.platform === 'ipad' && orientation === 'portrait';
  const screenW = isPortraitIpad ? Math.min(def.nativeScreenWidth, def.nativeScreenHeight) : def.nativeScreenWidth;
  const screenH = isPortraitIpad ? Math.max(def.nativeScreenWidth, def.nativeScreenHeight) : def.nativeScreenHeight;
  const aspectRatio = screenW / screenH;
  let imgHeight = maxHeight * 0.92;
  let imgWidth = imgHeight * aspectRatio;
  if (aspectRatio > 1) { imgWidth = maxHeight * 1.2; imgHeight = imgWidth / aspectRatio; }
  const borderRadius = Math.min(imgWidth, imgHeight) * 0.06;

  return (
    <div className="relative overflow-hidden" style={{ width: imgWidth, height: imgHeight, borderRadius, boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)', backgroundColor: '#000' }}>
      {screenshotUrl ? (
        <img src={screenshotUrl} alt="Screenshot" draggable={false} style={imgStyle} />
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

function MacFrame({ def, screenshotUrl, maxHeight, colors, imgStyle }: { def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant; imgStyle: React.CSSProperties }) {
  const aspectRatio = def.frameWidth / def.frameHeight;
  const frameHeight = maxHeight;
  const frameWidth = frameHeight * aspectRatio;
  // MacBook has very subtle rounding — scale with frame size
  const lidR = Math.max(3, frameWidth * 0.012);
  const baseR = Math.max(2, frameWidth * 0.008);
  const screenR = Math.max(2, frameWidth * 0.006);
  const borderW = Math.max(1, Math.min(2, frameWidth * 0.003));

  return (
    <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
      {/* Lid */}
      <div className="absolute" style={{ top: 0, left: frameWidth * 0.04, right: frameWidth * 0.04, bottom: frameHeight * 0.08, backgroundColor: colors.frameColor, border: `${borderW}px solid ${colors.borderColor}`, borderRadius: `${lidR}px ${lidR}px 0 0`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        {/* Camera */}
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#111]" style={{ top: frameHeight * 0.01, width: Math.max(4, frameWidth * 0.012), height: Math.max(4, frameWidth * 0.012), border: '0.5px solid #444' }} />
        {/* Screen */}
        <div className="absolute overflow-hidden" style={{ top: `${def.screenInset.top * 0.9}%`, left: '3%', right: '3%', bottom: '3%', borderRadius: screenR, backgroundColor: '#000' }}>
          {screenshotUrl ? (
            <img src={screenshotUrl} alt="Screenshot" draggable={false} style={imgStyle} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/80">
              <div className="text-center text-white/30"><ImagePlus size={Math.max(12, frameWidth * 0.03)} className="mx-auto mb-1" /><p style={{ fontSize: Math.max(7, frameWidth * 0.014) }}>Drop screenshot</p></div>
            </div>
          )}
        </div>
      </div>
      {/* Base / hinge */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: frameHeight * 0.08, background: `linear-gradient(to bottom, ${colors.frameColor}, ${colors.frameColor}dd)`, borderLeft: `${borderW}px solid ${colors.borderColor}`, borderRight: `${borderW}px solid ${colors.borderColor}`, borderBottom: `${borderW}px solid ${colors.borderColor}`, borderRadius: `0 0 ${baseR}px ${baseR}px` }}>
        {/* Notch */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 0, width: frameWidth * 0.15, height: Math.max(2, frameHeight * 0.006), backgroundColor: colors.borderColor, borderRadius: `0 0 ${baseR}px ${baseR}px` }} />
      </div>
    </div>
  );
}

function WatchFrame({ def, screenshotUrl, maxHeight, colors, imgStyle }: { def: DeviceDefinition; screenshotUrl: string | null; maxHeight: number; colors: FrameColorVariant; imgStyle: React.CSSProperties }) {
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
        backgroundColor: '#000',
      }}>
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Screenshot" draggable={false} style={imgStyle} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/80">
            <div className="text-center text-white/30"><ImagePlus size={16} className="mx-auto mb-1" /><p style={{ fontSize: 8 }}>Drop</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Custom SVG Frame
   ═══════════════════════════════════════════════════════════════════════════ */

function CustomFrameView({
  customFrame,
  screenshotUrl,
  maxHeight,
  imgStyle,
}: {
  customFrame: CustomFrame;
  screenshotUrl: string | null;
  maxHeight: number;
  imgStyle: React.CSSProperties;
}) {
  // Parse viewBox to get aspect ratio
  const vbParts = customFrame.viewBox.split(/\s+/).map(Number);
  const vbWidth = vbParts[2] || 100;
  const vbHeight = vbParts[3] || 100;
  const aspectRatio = vbWidth / vbHeight;

  const frameHeight = maxHeight;
  const frameWidth = frameHeight * aspectRatio;

  const sr = customFrame.screenRect;
  // Convert screen rect from SVG units to pixel positions
  const screenX = (sr.x / vbWidth) * frameWidth;
  const screenY = (sr.y / vbHeight) * frameHeight;
  const screenW = (sr.width / vbWidth) * frameWidth;
  const screenH = (sr.height / vbHeight) * frameHeight;

  return (
    <div className="relative mx-auto" style={{ width: frameWidth, height: frameHeight }}>
      {/* Screenshot behind frame */}
      <div
        className="absolute overflow-hidden"
        style={{ left: screenX, top: screenY, width: screenW, height: screenH, backgroundColor: '#000' }}
      >
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Screenshot" draggable={false} style={imgStyle} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/80">
            <div className="text-center text-white/30">
              <ImagePlus size={16} className="mx-auto mb-1" />
              <p style={{ fontSize: 8 }}>Drop</p>
            </div>
          </div>
        )}
      </div>
      {/* SVG frame on top */}
      <div
        className="absolute inset-0 pointer-events-none"
        dangerouslySetInnerHTML={{ __html: customFrame.svgContent }}
        style={{ width: frameWidth, height: frameHeight }}
      />
    </div>
  );
}
