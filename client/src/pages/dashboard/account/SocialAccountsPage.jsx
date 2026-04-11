import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HelpCircle } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { SOCIAL_ICONS } from '@/components/icons/SocialPlatformIcons';
import { updateProfile } from '@/features/auth/store/authSlice';
import { useToast } from '@/components/ui/Toast';

function AccountBreadcrumb({ items }) {
  return (
    <nav className="text-sm text-gray-500 dark:text-white/50 mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2">›</span>}
          {item.path ? (
            <Link to={item.path} className="hover:text-primary-pink dark:hover:text-primary-pink/90 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', placeholder: 'Paste facebook profile link' },
  { id: 'twitter', label: 'Twitter', placeholder: 'Paste twitter profile link' },
  { id: 'instagram', label: 'Instagram', placeholder: 'Paste instagram profile link' },
  { id: 'youtube', label: 'Youtube', placeholder: 'Paste youtube profile link' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'Paste linkedin profile link' },
];

export default function SocialAccountsPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const toast = useToast();
  const enrollment = user?.enrollmentData || {};
  const savedLinks = enrollment.socialLinks || {};
  const savedDisplay = enrollment.socialDisplayOnProfile || {};
  const [links, setLinks] = useState(savedLinks);
  const [displayOnProfile, setDisplayOnProfile] = useState(savedDisplay);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLinks(savedLinks);
    setDisplayOnProfile(savedDisplay);
  }, [user?._id]);

  const handleLinkChange = (id, value) => setLinks((prev) => ({ ...prev, [id]: value }));
  const toggleDisplay = (id) => setDisplayOnProfile((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      await dispatch(updateProfile({
        userId: user._id,
        payload: {
          enrollmentData: {
            socialLinks: links,
            socialDisplayOnProfile: displayOnProfile,
          },
        },
      })).unwrap();
      toast.success('Saved', 'Social accounts updated.');
    } catch (err) {
      toast.error('Save failed', err || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 font-satoshi">
      <AccountBreadcrumb items={[{ label: 'Account', path: ROUTES.DASHBOARD_MY_ACCOUNT }, { label: 'Social accounts', path: null }]} />
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Social accounts</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
            {PLATFORMS.map((platform) => {
              const Icon = SOCIAL_ICONS[platform.id];
              return (
              <div key={platform.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <input type="url" placeholder={platform.placeholder} value={links[platform.id] || ''} onChange={(e) => handleLinkChange(platform.id, e.target.value)} className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-pink/50" />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-white/50">Display on your profile</span>
                  <button type="button" role="switch" aria-checked={!!displayOnProfile[platform.id]} onClick={() => toggleDisplay(platform.id)} className={`relative w-11 h-6 rounded-full transition-colors ${displayOnProfile[platform.id] ? 'bg-primary-pink' : 'bg-gray-200 dark:bg-white/20'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${displayOnProfile[platform.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            );})}
            <div className="pt-4">
              <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary-pink text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0"><HelpCircle size={20} className="text-gray-500 dark:text-white/40" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Social accounts</h3>
                <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">You can add your social media profile links and enable/disable them to be shown on your profile when someone views it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
