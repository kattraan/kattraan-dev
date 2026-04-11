import React from "react";

/**
 * Shared content card with optional header (title, subtitle, headerRight).
 * Use for course editor tabs, dashboard pages, and any page that needs a consistent
 * card + header layout (Curriculum, Information, Drip, Reports, etc.).
 * Uses a plain div wrapper (no Card) so overflow is never hidden - keeps sticky and border-radius working.
 *
 * @param {string} title - Header title
 * @param {string} [subtitle] - Optional header subtitle
 * @param {React.ReactNode} [headerRight] - Optional actions/buttons in header
 * @param {boolean} [headerBorder=true] - Show border below header
 * @param {string} [variant='default'] - 'default' | 'elevated' | 'page' | 'flat'
 *   - flat: no card chrome (bg/border/shadow/radius); header sticks at top-0 of the
 *     nearest scroll container; content flows naturally (no inner scroll). Use inside
 *     a white scroll container (e.g. editor tab panels).
 * @param {string} [className] - Additional classes for the card
 * @param {React.ReactNode} children - Card body content
 */
const ContentCard = ({
  title,
  subtitle,
  headerRight,
  headerBorder = true,
  variant = "default",
  className = "",
  children,
}) => {
  // ── flat variant ──────────────────────────────────────────────────────────
  // Used inside the editor's white scroll container. No card chrome; header
  // sticks at the top of the outer scroll container; content flows normally.
  if (variant === "flat") {
    const flatBg = "bg-white dark:bg-[#111111]";
    return (
      <div className={`w-full px-5 md:px-6 ${className}`}>
        {(title || subtitle || headerRight) && (
          <header
            className={`sticky top-0 z-20 -mx-5 md:-mx-6 px-5 md:px-6 py-2.5 ${flatBg} transition-colors duration-300 ${
              headerBorder
                ? "border-b border-gray-100 dark:border-white/[0.05]"
                : ""
            }`}
            style={{ transform: "translateZ(0)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerRight && <div className="shrink-0">{headerRight}</div>}
            </div>
          </header>
        )}
        <div className="pt-6 pb-8">{children}</div>
      </div>
    );
  }

  // ── default / elevated / page variants ────────────────────────────────────
  const cardBg =
    variant === "elevated"
      ? "bg-white dark:bg-[#2A2A2A]"
      : "bg-white dark:bg-[#1E1E1E]";

  const contentCardRadius = variant === "page" ? "rounded-t-2xl" : "rounded-2xl";
  const headerRadius = "rounded-t-2xl";
  const stickyTopOffset = "top-6";

  return (
    <div
      className={`${cardBg} shadow-sm dark:shadow-none border border-gray-200 dark:border-white/10 ${contentCardRadius} px-5 pt-5 pb-0 md:px-6 md:pt-6 md:pb-0 transition-colors duration-300 flex flex-col min-h-0 overflow-visible ${className}`}
    >
      {/* Sticky header */}
      <header
        className={`sticky ${stickyTopOffset} z-50 flex-shrink-0 -mx-5 -mt-5 md:-mx-6 md:-mt-6 ${headerRadius} ${
          headerBorder
            ? "mb-0 border-b border-gray-100 dark:border-white/5 pb-6 min-h-[3.25rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_2px_4px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]"
            : "mb-0 pb-6 min-h-[3.25rem]"
        } ${cardBg}`}
        style={{ transform: "translateZ(0)" }}
      >
        <div className="flex flex-col justify-center px-0 pt-2 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-white/40 mt-1 transition-colors duration-300">
                  {subtitle}
                </p>
              )}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        </div>
      </header>
      <div className={`relative flex-1 min-h-0 pt-6 md:pt-8 overflow-y-auto scrollbar-hide ${variant === "page" ? "pb-8 md:pb-12" : "pb-4 md:pb-5"}`}>
        {children}
      </div>
    </div>
  );
};

export default ContentCard;
