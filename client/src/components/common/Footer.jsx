import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
import { logger } from '@/utils/logger';

/**
 * High-fidelity Footer matching the reference image and user specifications.
 * Uses Satoshi font and integrates seamlessly with the Landing Page gradient.
 */
const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    logger.debug('Subscribed with email:', email);
  };

  const footerLinks = {
    product: [
      { name: 'Landing Page', href: '#' },
      { name: 'Popup Builder', href: '#' },
      { name: 'Web-design', href: '#' },
      { name: 'Content', href: '#' },
      { name: 'Integrations', href: '#' }
    ],
    useCases: [
      { name: 'Web-designers', href: '#' },
      { name: 'Marketers', href: '#' },
      { name: 'Small Business', href: '#' },
      { name: 'Website Builder', href: '#' }
    ],
    resources: [
      { name: 'Academy', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Themes', href: '#' },
      { name: 'Hosting', href: '#' },
      { name: 'Developers', href: '#' },
      { name: 'Support', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'FAQs', href: '#' },
      { name: 'Teams', href: '#' },
      { name: 'Contact Us', href: '#' }
    ]
  };

  const legalLinks = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Use', href: '#' },
    { name: 'Sales and Refunds', href: '#' },
    { name: 'Legal', href: '#' },
    { name: 'Site Map', href: '#' }
  ];

  return (
    <footer className="relative w-full pt-20 pb-16 px-4 font-satoshi bg-gradient-to-b from-[#090c03] via-[#2d1419] via-55% to-[#3d1a20] overflow-hidden">
      {/* 
          Seamless integration with consistent dark brownish-burgundy background matching the reference image.
      */}
      
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 relative z-10 font-satoshi">
        {/* Main Footer Links - 4 Column Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-14 mb-20 font-satoshi">
          {['product', 'useCases', 'resources', 'company'].map((section) => (
            <div key={section} className="font-satoshi">
              <h3 className="text-white text-[20px] font-bold mb-8 tracking-tight capitalize font-satoshi">
                {section.replace(/([A-Z])/g, ' $1')}
              </h3>
              <ul className="space-y-4 font-satoshi">
                {footerLinks[section].map((link, index) => (
                  <li key={index} className="font-satoshi">
                    <a href={link.href} className="text-white text-[14px] hover:opacity-80 transition-all font-satoshi ">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full h-[1px] bg-white/10 mb-14"></div>

        {/* Subscription & Socials Row */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8 font-satoshi">
          {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="relative w-full md:w-[410px] font-satoshi">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email Address"
              className="w-full  border border-white/10 rounded-xl pl-6 pr-32 py-4 text-white text-[15px] placeholder:text-white focus:outline-none focus:border-white/20 transition-all font-satoshi font-medium"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-[#312527] hover:bg-[#413537] border border-white/5 text-white text-[13px] font-bold px-7 rounded-lg transition-all font-satoshi"
            >
              Subscribe
            </button>
          </form>

          {/* Social Icons - Glassy effect boxes */}
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

        {/* Legal Links & Copyright */}
        <div className="space-y-10 font-satoshi text-center">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-satoshi">
            {legalLinks.map((link, index) => (
              <a key={index} href={link.href} className="text-white text-[14px] hover:opacity-80 transition-all font-satoshi font-medium">
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-white text-[12px] font-medium tracking-widest uppercase font-satoshi leading-relaxed">© 2026 All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;