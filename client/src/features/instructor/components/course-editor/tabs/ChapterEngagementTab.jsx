import React, { useMemo, useState } from "react";
import { Plus, Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Card, Button, ContentCard } from "@/components/ui";
import { DEFAULT_LABELS, EMOJIS } from "./chapter-engagement/constants";
import TemplateCard from "./chapter-engagement/components/TemplateCard";
import TemplateModal from "./chapter-engagement/components/TemplateModal";
import useChapterEngagementAssignments from "./chapter-engagement/hooks/useChapterEngagementAssignments";
import useChapterEngagementTemplates from "./chapter-engagement/hooks/useChapterEngagementTemplates";
import useChapterEngagementAssignmentActions from "./chapter-engagement/hooks/useChapterEngagementAssignmentActions";

const ChapterEngagementTab = ({
  courseDetails,
  loadCourse,
  engagementTemplates = [],
  setEngagementTemplates,
}) => {
  const [activeSubTab, setActiveSubTab] = useState("assign");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [openTemplatePickerId, setOpenTemplatePickerId] = useState(null);
  const [templateQueryByRow, setTemplateQueryByRow] = useState({});
  const [bulkTemplateId, setBulkTemplateId] = useState("");
  const [bulkTemplateQuery, setBulkTemplateQuery] = useState("");

  const templates = engagementTemplates || [];
  const defaultTemplates = useMemo(
    () => templates.filter((template) => template.isDefault || template.isLocked),
    [templates],
  );
  const customTemplates = useMemo(
    () => templates.filter((template) => !(template.isDefault || template.isLocked)),
    [templates],
  );
  const {
    toast,
    isModalOpen,
    setIsModalOpen,
    editingTemplateId,
    isSavingTemplate,
    form,
    setForm,
    openCreateModal,
    openEditModal,
    saveTemplate,
    removeTemplate,
  } = useChapterEngagementTemplates({ setEngagementTemplates });
  const {
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
  } = useChapterEngagementAssignments({
    courseDetails,
    assignmentSearch,
    sectionFilter,
  });
  const {
    updatingVideoId,
    isBulkAssigning,
    getTemplateByName,
    getTemplateNameById,
    getFilteredTemplates,
    assignTemplateToVideo,
    applyBulkTemplate,
  } = useChapterEngagementAssignmentActions({
    templates,
    sectionsWithVideos,
    selectedRows,
    setSelectedRows,
    loadCourse,
    toast,
    templateQueryByRow,
    bulkTemplateId,
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500">
      <ContentCard
        title="Chapter Engagement"
        subtitle="Create micro-feedback templates and assign them to specific videos."
        variant="flat"
        className="flex-1 min-w-0"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-white/5 w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab("assign")}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                activeSubTab === "assign"
                  ? "bg-white dark:bg-[#2D2D2D] text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-white/50"
              }`}
            >
              Assign Templates To Videos
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("templates")}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                activeSubTab === "templates"
                  ? "bg-white dark:bg-[#2D2D2D] text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-white/50"
              }`}
            >
              Templates
            </button>
          </div>

          {activeSubTab === "templates" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Templates</h3>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                  <Plus size={16} />
                  Create Template
                </Button>
              </div>
              {templates.length === 0 ? (
                <Card className="p-8 text-center border border-dashed border-gray-300 dark:border-white/10">
                  <p className="text-sm text-gray-500 dark:text-white/50">
                    No templates yet. Create your first chapter engagement template.
                  </p>
                </Card>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 mb-3">
                      Default templates
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {defaultTemplates.map((template) => (
                        <TemplateCard
                          key={template._id}
                          template={template}
                          showActions={false}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 mb-3">
                      Custom templates
                    </h4>
                    {customTemplates.length === 0 ? (
                      <Card className="p-6 text-center border border-dashed border-gray-300 dark:border-white/10">
                        <p className="text-sm text-gray-500 dark:text-white/50">
                          No custom templates yet.
                        </p>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        {customTemplates.map((template) => (
                          <TemplateCard
                            key={template._id}
                            template={template}
                            showActions
                            onEdit={openEditModal}
                            onDelete={removeTemplate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeSubTab === "assign" && (
            <div className="pt-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Assign Engagement Template
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                    Choose one template for each lesson. Learners will see it right after the lesson ends.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70">
                    Assigned {assignedLessonRows}/{totalLessonRows}
                  </span>
                </div>
              </div>

              <Card className="border border-gray-200 dark:border-white/10 p-3 mb-3 overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-2">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30"
                    />
                    <input
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                      placeholder="Search by chapter or section name"
                      className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#1b1b1b] pl-9 pr-3 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30"
                    />
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#1b1b1b] pl-9 pr-3 text-sm"
                    >
                      <option value="all">All sections</option>
                      {sectionOptions.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {selectedCount > 0 && (
                <Card className="relative z-[220] border border-gray-200 dark:border-white/10 p-3 mb-3 overflow-visible">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <div className="text-xs font-semibold text-gray-600 dark:text-white/60 min-w-[160px]">
                      Bulk assign ({selectedCount} selected)
                    </div>
                    <div className="relative flex-1">
                      <input
                        value={bulkTemplateQuery}
                        list="bulk-engagement-template-list"
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkTemplateQuery(value);
                          const matched = getTemplateByName(value);
                          setBulkTemplateId(matched ? matched._id : "");
                        }}
                        placeholder="Search template for selected chapters"
                        className="h-10 w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#1b1b1b] px-3 text-sm"
                      />
                      <datalist id="bulk-engagement-template-list">
                        {templates.map((template) => (
                          <option
                            key={template._id}
                            value={template.question || template.name}
                          />
                        ))}
                      </datalist>
                    </div>
                    <Button
                      onClick={applyBulkTemplate}
                      disabled={!bulkTemplateId || isBulkAssigning}
                      className="h-10"
                    >
                      {isBulkAssigning ? "Applying..." : "Apply to selected"}
                    </Button>
                  </div>
                </Card>
              )}

              <Card className="relative z-10 border border-gray-200 dark:border-white/10 overflow-visible">
                {sectionsWithVideos.length === 0 ? (
                  <div className="p-8 text-sm text-center text-gray-500 dark:text-white/50">
                    Add lessons in Curriculum to assign engagement templates.
                  </div>
                ) : filteredSectionsWithVideos.length === 0 ? (
                  <div className="p-8 text-sm text-center text-gray-500 dark:text-white/50">
                    No matching lessons found. Try a different search or section filter.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredSectionsWithVideos.map((section) => (
                      <div key={section.sectionId} className="p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <button
                            type="button"
                            onClick={() => toggleSection(section.sectionId)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"
                          >
                            {expandedSections[section.sectionId] ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            {section.sectionTitle}
                          </button>
                          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/60">
                            <input
                              type="checkbox"
                              checked={getSectionSelectionStats(section).allSelected}
                              onChange={(e) =>
                                toggleSectionSelection(section, e.target.checked)
                              }
                            />
                            Select all ({getSectionSelectionStats(section).selected}/
                            {getSectionSelectionStats(section).total})
                          </label>
                        </div>
                        {expandedSections[section.sectionId] && (
                          <div className="space-y-2">
                            {section.videos.map((row) => (
                              <div
                                key={row.contentId}
                                className="p-3 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                              >
                                <div className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5"
                                    checked={Boolean(selectedRows[row.contentId])}
                                    onChange={() => toggleRowSelection(row.contentId)}
                                  />
                                  <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                      {row.chapterTitle || "Untitled chapter"}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-white/40 mt-0.5">
                                      {row.engagementTemplateId
                                        ? "Template assigned"
                                        : "No template assigned"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="relative min-w-[260px]">
                                  <input
                                    value={
                                      openTemplatePickerId === row.contentId
                                        ? templateQueryByRow[row.contentId] ??
                                          getTemplateNameById(
                                            row.engagementTemplateId,
                                          )
                                        : getTemplateNameById(
                                            row.engagementTemplateId,
                                          )
                                    }
                                    onFocus={() => {
                                      setOpenTemplatePickerId(row.contentId);
                                      setTemplateQueryByRow((prev) => ({
                                        ...prev,
                                        [row.contentId]:
                                          prev[row.contentId] ??
                                          getTemplateNameById(
                                            row.engagementTemplateId,
                                          ),
                                      }));
                                    }}
                                    onChange={(e) =>
                                      setTemplateQueryByRow((prev) => ({
                                        ...prev,
                                        [row.contentId]: e.target.value,
                                      }))
                                    }
                                    onBlur={() => {
                                      setTimeout(() => {
                                        setOpenTemplatePickerId((prev) =>
                                          prev === row.contentId ? null : prev,
                                        );
                                      }, 120);
                                    }}
                                    disabled={
                                      updatingVideoId === row.contentId ||
                                      isBulkAssigning
                                    }
                                    placeholder="Assign a template"
                                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#1b1b1b] px-3 text-sm"
                                  />

                                  {openTemplatePickerId === row.contentId && (
                                    <div className="absolute z-[120] mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#171717] shadow-xl">
                                      <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          assignTemplateToVideo(row, "");
                                          setTemplateQueryByRow((prev) => ({
                                            ...prev,
                                            [row.contentId]: "",
                                          }));
                                          setOpenTemplatePickerId(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white/80"
                                      >
                                        No template
                                      </button>
                                      {getFilteredTemplates(row).length === 0 ? (
                                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-white/50">
                                          No matching templates
                                        </div>
                                      ) : (
                                        getFilteredTemplates(row).map((template) => (
                                          <button
                                            key={template._id}
                                            type="button"
                                            onMouseDown={(e) =>
                                              e.preventDefault()
                                            }
                                            onClick={() => {
                                              assignTemplateToVideo(
                                                row,
                                                template._id,
                                              );
                                              setTemplateQueryByRow((prev) => ({
                                                ...prev,
                                                [row.contentId]:
                                                  template.question ||
                                                  template.name,
                                              }));
                                              setOpenTemplatePickerId(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white/80"
                                          >
                              {template.question || template.name}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </ContentCard>

      <TemplateModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingTemplateId={editingTemplateId}
        form={form}
        setForm={setForm}
        saveTemplate={saveTemplate}
        isSavingTemplate={isSavingTemplate}
      />
    </div>
  );
};

export default ChapterEngagementTab;
