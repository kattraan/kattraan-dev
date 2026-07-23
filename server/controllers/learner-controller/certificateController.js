const certificateService = require('../../services/certificate.service');
const { generateCertificatePdfBuffer } = require('../../services/certificatePdf.service');

function buildPdfFileName(courseTitle) {
  return `Kattraan-Certificate-${courseTitle || 'Course'}`
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function sendCertificatePdf(res, record, { inline = false } = {}) {
  return generateCertificatePdfBuffer({
    courseTitle: record.courseTitle,
    learnerName: record.learnerName,
    instructorName: record.instructorName,
    issuedDate: record.issuedAt,
    durationMinutes: record.durationMinutes,
  }).then((buffer) => {
    const fileName = buildPdfFileName(record.courseTitle);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${fileName}.pdf"`,
    );
    res.send(buffer);
  });
}

async function listMyCertificates(req, res) {
  const data = await certificateService.listUserCertificates(req.user._id);
  res.json({ success: true, data });
}

async function issueForCourse(req, res) {
  const { courseId } = req.params;
  const data = await certificateService.issueCertificate(req.user._id, courseId);
  res.json({ success: true, data });
}

async function getForCourse(req, res) {
  const { courseId } = req.params;
  let data = await certificateService.getCertificateForUserCourse(req.user._id, courseId);
  if (!data) {
    data = await certificateService.issueCertificate(req.user._id, courseId);
  }
  res.json({ success: true, data });
}

function wantsInlinePdf(req) {
  const value = req.query?.inline;
  return value === '1' || value === 'true';
}

async function downloadByCertificateId(req, res) {
  const record = await certificateService.getCertificateRecordForDownload(
    req.user._id,
    req.params.certificateId,
  );
  await sendCertificatePdf(res, record, { inline: wantsInlinePdf(req) });
}

async function viewByCertificateId(req, res) {
  const record = await certificateService.getCertificateRecordForDownload(
    req.user._id,
    req.params.certificateId,
  );
  await sendCertificatePdf(res, record, { inline: true });
}

async function downloadByCourseId(req, res) {
  let data = await certificateService.getCertificateForUserCourse(
    req.user._id,
    req.params.courseId,
  );
  if (!data) {
    data = await certificateService.issueCertificate(req.user._id, req.params.courseId);
  }
  await sendCertificatePdf(
    res,
    {
      courseTitle: data.courseTitle,
      learnerName: data.learnerName,
      instructorName: data.instructorName,
      issuedAt: data.issuedAt,
      durationMinutes: data.durationMinutes,
    },
    { inline: wantsInlinePdf(req) },
  );
}

async function viewByCourseId(req, res) {
  let data = await certificateService.getCertificateForUserCourse(
    req.user._id,
    req.params.courseId,
  );
  if (!data) {
    data = await certificateService.issueCertificate(req.user._id, req.params.courseId);
  }
  await sendCertificatePdf(
    res,
    {
      courseTitle: data.courseTitle,
      learnerName: data.learnerName,
      instructorName: data.instructorName,
      issuedAt: data.issuedAt,
      durationMinutes: data.durationMinutes,
    },
    { inline: true },
  );
}

async function verifyPublic(req, res) {
  const data = await certificateService.verifyCertificate(req.params.certificateId);
  res.json({ success: true, data });
}

module.exports = {
  listMyCertificates,
  issueForCourse,
  getForCourse,
  downloadByCertificateId,
  viewByCertificateId,
  downloadByCourseId,
  viewByCourseId,
  verifyPublic,
};
