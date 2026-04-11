/**
 * REFERENCE: Production-style Footer (example from Frontend Deep Audit).
 * This file is for comparison only. To use it, rename to Footer.jsx or swap imports.
 *
 * Improvements over original:
 * - No console.log; optional onSubscribe callback for analytics/API
 * - Link config extracted to constant (could be a separate config file)
 * - React.memo to prevent re-renders when parent updates
 * - useCallback for submit handler; stable reference for children
 * - Semantic section title formatting via helper
 * - Accessible button type and form labels
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const FOOTER_LINKS = {
  product: [
    { name: 'Landing Page', href: '#' },
    { name: 'Popup Builder', href: '#' },
    { name: 'Web-design', href: '#' },
    { name: 'Content', href: '#' },
    { name: 'Integrations', href: '#' },
  ],
  useCases: [
    { name: 'Web-designers', href: '#' },
    { name: 'Marketers', href: '#' },
    { name: 'Small Business', href: '#' },
    { name: 'Website Builder', href: '#' },
  ],
  resources: [
    { name: 'Academy', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Themes', href: '#' },
    { name: 'Hosting', href: '#' },
    { name: 'Developers', href: '#' },
    { name: 'Support', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'FAQs', href: '#' },
    { name: 'Teams', href: '#' },
    { name: 'Contact Us', href: '#' },
  ],
};

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Use', href: '#' },
  { name: 'Sales and Refunds', href: '#' },
  { name: 'Legal', href: '#' },
  { name: 'Site Map', href: '#' },
];

const SOCIAL_ICONS = [Facebook, Instagram, Linkedin];

const SECTION_KEYS = ['product', 'useCases', 'resources', 'company'];

function formatSectionTitle(key) {
  return key.replace(/([A-Z])/g, ' $1').trim();
}

const Footer = React.memo(function Footer({ onSubscribe }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = useCallback(
    (e) => {
      e.preventDefault();
      if (typeof onSubscribe === 'function') {
        onSubscribe(email);
      }
      setEmail('');
    },
    [email, onSubscribe]
  );

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const linkSections = useMemo(
    () =>
      SECTION_KEYS.map((section) => ({
        key: section,
        title: formatSectionTitle(section),
        links: FOOTER_LINKS[section],
      })),
    []
  );

  return (
    <footer
      className="relative w-full pt-20 pb-16 px-4 font-satoshi bg-gradient-to-b from-[#090c03] via-[#2d1419] via-55% to-[#3d1a20] overflow-hidden"
      role="contentinfo"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 relative z-10 font-satoshi">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-14 mb-20 font-satoshi">
          {linkSections.map(({ key, title, links }) => (
            <div key={key} className="font-satoshi">
              <h3 className="text-white text-[20px] font-bold mb-8 tracking-tight capitalize font-satoshi">
                {title}
              </h3>
              <ul className="space-y-4 font-satoshi">
                {links.map((link) => (
                  <li key={link.name} className="font-satoshi">
                    <a
                      href={link.href}
                      className="text-white text-[14px] hover:opacity-80 transition-all font-satoshi"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="w-full h-[1px] bg-white/10 mb-14" aria-hidden="true" />

        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8 font-satoshi">
          <form
            onSubmit={handleSubscribe}
            className="relative w-full md:w-[410px] font-satoshi"
            aria-label="Newsletter subscription"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email Address"
              className="w-full border border-white/10 rounded-xl pl-6 pr-32 py-4 text-white text-[15px] placeholder:text-white focus:outline-none focus:border-white/20 transition-all font-satoshi font-medium"
              autoComplete="email"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-[#312527] hover:bg-[#413537] border border-white/5 text-white text-[13px] font-bold px-7 rounded-lg transition-all font-satoshi"
            >
              Subscribe
            </button>
          </form>

          <div className="flex gap-4 font-satoshi" role="list">
            {SOCIAL_ICONS.map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-12 h-12 rounded-2xl border border-white/30 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 hover:border-white/50 transition-all duration-300 group shadow-lg"
                aria-label={`Social link ${idx + 1}`}
              >
                <Icon className="w-6 h-6 text-white group-hover:opacity-90 transition-all" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-10 font-satoshi text-center">
          <nav aria-label="Legal and site links">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-satoshi">
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white text-[14px] hover:opacity-80 transition-all font-satoshi font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </nav>
          <p className="text-white text-[12px] font-medium tracking-widest uppercase font-satoshi leading-relaxed pt-2">
            © 2026 All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
