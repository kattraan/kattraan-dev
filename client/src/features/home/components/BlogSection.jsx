import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Images
import blogBg from '@/assets/blog.webp';
import blogBg2 from '@/assets/blog-1.webp';
import { resolveBlogImage } from '@/data/blogData';
import siteContentService from '@/features/admin/services/siteContentService';

const BlogCard = ({ article, alignment = 'left', variant = 'large' }) => {
  const isCentered = alignment === 'center';
  const isLarge = variant === 'large';
  const navigate = useNavigate();

  const handleReadArticle = () => {
    navigate(`/blog/${article.id}`, { state: { article: { ...article, image: resolveBlogImage(article) } } });
  };

  return (
    <div 
      className={`group relative flex flex-col w-full border border-white/10 rounded-3xl sm:rounded-[40px] p-5 sm:p-5 transition-all duration-300 hover:scale-[1.02] backdrop-blur-[4px] shadow-2xl overflow-hidden ${isCentered ? 'items-center text-center' : 'items-start text-left'}`} 
      style={{ background: 'linear-gradient(91.43deg, rgba(217, 217, 217, 0.224) 1.92%, rgba(217, 217, 217, 0.048) 102.33%)' }}
    >
      
      {/* Article Image with Badge Overlay */}
      <div className={`relative w-full ${isLarge ? 'h-[220px] sm:h-[200px]' : 'h-[160px] sm:h-[130px]'} rounded-2xl sm:rounded-[24px] overflow-hidden mb-4 shrink-0`}>
        <img 
          src={resolveBlogImage(article)} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category Badge */}
        <div className={`absolute top-4 ${isCentered ? 'left-4' : 'left-4'}`}>
          <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col w-full">
        <h3 className={`text-white text-lg sm:text-[20px] font-bold leading-snug mb-2 transition-colors ${isCentered ? 'text-center' : 'text-left'}`}>
          {article.title}
        </h3>
        <p className={`text-white/80 text-sm sm:text-[13px] leading-relaxed mb-4 font-medium ${isCentered ? 'mx-auto' : ''}`}>
          {article.description}
        </p>
      </div>

      {/* Footer - Read time and Button */}
      <div className={`mt-auto flex flex-col gap-3 w-full ${isCentered ? 'items-center' : 'items-start'}`}>
        <p className="text-white/50 text-[11px] font-medium">
          {article.readTime}
        </p>
        
        <button 
          onClick={handleReadArticle}
          className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end hover:opacity-90 text-white text-[12px] font-bold py-2.5 px-8 rounded-[12px] transition-all shadow-lg shadow-pink-500/20"
        >
          Read Article
        </button>
      </div>
    </div>
  );
};

const BlogSection = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      siteContentService
        .listPublicBlogs()
        .then((res) => {
          if (!cancelled && Array.isArray(res.data)) {
            setArticles(res.data);
          }
        })
        .catch(() => {
          if (!cancelled) setArticles([]);
        });
    };

    load();
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const col1 = [articles[0], articles[3]].filter(Boolean);
  const col2 = [articles[1], articles[4]].filter(Boolean);
  const col3 = [articles[2], articles[5]].filter(Boolean);
  const extra = articles.slice(6);

  return (
    <section className="relative w-full pt-8 sm:pt-10 pb-16 sm:pb-20 px-3 sm:px-4 flex justify-center bg-transparent border-none">
      {/* Background Container for the Section - Split Backgrounds */}
      <div className="relative w-full max-w-[1252px] rounded-2xl sm:rounded-[32px] overflow-hidden p-4 sm:p-8 md:p-12 shadow-2xl bg-[#030002] border border-white/10">
        
        {/* Top Background Image (blog.png) - Fixed Height 572px, Radius 32px, Opacity 52% - No Border to avoid lines in cards */}
        <div 
          className="absolute top-[-150px] left-0 w-full h-[742px] pointer-events-none z-0 rounded-t-[32px] rounded-b-none opacity-[0.52]"
          style={{
            backgroundImage: `url(${blogBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center -50px',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Bottom Background Image (blog 1.png) - Covers the rest */}
        <div 
          className="absolute top-[592px] bottom-0 left-0 w-full pointer-events-none z-0"
          style={{
            backgroundImage: `url(${blogBg2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Header */}
        <div className="relative z-10 text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold mb-2 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#808080]">Stay ahead of</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end">What's next</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base font-medium tracking-wide">
            Insights on learning, building, and shipping from the Kattraan team.
          </p>


        </div>

        {/* Blog — mobile: flat list; tablet+: masonry columns */}
        <div className="relative z-10 flex flex-col gap-6 md:hidden">
          {articles.length === 0 && (
            <p className="py-10 text-center text-white/40">No articles published yet.</p>
          )}
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} alignment="left" variant="large" />
          ))}
        </div>

        <div className="relative z-10 hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Column 1 - Left Aligned */}
          <div className="flex flex-col gap-8">
            {col1.map((article, idx) => (
              <BlogCard key={article.id} article={article} alignment="left" variant={idx === 0 ? 'large' : 'compact'} />
            ))}
          </div>

          <div className="flex flex-col gap-8">
            {col2.map((article, idx) => (
              <BlogCard key={article.id} article={article} alignment="center" variant={idx === 0 ? 'compact' : 'large'} />
            ))}
          </div>

          <div className="flex flex-col gap-8">
            {col3.map((article, idx) => (
              <BlogCard key={article.id} article={article} alignment="left" variant={idx === 0 ? 'large' : 'compact'} />
            ))}
            {extra.map((article) => (
              <BlogCard key={article.id} article={article} alignment="left" variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
