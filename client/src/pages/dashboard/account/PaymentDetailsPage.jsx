import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HelpCircle, Plus, X } from 'lucide-react';
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
            <Link to={item.path} className="hover:text-primary-pink dark:hover:text-primary-pink/90 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

const defaultInvoice = { displayName: '', address: '', pincode: '', gstRegName: '', gstRegAddress: '', gstRegPincode: '', gstRegState: '' };

export default function PaymentDetailsPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const toast = useToast();
  const enrollment = user?.enrollmentData || {};
  const invoice = enrollment.invoiceAddress || defaultInvoice;
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [form, setForm] = useState(defaultInvoice);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => setForm({ ...defaultInvoice, ...invoice }), [invoice, showInvoiceModal]);

  const handleVerifyKYC = () => toast.info('Coming soon', 'KYC verification will be available soon.');
  const handleAddBank = () => toast.info('Coming soon', 'Bank account linking will be available soon.');

  const handleSaveInvoice = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      await dispatch(updateProfile({
        userId: user._id,
        payload: { enrollmentData: { invoiceAddress: form } },
      })).unwrap();
      toast.success('Saved', 'Address & invoice updated.');
      setShowInvoiceModal(false);
    } catch (err) {
      toast.error('Save failed', err || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 font-satoshi">
      <AccountBreadcrumb items={[{ label: 'Account', path: ROUTES.DASHBOARD_MY_ACCOUNT }, { label: 'Payment details', path: null }]} />
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Payment details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-white/70">Link your bank account first before KYC verification.</div>
          <button type="button" onClick={handleVerifyKYC} className="w-full py-4 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-700 dark:text-white/80 font-bold text-sm hover:border-primary-pink/40 hover:bg-primary-pink/5 transition-colors">Verify KYC</button>
          <div role="button" tabIndex={0} onClick={handleAddBank} onKeyDown={(e) => e.key === 'Enter' && handleAddBank()} className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:border-primary-pink/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3"><Plus size={28} className="text-gray-400 dark:text-white/30" /></div>
            <p className="text-sm font-bold text-gray-700 dark:text-white/70">Add bank account</p>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Address & Invoice</h2>
              <button type="button" onClick={() => setShowInvoiceModal(true)} className="text-sm font-bold text-primary-pink hover:text-primary-pink/80">Edit</button>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/60 mb-4">Send invoice to customers: <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-600 dark:text-green-400">ACTIVE</span></p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Invoice Type</dt><dd className="text-gray-900 dark:text-white">Non-GST</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Display Name</dt><dd className="text-gray-900 dark:text-white">{invoice.displayName || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Address</dt><dd className="text-gray-900 dark:text-white">{invoice.address || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Pincode</dt><dd className="text-gray-900 dark:text-white">{invoice.pincode || 'N/A'}</dd></div>
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Invoice Type</dt><dd className="text-gray-900 dark:text-white">GST</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Reg. Name</dt><dd className="text-gray-900 dark:text-white">{invoice.gstRegName || 'Not added'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-white/50">Reg. Address</dt><dd className="text-gray-900 dark:text-white">{invoice.gstRegAddress || 'Not added'}</dd></div>
              </div>
            </dl>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6 sticky top-24">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0"><HelpCircle size={20} className="text-gray-500 dark:text-white/40" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Payment terms</h3>
                <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">To ensure smooth and hassle-free withdrawals, please update your bank details and upload any required documents. Make sure to use JPG format for uploading your documents. For any payment-related assistance, feel free to reach out to us at <a href="mailto:support@kattraan.com" className="text-primary-pink hover:underline">support@kattraan.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Address & Invoice</h3>
              <button type="button" onClick={() => setShowInvoiceModal(false)} className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">Display Name</label><input value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">Address</label><input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">Pincode</label><input value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
              <div className="pt-2 border-t border-gray-100 dark:border-white/5"><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">GST Reg. Name</label><input value={form.gstRegName} onChange={(e) => setForm((p) => ({ ...p, gstRegName: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">GST Reg. Address</label><input value={form.gstRegAddress} onChange={(e) => setForm((p) => ({ ...p, gstRegAddress: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">GST Reg. Pincode</label><input value={form.gstRegPincode} onChange={(e) => setForm((p) => ({ ...p, gstRegPincode: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
              <div><label className="block text-xs font-bold text-gray-500 dark:text-white/50 mb-1">GST Reg. State</label><input value={form.gstRegState} onChange={(e) => setForm((p) => ({ ...p, gstRegState: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-700 dark:text-white/80">Cancel</button>
              <button type="button" onClick={handleSaveInvoice} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary-pink text-white font-bold hover:opacity-90 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
