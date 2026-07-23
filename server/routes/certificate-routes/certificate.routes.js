const express = require('express');
const authenticate = require('../../middleware/auth-middleware');
const {
  listMyCertificates,
  issueForCourse,
  getForCourse,
  downloadByCertificateId,
  viewByCertificateId,
  downloadByCourseId,
  viewByCourseId,
  verifyPublic,
} = require('../../controllers/learner-controller/certificateController');

const router = express.Router();

/** Public — anyone can verify a certificate ID (Udemy-style). */
router.get('/verify/:certificateId', verifyPublic);

/** Authenticated learner certificate endpoints. */
router.get('/mine', authenticate, listMyCertificates);
router.get('/view/:certificateId', authenticate, viewByCertificateId);
router.get('/download/:certificateId', authenticate, downloadByCertificateId);
router.get('/course/:courseId/view', authenticate, viewByCourseId);
router.get('/course/:courseId/download', authenticate, downloadByCourseId);
router.get('/course/:courseId', authenticate, getForCourse);
router.post('/issue/:courseId', authenticate, issueForCourse);

module.exports = router;
