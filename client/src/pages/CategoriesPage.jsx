import React, { useState } from 'react';
import { Search, ChevronRight, Palette, ArrowRight, Home, Layers, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBackground from "@/assets/hero-background.png";
import { ROUTES } from '@/config/routes';

/**
 * PAGE_CONTENT and CATEGORIES_DATA are kept outside for easy editability.
 * Recreates the UI exactly as shown in the provided image using Tailwind CSS.
 */
const PAGE_CONTENT = {
  title: 'Design Courses',
  subtitle: 'Explore our comprehensive collection of design disciplines',
  breadcrumb: 'Design',
  searchPlaceholder: 'Search...',
  levels: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
};

const CATEGORIES_DATA = [
  {
    id: 1,
    title: 'UI/UX Design',
    description: 'Create intuitive user experiences',
    coursesCount: 24,
    level: 'Beginner',
    icon: Layers,
  },
  {
    id: 2,
    title: 'Graphic Design',
    description: 'Master visual communication',
    coursesCount: 18,
    level: 'Beginner',
    icon: Palette,
  },
  {
    id: 3,
    title: 'Motion Graphics',
    description: 'Bring designs to life',
    coursesCount: 15,
    level: 'Advanced',
    icon: Film,
  },
];

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('All Levels');

  const filteredCategories = CATEGORIES_DATA.filter(cat => {
    const matchesSearch = cat.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = activeLevel === 'All Levels' || cat.level === activeLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="relative w-full overflow-hidden">
      
      {/* Background - Scoped to this page content only */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <img
          src={heroBackground}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090C03]/40 to-[#090C03] pointer-events-none" />
        {/* Subtle brown glow to match image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#3d1a20]/20 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Bottom Fade to blend seamless with Footer */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col flex-grow pb-10">
        <main className="max-w-[1440px] mx-auto w-full px-6 md:px-16 pt-32 pb-64">
          
          {/* Breadcrumbs matching image */}
          <nav className="flex items-center gap-2 mb-8 text-[13px]">
            <Link to={ROUTES.HOME} className="text-white hover:opacity-80 transition-opacity">
              <Home size={14} strokeWidth={2.5} />
            </Link>
            <ChevronRight size={12} className="text-white/40" strokeWidth={3} />
            <span className="text-white font-medium">{PAGE_CONTENT.breadcrumb}</span>
          </nav>

          {/* Hero Header */}
          <header className="mb-10">
            <h1 className="text-[40px] font-bold mb-3 tracking-tight">
              {PAGE_CONTENT.title}
            </h1>
            <p className="text-[15px] text-white/70 max-w-2xl font-normal">
              {PAGE_CONTENT.subtitle}
            </p>
          </header>

          {/* Pill-shaped Search and Filter Bar */}
          <div className="flex flex-col md:flex-row items-center gap-4 p-1 bg-[linear-gradient(91.43deg,rgba(217,217,217,0.224)_1.92%,rgba(217,217,217,0.048)_102.33%)] backdrop-blur-[20px] border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full mb-16 max-w-[1000px]">
            <div className="flex items-center gap-3 pl-6 flex-1 w-full md:w-auto">
              <Search className="text-white/30" size={18} />
              <input 
                type="text" 
                placeholder={PAGE_CONTENT.searchPlaceholder} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[14px] text-white placeholder:text-white/30 w-full py-2.5 font-normal"
              />
            </div>
            <div className="flex items-center gap-2 p-1 w-full md:w-auto pr-2">
              {PAGE_CONTENT.levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveLevel(level)}
                  className={`px-6 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    activeLevel === level 
                      ? 'bg-black text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Grid - Exact Image Replication */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1000px]">
            {filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="group relative bg-[linear-gradient(91.43deg,rgba(217,217,217,0.224)_1.92%,rgba(217,217,217,0.048)_102.33%)] backdrop-blur-md border border-white/10 rounded-[35px] p-6 flex flex-col transition-all duration-300 hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-white">
                    <category.icon size={32} strokeWidth={2} />
                  </div>
                  <span className="px-4 py-1.5 bg-white/5 backdrop-blur-sm border border-white/5 rounded-full text-[11px] font-medium text-white/50">
                    {category.level}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-[22px] font-bold mb-2 tracking-tight">
                    {category.title}
                  </h3>
                  <p className="text-white/50 text-[14px] leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[12px] text-white/40">
                    {category.coursesCount} Courses
                  </span>
                  <Link 
                    to={`/courses?category=${category.id}`} 
                    className="flex items-center gap-1.5 text-primary-pink font-bold text-[14px] hover:gap-2.5 transition-all"
                  >
                    Explore <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
