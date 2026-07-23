/** Public asset paths (files live in client/public/certificates/). */
export const CERTIFICATE_TEMPLATE_URL = '/certificates/certificate-template.png';

export const CERTIFICATE_WIDTH = 3368;
export const CERTIFICATE_HEIGHT = 2380;

/**
 * ALIGNMENT: edit CERTIFICATE_LAYOUT below (left, top, fontSize, maxWidth).
 * Must match server/config/certificateConfig.js — server generates PDFs.
 */
export const CERTIFICATE_LAYOUT = {
  courseTitle: {
    left: 660,
    top: 500,
    maxWidth: 2500,
    baseFontSize: 115,
    minFontSize: 80,
    maxLines: 3,
    fontWeight: 500,
    color: '#111111',
    lineHeight: 1.32,
  },
  /** Name on the same baseline as the template "Instructor" label. */
  instructorName: {
    left: 890,
    top: 1073,
    fontSize: 57,
    fontWeight: 500,
    color: '#111111',
  },
  learnerName: {
    left: 661,
    top: 1840,
    maxWidth: 2500,
    baseFontSize: 128,
    minFontSize: 49,
    fontWeight: 700,
    color: '#111111',
    lineHeight: 1.1,
  },
  /** Values sit below the grey "Completion" / "Course Duration" labels. */
  completionDate: {
    left: 654,
    top: 2166,
    fontSize: 50,
    fontWeight: 400,
    color: '#111111',
  },
  courseDuration: {
    left: 1223,
    top: 2167,
    fontSize: 50,
    fontWeight: 400,
    color: '#111111',
  },
};

export const CERTIFICATE_FONT_FAMILY = 'Satoshi, ui-sans-serif, system-ui, sans-serif';
