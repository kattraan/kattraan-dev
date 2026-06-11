import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Timer,
  Handshake,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { logger } from "@/utils/logger";
const Contact = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    logger.debug("Contact form submitted:", formState);
    setIsSubmitted(true);
    setFormState({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#090C03] text-white">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-purple/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-10 w-[400px] h-[400px] rounded-full bg-primary-pink/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-10 w-[600px] h-[600px] rounded-full bg-[#ff8c42]/5 blur-[180px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-28 flex flex-col items-center justify-center text-center px-6">
        <div className="relative inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float">
          <Sparkles className="w-4 h-4 text-primary-pink" />
          <span className="text-sm font-medium tracking-wider text-white/90">
            Get In Touch
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl">
          We'd Love to <br />
          <span className="text-gradient-brand bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
            Hear From You
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
          At Kattraan, learner success is our priority. Our team is available to assist you
          with any questions, feedback, or inquiries.
        </p>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#090C03] to-transparent pointer-events-none" />
      </section>

      {/* 2. CONTACT FORM & INFO SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary-pink" />
                Send us a Message
              </h2>
              <p className="text-white/60 text-sm font-light mb-8">
                Fill out the form below and we will get back to you according to our response times.
              </p>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-white/60 text-sm">Thank you for contacting Kattraan. We will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-pink/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-pink/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formState.subject}
                      onChange={handleChange}
                      placeholder="Course Inquiry / Technical Issue"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-pink/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-pink/50 focus:bg-white/[0.05] transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3 group transition-all"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Info Cards */}
          <div className="lg:col-span-5 space-y-6">

            {/* Customer Support Card */}
            <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-white/[0.005] backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                <Mail className="w-5 h-5 text-primary-pink" />
                Customer Support
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary-pink/10 text-primary-pink mt-1">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Email Support</p>
                    <a href="mailto:support@kattraan.com" className="text-white hover:text-primary-pink transition-colors font-medium">
                      kattraan.lms@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary-pink/10 text-primary-pink mt-1">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Phone Support</p>
                    <a href="tel:+91 98787 98797" className="text-white hover:text-primary-pink transition-colors font-medium">
                      +91 98787 98797
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary-pink/10 text-primary-pink mt-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Registered Office</p>
                    <p className="text-white/80 font-light text-sm leading-relaxed mt-1">
                      Urbancode Training And Solutions
                      Private Limited,<br />
                      9/29, 5th St, Kamakoti Nagar, Pallikaranai, Chennai, Tamil Nadu, 600100
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Hours Card */}
            <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-white/[0.005] backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-white/50 uppercase tracking-wider font-bold flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#FF8C42]" />
                  Support Hours
                </h4>
                <p className="text-white font-semibold">Monday to Saturday</p>
                <p className="text-sm text-white/70 font-light">9:00 AM – 6:00 PM IST</p>
              </div>

              <div>
                <h4 className="text-xs text-white/50 uppercase tracking-wider font-bold flex items-center gap-2 mb-2">
                  <Timer className="w-3.5 h-3.5 text-[#FF8C42]" />
                  Expected Response
                </h4>
                <ul className="text-xs text-white/70 space-y-1 font-light">
                  <li>• General: Within 24 hours</li>
                  <li>• Technical: Within 24–48 hours</li>
                  <li>• Payments: Within 24 hours</li>
                </ul>
              </div>
            </div>




          </div>

        </div>
      </section>
    </div>
  );
};

export default Contact;
