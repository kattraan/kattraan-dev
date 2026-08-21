const {
  TRENDING_MAX,
  POPULAR_MAX,
  getFeaturedDoc,
  loadPublishedByOrderedIds,
} = require("../../helpers/homepageFeatured");

async function getPublicHomepageFeatured(req, res) {
  try {
    const doc = await getFeaturedDoc();
    const trendingCourseIds = (doc.trendingCourseIds || []).map((id) => id.toString());
    const popularCourseIds = (doc.popularCourseIds || []).map((id) => id.toString());
    const [trending, popular] = await Promise.all([
      loadPublishedByOrderedIds(trendingCourseIds),
      loadPublishedByOrderedIds(popularCourseIds),
    ]);
    res.set('Cache-Control', 'no-store');
    return res.json({
      success: true,
      data: {
        trending,
        popular,
        trendingManual: trending.length > 0,
        popularManual: popular.length > 0,
        limits: { trending: TRENDING_MAX, popular: POPULAR_MAX },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getPublicHomepageFeatured };
