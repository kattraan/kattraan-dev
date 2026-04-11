import React from 'react';

const gradientMap = {
  'bg-[#FF5A5F]': 'from-[#FF5A5F] to-[#FF8C42]',
  'bg-[#FF9F00]': 'from-[#FF9F00] to-[#FFD60A]',
  'bg-[#00C9FF]': 'from-[#00A3E0] to-[#00C9FF]',
  'bg-[#FF1E6D]': 'from-[#FF1E6D] to-[#FF5A5F]',
  'bg-[#00D285]': 'from-[#00B37D] to-[#00D285]',
  'bg-[#4A69FF]': 'from-[#4A69FF] to-[#8B5CF6]',
  'bg-[#1B263B]': 'from-[#2E4371] to-[#1B263B]',
  'bg-[#8B5CF6]': 'from-[#8B5CF6] to-[#C946C6]',
  'bg-[#0D9488]': 'from-[#14B8A6] to-[#0D9488]',
};

const CurriculumContentTypeCard = React.memo(function CurriculumContentTypeCard({ label, Icon, color, onClick }) {
  const gradientClass = gradientMap[color] || '';

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex flex-col items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-transparent hover:shadow-xl dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-primary-pink/40"
    >
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientClass || color} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
      >
        <Icon size={21} aria-hidden />
      </div>
      <span className="text-[11px] font-bold text-gray-400 dark:text-white/35 group-hover:text-gray-800 dark:group-hover:text-white/90 transition-colors duration-200 leading-none">
        {label}
      </span>
    </button>
  );
});

export default CurriculumContentTypeCard;
