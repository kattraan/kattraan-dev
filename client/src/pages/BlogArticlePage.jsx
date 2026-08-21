import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { resolveBlogImage } from '@/data/blogData';
import siteContentService from '@/features/admin/services/siteContentService';

const BlogArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    siteContentService
      .getPublicBlog(id)
      .then((res) => {
        if (!cancelled && res.data) setArticle(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null);
          setNotFound(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090c03] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white px-6 py-2 rounded-lg font-bold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090c03] text-white/50">
        Loading article…
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 bg-[#090c03] font-satoshi text-white">
      <div className="max-w-[800px] mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Articles
        </button>

        <div className="mb-8">
          <span className="text-[12px] font-bold text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/20 mb-4 inline-block">
            {article.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Clock className="w-4 h-4" />
            {article.readTime}
          </div>
        </div>

        <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-pink-500/10">
          <img 
            src={resolveBlogImage(article)} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-invert max-w-none text-white/80 leading-relaxed space-y-6">
          <p className="text-xl md:text-2xl font-medium text-white mb-8">
            {article.description}
          </p>
          
          {article.content ? (
            article.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return <p key={index}>{block.text}</p>;
              } else if (block.type === 'heading') {
                return <h3 key={index} className="text-2xl font-bold text-white mt-10 mb-4">{block.text}</h3>;
              }
              return null;
            })
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BlogArticlePage;
