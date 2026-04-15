import { useState } from "react";
import courseService from "@/features/courses/services/courseService";
import { DEFAULT_LABELS, EMOJIS } from "../constants";

const useChapterEngagementAssignmentActions = ({
  templates,
  sectionsWithVideos,
  selectedRows,
  setSelectedRows,
  loadCourse,
  toast,
  templateQueryByRow,
  bulkTemplateId,
}) => {
  const [updatingVideoId, setUpdatingVideoId] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  const getTemplateNameById = (templateId) => {
    if (!templateId) return "";
    const found = templates.find((tpl) => String(tpl._id) === String(templateId));
    return found?.question || found?.name || "";
  };

  const getTemplateByName = (name) => {
    const needle = String(name || "").trim().toLowerCase();
    if (!needle) return null;
    return (
      templates.find(
        (tpl) =>
          String(tpl.question || tpl.name || "")
            .trim()
            .toLowerCase() === needle,
      ) || null
    );
  };

  const getFilteredTemplates = (row) => {
    const query = (
      templateQueryByRow[row.contentId] ||
      getTemplateNameById(row.engagementTemplateId) ||
      ""
    )
      .trim()
      .toLowerCase();
    if (!query) return templates;
    return templates.filter((tpl) =>
      String(tpl.question || tpl.name || "").toLowerCase().includes(query),
    );
  };

  const updateVideoTemplate = async (
    row,
    templateId,
    { withToast = false, withReload = false } = {},
  ) => {
    if (!row.contentId || !row.chapterId) return;
    setUpdatingVideoId(row.contentId);
    try {
      const selectedTemplate = templates.find(
        (tpl) => String(tpl._id) === String(templateId),
      );
      const templateLabels = selectedTemplate?.labels || DEFAULT_LABELS;
      await courseService.updateContent("video", row.contentId, {
        ...row.raw,
        chapter: row.chapterId,
        engagementTemplateId: templateId || "",
        metadata: {
          ...(row.raw.metadata || {}),
          engagementTemplateId: templateId || "",
          engagementTemplateName:
            selectedTemplate?.question || selectedTemplate?.name || "",
          engagementTemplateLabels: templateId ? templateLabels : [],
          engagementTemplateEmojis: templateId
            ? selectedTemplate?.emojis || EMOJIS
            : [],
        },
      });
      if (withToast) {
        toast.success("Updated", "Chapter engagement template assigned.");
      }
      if (withReload) {
        await loadCourse();
      }
      return true;
    } catch (err) {
      if (withToast) {
        toast.error(
          "Update failed",
          err?.apiMessageForToast?.message || "Could not assign template.",
        );
      }
      return false;
    } finally {
      setUpdatingVideoId("");
    }
  };

  const assignTemplateToVideo = async (row, templateId) => {
    await updateVideoTemplate(row, templateId, {
      withToast: true,
      withReload: true,
    });
  };

  const applyBulkTemplate = async () => {
    if (!bulkTemplateId) {
      toast.error("Select template", "Choose a template for bulk assignment.");
      return;
    }
    const targetRows = sectionsWithVideos
      .flatMap((section) => section.videos)
      .filter((row) => selectedRows[row.contentId]);
    if (targetRows.length === 0) {
      toast.error("No chapters selected", "Select at least one chapter first.");
      return;
    }

    setIsBulkAssigning(true);
    try {
      const results = await Promise.all(
        targetRows.map((row) =>
          updateVideoTemplate(row, bulkTemplateId, {
            withToast: false,
            withReload: false,
          }),
        ),
      );
      const successCount = results.filter(Boolean).length;
      await loadCourse();
      toast.success(
        "Bulk assignment complete",
        `Assigned template to ${successCount}/${targetRows.length} chapters.`,
      );
      setSelectedRows({});
    } catch {
      toast.error("Bulk assignment failed", "Please try again.");
    } finally {
      setIsBulkAssigning(false);
    }
  };

  return {
    updatingVideoId,
    isBulkAssigning,
    getTemplateByName,
    getTemplateNameById,
    getFilteredTemplates,
    assignTemplateToVideo,
    applyBulkTemplate,
  };
};

export default useChapterEngagementAssignmentActions;
