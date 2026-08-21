const mongoose = require("mongoose");
const Course = require("../models/Course");
const HomepageFeatured = require("../models/HomepageFeatured");
const LearnerCourses = require("../models/LearnerCourses");
const { signStorageCdnUrl } = require("./bunnyToken");

const STORAGE_THUMB_TTL_SEC = 60 * 60 * 24 * 7;
const TRENDING_MAX = 4;
const POPULAR_MAX = 8;

function toIdString(id) {
  if (!id) return "";
  if (typeof id === "string") return id;
  return id.toString();
}

async function getFeaturedDoc() {
  return HomepageFeatured.findOneAndUpdate(
    { key: HomepageFeatured.SINGLETON_KEY },
    { $setOnInsert: { key: HomepageFeatured.SINGLETON_KEY, trendingCourseIds: [], popularCourseIds: [] } },
    { upsert: true, new: true }
  );
}

async function saveFeaturedIds({ trendingCourseIds, popularCourseIds, updatedBy }) {
  const oid = (id) => new mongoose.Types.ObjectId(id);
  return HomepageFeatured.findOneAndUpdate(
    { key: HomepageFeatured.SINGLETON_KEY },
    {
      $set: {
        trendingCourseIds: trendingCourseIds.map(oid),
        popularCourseIds: popularCourseIds.map(oid),
        updatedBy: updatedBy || undefined,
      },
      $setOnInsert: { key: HomepageFeatured.SINGLETON_KEY },
    },
    { upsert: true, new: true }
  );
}

async function sanitizePublishedIds(ids, max) {
  const unique = [];
  const seen = new Set();
  for (const raw of Array.isArray(ids) ? ids : []) {
    const str = toIdString(raw);
    if (!mongoose.Types.ObjectId.isValid(str) || seen.has(str)) continue;
    seen.add(str);
    unique.push(str);
    if (unique.length >= max) break;
  }
  if (!unique.length) return [];

  const published = await Course.find({
    _id: { $in: unique },
    status: "published",
    isDeleted: { $ne: true },
  })
    .select("_id")
    .lean();
  const allowed = new Set(published.map((c) => c._id.toString()));
  return unique.filter((id) => allowed.has(id));
}

async function enrichLiteCourses(courses) {
  const courseIds = courses.map((c) => c._id);
  let countByCourseId = {};
  if (courseIds.length) {
    const enrollmentCounts = await LearnerCourses.aggregate([
      { $unwind: "$courses" },
      { $match: { "courses.courseId": { $in: courseIds.map((id) => id.toString()) } } },
      { $group: { _id: "$courses.courseId", count: { $sum: 1 } } },
    ]);
    countByCourseId = Object.fromEntries(enrollmentCounts.map((r) => [r._id, r.count]));
  }

  return courses.map((c) => {
    const idStr = c._id.toString();
    const learners = countByCourseId[idStr] ?? c.learners ?? 0;
    return {
      ...c,
      learners,
      durationMinutes: c.duration != null && c.duration >= 0 ? c.duration : 0,
      enrolledCount: learners,
      thumbnail: c.thumbnail ? signStorageCdnUrl(c.thumbnail, STORAGE_THUMB_TTL_SEC) : c.thumbnail,
    };
  });
}

async function loadPublishedByOrderedIds(ids) {
  if (!ids.length) return [];
  const courses = await Course.find({
    _id: { $in: ids },
    status: "published",
    isDeleted: { $ne: true },
  })
    .select("title category description thumbnail image duration learners sections averageRating status createdAt updatedAt createdBy")
    .populate("createdBy", "name userName")
    .lean();
  const map = new Map(courses.map((c) => [c._id.toString(), c]));
  const ordered = ids.map((id) => map.get(toIdString(id))).filter(Boolean);
  return enrichLiteCourses(ordered);
}

module.exports = {
  TRENDING_MAX,
  POPULAR_MAX,
  getFeaturedDoc,
  saveFeaturedIds,
  sanitizePublishedIds,
  loadPublishedByOrderedIds,
};
