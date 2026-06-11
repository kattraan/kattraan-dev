import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  GraduationCap,
  Award,
  Smartphone,
  ShieldCheck,
  Headphones,
  Building2,
} from "lucide-react";
const faqData = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Select your preferred course, complete payment, and access your learning dashboard immediately after successful enrollment.",
    icon: GraduationCap,
    iconColor: "text-[#FF8C42] bg-[#FF8C42]/10",
  },
  {
    question: "Do courses include certificates?",
    answer:
      "Eligible courses provide certificates upon successful completion of required learning activities.",
    icon: Award,
    iconColor: "text-primary-pink bg-primary-pink/10",
  },
  {
    question: "Can I access courses on mobile devices?",
    answer:
      "Yes. Kattraan is designed to support modern desktops, tablets, and mobile devices.",
    icon: Smartphone,
    iconColor: "text-blue-400 bg-blue-400/10",
  },
  {
    question: "Are payments secure?",
    answer:
      "Yes. Payments are processed through trusted and secure payment gateway providers with industry-standard security practices.",
    icon: ShieldCheck,
    iconColor: "text-emerald-400 bg-emerald-400/10",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can contact us through email, phone, or the contact form available on our website.",
    icon: Headphones,
    iconColor: "text-purple-400 bg-purple-400/10",
  },
  {
    question: "Can organizations train employees through Kattraan?",
    answer:
      "Yes. We welcome discussions regarding institutional learning and corporate training partnerships.",
    icon: Building2,
    iconColor: "text-amber-400 bg-amber-400/10",
  },
];

const AccordionItem = ({ item, isOpen, onToggle, index }) => {
  const Icon = item.icon;

  return (
    <div
      className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
        isOpen
          ? "border-white/15 bg-white/[0.04] shadow-lg shadow-black/20"
          : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 md:gap-5 p-6 md:p-7 text-left cursor-pointer group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        {/* Icon */}
        <div
          className={`p-2.5 rounded-xl ${item.iconColor} flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Question */}
        <span
          className={`flex-1 text-base md:text-lg font-bold tracking-tight transition-colors duration-300 ${
            isOpen ? "text-white" : "text-white/80 group-hover:text-white"
          }`}
        >
          {item.question}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-primary-pink" : ""
          }`}
        />
      </button>

      {/* Answer panel */}
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 md:px-7 pb-6 md:pb-7 flex gap-4 md:gap-5">
          <div className="w-10 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
          <p className="text-white/65 text-sm md:text-base font-light leading-relaxed">
            {item.answer}
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#090C03] text-white">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-pink/8 blur-[150px] pointer-events-none" />
      <div className="absolute top-[50%] left-0 w-[400px] h-[400px] rounded-full bg-primary-purple/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-10 w-[500px] h-[500px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 lg:pt-48 lg:pb-24 flex flex-col items-center justify-center text-center px-6">
        <div className="relative inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float-delayed">
          <Sparkles className="w-4 h-4 text-primary-pink" />
          <span className="text-sm font-medium tracking-wider text-white/90">
            Help Center
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl">
          Frequently Asked{" "}
          <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
            Questions
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
          Find quick answers to common questions about courses, enrollments,
          payments, and more.
        </p>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
      </section>

      {/* ─── ACCORDION ─── */}
      <section className="max-w-[820px] mx-auto px-6 lg:px-8 pb-28 relative z-10">
        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <AccordionItem
              key={idx}
              item={item}
              index={idx}
              isOpen={openIndex === idx}
              onToggle={() => handleToggle(idx)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-16 p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-xl text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
            Still have questions?
          </h3>
          <p className="text-white/60 text-sm md:text-base font-light mb-6 max-w-md mx-auto">
            Our support team is ready to help. Reach out and we'll get back to
            you as soon as possible.
          </p>
          <a
            href="mailto:support@kattraan.com"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-95 shadow-lg shadow-pink-500/20 transition-all"
          >
            <Headphones className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
