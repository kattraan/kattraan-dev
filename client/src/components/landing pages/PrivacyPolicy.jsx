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

      {/* ─── CONTENT SECTIONS (TABLE FORMAT) ─── */}
      <section className="max-w-[1000px] mx-auto px-6 lg:px-8 pb-24 relative z-10">
        <div className="w-full overflow-x-auto rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-6 md:p-8 text-xl font-bold text-white w-1/3">Policy Section</th>
                <th className="p-6 md:p-8 text-xl font-bold text-white">Details & Information</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {/* 1. Personal Information */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <User className="w-5 h-5 text-[#FF8C42]" />
                  Personal Information
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">We may collect the following personal information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Mobile Number</li>
                    <li>Billing Address</li>
                    <li>Payment Information</li>
                    <li>Account Credentials</li>
                  </ul>
                </td>
              </tr>

              {/* 2. Learning Information */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Learning Information
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">To improve your learning experience, we may collect:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Course enrollments and progress</li>
                    <li>Assessment results</li>
                    <li>Certificate status</li>
                    <li>Learning preferences</li>
                  </ul>
                </td>
              </tr>

              {/* 3. Technical Information */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-emerald-400" />
                  Technical Information
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">We may automatically collect:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP Address and Browser Information</li>
                    <li>Device Information</li>
                    <li>Usage Analytics</li>
                    <li>Cookies</li>
                  </ul>
                </td>
              </tr>

              {/* 4. How We Use Information */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <Settings className="w-5 h-5 text-primary-pink" />
                  Data Usage
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Create and manage accounts</li>
                    <li>Process payments securely</li>
                    <li>Provide course access and deliver learning services</li>
                    <li>Generate certificates</li>
                    <li>Improve platform performance</li>
                    <li>Provide customer support and send notifications</li>
                  </ul>
                </td>
              </tr>

              {/* 5. Data Security */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-purple-400" />
                  Data Security
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">We implement reasonable technical, administrative, and organizational safeguards to protect user information.</p>
                  <p>Despite our efforts, no system can guarantee absolute security. Users are encouraged to maintain strong passwords and protect account credentials.</p>
                </td>
              </tr>

              {/* 6. Third-Party Services */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-amber-400" />
                  Third-Party Services
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">We may use trusted third-party service providers for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Payment Processing</li>
                    <li>Cloud Infrastructure and Analytics</li>
                    <li>Communication Services</li>
                    <li>Security Monitoring</li>
                  </ul>
                </td>
              </tr>

              {/* 7. User Rights */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  User Rights
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-2">As a Kattraan user, you may:</p>
                  <ul className="list-disc list-inside space-y-1 mb-4">
                    <li>Access your personal data</li>
                    <li>Request corrections</li>
                    <li>Request account deletion</li>
                    <li>Withdraw marketing consent</li>
                  </ul>
                  <p>Submit requests at <a href="mailto:kattraan.lms@gmail.com" className="text-primary-pink hover:underline font-medium">kattraan.lms@gmail.com</a></p>
                </td>
              </tr>

              {/* 8. Contact Information */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 md:p-8 align-top font-semibold text-white/90 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-pink-400" />
                  Contact Us
                </td>
                <td className="p-6 md:p-8 align-top text-white/70">
                  <p className="mb-3">If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <p className="font-bold text-white mb-1">Urbancode Training And Solutions Private Limited</p>
                    <p>9/29, 5th St, Kamakoti Nagar, Pallikaranai,</p>
                    <p>Chennai, Tamil Nadu, 600100</p>
                    <p className="mt-2 text-white/90">Email: kattraan.lms@gmail.com</p>
                    <p className="text-white/90">Phone: +91 92268 92667</p>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
