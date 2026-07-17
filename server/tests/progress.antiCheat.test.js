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

const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const {
  saveProgress,
  deriveWatchedPercentage,
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

  it('derives percentage only from currentTime/duration (never client %)', () => {
    // Client could claim 100%; server uses position math only.
    const derived = deriveWatchedPercentage(10, 100);
    expect(derived.percentage).toBe(10);
  });

  it('does not mark complete below threshold even if client would claim done', async () => {
    CourseProgress.findOne.mockResolvedValue(null);

    const entry = await saveProgress('user-1', {
      courseId: 'course-1',
      chapterId: 'ch-1',
      currentTime: COMPLETION_THRESHOLD - 1,
      duration: 100,
    });

    expect(entry.completed).toBe(false);
    expect(entry.watchedPercentage).toBe(COMPLETION_THRESHOLD - 1);
  });

  it('marks complete at threshold from playback position', async () => {
    CourseProgress.findOne.mockResolvedValue(null);

    const entry = await saveProgress('user-1', {
      courseId: 'course-1',
      chapterId: 'ch-1',
      currentTime: COMPLETION_THRESHOLD,
      duration: 100,
    });

    expect(entry.completed).toBe(true);
    expect(entry.watchedPercentage).toBe(COMPLETION_THRESHOLD);
  });

  it('does not regress completion on early rewind', async () => {
    const existing = {
      chapterProgress: [
        {
          chapterId: 'ch-1',
          currentTime: 95,
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
