jest.mock('../models/Course', () => ({
  findById: jest.fn(),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
}));
jest.mock('../models/LearnerCourses', () => ({
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  findOne: jest.fn(),
}));
jest.mock('../models/Chapter', () => ({
  countDocuments: jest.fn().mockResolvedValue(0),
}));

const Course = require('../models/Course');
const LearnerCourses = require('../models/LearnerCourses');
const { enrollCourse } = require('../controllers/learner-controller/learnerCoursesController');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function mockFindOneLean(doc) {
  LearnerCourses.findOne.mockReturnValue({
    lean: jest.fn().mockResolvedValue(doc),
  });
}

describe('enrollCourse paid-course gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LearnerCourses.updateOne
      .mockResolvedValueOnce({ modifiedCount: 0, upsertedCount: 1 })
      .mockResolvedValueOnce({ modifiedCount: 1 });
    mockFindOneLean({ userId: 'user-1', courses: [{ courseId: 'course-free' }] });
    Course.updateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  it('rejects enrollment for paid courses', async () => {
    Course.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        _id: 'course-paid',
        price: 499,
        status: 'published',
        isDeleted: false,
        sections: [],
      }),
    });

    const req = { user: { _id: 'user-1' }, body: { courseId: 'course-paid' } };
    const res = mockRes();
    await enrollCourse(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/paid course/i);
    expect(LearnerCourses.updateOne).not.toHaveBeenCalled();
  });

  it('allows enrollment for free published courses', async () => {
    Course.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        _id: 'course-free',
        price: 0,
        status: 'published',
        isDeleted: false,
        sections: [],
        title: 'Free Course',
        createdBy: { userName: 'Instructor' },
      }),
    });

    const req = { user: { _id: 'user-1' }, body: { courseId: 'course-free' } };
    const res = mockRes();
    await enrollCourse(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(LearnerCourses.updateOne).toHaveBeenCalledTimes(2);
    expect(Course.updateOne).toHaveBeenCalledWith(
      { _id: 'course-free' },
      { $inc: { learners: 1 } },
    );
  });

  it('does not inflate learners when already enrolled (concurrent-safe)', async () => {
    Course.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        _id: 'course-free',
        price: 0,
        status: 'published',
        isDeleted: false,
        sections: [],
        title: 'Free Course',
        createdBy: { userName: 'Instructor' },
      }),
    });
    LearnerCourses.updateOne.mockReset();
    LearnerCourses.updateOne
      .mockResolvedValueOnce({ modifiedCount: 0, upsertedCount: 0 })
      .mockResolvedValueOnce({ modifiedCount: 0 });
    mockFindOneLean({
      userId: 'user-1',
      courses: [{ courseId: 'course-free' }],
    });

    const req = { user: { _id: 'user-1' }, body: { courseId: 'course-free' } };
    const res = mockRes();
    await enrollCourse(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/already enrolled/i);
    expect(Course.updateOne).not.toHaveBeenCalled();
  });
});
