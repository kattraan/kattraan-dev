const { cloneDocFields } = require('../controllers/course-controller/course.controller');

describe('cloneDocFields', () => {
  it('strips identity and soft-delete metadata for an independent clone', () => {
    const cloned = cloneDocFields({
      _id: 'orig-id',
      id: 'orig-id',
      __v: 3,
      title: 'Original',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      deletedAt: new Date('2024-01-03'),
      deletedBy: 'user-x',
      isDeleted: true,
      status: 'published',
    });

    expect(cloned._id).toBeUndefined();
    expect(cloned.id).toBeUndefined();
    expect(cloned.__v).toBeUndefined();
    expect(cloned.createdAt).toBeUndefined();
    expect(cloned.updatedAt).toBeUndefined();
    expect(cloned.deletedAt).toBeUndefined();
    expect(cloned.deletedBy).toBeUndefined();
    expect(cloned.isDeleted).toBe(false);
    expect(cloned.title).toBe('Original');
    expect(cloned.status).toBe('published');
  });

  it('supports mongoose-like toObject documents', () => {
    const doc = {
      toObject() {
        return { _id: 'x', title: 'From toObject', __v: 1 };
      },
    };
    const cloned = cloneDocFields(doc);
    expect(cloned._id).toBeUndefined();
    expect(cloned.title).toBe('From toObject');
  });
});
