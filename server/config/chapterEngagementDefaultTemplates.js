const DEFAULT_TEMPLATE_EMOJIS = [
  "⭐ 😵",
  "⭐⭐ 🤯",
  "⭐⭐⭐ 😐",
  "⭐⭐⭐⭐ 👍",
  "⭐⭐⭐⭐⭐ 💡",
];

/**
 * Default template blueprints used for first-time instructor seeding.
 * Keep this config-driven (outside controller logic) so product can evolve
 * template wording without touching business logic.
 */
const CHAPTER_ENGAGEMENT_DEFAULT_TEMPLATES = [
  {
    defaultKey: "clarity",
    question: "How clear was this video?",
    labels: [
      "Totally lost",
      "Very confusing",
      "Partly clear",
      "Mostly clear",
      "Crystal clear",
    ],
    emojis: [...DEFAULT_TEMPLATE_EMOJIS],
  },
  {
    defaultKey: "confidence",
    question: "How confident do you feel about this concept now?",
    labels: [
      "Still totally unsure",
      "Very unsure",
      "Somewhat sure",
      "Mostly sure",
      "Very confident",
    ],
    emojis: ["⭐ 😵", "⭐⭐ 😕", "⭐⭐⭐ 😐", "⭐⭐⭐⭐ 🙂", "⭐⭐⭐⭐⭐ 💪"],
  },
  {
    defaultKey: "pace",
    question: "Was this lesson pace comfortable for you?",
    labels: [
      "Too fast and lost",
      "Fast and hard to follow",
      "Manageable",
      "Good pace",
      "Perfectly paced",
    ],
    emojis: ["⭐ 🏃", "⭐⭐ 😮‍💨", "⭐⭐⭐ 👌", "⭐⭐⭐⭐ 👍", "⭐⭐⭐⭐⭐ 🚀"],
  },
];

module.exports = {
  DEFAULT_TEMPLATE_EMOJIS,
  CHAPTER_ENGAGEMENT_DEFAULT_TEMPLATES,
};
