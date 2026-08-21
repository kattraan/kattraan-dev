import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ChevronRight,
  UserPlus,
  ClipboardList,
  ShieldCheck,
  MailCheck,
  GraduationCap,
  Clock,
  FileText,
  Headphones,
  MonitorPlay,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up as an instructor in minutes — or activate instructor access if you already learn on Kattraan.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Complete your profile",
    desc: "Share a short bio, your expertise, experience, and links. Upload a photo and resume when ready.",
    icon: ClipboardList,
  },
  {
    step: "03",
    title: "Verify your identity",
    desc: "Upload a simple ID proof so we can keep the instructor community trusted and secure.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Get reviewed & approved",
    desc: "Our team reviews your application. You will get an email as soon as you are approved to teach.",
    icon: MailCheck,
  },
  {
    step: "05",
    title: "Start teaching",
    desc: "Open your instructor dashboard, build courses, go live with learners, and grow your reach.",
    icon: GraduationCap,
  },
];

const EASY_POINTS = [
  {
    title: "Guided, step-by-step form",
    desc: "Three clear steps — Basic, Professional, and Verification. No confusing paperwork.",
    icon: FileText,
  },
  {
    title: "Takes only a few minutes",
    desc: "Most applicants finish the profile setup in one short sitting.",
    icon: Clock,
  },
  {
    title: "Already a learner? Even easier",
    desc: "Log in and activate instructor access — no need to create a second account.",
    icon: CheckCircle2,
  },
];

const TEACH_BENEFITS = [
  {
    title: "Reach global learners",
    desc: "Publish courses that students can discover and enroll in from anywhere.",
    icon: Globe,
  },
  {
    title: "Simple course builder",
    desc: "Create lessons, quizzes, live sessions, and communities from one dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Secure payments",
    desc: "Focus on teaching while Kattraan handles enrollment and checkout securely.",
    icon: Wallet,
  },
];

const BecomeInstructor = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#090C03] text-white font-satoshi">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-pink/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[25%] right-0 w-[420px] h-[420px] rounded-full bg-primary-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-0 w-[560px] h-[560px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        <p className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-white/90 mb-5 animate-float-delayed">
          Kattraan
        </p>

        <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float">
          <Sparkles className="w-4 h-4 text-primary-pink" />
          <span className="text-sm font-medium tracking-wider text-white/90">
            Teach on Kattraan
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl">
          Become an{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end">
            Instructor
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/75 max-w-2xl font-light leading-relaxed">
          Share what you know. Apply in a few guided steps — and if you need help,
          we will walk you through it or give you a live demo.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={ROUTES.INSTRUCTOR_SIGNUP}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end hover:opacity-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 group transition-all"
          >
            Start Application
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={ROUTES.CONTACT}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            Get Guidance or Demo
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
      </section>

      {/* Why it is easy */}
      <section className="relative max-w-[1440px] mx-auto px-6 lg:px-16 py-16 lg:py-24 z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#FF8C42] font-bold">
            Simple by design
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
            Applying is easier than you think
          </h2>
          <p className="mt-4 text-white/65 text-base md:text-lg font-light leading-relaxed">
            We built the instructor application to feel clear and short — so you
            can focus on teaching, not paperwork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {EASY_POINTS.map((item) => (
            <div
              key={item.title}
              className="p-6 lg:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gradient-start/20 via-gradient-mid/20 to-gradient-end/20 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                <item.icon className="w-5 h-5 text-primary-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">{item.title}</h3>
              <p className="text-white/60 text-sm md:text-base font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="relative py-16 lg:py-24 bg-[#0c091a]/40 border-t border-b border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary-pink/5 blur-[140px] pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-16 z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-[#FF8C42] font-bold">
              How it works
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
              Your path from apply to teach
            </h2>
            <p className="mt-4 text-white/65 text-base md:text-lg font-light leading-relaxed">
              Here is the full instructor journey on Kattraan — transparent from
              day one.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-5 max-w-4xl mx-auto">
            {PROCESS_STEPS.map((item, idx) => (
              <div
                key={item.step}
                className="relative flex flex-col sm:flex-row gap-5 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:min-w-[4.5rem]">
                  <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-b from-gradient-start via-gradient-mid to-gradient-end">
                    {item.step}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary-pink" />
                  </div>
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm md:text-base font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="relative max-w-[1440px] mx-auto px-6 lg:px-16 py-16 lg:py-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs uppercase tracking-widest text-[#FF8C42] font-bold">
              Why teach here
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Tools built for real instructors
            </h2>
            <p className="text-white/65 text-base md:text-lg font-light leading-relaxed">
              Once approved, you get a full instructor workspace — courses,
              learners, analytics, live classes, and community — in one place.
            </p>
            <Link
              to={ROUTES.INSTRUCTOR_SIGNUP}
              className="inline-flex items-center gap-2 mt-2 text-sm font-bold text-primary-pink hover:underline group"
            >
              Begin your application
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEACH_BENEFITS.map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-pink/10 text-primary-pink flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-white/55 text-sm font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidance / demo */}
      <section className="relative py-16 lg:py-24 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl p-8 md:p-12 lg:p-14">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary-pink/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#FF8C42]/15 blur-[80px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="space-y-5">
                <span className="text-xs uppercase tracking-widest text-[#FF8C42] font-bold">
                  Stuck or unsure?
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  We will guide you — or show you a demo
                </h2>
                <p className="text-white/65 text-base md:text-lg font-light leading-relaxed">
                  Doubts about the form, documents, or how teaching works on
                  Kattraan? Reach out. Our team can answer questions and walk you
                  through a live demo of the instructor experience.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#FF8C42]/15 text-[#FF8C42] flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">Application guidance</h3>
                    <p className="text-white/55 text-sm font-light leading-relaxed">
                      Not sure what to write in your bio or which ID to upload?
                      Ask us — we will help you complete it correctly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-primary-pink/15 text-primary-pink flex items-center justify-center flex-shrink-0">
                    <MonitorPlay className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">Live product demo</h3>
                    <p className="text-white/55 text-sm font-light leading-relaxed">
                      See how course creation, live classes, and the instructor
                      dashboard work before you commit.
                    </p>
                  </div>
                </div>

                <Link
                  to={ROUTES.CONTACT}
                  className="mt-2 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end hover:opacity-95 shadow-lg shadow-pink-500/20 group transition-all"
                >
                  Contact Us for Help
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-pink/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Ready to teach on{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end">
              Kattraan?
            </span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Start your application now. If anything feels unclear, Contact Us —
            we are happy to guide you or schedule a demo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to={ROUTES.INSTRUCTOR_SIGNUP}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end hover:opacity-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 group transition-all"
            >
              Apply as Instructor
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeInstructor;
