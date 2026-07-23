import html2canvas from 'html2canvas';
import {
  CERTIFICATE_TEMPLATE_URL,
  CERTIFICATE_WIDTH,
  CERTIFICATE_HEIGHT,
  CERTIFICATE_LAYOUT,
  CERTIFICATE_FONT_FAMILY,
} from './certificateConfig';

export function resolveCertificateLayout(customLayout) {
  if (!customLayout) return CERTIFICATE_LAYOUT;
  const merged = { ...CERTIFICATE_LAYOUT };
  for (const key of Object.keys(customLayout)) {
    merged[key] = { ...CERTIFICATE_LAYOUT[key], ...customLayout[key] };
  }
  return merged;
}

async function ensureCertificateFonts() {
  const sizes = [42, 44, 48, 50, 56, 62, 68, 76];
  await Promise.all(
    sizes.flatMap((size) => [
      document.fonts.load(`500 ${size}px Satoshi`).catch(() => {}),
      document.fonts.load(`700 ${size}px Satoshi`).catch(() => {}),
    ]),
  );
  await document.fonts.ready;
}

function waitForImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load certificate template: ${url}`));
    img.src = url;
  });
}

export function formatCertificateDate(value) {
  const d = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCertificateDuration(minutes) {
  const total = Number(minutes) || 0;
  if (total <= 0) return '';
  const hours = total / 60;
  if (hours < 1) return `${total} min`;
  const rounded = Math.round(hours * 10) / 10;
  const label = rounded === 1 ? 'hour' : 'hours';
  return `${rounded} total ${label}`;
}

function createFieldEl({ left, top, fontSize, fontWeight, color, maxWidth, lineHeight }) {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.fontFamily = CERTIFICATE_FONT_FAMILY;
  el.style.fontSize = `${fontSize}px`;
  el.style.fontWeight = String(fontWeight);
  el.style.color = color;
  el.style.margin = '0';
  el.style.padding = '0';
  el.style.whiteSpace = maxWidth ? 'normal' : 'nowrap';
  el.style.wordBreak = 'break-word';
  if (maxWidth) el.style.maxWidth = `${maxWidth}px`;
  if (lineHeight) el.style.lineHeight = String(lineHeight);
  return el;
}

function fitWrappedField(el, text, { baseFontSize, minFontSize, maxLines, lineHeight }) {
  let size = baseFontSize;
  while (size >= minFontSize) {
    el.style.fontSize = `${size}px`;
    el.style.lineHeight = String(lineHeight);
    el.textContent = text;
    const linePx = size * lineHeight;
    const lines = Math.max(1, Math.round(el.offsetHeight / linePx));
    if (lines <= maxLines) return size;
    size -= 2;
  }
  el.style.fontSize = `${minFontSize}px`;
  el.textContent = text;
  return minFontSize;
}

function fitSingleLineField(el, text, { maxWidth, baseFontSize, minFontSize }) {
  let size = baseFontSize;
  while (size >= minFontSize) {
    el.style.fontSize = `${size}px`;
    el.textContent = text;
    if (el.scrollWidth <= maxWidth) return size;
    size -= 2;
  }
  el.style.fontSize = `${minFontSize}px`;
  let trimmed = text;
  while (trimmed.length > 1 && el.scrollWidth > maxWidth) {
    trimmed = trimmed.slice(0, -1);
    el.textContent = `${trimmed}…`;
  }
  return minFontSize;
}

function buildCertificateElement(
  {
    courseTitle,
    learnerName,
    instructorName,
    issuedDate,
    durationMinutes,
  },
  layout = CERTIFICATE_LAYOUT,
) {
  const root = document.createElement('div');
  root.setAttribute('data-certificate-root', 'true');
  root.style.cssText = [
    `width:${CERTIFICATE_WIDTH}px`,
    `height:${CERTIFICATE_HEIGHT}px`,
    `position:relative`,
    `overflow:hidden`,
    `background-color:#ffffff`,
    `font-family:${CERTIFICATE_FONT_FAMILY}`,
  ].join(';');

  const bg = document.createElement('img');
  bg.src = CERTIFICATE_TEMPLATE_URL;
  bg.alt = '';
  bg.decoding = 'sync';
  bg.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;';
  root.appendChild(bg);

  const title = String(courseTitle || 'Course').trim();
  const learner = String(learnerName || 'Learner').trim();
  const instructor = String(instructorName || 'Instructor').trim();

  const titleCfg = layout.courseTitle;
  const titleEl = createFieldEl({
    left: titleCfg.left,
    top: titleCfg.top,
    fontSize: titleCfg.baseFontSize,
    fontWeight: titleCfg.fontWeight,
    color: titleCfg.color,
    maxWidth: titleCfg.maxWidth,
    lineHeight: titleCfg.lineHeight,
  });
  titleEl.dataset.field = 'title';
  titleEl.dataset.text = title;
  root.appendChild(titleEl);

  const instCfg = layout.instructorName;
  const instEl = createFieldEl({
    left: instCfg.left,
    top: instCfg.top,
    fontSize: instCfg.fontSize,
    fontWeight: instCfg.fontWeight,
    color: instCfg.color,
  });
  instEl.textContent = instructor;
  root.appendChild(instEl);

  const learnerCfg = layout.learnerName;
  const learnerEl = createFieldEl({
    left: learnerCfg.left,
    top: learnerCfg.top,
    fontSize: learnerCfg.baseFontSize,
    fontWeight: learnerCfg.fontWeight,
    color: learnerCfg.color,
    maxWidth: learnerCfg.maxWidth,
    lineHeight: learnerCfg.lineHeight,
  });
  learnerEl.dataset.field = 'learner';
  learnerEl.dataset.text = learner;
  root.appendChild(learnerEl);

  const dateCfg = layout.completionDate;
  const dateEl = createFieldEl({
    left: dateCfg.left,
    top: dateCfg.top,
    fontSize: dateCfg.fontSize,
    fontWeight: dateCfg.fontWeight,
    color: dateCfg.color,
  });
  dateEl.textContent = formatCertificateDate(issuedDate);
  root.appendChild(dateEl);

  const durCfg = layout.courseDuration;
  const durationText = formatCertificateDuration(durationMinutes);
  if (durationText) {
    const durEl = createFieldEl({
      left: durCfg.left,
      top: durCfg.top,
      fontSize: durCfg.fontSize,
      fontWeight: durCfg.fontWeight,
      color: durCfg.color,
    });
    durEl.textContent = durationText;
    root.appendChild(durEl);
  }

  return root;
}

function applyTextFitting(root, layout = CERTIFICATE_LAYOUT) {
  const titleEl = root.querySelector('[data-field="title"]');
  if (titleEl) {
    fitWrappedField(titleEl, titleEl.dataset.text || '', layout.courseTitle);
  }
  const learnerEl = root.querySelector('[data-field="learner"]');
  if (learnerEl) {
    fitSingleLineField(learnerEl, learnerEl.dataset.text || '', layout.learnerName);
  }
}

async function waitForBgImage(root) {
  const bg = root.querySelector('img');
  if (!bg) return;
  if (bg.complete && bg.naturalWidth > 0) return;
  await new Promise((resolve, reject) => {
    bg.onload = () => resolve();
    bg.onerror = () => reject(new Error('Certificate background image failed to load'));
  });
}

/** Native canvas fallback when html2canvas fails (large image / memory limits). */
async function renderWithCanvas2D(fields, layout = CERTIFICATE_LAYOUT) {
  const template = await waitForImage(CERTIFICATE_TEMPLATE_URL);
  const canvas = document.createElement('canvas');
  canvas.width = CERTIFICATE_WIDTH;
  canvas.height = CERTIFICATE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(template, 0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT);
  ctx.fillStyle = '#111111';
  ctx.textBaseline = 'top';

  const title = String(fields.courseTitle || 'Course').trim();
  const learner = String(fields.learnerName || 'Learner').trim();
  const instructor = String(fields.instructorName || 'Instructor').trim();

  const titleCfg = layout.courseTitle;
  let titleSize = titleCfg.baseFontSize;
  ctx.font = `700 ${titleSize}px Satoshi, sans-serif`;
  while (titleSize >= titleCfg.minFontSize) {
    const words = title.split(/\s+/);
    let lines = 1;
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > titleCfg.maxWidth && line) {
        lines += 1;
        line = word;
      } else {
        line = test;
      }
    }
    if (lines <= titleCfg.maxLines) break;
    titleSize -= 2;
    ctx.font = `700 ${titleSize}px Satoshi, sans-serif`;
  }
  let line = '';
  let y = titleCfg.top;
  const lineH = titleSize * titleCfg.lineHeight;
  for (const word of title.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > titleCfg.maxWidth && line) {
      ctx.fillText(line, titleCfg.left, y);
      y += lineH;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, titleCfg.left, y);

  const inst = layout.instructorName;
  ctx.font = `700 ${inst.fontSize}px Satoshi, sans-serif`;
  ctx.fillText(instructor, inst.left, inst.top);

  const learn = layout.learnerName;
  let learnSize = learn.baseFontSize;
  ctx.font = `700 ${learnSize}px Satoshi, sans-serif`;
  while (learnSize >= learn.minFontSize && ctx.measureText(learner).width > learn.maxWidth) {
    learnSize -= 2;
    ctx.font = `700 ${learnSize}px Satoshi, sans-serif`;
  }
  ctx.fillText(learner, learn.left, learn.top);

  const dateCfg = layout.completionDate;
  ctx.font = `500 ${dateCfg.fontSize}px Satoshi, sans-serif`;
  ctx.fillText(formatCertificateDate(fields.issuedDate), dateCfg.left, dateCfg.top);

  const durCfg = layout.courseDuration;
  const durationText = formatCertificateDuration(fields.durationMinutes);
  if (durationText) {
    ctx.font = `500 ${durCfg.fontSize}px Satoshi, sans-serif`;
    ctx.fillText(durationText, durCfg.left, durCfg.top);
  }

  return canvas;
}

/**
 * Renders the Kattraan certificate template with dynamic fields.
 */
export async function renderCertificateCanvas(fields, options = {}) {
  const layout = resolveCertificateLayout(options.layout);
  await ensureCertificateFonts();
  await waitForImage(CERTIFICATE_TEMPLATE_URL);

  const root = buildCertificateElement(fields, layout);
  root.style.position = 'fixed';
  root.style.left = '-9999px';
  root.style.top = '0';
  root.style.zIndex = '-1';
  document.body.appendChild(root);

  try {
    await waitForBgImage(root);
    applyTextFitting(root, layout);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const canvas = await html2canvas(root, {
        width: CERTIFICATE_WIDTH,
        height: CERTIFICATE_HEIGHT,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      return canvas;
    } catch (html2canvasErr) {
      console.warn('html2canvas failed, using canvas fallback:', html2canvasErr);
      return renderWithCanvas2D(fields, layout);
    }
  } finally {
    if (root.parentNode) root.parentNode.removeChild(root);
  }
}

export async function renderCertificateToDataUrl(fields, options = {}) {
  const canvas = await renderCertificateCanvas(fields, options);
  return canvas.toDataURL('image/jpeg', 0.92);
}
