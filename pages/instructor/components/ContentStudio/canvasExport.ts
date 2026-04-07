// Content Studio - Canvas Export Utility

import { getThemeById, getBadgeByKey, ThemeConfig } from './types';

interface ExportConfig {
  branding: string;
  headline: string;
  statusLine: string;
  studentName: string;
  themeId: string;
  badgeKey: string;
}

// Badge key to emoji/symbol mapping for canvas rendering
const BADGE_SYMBOLS: Record<string, string> = {
  // Milestones
  first_steps: '👣',
  getting_rolling: '🚗',
  road_warrior: '🛡️',
  driving_pro: '🏆',
  on_fire: '🔥',
  champ: '👑',
  legendary: '⭐',
  master: '💎',
  // Skills
  mirrors: '👁️',
  signals: '⚡',
  anticipation: '🧠',
  junctions: '🔀',
  rounds: '🔄',
  parking: '🅿️',
  night: '🌙',
  speed: '⏱️',
};

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// Draw a gradient on the canvas
const drawGradient = (ctx: CanvasRenderingContext2D, theme: ThemeConfig) => {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  gradient.addColorStop(0, theme.canvasColors[0]);
  gradient.addColorStop(0.5, theme.canvasColors[1]);
  gradient.addColorStop(1, theme.canvasColors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

// Draw subtle grain texture (very light)
const drawNoiseTexture = (ctx: CanvasRenderingContext2D) => {
  // Create a temporary canvas for the noise
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = CANVAS_WIDTH;
  tempCanvas.height = CANVAS_HEIGHT;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  const imageData = tempCtx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 255;
    imageData.data[i] = noise;
    imageData.data[i + 1] = noise;
    imageData.data[i + 2] = noise;
    imageData.data[i + 3] = 8; // Very low alpha (about 3%)
  }
  tempCtx.putImageData(imageData, 0, 0);
  
  // Draw the noise with soft-light-like blending
  ctx.globalAlpha = 0.15;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};

// Draw rounded rectangle
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/**
 * Render the poster to canvas and return blob + dataUrl (without auto-download)
 */
export const renderCanvasImage = (
  canvas: HTMLCanvasElement,
  config: ExportConfig
): Promise<{ blob: Blob; dataUrl: string }> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas context not available'));

  const theme = getThemeById(config.themeId);
  const badge = getBadgeByKey(config.badgeKey);
  const textColor = theme.textColor === 'white' ? '#ffffff' : '#0f172a';
  const mutedColor = theme.textColor === 'white' ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.5)';
  const glassColor = theme.textColor === 'white' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const glassBorder = theme.textColor === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  // 1. Background gradient
  drawGradient(ctx, theme);
  
  // 2. Noise texture
  drawNoiseTexture(ctx);

  ctx.textAlign = 'center';

  // 3. Branding text at top
  ctx.fillStyle = mutedColor;
  ctx.font = '700 36px Inter, system-ui, sans-serif';
  ctx.fillText((config.branding || 'CRUZI ACADEMY').toUpperCase(), CANVAS_WIDTH / 2, 180);

  // 4. Headline (large italic)
  ctx.fillStyle = textColor;
  ctx.font = 'italic 900 120px Inter, system-ui, sans-serif';
  const headlineLines = (config.headline || 'MASTERY UNLOCKED').toUpperCase().split(' ');
  let yPos = 480;
  headlineLines.forEach((line) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, yPos);
    yPos += 130;
  });

  // 5. Glass card
  const cardWidth = 700;
  const cardHeight = 450;
  const cardX = (CANVAS_WIDTH - cardWidth) / 2;
  const cardY = 850;
  
  // Glass background
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 60);
  ctx.fillStyle = glassColor;
  ctx.fill();
  
  // Glass border
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 60);
  ctx.strokeStyle = glassBorder;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Badge icon box
  const iconBoxSize = 120;
  const iconBoxX = (CANVAS_WIDTH - iconBoxSize) / 2;
  const iconBoxY = cardY + 50;
  
  drawRoundedRect(ctx, iconBoxX, iconBoxY, iconBoxSize, iconBoxSize, 30);
  ctx.fillStyle = theme.textColor === 'white' ? '#ffffff' : '#0f172a';
  ctx.fill();

  // Badge icon (emoji symbol)
  if (badge) {
    const symbol = BADGE_SYMBOLS[badge.key] || badge.label.charAt(0);
    ctx.fillStyle = theme.textColor === 'white' ? '#0f172a' : '#ffffff';
    ctx.font = '60px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.fillText(symbol, CANVAS_WIDTH / 2, iconBoxY + 85);
  }

  // Student name
  ctx.fillStyle = textColor;
  ctx.font = '900 72px Inter, system-ui, sans-serif';
  ctx.fillText((config.studentName || 'STUDENT NAME').toUpperCase(), CANVAS_WIDTH / 2, cardY + 280);

  // Status line
  ctx.fillStyle = mutedColor;
  ctx.font = '700 32px Inter, system-ui, sans-serif';
  ctx.fillText((config.statusLine || 'BEGINNER LEVEL').toUpperCase(), CANVAS_WIDTH / 2, cardY + 360);

  // 6. Footer watermark
  ctx.fillStyle = theme.textColor === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.25)';
  ctx.font = '700 28px Inter, system-ui, sans-serif';
  ctx.fillText('POWERED BY CRUZI', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);

  // Return blob and dataUrl
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob: blob!, dataUrl });
    }, 'image/png');
  });
};

/**
 * Download image from data URL (legacy support)
 */
export const downloadCanvasImage = (dataUrl: string, filename?: string): void => {
  const link = document.createElement('a');
  link.download = filename || `Cruzi_Content_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
};

/**
 * Legacy export function for backwards compatibility
 */
export const exportCanvasImage = (
  canvas: HTMLCanvasElement,
  config: ExportConfig
): void => {
  renderCanvasImage(canvas, config).then(({ dataUrl }) => {
    downloadCanvasImage(dataUrl);
  });
};
