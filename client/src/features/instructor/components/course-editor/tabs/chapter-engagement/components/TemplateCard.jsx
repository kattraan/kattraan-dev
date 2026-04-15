import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { DEFAULT_LABELS, EMOJIS } from "../constants";

const TemplateCard = ({ template, showActions = false, onEdit, onDelete }) => {
  return (
    <Card className="p-4 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-900 dark:text-white">
            {template.question || template.name}
          </p>
          {template.description ? (
            <p className="text-xs mt-1 text-gray-500 dark:text-white/50">
              {template.description}
            </p>
          ) : null}
        </div>
        {showActions ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(template)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(template._id)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-3 space-y-1.5">
        {(template.labels || DEFAULT_LABELS).slice(0, 5).map((label, idx) => (
          <div
            key={`${template._id}-${idx}`}
            className="text-xs text-gray-600 dark:text-white/60 flex items-center gap-2"
          >
            <span>{template.emojis?.[idx] || EMOJIS[idx]}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {template.isLocked && (
        <p className="mt-3 text-[11px] text-gray-500 dark:text-white/40">
          Default template (locked)
        </p>
      )}
    </Card>
  );
};

export default TemplateCard;
