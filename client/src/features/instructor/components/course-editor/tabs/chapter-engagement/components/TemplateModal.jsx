import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Button } from "@/components/ui";

const TemplateModal = ({
  isModalOpen,
  setIsModalOpen,
  editingTemplateId,
  form,
  setForm,
  saveTemplate,
  isSavingTemplate,
}) => {
  const [openEmojiPickerIdx, setOpenEmojiPickerIdx] = useState(null);
  const emojiInputRefs = useRef({});
  const emojiPopoverRefs = useRef({});
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDarkMode(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (openEmojiPickerIdx == null) return undefined;
    const closeOnOutsideClick = (event) => {
      const idx = openEmojiPickerIdx;
      const popover = emojiPopoverRefs.current[idx];
      const input = emojiInputRefs.current[idx];
      if (popover?.contains(event.target) || input?.contains(event.target)) return;
      setOpenEmojiPickerIdx(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [openEmojiPickerIdx]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsModalOpen(false)}
      />
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingTemplateId ? "Edit Template" : "Create Template"}
          </h4>
          <Sparkles size={18} className="text-primary-pink" />
        </div>
        <input
          value={form.question}
          onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
          placeholder="Template question (e.g. How clear was this video?)"
          className="w-full h-11 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#111] px-3"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Description (optional)"
          rows={2}
          className="w-full rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-[#111] px-3 py-2"
        />
        <div className="space-y-2">
          {form.labels.map((label, idx) => (
            <div key={idx} className="grid grid-cols-[168px_1fr] gap-2 items-center">
              <div className="relative">
                <div className="relative">
                  <input
                    ref={(el) => {
                      emojiInputRefs.current[idx] = el;
                    }}
                    value={form.emojis[idx]}
                    onChange={(e) => {
                      const next = [...form.emojis];
                      next[idx] = e.target.value;
                      setForm((p) => ({ ...p, emojis: next }));
                    }}
                    placeholder="Type icons (e.g. ⭐⭐ 😵)"
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#111] px-3 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setOpenEmojiPickerIdx((prev) => (prev === idx ? null : idx))
                    }
                    className={`absolute right-1 top-1 h-8 w-8 rounded-md text-base border transition-colors ${
                      openEmojiPickerIdx === idx
                        ? "border-gray-900 dark:border-white bg-gray-100 dark:bg-white/15"
                        : "border-gray-800/70 dark:border-white/30 bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                    title="Choose emoji"
                  >
                    🙂
                  </button>
                </div>
                {openEmojiPickerIdx === idx && (
                  <div
                    ref={(el) => {
                      emojiPopoverRefs.current[idx] = el;
                    }}
                    className="absolute z-[150] mt-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#171717] shadow-xl p-2"
                  >
                    <EmojiPicker
                      lazyLoadEmojis
                      skinTonesDisabled
                      searchDisabled={false}
                      previewConfig={{ showPreview: false }}
                      theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                      width={320}
                      height={260}
                      onEmojiClick={(emojiData) => {
                        const next = [...form.emojis];
                        const inputEl = emojiInputRefs.current[idx];
                        const currentValue = next[idx] || "";
                        const start = inputEl?.selectionStart ?? currentValue.length;
                        const end = inputEl?.selectionEnd ?? currentValue.length;
                        next[idx] =
                          currentValue.slice(0, start) +
                          emojiData.emoji +
                          currentValue.slice(end);
                        setForm((p) => ({ ...p, emojis: next }));
                        setTimeout(() => {
                          if (inputEl) {
                            const pos = start + emojiData.emoji.length;
                            inputEl.focus();
                            inputEl.setSelectionRange(pos, pos);
                          }
                        }, 0);
                      }}
                    />
                  </div>
                )}
              </div>
              <input
                value={label}
                onChange={(e) => {
                  const next = [...form.labels];
                  next[idx] = e.target.value;
                  setForm((p) => ({ ...p, labels: next }));
                }}
                placeholder={`Label for level ${idx + 1}`}
                className="h-10 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#111] px-3 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveTemplate} disabled={isSavingTemplate}>
            {editingTemplateId ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
