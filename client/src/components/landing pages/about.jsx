import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Code2, 
  Users, 
  Briefcase, 
  Award, 
  TrendingUp, 
  Target, 
  Globe, 
  Rocket, 
  Infinity, 
  ChevronRight, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { ROUTES } from "@/config/routes";
const About = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#090C03] text-white">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-pink/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-10 w-[400px] h-[400px] rounded-full bg-primary-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-10 w-[600px] h-[600px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-36 flex flex-col items-center justify-center text-center px-6">
        {/* Animated Badge */}
        <div className="relative inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float-delayed">
          <Sparkles className="w-4 h-4 text-primary-pink" />
          <span className="text-sm font-medium tracking-wider text-white/90">
            About Kattraan
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl">
          Education Should Create <br />
          <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
            Capability
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
          Moving beyond traditional certificates to empower learners worldwide with practical, 
          industry-relevant skills that build true career confidence.
        </p>

        {/* Wave or decorative separator at the bottom of hero */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#FF8C42] font-bold">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                Building Skills That Matter
              </h2>
            </div>

            <div className="space-y-6 text-white/70 text-base md:text-lg leading-relaxed font-light">
              <p>
                The world is changing faster than ever. Technologies evolve, industries transform, 
                and the skills required by employers continue to grow.
              </p>
              <p>
                Unfortunately, traditional learning methods often struggle to keep pace with these changes. 
                Many learners complete courses and earn certificates, yet still find it challenging to apply 
                their knowledge confidently in real-world situations.
              </p>
              <p className="font-medium text-white">
                Kattraan was founded to solve this gap.
              </p>
            </div>

            {/* Quote Block */}
            <div className="relative pl-6 border-l-4 border-primary-pink my-8">
              <p className="text-xl md:text-2xl font-bold italic text-white/90 leading-snug">
                "Education should not stop at knowledge. It should create capability."
              </p>
            </div>

            <div className="space-y-6 text-white/70 text-base md:text-lg leading-relaxed font-light">
              <p>
                We believe that learning becomes truly valuable when learners can apply concepts, 
                solve problems, build projects, and create meaningful outcomes.
              </p>
              <p>
                Kattraan is designed as a modern learning ecosystem where education, mentorship, 
                and practical experience come together to help learners develop confidence and 
                career-ready skills.
              </p>
            </div>

            {/* Target Audience List */}
            <div className="pt-4">
              <p className="font-bold text-white mb-4">Whether you are:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "A student preparing for your first internship",
                  "A graduate entering the job market",
                  "A professional looking to upskill",
                  "An entrepreneur learning new technologies"
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary-pink flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm md:text-base font-light">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-base md:text-lg mt-6 font-light">
                Kattraan provides the resources, structure, and support needed to move forward.
              </p>
            </div>
          </div>

          {/* Right: Graphic / Visual Board */}
          <div className="lg:col-span-5 relative">
            {/* Visual Glass Box */}
            <div className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl shadow-2xl overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-primary-pink/20 blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-[#FF8C42]/20 blur-[60px]" />

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
                <ShieldCheck className="w-5 h-5 text-primary-pink" />
                The Kattraan Model
              </h3>

              {/* Interactive Mock Capability Progress */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60 font-light">Theoretical Knowledge</span>
                    <span className="text-[#FF8C42] font-semibold">100%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF8C42] rounded-full w-[100%] transition-all duration-1000" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60 font-light">Practical Application</span>
                    <span className="text-primary-pink font-semibold">Ready to Apply</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF8C42] to-primary-pink rounded-full w-[90%] animate-pulse" />
                  </div>
                </div>

                {/* Grid Overlay showing features */}
                <div className="pt-4 mt-6 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs text-white/50 bg-white/[0.03] p-3 rounded-lg">
                    <span>Active Coursework</span>
                    <span className="text-green-400 font-bold">100% Practical</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/50 bg-white/[0.03] p-3 rounded-lg">
                    <span>Mock Projects Completed</span>
                    <span className="text-white font-semibold">Industry-standard</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/50 bg-white/[0.03] p-3 rounded-lg">
                    <span>Mentorship Sessions</span>
                    <span className="text-primary-pink font-bold">Live Q&A Included</span>
                  </div>
                </div>
              </div>

              {/* Decorative Brand Tag */}
              <div className="mt-8 pt-4 flex items-center justify-between text-xs text-white/40">
                <span>Confidence Tracker</span>
                <span className="px-2.5 py-1 rounded-full bg-primary-pink/10 border border-primary-pink/20 text-primary-pink font-semibold uppercase tracking-wider">
                  Kattraan Certified
                </span>
              </div>
            </div>

            {/* Glowing Accent Ring behind the box */}
            <div className="absolute inset-0 border border-white/5 rounded-3xl -m-4 pointer-events-none scale-105 opacity-50 blur-[2px] transition-transform duration-500 group-hover:scale-110" />
          </div>

        </div>
      </section>

      {/* 3. MISSION & VISION SECTION */}
      <section className="relative py-16 lg:py-24 bg-[#0c091a]/40 border-t border-b border-white/5 overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-brand-glow-soft pointer-events-none opacity-40" />

        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Mission Card */}
            <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-md flex flex-col justify-between hover:border-[#FF8C42]/30 transition-all duration-500 group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8C42]/20 to-[#FF8C42]/5 border border-[#FF8C42]/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-[#FF8C42]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Our Mission</h3>
                <p className="text-white/75 text-base md:text-lg font-light leading-relaxed">
                  To empower learners worldwide with practical, industry-relevant education that enables 
                  career growth, professional success, and lifelong learning.
                </p>
              </div>
              <div className="h-1 w-20 bg-[#FF8C42] mt-8 rounded-full group-hover:w-full transition-all duration-500" />
            </div>

            {/* Vision Card */}
            <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-md flex flex-col justify-between hover:border-primary-pink/30 transition-all duration-500 group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-pink/20 to-primary-pink/5 border border-primary-pink/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-7 h-7 text-primary-pink" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Our Vision</h3>
                <p className="text-white/75 text-base md:text-lg font-light leading-relaxed">
                  To become one of the most trusted learning platforms for skill development, professional growth, 
                  and career transformation.
                </p>
              </div>
              <div className="h-1 w-20 bg-primary-pink mt-8 rounded-full group-hover:w-full transition-all duration-500" />
            </div>

          </div>
        </div>
      </section>

      {/* 4. WHAT WE BELIEVE SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-20 lg:py-28 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-primary-pink font-bold">
            Core Values
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
            What We Believe
          </h2>
          <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
            Our principles guide everything we build, the courses we curate, and how we support our learning community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Learning Should Be Practical",
              desc: "Knowledge becomes valuable when it can be applied to real-world challenges.",
              icon: Target,
              color: "from-orange-500 to-red-500",
              border: "hover:border-orange-500/30"
            },
            {
              title: "Learning Should Be Accessible",
              desc: "Quality education should be available to anyone willing to learn.",
              icon: Globe,
              color: "from-blue-500 to-indigo-500",
              border: "hover:border-blue-500/30"
            },
            {
              title: "Learning Should Create Opportunities",
              desc: "Education should open doors to better careers, better businesses, and better futures.",
              icon: Rocket,
              color: "from-pink-500 to-rose-500",
              border: "hover:border-pink-500/30"
            },
            {
              title: "Learning Never Stops",
              desc: "The most successful individuals are lifelong learners who continuously adapt and grow.",
              icon: Infinity,
              color: "from-purple-500 to-violet-500",
              border: "hover:border-purple-500/30"
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className={`p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex flex-col justify-between ${item.border} group`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20 flex items-center justify-center mb-6`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold mb-3 tracking-tight group-hover:text-white transition-colors duration-300">
                  {item.title}
                </h4>
                <p className="text-white/60 text-sm font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHAT KATTRAAN OFFERS SECTION */}
      <section className="relative py-20 lg:py-28 bg-[#0c091a]/40 border-t border-b border-white/5 overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-primary-pink/5 blur-[100px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Sticky Header Content on Desktop */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#FF8C42] font-bold">
                Ecosystem
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                What Kattraan Offers
              </h2>
              <p className="text-white/60 text-base font-light leading-relaxed">
                We provide a comprehensive framework of tools, mentorship, and courses designed to support long-term, continuous development.
              </p>
              <div className="pt-4">
                <Link
                  to={ROUTES.COURSES}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Offers Cards List */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Professional Courses",
                  desc: "Structured programs covering industry-relevant skills and technologies.",
                  icon: BookOpen,
                  accent: "text-amber-400 bg-amber-400/10"
                },
                {
                  title: "Project-Based Learning",
                  desc: "Hands-on projects that help learners gain practical implementation experience.",
                  icon: Code2,
                  accent: "text-blue-400 bg-blue-400/10"
                },
                {
                  title: "Mentorship",
                  desc: "Guidance from experienced professionals and instructors.",
                  icon: Users,
                  accent: "text-emerald-400 bg-emerald-400/10"
                },
                {
                  title: "Career Development",
                  desc: "Support focused on improving employability and professional readiness.",
                  icon: Briefcase,
                  accent: "text-[#FF8C42] bg-[#FF8C42]/10"
                },
                {
                  title: "Certifications",
                  desc: "Certificates awarded upon successful completion of eligible programs.",
                  icon: Award,
                  accent: "text-primary-pink bg-primary-pink/10"
                },
                {
                  title: "Continuous Learning",
                  desc: "Resources designed to support long-term growth and skill development.",
                  icon: TrendingUp,
                  accent: "text-purple-400 bg-purple-400/10"
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 flex items-start gap-5 group"
                >
                  <div className={`p-3 rounded-xl ${item.accent} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2 tracking-tight group-hover:text-white transition-colors duration-300">
                      {item.title}
                    </h4>
                    <p className="text-white/60 text-sm font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="relative py-24 lg:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-pink/10 blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Ready to Build Skills <br />
            <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
              That Actually Matter?
            </span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Join thousands of learners who are transforming their lives through project-driven capability building.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to={ROUTES.SIGNUP}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 group transition-all"
            >
              Get Started Now
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={ROUTES.COURSES}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
