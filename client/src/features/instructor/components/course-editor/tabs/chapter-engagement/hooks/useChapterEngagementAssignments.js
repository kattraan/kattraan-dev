import { useEffect, useMemo, useState } from "react";

const useChapterEngagementAssignments = ({
  courseDetails,
  assignmentSearch,
  sectionFilter,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedRows, setSelectedRows] = useState({});

  const sectionsWithVideos = useMemo(() => {
    const grouped = [];
    (courseDetails?.sections || []).forEach((section) => {
      const videos = [];
      (section.chapters || []).forEach((chapter) => {
        (chapter.contents || [])
          .filter((c) => c.type === "video")
          .forEach((video) => {
            videos.push({
              sectionId: section._id || section.id,
              sectionTitle: section.title,
              chapterId: chapter._id || chapter.id,
              chapterTitle: chapter.title,
              contentId: video._id || video.id,
              videoTitle: chapter.title || "Untitled chapter",
              engagementTemplateId:
                video.engagementTemplateId ||
                video.metadata?.engagementTemplateId ||
                "",
              raw: video,
            });
          });
      });
      if (videos.length > 0) {
        grouped.push({
          sectionId: section._id || section.id,
          sectionTitle: section.title || "Untitled section",
          videos,
        });
      }
    });
    return grouped;
  }, [courseDetails?.sections]);

  const sectionOptions = useMemo(
    () =>
      sectionsWithVideos.map((section) => ({
        id: section.sectionId,
        title: section.sectionTitle,
      })),
    [sectionsWithVideos],
  );

  const filteredSectionsWithVideos = useMemo(() => {
    const query = assignmentSearch.trim().toLowerCase();
    return sectionsWithVideos
      .filter((section) =>
        sectionFilter === "all" ? true : section.sectionId === sectionFilter,
      )
      .map((section) => {
        if (!query) return section;
        const filteredVideos = section.videos.filter((row) =>
          `${row.chapterTitle} ${row.sectionTitle}`
            .toLowerCase()
            .includes(query),
        );
        return { ...section, videos: filteredVideos };
      })
      .filter((section) => section.videos.length > 0);
  }, [sectionsWithVideos, sectionFilter, assignmentSearch]);

  const totalLessonRows = useMemo(
    () => sectionsWithVideos.reduce((sum, section) => sum + section.videos.length, 0),
    [sectionsWithVideos],
  );

  const assignedLessonRows = useMemo(
    () =>
      sectionsWithVideos.reduce(
        (sum, section) =>
          sum +
          section.videos.filter((row) => Boolean(row.engagementTemplateId)).length,
        0,
      ),
    [sectionsWithVideos],
  );

  const selectedCount = useMemo(
    () => Object.values(selectedRows).filter(Boolean).length,
    [selectedRows],
  );

  useEffect(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      sectionsWithVideos.forEach((section) => {
        if (next[section.sectionId] == null) next[section.sectionId] = true;
      });
      return next;
    });
  }, [sectionsWithVideos]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleRowSelection = (contentId) => {
    setSelectedRows((prev) => ({ ...prev, [contentId]: !prev[contentId] }));
  };

  const toggleSectionSelection = (section, checked) => {
    setSelectedRows((prev) => {
      const next = { ...prev };
      section.videos.forEach((row) => {
        next[row.contentId] = checked;
      });
      return next;
    });
  };

  const getSectionSelectionStats = (section) => {
    const total = section.videos.length;
    const selected = section.videos.filter((row) => selectedRows[row.contentId])
      .length;
    return { total, selected, allSelected: total > 0 && selected === total };
  };

  return {
    sectionsWithVideos,
    sectionOptions,
    filteredSectionsWithVideos,
    totalLessonRows,
    assignedLessonRows,
    expandedSections,
    selectedRows,
    setSelectedRows,
    selectedCount,
    toggleSection,
    toggleRowSelection,
    toggleSectionSelection,
    getSectionSelectionStats,
  };
};

export default useChapterEngagementAssignments;
