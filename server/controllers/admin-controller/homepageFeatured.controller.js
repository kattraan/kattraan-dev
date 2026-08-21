const Course = require("../../models/Course");
const { signStorageCdnUrl } = require("../../helpers/bunnyToken");
const {
  TRENDING_MAX,
  POPULAR_MAX,
  getFeaturedDoc,
  saveFeaturedIds,
  sanitizePublishedIds,
  loadPublishedByOrderedIds,
} = require("../../helpers/homepageFeatured");

async function getPublishedCourses(req, res) {
  try {
    const courses = await Course.find({
      status: "published",
      isDeleted: { $ne: true },
    })
      .select("title category thumbnail status updatedAt createdBy learners")
      .populate("createdBy", "name userName")
      .sort({ updatedAt: -1 })
      .lean();
    const signed = courses.map((c) => ({
      ...c,
      thumbnail: c.thumbnail ? signStorageCdnUrl(c.thumbnail, 60 * 60 * 24 * 7) : c.thumbnail,
    }));
    return res.json({ success: true, data: signed });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getHomepageFeatured(req, res) {
  try {
    const doc = await getFeaturedDoc();
    const trendingCourseIds = (doc.trendingCourseIds || []).map((id) => id.toString());
    const popularCourseIds = (doc.popularCourseIds || []).map((id) => id.toString());
    const [trending, popular] = await Promise.all([
      loadPublishedByOrderedIds(trendingCourseIds),
      loadPublishedByOrderedIds(popularCourseIds),
    ]);
    return res.json({
      success: true,
      data: {
        trendingCourseIds: trending.map((c) => c._id.toString()),
        popularCourseIds: popular.map((c) => c._id.toString()),
        trending,
        popular,
        limits: { trending: TRENDING_MAX, popular: POPULAR_MAX },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateHomepageFeatured(req, res) {
  try {
    const trendingCourseIds = await sanitizePublishedIds(req.body?.trendingCourseIds, TRENDING_MAX);
    const popularCourseIds = await sanitizePublishedIds(req.body?.popularCourseIds, POPULAR_MAX);
    await saveFeaturedIds({
      trendingCourseIds,
      popularCourseIds,
      updatedBy: req.user._id,
    });

    const [trending, popular] = await Promise.all([
      loadPublishedByOrderedIds(trendingCourseIds),
      loadPublishedByOrderedIds(popularCourseIds),
    ]);

    return res.json({
      success: true,
      message: "Homepage course placements saved.",
      data: {
        trendingCourseIds,
        popularCourseIds,
        trending,
        popular,
        limits: { trending: TRENDING_MAX, popular: POPULAR_MAX },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getPublishedCourses,
  getHomepageFeatured,
  updateHomepageFeatured,
};
