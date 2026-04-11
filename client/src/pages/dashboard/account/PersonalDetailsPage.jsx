import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HelpCircle, X } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { updateProfile } from '@/features/auth/store/authSlice';
import { useToast } from '@/components/ui/Toast';

function AccountBreadcrumb({ items }) {
  return (
    <nav className="text-sm text-gray-500 dark:text-white/50 mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2">›</span>}
          {item.path ? (
            <Link to={item.path} className="hover:text-primary-pink dark:hover:text-primary-pink/90 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function DetailRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-b-0">
      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm text-gray-900 dark:text-white">{value || '—'}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-sm font-bold text-primary-pink hover:text-primary-pink/80 transition-colors shrink-0">
        Edit
      </button>
    </div>
  );
}

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Please select Category' },
  { value: 'education', label: 'Education' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'creative', label: 'Creative' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'other', label: 'Other' },
];

function InlineEditField({ label, type, value, displayValue, editing, onEdit, onSave, onCancel, saving, options }) {
  const [val, setVal] = useState(value ?? '');
  useEffect(() => setVal(value ?? ''), [value]);
  const handleCancel = () => {
    setVal(value ?? '');
    onCancel?.();
  };
  const handleSave = async () => {
    await onSave(val);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-b-0">
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm text-gray-900 dark:text-white">{displayValue ?? value ?? '—'}</p>
        </div>
        <button type="button" onClick={onEdit} className="text-sm font-bold text-primary-pink hover:text-primary-pink/80 transition-colors shrink-0">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-gray-100 dark:border-white/5 last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider">{label}</p>
        <button type="button" onClick={handleCancel} className="text-sm font-bold text-primary-pink hover:text-primary-pink/80 transition-colors">
          Cancel
        </button>
      </div>
      {type === 'select' && options ? (
        <select value={val} onChange={(e) => setVal(e.target.value)} className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50 appearance-none bg-no-repeat bg-[length:12px] bg-[right_12px_center]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type="date" value={val} onChange={(e) => setVal(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50 [color-scheme:light]" />
      )}
      <button type="button" onClick={handleSave} disabled={saving} className="mt-3 px-6 py-2.5 rounded-xl bg-primary-pink text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

function EditModal({ title, value, onSave, onClose, multiline = false }) {
  const [val, setVal] = useState(value ?? '');
  useEffect(() => setVal(value ?? ''), [value]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(val);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit {title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {multiline ? (
            <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-pink/50" placeholder={`Enter ${title.toLowerCase()}`} />
          ) : (
            <input type="text" value={val} onChange={(e) => setVal(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50" placeholder={`Enter ${title.toLowerCase()}`} />
          )}
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-700 dark:text-white/80">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-pink text-white font-bold hover:opacity-90">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PersonalDetailsPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const toast = useToast();
  const [showSubscriberCount, setShowSubscriberCount] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingInlineField, setEditingInlineField] = useState(null); // 'gender' | 'birthday' | 'category'
  const [saving, setSaving] = useState(false);

  const enrollment = user?.enrollmentData || {};
  const displayName = user?.userName || user?.name || user?.user_name || '';
  const bio = enrollment.bio || user?.bio || '';
  const gender = enrollment.gender || user?.gender || '';
  const dateOfBirth = enrollment.dateOfBirth ? (typeof enrollment.dateOfBirth === 'string' ? enrollment.dateOfBirth : enrollment.dateOfBirth.split?.('T')?.[0]) : user?.dateOfBirth || '';
  const category = enrollment.category || user?.category || '';
  const subscriberPref = enrollment.showSubscriberCount !== false;

  useEffect(() => {
    setShowSubscriberCount(subscriberPref);
  }, [subscriberPref]);

  const savePayload = async (payload) => {
    if (!user?._id) return;
    setSaving(true);
    try {
      await dispatch(updateProfile({ userId: user._id, payload })).unwrap();
      toast.success('Saved', 'Your changes have been saved.');
    } catch (err) {
      toast.error('Save failed', err || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveField = async (field, value) => {
    if (field === 'Name') {
      await savePayload({ userName: value.trim() });
    } else if (field === 'About you') {
      await savePayload({ enrollmentData: { bio: value.trim() } });
    } else if (field === 'Gender') {
      await savePayload({ enrollmentData: { gender: value.trim() } });
    } else if (field === 'Birthday') {
      await savePayload({ enrollmentData: { dateOfBirth: value.trim() || undefined } });
    } else if (field === 'Category') {
      await savePayload({ enrollmentData: { category: value.trim() } });
    }
    setEditField(null);
    setEditingInlineField(null);
  };

  const handleToggleSubscriber = () => {
    const next = !showSubscriberCount;
    setShowSubscriberCount(next);
    savePayload({ enrollmentData: { showSubscriberCount: next } });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 font-satoshi">
      <AccountBreadcrumb items={[{ label: 'Account', path: ROUTES.DASHBOARD_MY_ACCOUNT }, { label: 'Personal details', path: null }]} />
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Personal details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Show subscriber count on your profile</span>
              <button type="button" role="switch" aria-checked={showSubscriberCount} onClick={handleToggleSubscriber} disabled={saving} className={`relative w-11 h-6 rounded-full transition-colors ${showSubscriberCount ? 'bg-primary-pink' : 'bg-gray-200 dark:bg-white/20'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${showSubscriberCount ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <DetailRow label="Name" value={displayName} onEdit={() => { setEditField('Name'); setEditValue(displayName); }} />
            <DetailRow label="About you" value={bio} onEdit={() => { setEditField('About you'); setEditValue(bio); }} />
            <InlineEditField label="Gender" type="select" value={gender} displayValue={GENDER_OPTIONS.find((o) => o.value === gender)?.label} editing={editingInlineField === 'gender'} onEdit={() => setEditingInlineField('gender')} onSave={async (v) => { await handleSaveField('Gender', v); setEditingInlineField(null); }} onCancel={() => setEditingInlineField(null)} saving={saving} options={GENDER_OPTIONS} />
            <InlineEditField label="Birthday" type="date" value={dateOfBirth} displayValue={dateOfBirth} editing={editingInlineField === 'birthday'} onEdit={() => setEditingInlineField('birthday')} onSave={async (v) => { await handleSaveField('Birthday', v); setEditingInlineField(null); }} onCancel={() => setEditingInlineField(null)} saving={saving} />
            <InlineEditField label="Category" type="select" value={category} displayValue={CATEGORY_OPTIONS.find((o) => o.value === category)?.label} editing={editingInlineField === 'category'} onEdit={() => setEditingInlineField('category')} onSave={async (v) => { await handleSaveField('Category', v); setEditingInlineField(null); }} onCancel={() => setEditingInlineField(null)} saving={saving} options={CATEGORY_OPTIONS} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                <HelpCircle size={20} className="text-gray-500 dark:text-white/40" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Personal details</h3>
                <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">You can add your personal information here so that we can get to know you better. Only your name, picture and the about you section will be visible to your audience!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {editField && (
        <EditModal
          title={editField}
          value={editValue}
          multiline={editField === 'About you'}
          onSave={(v) => handleSaveField(editField, v)}
          onClose={() => setEditField(null)}
        />
      )}
    </div>
  );
}
