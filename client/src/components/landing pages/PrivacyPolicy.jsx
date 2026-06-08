import React from "react";
import {
  Shield,
  User,
  BookOpen,
  Monitor,
  Settings,
  Lock,
  ExternalLink,
  UserCheck,
  Sparkles,
  Mail,
  CheckCircle2,
} from "lucide-react";

/**
 * Data-driven section renderer — each privacy topic is a card with icon, title,
 * and either a bullet list or paragraph body. This keeps the JSX lean while
 * allowing the content array below to stay readable.
 */
const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
  <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-xl group hover:border-white/15 transition-all duration-500">
    <div className="flex items-start gap-5 mb-6">
      <div
        className={`p-3 rounded-xl ${iconColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight pt-1">
        {title}
      </h2>
    </div>
    <div className="space-y-4 text-white/70 text-base font-light leading-relaxed pl-0 md:pl-[68px]">
      {children}
    </div>
  </div>
);

const BulletList = ({ heading, items }) => (
  <div>
    {heading && (
      <h3 className="text-lg font-bold text-white mb-3">{heading}</h3>
    )}
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-primary-pink flex-shrink-0 mt-1" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#090C03] text-white">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary-purple/8 blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-0 w-[400px] h-[400px] rounded-full bg-primary-pink/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-10 w-[500px] h-[500px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-28 flex flex-col items-center justify-center text-center px-6">
        <div className="relative inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float-delayed">
          <Sparkles className="w-4 h-4 text-primary-pink" />
          <span className="text-sm font-medium tracking-wider text-white/90">
            Your Privacy Matters
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-4xl">
          Privacy{" "}
          <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
            Policy
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
          Kattraan respects your privacy and is committed to protecting your
          personal information. This policy explains how we collect, use, store,
          and safeguard your data.
        </p>

        {/* Effective-date badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60">
          <Shield className="w-4 h-4 text-[#FF8C42]" />
          <span>
            Effective Date: <strong className="text-white/90">June 2026</strong>
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
      </section>

      {/* ─── CONTENT SECTIONS ─── */}
      <section className="max-w-[1000px] mx-auto px-6 lg:px-8 pb-24 relative z-10 space-y-8">
        {/* 1. Personal Information */}
        <SectionCard
          icon={User}
          iconColor="text-[#FF8C42] bg-[#FF8C42]/10"
          title="Personal Information"
        >
          <p>We may collect the following personal information:</p>
          <BulletList
            items={[
              "Full Name",
              "Email Address",
              "Mobile Number",
              "Billing Address",
              "Payment Information",
              "Account Credentials",
            ]}
          />
        </SectionCard>

        {/* 2. Learning Information */}
        <SectionCard
          icon={BookOpen}
          iconColor="text-blue-400 bg-blue-400/10"
          title="Learning Information"
        >
          <p>
            To improve your learning experience, we may collect:
          </p>
          <BulletList
            items={[
              "Course enrollments",
              "Course progress",
              "Assessment results",
              "Certificate status",
              "Learning preferences",
            ]}
          />
        </SectionCard>

        {/* 3. Technical Information */}
        <SectionCard
          icon={Monitor}
          iconColor="text-emerald-400 bg-emerald-400/10"
          title="Technical Information"
        >
          <p>We may automatically collect:</p>
          <BulletList
            items={[
              "IP Address",
              "Browser Information",
              "Device Information",
              "Usage Analytics",
              "Cookies",
            ]}
          />
        </SectionCard>

        {/* 4. How We Use Information */}
        <SectionCard
          icon={Settings}
          iconColor="text-primary-pink bg-primary-pink/10"
          title="How We Use Information"
        >
          <p>We use the information we collect to:</p>
          <BulletList
            items={[
              "Create and manage accounts",
              "Process payments securely",
              "Provide course access",
              "Deliver learning services",
              "Generate certificates",
              "Improve platform performance",
              "Provide customer support",
              "Send important service notifications",
            ]}
          />
        </SectionCard>

        {/* 5. Data Security */}
        <SectionCard
          icon={Lock}
          iconColor="text-purple-400 bg-purple-400/10"
          title="Data Security"
        >
          <p>
            We implement reasonable technical, administrative, and
            organizational safeguards to protect user information.
          </p>
          <p>
            Despite our efforts, no system can guarantee absolute security.
            Users are encouraged to maintain strong passwords and protect
            account credentials.
          </p>
        </SectionCard>

        {/* 6. Third-Party Services */}
        <SectionCard
          icon={ExternalLink}
          iconColor="text-amber-400 bg-amber-400/10"
          title="Third-Party Services"
        >
          <p>
            We may use trusted third-party service providers for:
          </p>
          <BulletList
            items={[
              "Payment Processing",
              "Cloud Infrastructure",
              "Analytics",
              "Communication Services",
              "Security Monitoring",
            ]}
          />
        </SectionCard>

        {/* 7. User Rights */}
        <SectionCard
          icon={UserCheck}
          iconColor="text-emerald-400 bg-emerald-400/10"
          title="User Rights"
        >
          <p>As a Kattraan user, you may:</p>
          <BulletList
            items={[
              "Access their personal data",
              "Request corrections",
              "Request account deletion",
              "Withdraw marketing consent",
            ]}
          />
          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary-pink flex-shrink-0" />
            <p className="text-sm">
              Submit requests at{" "}
              <a
                href="mailto:kattraan.lms@gmail.com"
                className="text-primary-pink hover:underline font-medium"
              >
                support@kattraan.com
              </a>
            </p>
          </div>
        </SectionCard>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
