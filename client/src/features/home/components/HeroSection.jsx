import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronRight } from "lucide-react";
import TrendingCourses from "./TrendingCourses";
import { getStartLearningPath } from "@/features/home/utils/landingNavigation";
import heroBackground from "@/assets/hero-background.webp";
import heroBackgroundSm from "@/assets/hero-background-sm.webp";
import heroDecorationRightBottom from "@/assets/hero-decoration-right-bottom.png";
import heroDecorationLeft from "@/assets/hero-decoration-left.png";
import heroDecorationRightTop from "@/assets/hero-decoration-right-top.png";

const HeroSection = () => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const user = useSelector((state) => state.auth?.user);
  const startLearningPath = getStartLearningPath(isAuthenticated, user);

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-start pt-28 md:pt-32 lg:pt-36 xl:pt-44 pb-8">
      <picture>
        <source media="(max-width: 768px)" srcSet={heroBackgroundSm} type="image/webp" />
        <img
          src={heroBackground}
          alt=""
          role="presentation"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-[65%_center]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#090C03] via-[#090C03]/60 to-transparent pointer-events-none" />

      <img
        src={heroDecorationRightBottom}
        className="hidden lg:block absolute right-[30%] top-[20%] w-20 opacity-90"
        alt=""
        role="presentation"
        loading="lazy"
        decoding="async"
        width={80}
        height={80}
      />
      <img
        src={heroDecorationRightTop}
        className="hidden lg:block absolute left-[20%] top-[45%] w-24 opacity-90"
        alt=""
        role="presentation"
        loading="lazy"
        decoding="async"
        width={96}
        height={96}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="relative">
          <div
            className="px-8 py-2 rounded-full border border-white/10 shadow-[0_0_30px_rgba(235,100,100,0.1)]"
            style={{
              background:
                "linear-gradient(90deg, rgba(61, 18, 25, 0.5) 0%, rgba(30, 10, 15, 0.5) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-white text-[15px] font-normal tracking-wide">
              Upskill. Anytime. Anywhere.
            </span>
          </div>
          <img
            src={heroDecorationLeft}
            className="absolute -top-4 -right-5 w-6 h-6"
            alt=""
            role="presentation"
            loading="lazy"
            decoding="async"
            width={24}
            height={24}
          />
        </div>

       
        <h1 className="mt-2 md:mt-3 text-white font-black text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] leading-tight tracking-tight px-4">
          New-Gen <br /> Learning Hub
        </h1>

        <p className="text-white/90 mt-4 text-sm md:text-[15px] max-w-md">
          Master in-demand skills with practical courses built for working learners.
        </p>

        <Link
          to={startLearningPath}
          className="mt-8 inline-flex items-center gap-3 text-white px-10 py-2.5 rounded-full text-[17px] font-medium border border-white/30 backdrop-blur-md bg-[rgba(168,85,108,0.5)] hover:bg-[rgba(168,85,108,0.6)] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
        >
          Start learning
          <ChevronRight className="h-5 w-5" aria-hidden />
        </Link>

        <TrendingCourses />
      </div>
    </section>
  );
};

export default HeroSection;
