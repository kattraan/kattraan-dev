import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import {
  createEngagementTemplate,
  deleteEngagementTemplate,
  updateEngagementTemplate,
} from "@/features/instructor/services/chapterEngagementTemplateService";
import { DEFAULT_LABELS, EMOJIS } from "../constants";

const useChapterEngagementTemplates = ({ setEngagementTemplates }) => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [form, setForm] = useState({
    question: "",
    description: "",
    labels: [...DEFAULT_LABELS],
    emojis: [...EMOJIS],
  });

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setForm({
      question: "",
      description: "",
      labels: [...DEFAULT_LABELS],
      emojis: [...EMOJIS],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplateId(template._id);
    setForm({
      question: template.question || template.name || "",
      description: template.description || "",
      labels: [
        template.labels?.[0] || DEFAULT_LABELS[0],
        template.labels?.[1] || DEFAULT_LABELS[1],
        template.labels?.[2] || DEFAULT_LABELS[2],
        template.labels?.[3] || DEFAULT_LABELS[3],
        template.labels?.[4] || DEFAULT_LABELS[4],
      ],
      emojis: [
        template.emojis?.[0] || EMOJIS[0],
        template.emojis?.[1] || EMOJIS[1],
        template.emojis?.[2] || EMOJIS[2],
        template.emojis?.[3] || EMOJIS[3],
        template.emojis?.[4] || EMOJIS[4],
      ],
    });
    setIsModalOpen(true);
  };

  const saveTemplate = async () => {
    if (!form.question.trim()) {
      toast.error("Missing question", "Template question is required.");
      return;
    }
    if (form.labels.some((label) => !label.trim())) {
      toast.error("Missing label", "All 5 rating labels are required.");
      return;
    }
    if (form.emojis.some((icon) => !String(icon || "").trim())) {
      toast.error("Missing icon", "All 5 icon fields are required.");
      return;
    }

    try {
      setIsSavingTemplate(true);
      const payload = {
        question: form.question.trim(),
        description: form.description.trim(),
        labels: form.labels.map((l) => l.trim()),
        emojis: form.emojis.map((e) => String(e || "").trim()),
      };
      if (editingTemplateId) {
        const updated = await updateEngagementTemplate(editingTemplateId, payload);
        setEngagementTemplates((prev) =>
          (prev || []).map((tpl) =>
            String(tpl._id) === String(editingTemplateId) ? updated : tpl,
          ),
        );
        toast.success("Updated", "Template updated.");
      } else {
        const created = await createEngagementTemplate(payload);
        setEngagementTemplates((prev) => [created, ...(prev || [])]);
        toast.success("Created", "Template created.");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(
        "Save failed",
        err?.response?.data?.message || "Could not save template.",
      );
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const removeTemplate = async (templateId) => {
    try {
      await deleteEngagementTemplate(templateId);
      setEngagementTemplates((prev) =>
        (prev || []).filter((tpl) => String(tpl._id) !== String(templateId)),
      );
      toast.success("Deleted", "Template deleted.");
    } catch (err) {
      toast.error(
        "Delete failed",
        err?.response?.data?.message || "Could not delete template.",
      );
    }
  };

  return {
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
  };
};

export default useChapterEngagementTemplates;
