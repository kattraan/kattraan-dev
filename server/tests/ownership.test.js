jest.mock('../models/Course', () => ({
  findOne: jest.fn(),
}));

const Course = require('../models/Course');
const { ensureUserCanEditCourse } = require('../middleware/courseOwnership');

describe('course ownership', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function courseQuery(result) {
    Course.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(result),
    });
  }

  it('allows the course owner', async () => {
    courseQuery({ createdBy: 'owner-1' });
    const result = await ensureUserCanEditCourse(
      { user: { _id: 'owner-1', roleNames: ['instructor'] } },
      'course-1',
    );
    expect(result).toEqual({ ok: true });
  });

  it('allows admins on other instructors courses', async () => {
    courseQuery({ createdBy: 'owner-1' });
    const result = await ensureUserCanEditCourse(
      { user: { _id: 'admin-1', roleNames: ['admin'] } },
      'course-1',
    );
    expect(result).toEqual({ ok: true });
  });

  it('forbids non-owner instructors', async () => {
    courseQuery({ createdBy: 'owner-1' });
    const result = await ensureUserCanEditCourse(
      { user: { _id: 'other-1', roleNames: ['instructor'] } },
      'course-1',
    );
    expect(result).toEqual({ forbidden: true });
  });

  it('returns notFound for missing courses', async () => {
    courseQuery(null);
    const result = await ensureUserCanEditCourse(
      { user: { _id: 'owner-1', roleNames: ['instructor'] } },
      'missing',
    );
    expect(result).toEqual({ notFound: true });
  });
});
