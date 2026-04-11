import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HelpCircle, AlertTriangle, X } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { updateProfile } from '@/features/auth/store/authSlice';
import { useToast } from '@/components/ui/Toast';

function EditModal({ title, value, onSave, onClose, type = 'text' }) {
  const [val, setVal] = useState(value ?? '');
  React.useEffect(() => { setVal(value ?? ''); }, [value]);
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
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type={type} value={val} onChange={(e) => setVal(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50" placeholder={`Enter ${title.toLowerCase()}`} />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-700 dark:text-white/80">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-pink text-white font-bold hover:opacity-90">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

function InfoSidebar({ title, children }) {
  return (
    <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
          <HelpCircle size={20} className="text-gray-500 dark:text-white/40" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}

export default function UpdateContactPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const toast = useToast();
  const phone = user?.phone || user?.phoneNumber || user?.mobile || '';
  const email = user?.userEmail || user?.email || '';
  const [editField, setEditField] = useState(null);
  const [saving, setSaving] = useState(false);

  const savePayload = async (payload) => {
    if (!user?._id) return;
    setSaving(true);
    try {
      await dispatch(updateProfile({ userId: user._id, payload })).unwrap();
      toast.success('Saved', 'Your contact details have been updated.');
    } catch (err) {
      toast.error('Save failed', err || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
      setEditField(null);
    }
  };

  const handleSave = (field, value) => {
    if (field === 'Phone number') savePayload({ phoneNumber: value.trim() });
    if (field === 'Email') savePayload({ userEmail: value.trim() });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 font-satoshi">
      <AccountBreadcrumb
        items={[
          { label: 'Account', path: ROUTES.DASHBOARD_MY_ACCOUNT },
          { label: 'Update number/email', path: null },
        ]}
      />
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Update number/email</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 dark:border-white/5">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">
                  Phone number
                </p>
                <p className="text-sm text-gray-900 dark:text-white">{phone || '—'}</p>
              </div>
              <button type="button" onClick={() => setEditField('Phone number')} className="text-sm font-bold text-primary-pink hover:text-primary-pink/80 transition-colors shrink-0" disabled={saving}>
                Edit
              </button>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3">
              <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">Only Indian phone numbers can be updated currently.</p>
            </div>
            <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 dark:border-white/5">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm text-gray-900 dark:text-white">{email || '—'}</p>
              </div>
              <button type="button" onClick={() => setEditField('Email')} className="text-sm font-bold text-primary-pink hover:text-primary-pink/80 transition-colors shrink-0" disabled={saving}>
                Edit
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <InfoSidebar title="Update email/number">
            Update your email id or Indian phone number by entering the new details and verifying via OTP.
            International phone numbers can&apos;t be updated presently.
          </InfoSidebar>
        </div>
      </div>
      {editField && (
        <EditModal
          title={editField}
          value={editField === 'Phone number' ? phone : email}
          type={editField === 'Email' ? 'email' : 'tel'}
          onSave={(v) => handleSave(editField, v)}
          onClose={() => setEditField(null)}
        />
      )}
    </div>
  );
}
