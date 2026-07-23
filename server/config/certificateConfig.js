/**
 * ALIGNMENT: edit CERTIFICATE_LAYOUT below (left, top, fontSize, maxWidth).
 * Must match client/src/features/courses/utils/certificateConfig.js
 */
const path = require('path');
const fs = require('fs');

const CERTIFICATE_WIDTH = 3368;
const CERTIFICATE_HEIGHT = 2380;

const CERTIFICATE_LAYOUT = {
  courseTitle: {
    left: 660,
    top: 620,
    maxWidth: 2150,
    baseFontSize: 130,
    minFontSize: 80,
    maxLines: 3,
    fontWeight: 500,
    color: '#111111',
    lineHeight: 1.32,
  },
  instructorName: {
    left: 890,
    top: 1118,
    fontSize: 57,
    fontWeight: 800,
    color: '#111111',
  },
  learnerName: {
    left: 661,
    top: 1900,
    maxWidth: 950,
    baseFontSize: 130,
    minFontSize: 49,
    fontWeight: 700,
    color: '#111111',
    lineHeight: 1.1,
  },
  completionDate: {
    left: 640,
    top: 2210,
    fontSize: 56,
    fontWeight: 500,
    color: '#111111',
  },
  courseDuration: {
    left: 1250,
    top: 2210,
    fontSize: 56,
    fontWeight: 500,
    color: '#111111',
  },
};

/** Landscape PDF size (points) — same proportions as client jsPDF (297mm wide). */
const PDF_WIDTH_PT = (297 / 25.4) * 72;
const PDF_HEIGHT_PT = PDF_WIDTH_PT * (CERTIFICATE_HEIGHT / CERTIFICATE_WIDTH);
const LAYOUT_SCALE = PDF_WIDTH_PT / CERTIFICATE_WIDTH;

function resolveTemplatePath() {
  const candidates = [
    path.join(__dirname, '../assets/certificates/certificate-template.png'),
    path.join(__dirname, '../../client/public/certificates/certificate-template.png'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    'Certificate template not found. Place certificate-template.png in server/assets/certificates/ or client/public/certificates/',
  );
}

module.exports = {
  CERTIFICATE_WIDTH,
  CERTIFICATE_HEIGHT,
  CERTIFICATE_LAYOUT,
  PDF_WIDTH_PT,
  PDF_HEIGHT_PT,
  LAYOUT_SCALE,
  resolveTemplatePath,
};
