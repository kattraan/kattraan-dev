import React from "react";
import { Shield } from "lucide-react";

const Shipping = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#090C03] text-white">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-pink/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-28 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl">
          Shipping & <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">Delivery</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
          Our policy regarding delivery of courses and digital products.
        </p>
      </section>

      <section className="max-w-[1000px] mx-auto px-6 lg:px-8 pb-24 relative z-10 space-y-8">
        <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.005] backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">1. Digital Delivery</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Kattraan offers digital educational content. As such, no physical shipping is involved. All purchased courses, certificates, and learning materials are delivered electronically.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">2. Access to Courses</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Upon successful payment processing, you will receive immediate access to the enrolled course(s) via your dashboard. A confirmation email will also be sent to your registered email address.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">3. Delivery Issues</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            If you experience any issues accessing your purchased content, please contact our support team immediately. We will ensure the issue is resolved promptly so you can continue your learning journey.
          </p>
          
          <h2 className="text-2xl font-bold mb-4 text-white">4. Contact Information</h2>
          <div className="text-white/70 leading-relaxed">
            <p>For any queries regarding the delivery of digital goods, please reach out to us at:</p>
            <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="font-bold text-white mb-2">Urbancode Training And Solutions Private Limited</p>
              <p>9/29, 5th St, Kamakoti Nagar, Pallikaranai,</p>
              <p>Chennai, Tamil Nadu, 600100</p>
              <p className="mt-2">Email: kattraan.lms@gmail.com</p>
              <p className="mt-1">Phone: +91 92268 92667</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shipping;
