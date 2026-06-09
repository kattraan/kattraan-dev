import React from "react";
import { Shield } from "lucide-react";

const Terms = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#090C03] text-white">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-pink/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-28 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl">
          Terms of <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">Use</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
          Please read these terms carefully before using our platform.
        </p>
      </section>

      <section className="max-w-[1000px] mx-auto px-6 lg:px-8 pb-24 relative z-10 space-y-8">
        <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            By accessing and using Kattraan, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">2. User Accounts</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">3. Intellectual Property</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            All content on this website, including courses, text, graphics, logos, and software, is the property of Urbancode Training And Solutions Private Limited and protected by intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">4. User Conduct</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            You agree not to use the platform for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">5. Modifications</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            We reserve the right to modify these terms at any time. Your continued use of the platform constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">6. Contact Information</h2>
          <div className="text-white/70 leading-relaxed">
            <p>If you have any questions about these Terms, please contact us at:</p>
            <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="font-bold text-white mb-2">Urbancode Training And Solutions Private Limited</p>
              <p>9/29, 5th St, Kamakoti Nagar, Pallikaranai,</p>
              <p>Chennai, Tamil Nadu, 600100</p>
              <p className="mt-2">Email: kattraan.lms@gmail.com</p>
              <p className="mt-1">Phone: +91 98787 98797</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
