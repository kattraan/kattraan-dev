jest.mock('../models/Course', () => ({
  findById: jest.fn(),
}));
jest.mock('../models/LearnerCourses', () => ({
  findOne: jest.fn(),
}));
jest.mock('../models/Chapter', () => ({
  findById: jest.fn(),
}));
jest.mock('../models/Section', () => ({
  findById: jest.fn(),
}));
jest.mock('../models/Content', () => ({
  findById: jest.fn(),
}));
jest.mock('../helpers/bunnyToken', () => ({
  generateSignedStreamUrl: jest.fn().mockResolvedValue('https://signed.example/play.m3u8'),
  generateSignedUrl: jest.fn(),
}));
jest.mock('../helpers/bunnyStream', () => ({
  getBunnyVideo: jest.fn().mockResolvedValue({ status: 3 }),
}));

const Course = require('../models/Course');
const LearnerCourses = require('../models/LearnerCourses');
const Content = require('../models/Content');
const Chapter = require('../models/Chapter');
const Section = require('../models/Section');
const { generateSignedStreamUrl } = require('../helpers/bunnyToken');
const videoService = require('../services/video.service');

describe('video.service access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('denies non-owner instructors who are not enrolled', async () => {
    Course.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ createdBy: 'owner-1' }),
    });
    LearnerCourses.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      videoService.isEnrolledOrElevated('other-instructor', 'course-1', 'instructor'),
    ).resolves.toBe(false);
  });

  it('allows course owner and admin', async () => {
    Course.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ createdBy: 'owner-1' }),
    });

    await expect(
      videoService.isEnrolledOrElevated('owner-1', 'course-1', 'instructor'),
    ).resolves.toBe(true);

    await expect(
      videoService.isEnrolledOrElevated('admin-1', 'course-1', 'admin'),
    ).resolves.toBe(true);
  });

  it('checks authorization before signing playback URL', async () => {
    Content.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'vid-1',
        type: 'video',
        chapter: 'ch-1',
        bunnyVideoId: 'bunny-1',
      }),
    });
    Chapter.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ section: 'sec-1' }),
    });
    Section.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ course: 'course-1' }),
    });
    Course.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ createdBy: 'owner-1' }),
    });
    LearnerCourses.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const denied = await videoService.getVideoPlayUrlByVideoId(
      'vid-1',
      'stranger',
      'instructor',
    );
    expect(denied).toBeNull();
    expect(generateSignedStreamUrl).not.toHaveBeenCalled();

    LearnerCourses.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ courses: [{ courseId: 'course-1' }] }),
    });
    const allowed = await videoService.getVideoPlayUrlByVideoId(
      'vid-1',
      'learner-1',
      'learner',
    );
    expect(allowed).toEqual({ playbackUrl: 'https://signed.example/play.m3u8' });
    expect(generateSignedStreamUrl).toHaveBeenCalled();
  });
});
