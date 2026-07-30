import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import blogBg from '@/assets/blog.webp';
import blogBg2 from '@/assets/blog-1.webp';

const TESTIMONIALS = [
  {
    id: 1,
    category: 'Career Switcher',
    text: 'At 32, I thought it was too late. Kattraan proved me wrong. Built a job portal from scratch. Now earning double as a developer.',
    author: 'Rajesh Kumar',
    journey: 'Civil Engineer → Full Stack Developer',
    date: 'Jan 18, 2025',
  },
  {
    id: 2,
    category: 'Struggling Fresh Grad',
    text: "12 rejections broke me. Kattraan's real projects gave me confidence. Cracked interviews at product companies and a startup.",
    author: 'Aditya Verma, B.Tech',
    journey: 'Rejections → selection',
    date: 'Feb 25, 2025',
  },
  {
    id: 3,
    category: 'Working Professional',
    text: 'Same job, same salary for 4 years. I felt invisible. Learned automation at Kattraan. Got promoted in 2 months. Finally noticed.',
    author: 'Priya Menon',
    journey: 'Manual Tester → Automation Lead',
    date: 'Dec 12, 2024',
  },
  {
    id: 4,
    category: 'Career Changer',
    text: "Switched from teaching to tech at 35. Kattraan's supportive community and structured learning path made the impossible possible.",
    author: 'Sneha Patel',
    journey: 'Teacher → Software Engineer',
    date: 'Apr 05, 2025',
  },
  {
    id: 5,
    category: 'Freelancer to Corporate',
    text: 'From freelancing struggles to a stable role. Kattraan taught me not just coding but professional development practices. Landed my target job in 6 months.',
    author: 'Vikram Singh',
    journey: 'Freelancer → Product Developer',
    date: 'May 12, 2025',
  },
];

/** Shared card content — used by both mobile and desktop views */
function TestimonialCardContent({ testimonial, showFeatured = false }) {
  return (
    <>
      {showFeatured && (
        <div className="absolute -top-3 right-3 sm:-top-4 sm:-right-4 z-20">
          <div className="relative px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] rounded-full shadow-[0_0_20px_rgba(255,63,180,0.4)] flex items-center gap-2 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="text-white text-[10px] sm:text-[11px] font-black tracking-[0.1em] uppercase">
              Featured
            </span>
          </div>
        </div>
      )}

      <h3 className="text-lg sm:text-2xl font-bold mb-3 tracking-tight pr-16 sm:pr-0">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
          &ldquo;{testimonial.category}&rdquo;
        </span>
      </h3>

      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 fill-white text-white" />
          </div>
        ))}
      </div>

      <p className="text-white text-[15px] sm:text-[16px] leading-relaxed mb-4">
        {testimonial.text}
      </p>

      <p className="text-white/80 text-sm mb-5 text-right font-medium">
        — {testimonial.author}
      </p>

      <div className="border-t border-white/5 pt-4">
        <div className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-4 max-w-full">
          <span className="text-gray-400 text-xs font-medium tracking-wide break-words">
            {testimonial.journey}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-[#FF8C42] to-[#FF3FB4] shrink-0">
            <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-bold">
              {testimonial.author.charAt(0)}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">{testimonial.author}</p>
            <p className="text-white/60 text-xs font-medium">{testimonial.date}</p>
          </div>
        </div>
      </div>
    </>
  );
}

/** Mobile / tablet: single card + controls below (no overlap) */
function MobileTestimonialSlider({ testimonials, currentIndex, onChange }) {
  const testimonial = testimonials[currentIndex];

  return (
    <div className="flex flex-col w-full px-4 py-6 sm:py-8 gap-6">
      <div className="relative w-full max-w-[420px] mx-auto rounded-2xl border border-white/20 overflow-visible">
        <div
          className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none"
          style={{
            background:
              'linear-gradient(91.43deg, rgba(217, 217, 217, 0.12) 1.92%, rgba(217, 217, 217, 0.03) 102.33%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />
        <div className="relative p-5 sm:p-6 z-10">
          <TestimonialCardContent testimonial={testimonial} showFeatured />
        </div>
      </div>

      <TestimonialControls
        count={testimonials.length}
        currentIndex={currentIndex}
        onChange={onChange}
      />
    </div>
  );
}

function TestimonialControls({ count, currentIndex, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 px-2">
      <button
        type="button"
        aria-label="Previous testimonial"
        onClick={() => onChange((currentIndex - 1 + count) % count)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white/70 shrink-0"
      >
        <ChevronLeft size={18} aria-hidden />
      </button>

      <div className="flex gap-2" role="tablist" aria-label="Testimonials">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={currentIndex === index}
            aria-label={`Show testimonial ${index + 1}`}
            onClick={() => onChange(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Next testimonial"
        onClick={() => onChange((currentIndex + 1) % count)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white/70 shrink-0"
      >
        <ChevronRight size={18} aria-hidden />
      </button>
    </div>
  );
}

/** Desktop 3D carousel card */
const TestimonialCard = ({ testimonial, position, isCenter, carouselRadius = 460 }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const getCardStyle = () => {
    const totalCards = 5;
    const theta = (position * (360 / totalCards)) * (Math.PI / 180);
    const radiusX = carouselRadius;
    const x = Math.round(radiusX * Math.sin(theta));
    const z = Math.cos(theta);
    const depth = (z + 1) / 2;
    const scale = isCenter ? 1 : Number((0.6 + 0.35 * depth).toFixed(2));
    let opacity = isCenter ? 1 : Math.abs(position) === 1 ? 0.6 : 0.2;
    const zIndex = Math.round(z * 100);

    return {
      translateX: `${x}px`,
      translateY: isCenter ? '0px' : '40px',
      scale,
      rotateY: Math.round(-position * 30),
      opacity,
      zIndex,
    };
  };

  const handleMouseMove = (e) => {
    if (!isCenter || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width - 0.5) * 12);
    const y = Math.round(((e.clientY - rect.top) / rect.height - 0.5) * -12);
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const style = getCardStyle();

  return (
    <div
      className="absolute left-1/2 top-4 transition-all duration-1000 will-change-transform"
      style={{
        transform: `translateX(-50%) translateX(${style.translateX}) translateY(${style.translateY}) scale(${style.scale})`,
        zIndex: style.zIndex,
        opacity: style.opacity,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[380px] min-h-[320px] rounded-[32px] transition-all duration-700"
        style={{
          transform: `rotateY(${style.rotateY}deg) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={`absolute inset-0 rounded-[32px] border transition-all duration-500 ${
            isCenter ? 'border-white/20' : 'border-white/5 grayscale pointer-events-none'
          }`}
          style={{
            background: isCenter
              ? 'linear-gradient(91.43deg, rgba(217, 217, 217, 0.12) 1.92%, rgba(217, 217, 217, 0.03) 102.33%)'
              : 'rgba(255, 255, 255, 0.02)',
            backdropFilter: isCenter ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: isCenter ? 'blur(16px)' : 'none',
            transform: 'translateZ(0)',
          }}
        />
        <div className="relative flex flex-col p-8 z-10 antialiased" style={{ transform: 'translateZ(1px)' }}>
          <TestimonialCardContent testimonial={testimonial} showFeatured={isCenter} />
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = TESTIMONIALS;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setIsAutoPlaying(false);
    const onChange = () => {
      if (mq.matches) setIsAutoPlaying(false);
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return undefined;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleManualChange = (newIndex) => {
    setIsAutoPlaying(false);
    setCurrentIndex(newIndex);
  };

  return (
    <section className="relative w-full py-12 sm:py-20 px-3 sm:px-4 flex flex-col items-center overflow-hidden font-satoshi bg-[#090C03]">
      <div className="relative z-10 w-full max-w-[1400px] text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold mb-2 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#808080]">
            Our Trusted
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
            Testimonials
          </span>
        </h2>

        <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-[1000px] mx-auto">
          <svg width="0" height="0" className="absolute" aria-hidden>
            <defs>
              <linearGradient id="starGradientTestimonials" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#808080" />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="h-[1.5px] flex-1"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))',
            }}
          />
          <div className="flex items-center gap-2" aria-hidden>
            <Star className="w-2.5 h-2.5 fill-[url(#starGradientTestimonials)] stroke-none opacity-80" />
            <Star className="w-4 h-4 fill-[url(#starGradientTestimonials)] stroke-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
            <Star className="w-2.5 h-2.5 fill-[url(#starGradientTestimonials)] stroke-none opacity-80" />
          </div>
          <div
            className="h-[1.5px] flex-1"
            style={{
              background:
                'linear-gradient(270deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))',
            }}
          />
        </div>
      </div>

      <div className="relative w-full max-w-[1400px] rounded-2xl sm:rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-60">
          <div
            className="absolute top-[-150px] left-0 w-full h-[742px] z-0 opacity-[0.52]"
            style={{
              backgroundImage: `url(${blogBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center -50px',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            className="absolute top-[600px] h-[742px] bottom-0 left-0 w-full z-0"
            style={{
              backgroundImage: `url(${blogBg2})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="absolute inset-0 bg-[#090C03]/40" />
        </div>

        {/* Mobile & tablet — stacked card + controls */}
        <div className="relative z-10 lg:hidden">
          <MobileTestimonialSlider
            testimonials={testimonials}
            currentIndex={currentIndex}
            onChange={handleManualChange}
          />
        </div>

        {/* Desktop — 3D carousel */}
        <div
          className="relative z-10 hidden lg:flex items-center justify-center min-h-[700px]"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative h-[650px] w-full">
            <div className="absolute inset-0 flex justify-center perspective-[2000px] items-center overflow-hidden [contain:paint] pb-20">
              {testimonials.map((testimonial, index) => {
                let position = index - currentIndex;
                if (position > testimonials.length / 2) position -= testimonials.length;
                if (position < -testimonials.length / 2) position += testimonials.length;
                const isCenter = position === 0;

                return (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    position={position}
                    isCenter={isCenter}
                    carouselRadius={460}
                  />
                );
              })}
            </div>

            <div className="absolute bottom-8 left-0 right-0 z-50">
              <TestimonialControls
                count={testimonials.length}
                currentIndex={currentIndex}
                onChange={handleManualChange}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
