import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { logger } from '@/utils/logger';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      logger.debug('Subscribed with email:', email);
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const footerLinks = {
    quickLinks: [
      { name: 'Home', href: ROUTES?.HOME },
      { name: 'Courses', href: ROUTES?.COURSES },
      { name: 'Categories', href: ROUTES?.CATEGORIES }
    ],
    support: [
      { name: 'Contact Us', href: ROUTES?.CONTACT },
      { name: 'FAQs', href: ROUTES?.FAQ },
      { name: 'Cancellation & Refunds', href: ROUTES?.REFUNDS },
    ],
    company: [
      { name: 'About Us', href: ROUTES?.ABOUT },
      { name: 'Privacy Policy', href: ROUTES?.PRIVACY_POLICY },
      { name: 'Terms of Use', href: ROUTES?.TERMS },
      { name: 'Shipping and Delivery Policy', href: ROUTES?.SHIPPING_DELIVERY },
    ]
  };

  const legalLinks = [];

  // Helper to safely render links
  const renderLink = (link, index) => {
    if (typeof link.href === 'string' && link.href.startsWith('/')) {
      return (
        <Link
          key={index}
          to={link.href}
          className="text-white text-[14px] hover:opacity-80 transition-all font-satoshi"
        >
          {link.name}
        </Link>
      );
    }
    return (
      <a
        key={index}
        href={link.href || '#'}
        className="text-white text-[14px] hover:opacity-80 transition-all font-satoshi"
      >
        {link.name}
      </a>
    );
  };

  return (
    <footer className="relative w-full pt-12 pb-8 px-4 font-satoshi bg-gradient-to-b from-[#090c03] via-[#2d1419] via-55% to-[#3d1a20] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 relative z-10 font-satoshi">
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-14 mb-10 font-satoshi">
          {['quickLinks', 'support', 'company'].map((section) => (
            <div key={section} className="font-satoshi">
              <h3 className="text-white text-[20px] font-bold mb-8 tracking-tight capitalize font-satoshi">
                {section.replace(/([A-Z])/g, ' $1')}
              </h3>
              <ul className="space-y-4 font-satoshi">
                {footerLinks[section].map((link, index) => (
                  <li key={index} className="font-satoshi">
                    {renderLink(link, index)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/10 mb-8"></div>

        {/* Subscription & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-8 font-satoshi">
          <form onSubmit={handleSubscribe} className="relative w-full md:w-[410px] font-satoshi">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email Address"
              className="w-full border border-white/10 rounded-xl pl-6 pr-32 py-4 text-white text-[15px] placeholder:text-white focus:outline-none focus:border-white/20 transition-all font-satoshi font-medium"
            />
            <button
              type="submit"
              disabled={isSubscribed}
              className="absolute right-2 top-2 bottom-2 bg-[#312527] hover:bg-[#413537] border border-white/5 text-white text-[13px] font-bold px-7 rounded-lg transition-all font-satoshi disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>

          <div className="flex gap-4 font-satoshi">
            {[Facebook, Instagram, Linkedin].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-12 h-12 rounded-2xl border border-white/30 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 hover:border-white/50 transition-all duration-300 group shadow-lg"
              >
                <Icon className="w-6 h-6 text-white group-hover:opacity-90 transition-all" />
              </a>
            ))}
          </div>
        </div>

        {/* Legal Links */}
        <div className="space-y-4 font-satoshi text-center">
          {/* <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-satoshi">
            {legalLinks.map((link, index) => renderLink(link, index))}
          </div> */}

          <div className="pt-2">
            <p className="text-white text-[12px] font-medium tracking-widest uppercase font-satoshi leading-relaxed">
              © 2026 All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
