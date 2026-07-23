const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const PDFDocument = require('pdfkit');
const {
  CERTIFICATE_WIDTH,
  CERTIFICATE_HEIGHT,
  CERTIFICATE_LAYOUT,
  PDF_WIDTH_PT,
  PDF_HEIGHT_PT,
  resolveTemplatePath,
} = require('../config/certificateConfig');

let fontsReady = false;

function resolveFontDir() {
  const candidates = [
    path.join(__dirname, '../assets/fonts/satoshi'),
    path.join(__dirname, '../../client/public/fonts/satoshi'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'Satoshi-Medium.woff2'))) return dir;
  }
  throw new Error(
    'Satoshi fonts not found. Add .woff2 files to server/assets/fonts/satoshi/',
  );
}

function ensureSatoshiFonts() {
  if (fontsReady) return;
  const dir = resolveFontDir();
  GlobalFonts.registerFromPath(path.join(dir, 'Satoshi-Regular.woff2'), 'Satoshi-Regular');
  GlobalFonts.registerFromPath(path.join(dir, 'Satoshi-Medium.woff2'), 'Satoshi-Medium');
  GlobalFonts.registerFromPath(path.join(dir, 'Satoshi-Bold.woff2'), 'Satoshi-Bold');
  fontsReady = true;
}

function pickFontFamily(weight) {
  const w = Number(weight);
  if (w >= 700) return 'Satoshi-Bold';
  if (w >= 500) return 'Satoshi-Medium';
  return 'Satoshi-Regular';
}

function formatCertificateDate(value) {
  const d = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCertificateDuration(minutes) {
  const total = Number(minutes) || 0;
  if (total <= 0) return '';
  const hours = total / 60;
  if (hours < 1) return `${total} min`;
  const rounded = Math.round(hours * 10) / 10;
  const label = rounded === 1 ? 'hour' : 'hours';
  return `${rounded} total ${label}`;
}

function countTitleLines(ctx, text, maxWidth, fontFamily, fontSize) {
  ctx.font = `${fontSize}px ${fontFamily}`;

  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;

  let lines = 1;
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines += 1;
      line = word;
    } else {
      line = test;
    }
  }
  return lines;
}


function drawWrappedTitle(ctx, text, cfg) {
  const title = String(text || 'Course').trim();
  let titleSize = cfg.baseFontSize;
  const family = pickFontFamily(cfg.fontWeight);

  while (titleSize >= cfg.minFontSize) {
    const lines = countTitleLines(ctx, title, cfg.maxWidth, family, titleSize);
    if (lines <= cfg.maxLines) break;
    titleSize -= 2;
  }

  ctx.font = `${titleSize}px ${family}`;
  ctx.fillStyle = cfg.color;

  const words = title.split(/\s+/);
  let line = '';
  let y = cfg.top;
  const lineH = titleSize * cfg.lineHeight;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > cfg.maxWidth && line) {
      ctx.fillText(line, cfg.left, y);
      y += lineH;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, cfg.left, y);
}

function drawSingleLine(ctx, text, cfg) {
  const value = String(text || '').trim();
  let size = cfg.baseFontSize;
  const family = pickFontFamily(cfg.fontWeight);

  ctx.fillStyle = cfg.color;
  while (size >= cfg.minFontSize) {
    ctx.font = `${size}px ${family}`;
    if (ctx.measureText(value).width <= cfg.maxWidth) break;
    size -= 2;
  }
  ctx.font = `${size}px ${family}`;
  ctx.fillText(value, cfg.left, cfg.top);
}

function drawFixedLine(ctx, text, cfg) {
  const family = pickFontFamily(cfg.fontWeight);
  ctx.font = `${cfg.fontSize}px ${family}`;
  ctx.fillStyle = cfg.color;
  ctx.fillText(String(text || '').trim(), cfg.left, cfg.top);
}

/**
 * Renders certificate at native template resolution (3368×2380) — matches client canvas path.
 */
async function renderCertificateCanvas(fields) {
  ensureSatoshiFonts();
  const template = await loadImage(resolveTemplatePath());
  const canvas = createCanvas(CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(template, 0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT);
  ctx.fillStyle = '#111111';
  ctx.textBaseline = 'top';

  const layout = CERTIFICATE_LAYOUT;

  drawWrappedTitle(ctx, fields.courseTitle, layout.courseTitle);
  drawFixedLine(ctx, fields.instructorName || 'Instructor', layout.instructorName);
  drawSingleLine(ctx, fields.learnerName || 'Learner', layout.learnerName);
  drawFixedLine(ctx, formatCertificateDate(fields.issuedDate), layout.completionDate);
  const durationText = formatCertificateDuration(fields.durationMinutes);
  if (durationText) {
    drawFixedLine(ctx, durationText, layout.courseDuration);
  }

  return canvas;
}

/**
 * Generate a certificate PDF buffer (rasterized at full resolution, embedded in PDF).
 */
async function generateCertificatePdfBuffer(fields) {
  const canvas = await renderCertificateCanvas(fields);
  const jpegBuffer = await canvas.encode('jpeg', 92);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PDF_WIDTH_PT, PDF_HEIGHT_PT],
      margin: 0,
      autoFirstPage: false,
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.addPage({ size: [PDF_WIDTH_PT, PDF_HEIGHT_PT], margin: 0 });
    doc.image(jpegBuffer, 0, 0, { width: PDF_WIDTH_PT, height: PDF_HEIGHT_PT });
    doc.end();
  });
}

module.exports = {
  generateCertificatePdfBuffer,
  renderCertificateCanvas,
  formatCertificateDate,
  formatCertificateDuration,
};
