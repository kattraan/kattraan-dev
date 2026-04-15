const InstructorEngagementTemplate = require("../../models/InstructorEngagementTemplate");
const Course = require("../../models/Course");
const Section = require("../../models/Section");
const Chapter = require("../../models/Chapter");
const Content = require("../../models/Content");
const {
  DEFAULT_TEMPLATE_EMOJIS,
  CHAPTER_ENGAGEMENT_DEFAULT_TEMPLATES,
} = require("../../config/chapterEngagementDefaultTemplates");

function normalizeLabels(input) {
  const labels = Array.isArray(input) ? input : [];
  const fallbackLabels =
    CHAPTER_ENGAGEMENT_DEFAULT_TEMPLATES[0]?.labels || [
      "Totally lost",
      "Very confusing",
      "Partly clear",
      "Mostly clear",
      "Crystal clear",
    ];
  const normalized = fallbackLabels.map((fallback, idx) => String(labels[idx] || fallback).trim());
  return normalized;
}

function normalizeEmojis(input) {
  const emojis = Array.isArray(input) ? input : [];
  return DEFAULT_TEMPLATE_EMOJIS.map((_, idx) => String(emojis[idx] || "").trim());
}

function hasAllEmojiIcons(input) {
  return Array.isArray(input) && input.length === 5 && input.every((e) => String(e || "").trim());
}

async function ensureDefaultTemplatesForInstructor(userId) {
  await Promise.all(
    CHAPTER_ENGAGEMENT_DEFAULT_TEMPLATES.map((tpl) =>
      InstructorEngagementTemplate.updateOne(
        { createdBy: userId, defaultKey: tpl.defaultKey },
        {
          $setOnInsert: {
            createdBy: userId,
            defaultKey: tpl.defaultKey,
            isDefault: true,
            isLocked: true,
            question: tpl.question,
            name: tpl.question,
            description: "System default template",
            labels: tpl.labels,
            emojis: tpl.emojis,
          },
        },
        { upsert: true },
      ),
    ),
  );
}

async function listTemplates(req, res) {
  try {
    await ensureDefaultTemplatesForInstructor(req.user._id);
    const templates = await InstructorEngagementTemplate.find({
      createdBy: req.user._id,
    })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: templates });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createTemplate(req, res) {
  try {
    await ensureDefaultTemplatesForInstructor(req.user._id);
    const { name, question, description = "", labels, emojis } = req.body || {};
    const resolvedQuestion = String(question || name || "").trim();
    if (!resolvedQuestion) {
      return res
        .status(400)
        .json({ success: false, message: "Template question is required" });
    }
    const normalizedEmojis = normalizeEmojis(emojis);
    if (!hasAllEmojiIcons(normalizedEmojis)) {
      return res.status(400).json({
        success: false,
        message: "All 5 icon fields are required",
      });
    }
    const template = await InstructorEngagementTemplate.create({
      createdBy: req.user._id,
      question: resolvedQuestion,
      name: resolvedQuestion,
      description: String(description || "").trim(),
      labels: normalizeLabels(labels),
      emojis: normalizedEmojis,
      isDefault: false,
      isLocked: false,
      defaultKey: "",
    });
    return res.status(201).json({ success: true, data: template });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    await ensureDefaultTemplatesForInstructor(req.user._id);
    const existing = await InstructorEngagementTemplate.findOne({
      _id: id,
      createdBy: req.user._id,
    }).lean();
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    if (existing.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Default templates cannot be edited",
      });
    }
    const { name, question, description = "", labels, emojis } = req.body || {};
    const resolvedQuestion = String(question || name || "").trim();
    if (!resolvedQuestion) {
      return res
        .status(400)
        .json({ success: false, message: "Template question is required" });
    }
    const normalizedEmojis = normalizeEmojis(emojis);
    if (!hasAllEmojiIcons(normalizedEmojis)) {
      return res.status(400).json({
        success: false,
        message: "All 5 icon fields are required",
      });
    }
    const updated = await InstructorEngagementTemplate.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      {
        $set: {
          question: resolvedQuestion,
          name: resolvedQuestion,
          description: String(description || "").trim(),
          labels: normalizeLabels(labels),
          emojis: normalizedEmojis,
        },
      },
      { new: true },
    );
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    await ensureDefaultTemplatesForInstructor(req.user._id);
    const existing = await InstructorEngagementTemplate.findOne({
      _id: id,
      createdBy: req.user._id,
    }).lean();
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    if (existing.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Default templates cannot be deleted",
      });
    }
    const deleted = await InstructorEngagementTemplate.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });
    return res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * One-time/backfill utility:
 * Syncs existing video metadata (name/labels/emojis) from assigned template IDs.
 * Body: { courseId?: string }
 */
async function syncVideoTemplateMetadata(req, res) {
  try {
    await ensureDefaultTemplatesForInstructor(req.user._id);
    const { courseId } = req.body || {};

    const courseFilter = {
      createdBy: req.user._id,
      isDeleted: { $ne: true },
    };
    if (courseId) courseFilter._id = courseId;

    const courses = await Course.find(courseFilter).select("_id").lean();
    if (!courses.length) {
      return res.json({
        success: true,
        data: {
          coursesScanned: 0,
          videosScanned: 0,
          videosUpdated: 0,
          skippedWithoutTemplate: 0,
          skippedMissingTemplate: 0,
        },
      });
    }

    const courseIds = courses.map((c) => c._id);
    const sections = await Section.find({
      course: { $in: courseIds },
      isDeleted: { $ne: true },
    })
      .select("_id")
      .lean();
    const sectionIds = sections.map((s) => s._id);

    if (!sectionIds.length) {
      return res.json({
        success: true,
        data: {
          coursesScanned: courses.length,
          videosScanned: 0,
          videosUpdated: 0,
          skippedWithoutTemplate: 0,
          skippedMissingTemplate: 0,
        },
      });
    }

    const chapters = await Chapter.find({
      section: { $in: sectionIds },
      isDeleted: { $ne: true },
    })
      .select("_id contents")
      .lean();

    const contentIds = chapters.flatMap((ch) => ch.contents || []);
    if (!contentIds.length) {
      return res.json({
        success: true,
        data: {
          coursesScanned: courses.length,
          videosScanned: 0,
          videosUpdated: 0,
          skippedWithoutTemplate: 0,
          skippedMissingTemplate: 0,
        },
      });
    }

    const videos = await Content.find({
      _id: { $in: contentIds },
      type: "video",
      isDeleted: { $ne: true },
    }).lean();

    const templateDocs = await InstructorEngagementTemplate.find({
      createdBy: req.user._id,
    })
      .select("_id name question labels emojis")
      .lean();
    const templateMap = new Map(
      templateDocs.map((tpl) => [String(tpl._id), tpl]),
    );

    let videosUpdated = 0;
    let skippedWithoutTemplate = 0;
    let skippedMissingTemplate = 0;

    for (const video of videos) {
      const templateId =
        video.engagementTemplateId || video.metadata?.engagementTemplateId || "";
      if (!templateId) {
        skippedWithoutTemplate += 1;
        continue;
      }

      const tpl = templateMap.get(String(templateId));
      if (!tpl) {
        skippedMissingTemplate += 1;
        continue;
      }

      const nextMetadata = {
        ...(video.metadata || {}),
        engagementTemplateId: String(tpl._id),
        engagementTemplateName: tpl.question || tpl.name || "",
        engagementTemplateLabels: Array.isArray(tpl.labels)
          ? tpl.labels
          : [],
        engagementTemplateEmojis: Array.isArray(tpl.emojis)
          ? tpl.emojis
          : [],
      };

      const needsUpdate =
        String(video.engagementTemplateId || "") !== String(tpl._id) ||
        String(video.metadata?.engagementTemplateName || "") !==
          String(nextMetadata.engagementTemplateName || "") ||
        JSON.stringify(video.metadata?.engagementTemplateLabels || []) !==
          JSON.stringify(nextMetadata.engagementTemplateLabels || []) ||
        JSON.stringify(video.metadata?.engagementTemplateEmojis || []) !==
          JSON.stringify(nextMetadata.engagementTemplateEmojis || []);

      if (!needsUpdate) continue;

      await Content.updateOne(
        { _id: video._id, type: "video" },
        {
          $set: {
            engagementTemplateId: String(tpl._id),
            metadata: nextMetadata,
          },
        },
      );
      videosUpdated += 1;
    }

    return res.json({
      success: true,
      data: {
        coursesScanned: courses.length,
        videosScanned: videos.length,
        videosUpdated,
        skippedWithoutTemplate,
        skippedMissingTemplate,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  syncVideoTemplateMetadata,
};
