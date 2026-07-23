jest.mock('../models/CourseProgress', () => {
  const Mock = jest.fn().mockImplementation(function CourseProgress(doc) {
    Object.assign(this, doc);
    this.chapterProgress = doc.chapterProgress || [];
    this.save = jest.fn().mockResolvedValue(this);
  });
  Mock.findOne = jest.fn();
  return Mock;
});
jest.mock('../models/LearnerCourses', () => ({
  findOne: jest.fn(),
}));
jest.mock('../models/Course', () => ({
  findById: jest.fn(),
}));
jest.mock('../models/Chapter', () => ({
  countDocuments: jest.fn(),
  exists: jest.fn(),
}));
jest.mock('../services/certificate.service', () => ({
  issueCertificate: jest.fn().mockResolvedValue(undefined),
}));

const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const {
  saveProgress,
  deriveWatchedPercentage,
  mergeMaxWatchedTime,
  COMPLETION_THRESHOLD,
} = require('../services/progress.service');

describe('progress anti-cheat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Course.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ sections: ['sec-1'] }),
    });
    Chapter.exists.mockResolvedValue(true);
    Chapter.countDocuments.mockResolvedValue(2);
  });

  it('derives percentage only from maxWatchedTime/duration (never client %)', () => {
    const derived = deriveWatchedPercentage(10, 100);
    expect(derived.percentage).toBe(10);
  });

  it('does not mark complete when learner scrubs to threshold without watching', async () => {
    CourseProgress.findOne.mockResolvedValue(null);

    const entry = await saveProgress('user-1', {
      courseId: 'course-1',
      chapterId: 'ch-1',
      currentTime: COMPLETION_THRESHOLD,
      duration: 100,
    });

    expect(entry.completed).toBe(false);
    expect(entry.maxWatchedTime).toBeLessThan(COMPLETION_THRESHOLD);
  });

  it('marks complete at threshold from legitimate incremental watching', async () => {
    const now = new Date();
    const existing = {
      chapterProgress: [
        {
          chapterId: 'ch-1',
          currentTime: 85,
          maxWatchedTime: 85,
          duration: 100,
          watchedPercentage: 85,
          completed: false,
          lastWatchedAt: new Date(now.getTime() - 10000),
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    CourseProgress.findOne.mockResolvedValue(existing);

    const entry = await saveProgress('user-1', {
      courseId: 'course-1',
      chapterId: 'ch-1',
      currentTime: 90,
      duration: 100,
    });

    expect(entry.completed).toBe(true);
    expect(entry.maxWatchedTime).toBeGreaterThanOrEqual(COMPLETION_THRESHOLD);
  });

  it('does not regress completion on early rewind', async () => {
    const existing = {
      chapterProgress: [
        {
          chapterId: 'ch-1',
          currentTime: 95,
          maxWatchedTime: 95,
          duration: 100,
          watchedPercentage: 95,
          completed: true,
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    CourseProgress.findOne.mockResolvedValue(existing);

    const entry = await saveProgress('user-1', {
      courseId: 'course-1',
      chapterId: 'ch-1',
      currentTime: 5,
      duration: 100,
    });

    expect(entry.completed).toBe(true);
    expect(entry.watchedPercentage).toBeGreaterThanOrEqual(100);
  });

  it('rejects forward seek jumps in mergeMaxWatchedTime', () => {
    const prev = {
      maxWatchedTime: 20,
      lastWatchedAt: new Date(Date.now() - 2000),
    };
    const merged = mergeMaxWatchedTime(prev, 90, 100, new Date());
    expect(merged).toBe(20);
  });

  it('rejects chapters that do not belong to the course', async () => {
    Chapter.exists.mockResolvedValue(false);

    await expect(
      saveProgress('user-1', {
        courseId: 'course-1',
        chapterId: 'foreign-ch',
        currentTime: 100,
        duration: 100,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
