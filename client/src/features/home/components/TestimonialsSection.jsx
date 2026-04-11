import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import blogBg from '@/assets/blog.png';
import blogBg2 from '@/assets/blog 1.png';

const TestimonialCard = ({ testimonial, position, isCenter }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const getCardStyle = () => {
    const totalCards = 5;
    const theta = (position * (360 / totalCards)) * (Math.PI / 180);
    const radiusX = 460; 
    
    // Math.round all values to prevent sub-pixel rendering blur
    const x = Math.round(radiusX * Math.sin(theta));
    const z = Math.cos(theta); // 1 = Front, -1 = Back
    const depth = (z + 1) / 2;
    const scale = isCenter ? 1 : Number((0.6 + (0.35 * depth)).toFixed(2));
    
    let opacity = isCenter ? 1 : (Math.abs(position) === 1 ? 0.6 : 0.2);
    const zIndex = Math.round(z * 100); 
    
    return {
      translateX: `${x}px`,
      translateY: isCenter ? '0px' : '40px',
      scale,
      rotateY: Math.round(-position * 30),
      opacity,
      zIndex
    };
  };

  const handleMouseMove = (e) => {
    if (!isCenter || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width - 0.5) * 12); 
    const y = Math.round(((e.clientY - rect.top) / rect.height - 0.5) * -12);
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const style = getCardStyle();

  return (
    <div 
      className="absolute left-1/2 top-4 transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1) will-change-transform"
      style={{
        transform: `translateX(-50%) translateX(${style.translateX}) translateY(${style.translateY}) scale(${style.scale})`,
        zIndex: style.zIndex,
        opacity: style.opacity,
        // No filter or blur on this parent container
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
        {/* Layer 1: The Glass Background (Flat 3D Layer) */}
        <div 
          className={`absolute inset-0 rounded-[32px] border transition-all duration-500 ${
            isCenter ? 'border-white/20' : 'border-white/5 grayscale pointer-events-none'
          }`}
          style={{
            background: isCenter 
              ? 'linear-gradient(91.43deg, rgba(217, 217, 217, 0.12) 1.92%, rgba(217, 217, 217, 0.03) 102.33%)' 
              : 'rgba(255, 255, 255, 0.02)',
            // Backdrop blur only on this layer, not parent of text
            backdropFilter: isCenter ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: isCenter ? 'blur(16px)' : 'none',
            transform: 'translateZ(0)', // Keep it attached to the 3D plane but flat
          }}
        />

        {/* Layer 2: The Text & Interaction Layer (Flat context) */}
        <div className="relative h-full flex flex-col p-8 z-10 antialiased" style={{ transform: 'translateZ(1px)' }}>
          {/* Creative Floating Featured Badge */}
          {isCenter && (
            <div className="absolute -top-4 -right-4 z-20 group/badge">
              <div className="relative px-4 py-1.5 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] rounded-full shadow-[0_0_20px_rgba(255,63,180,0.4)] flex items-center gap-2 border border-white/20 transform hover:scale-110 transition-transform duration-300 cursor-default">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span className="text-white text-[11px] font-black tracking-[0.1em] uppercase relative z-10">
                  Featured
                </span>
              </div>
            </div>
          )}
          
          <h3 className="text-2xl font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
              "{testimonial.category}"
            </span>
          </h3>

          <div className="flex gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center">
                 <Star className="w-3 h-3 fill-white text-white" />
              </div>
            ))}
          </div>

          <p className={`text-white  mb-6 flex-1 ${isCenter ? 'text-[16px]' : 'text-base opacity-60'}`}>
            {testimonial.text}
          </p>

          <p className="text-white/80 text-sm mb-6 text-right font-medium ">
             — {testimonial.author}
          </p>

          <div className="mt-auto border-t border-white/5 pt-5">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-4">
              <span className="text-gray-400 text-xs font-medium tracking-wide">
                {testimonial.journey}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-[#FF8C42] to-[#FF3FB4]">
                <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.author.charAt(0)}
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-bold">{testimonial.author}</p>
                <p className="text-white/60 text-xs font-medium">{testimonial.date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      category: "Career Switcher",
      text: "At 32, I thought it was too late. Kattran proved me wrong. Built a job portal from scratch. Now earning double as a developer.",
      author: "Rajesh Kumar",
      journey: "Civil Engineer → Full Stack Developer",
      date: "Jan 18, 2027"
    },
    {
      id: 2,
      category: "Struggling Fresh Grad",
      text: "12 rejections broke me. Kattran's real projects gave me confidence. Cracked TCS, Infosys & a startup!",
      author: "Aditya Verma, B.Tech",
      journey: "Rejections → selection",
      date: "Feb 25, 2027"
    },
    {
      id: 3,
      category: "Working Professional",
      text: "Same job, same salary for 4 years. I felt invisible. Learned automation at Kattran. Got promoted in 2 months. Finally noticed.",
      author: "Priya Menon",
      journey: "Manual Tester → Automation Lead",
      date: "Dec 12, 2026"
    },
    {
      id: 4,
      category: "Career Changer",
      text: "Switched from teaching to tech at 35. Kattran's supportive community and structured learning path made the impossible possible. Now working at a top MNC.",
      author: "Sneha Patel",
      journey: "Teacher → Software Engineer",
      date: "Apr 05, 2027"
    },
    {
      id: 5,
      category: "Freelancer to Corporate",
      text: "From freelancing struggles to stable career. Kattran taught me not just coding but professional development practices. Landed my dream job in 6 months.",
      author: "Vikram Singh",
      journey: "Freelancer → Product Developer",
      date: "May 12, 2027"
    }
  ];

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleManualChange = (newIndex) => {
    setIsAutoPlaying(false);
    setCurrentIndex(newIndex);
  };

  const handleDotClick = (index) => { // Added back incase needed, though manual change covers it
      setIsAutoPlaying(false);
      setCurrentIndex(index);
  };

  return (
    <section className="relative w-full py-20 px-4 flex flex-col items-center overflow-hidden font-satoshi bg-[#090C03]">
      
      {/* Header - Moved OUTSIDE the background container */}
      <div className="relative z-10 w-full max-w-[1400px] text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Our Trusted</span>{' '}
          <span className="bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent">Testimonials</span>
        </h2>
      </div>

      {/* Main Content Container (Background + Carousel) */}
      <div className="relative w-full max-w-[1400px] h-[700px] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Absolute Background Images - Copied from BlogSection */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-60">
           {/* Top Background Image */}
           <div 
             className="absolute top-[-150px] left-0 w-full h-[742px] z-0 opacity-[0.52]"
             style={{
               backgroundImage: `url(${blogBg})`,
               backgroundSize: 'cover',
               backgroundPosition: 'center -50px',
               backgroundRepeat: 'no-repeat'
             }}
           ></div>

           {/* Bottom Background Image */}
           <div 
             className="absolute top-[600px] h-[742px] bottom-0 left-0 w-full z-0"
             style={{
               backgroundImage: `url(${blogBg2})`,
               backgroundSize: 'cover',
               backgroundPosition: 'top center',
               backgroundRepeat: 'no-repeat'
             }}
           ></div>
           
           {/* Dark overlay */}
           <div className="absolute inset-0 bg-[#090C03]/40"></div>
        </div>

        {/* Carousel Wrapper - Center Vertically */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          
          {/* Original Carousel Logic */}
          <div 
            className="relative h-[650px] w-full"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Cards Container */}
            <div className="absolute inset-0 flex justify-center perspective-[2000px] items-center">
              {testimonials.map((testimonial, index) => {
                // Calculate relative position for circular buffer
                let position = (index - currentIndex);
                if (position > testimonials.length / 2) position -= testimonials.length;
                if (position < -testimonials.length / 2) position += testimonials.length;
                
                const isCenter = position === 0;

                return (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    position={position}
                    isCenter={isCenter}
                  />
                );
              })}
            </div>

            {/* Controls & Progress */}
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-6 z-50">
            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => handleManualChange((currentIndex - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all text-white/70"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleManualChange(index)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      currentIndex === index 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={() => handleManualChange((currentIndex + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all text-white/70"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
