import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { approveInstructor } from '@/features/auth/store/authSlice';
import adminService from '@/features/admin/services/adminService';
import { useToast, useConfirmDialog } from '@/components/ui';
import { logger } from '@/utils/logger';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Linkedin,
  Globe,
  Search,
  Filter,
  AlertCircle,
  ShieldCheck,
  CalendarDays,
  ShieldOff,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CardListSkeleton } from '@/components/skeleton';

function toExternalHref(url) {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function matchesSearch(user, searchTerm) {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return true;
  return (
    user.userName?.toLowerCase().includes(q) ||
    user.userEmail?.toLowerCase().includes(q)
  );
}

function getApprovalDate(user) {
  if (user.instructorApprovedAt) return new Date(user.instructorApprovedAt);
  if (user.enrollmentData?.submittedAt) return new Date(user.enrollmentData.submittedAt);
  if (user._id && typeof user._id === 'string' && user._id.length >= 8) {
    return new Date(parseInt(user._id.substring(0, 8), 16) * 1000);
  }
  return new Date(user.createdAt || Date.now());
}

function formatApprovalStamp(dateValue) {
  const date = getApprovalDate({ instructorApprovedAt: dateValue });
  if (Number.isNaN(date.getTime())) {
    return { day: '—', dateLabel: '—', time: '—' };
  }
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'long' }),
    dateLabel: date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

function ApplicationInputs({ enrollmentData, className = '' }) {
  return (
    <div className={`space-y-5 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
          <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-2">Experience</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white/90">{enrollmentData?.experience || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
          <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-2">Expertise</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white/90">{enrollmentData?.expertise || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-white/[0.03] p-5 rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden group/bio transition-colors duration-300">
        <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-3">Applicant Bio</span>
        <p className="text-sm text-gray-700 dark:text-white/70 leading-relaxed font-medium">
          &ldquo;{enrollmentData?.bio || 'No bio provided for this applicant.'}&rdquo;
        </p>
        <div className="absolute top-0 right-0 p-3 text-gray-200 dark:text-white/5 group-hover/bio:text-gray-400 dark:group-hover/bio:text-white/20 transition-colors">
          <FileText size={40} />
        </div>
      </div>

      {enrollmentData?.languages?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {enrollmentData.languages.map((lang) => (
            <span key={lang} className="px-3 py-1 rounded-full bg-primary-pink/10 text-primary-pink text-[11px] font-bold">
              {lang}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {enrollmentData?.linkedin && (
          <a href={toExternalHref(enrollmentData.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
            <Linkedin size={14} /> LinkedIn
          </a>
        )}
        {enrollmentData?.github && (
          <a href={toExternalHref(enrollmentData.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white/70 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            GitHub
          </a>
        )}
        {enrollmentData?.website && (
          <a href={toExternalHref(enrollmentData.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-pink/10 text-primary-pink text-xs font-bold hover:bg-primary-pink/20 transition-all">
            <Globe size={14} /> Portfolio
          </a>
        )}
        {enrollmentData?.resume && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/40 text-xs font-bold">
            <FileText size={14} /> {enrollmentData.resume}
          </span>
        )}
        {enrollmentData?.idProof && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/40 text-xs font-bold">
            <ShieldCheck size={14} /> ID: {enrollmentData.idProof}
          </span>
        )}
      </div>
    </div>
  );
}

const ApplicationCard = ({ user, onAction }) => {
  const { enrollmentData } = user;
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[32px] p-8 hover:border-gray-300 dark:hover:border-white/15 transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary-purple font-bold text-2xl border border-gray-200 dark:border-white/10 transition-colors duration-300">
              {(user.userName || '?').charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-purple transition-colors duration-300">{user.userName}</h3>
              <p className="text-gray-500 dark:text-white/40 text-[13px] break-all transition-colors duration-300">{user.userEmail}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
                {user.status === 'pending_approval' || user.enrollmentData?.submittedAt
                  ? 'Awaiting review'
                  : 'Enrollment incomplete'}
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500 dark:text-white/40 transition-colors duration-300">Applied On</span>
              <span className="text-gray-700 dark:text-white/80 font-medium transition-colors duration-300">{new Date(enrollmentData?.submittedAt || user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500 dark:text-white/40 transition-colors duration-300">Target Role</span>
              <span className="text-primary-pink font-bold uppercase tracking-tighter">Instructor</span>
            </div>
          </div>
        </div>

        <div className="lg:w-2/4 lg:px-8 lg:border-l lg:border-gray-200 dark:lg:border-white/5 transition-colors duration-300">
          <ApplicationInputs enrollmentData={enrollmentData} />
        </div>

        <div className="lg:w-1/4 flex flex-col justify-center gap-4 lg:pl-8 lg:border-l lg:border-gray-200 dark:lg:border-white/5 transition-colors duration-300">
          <div className="text-center mb-4">
            <p className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] font-bold mb-1 transition-colors duration-300">Decision Required</p>
            <div className="w-12 h-1 bg-primary-purple/30 mx-auto rounded-full" />
          </div>
          <Button
            onClick={() => onAction(user._id, 'approve')}
            className="bg-primary-purple hover:bg-indigo-600 text-white border-none h-12 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> Approve
          </Button>
          <button
            onClick={() => onAction(user._id, 'reject')}
            className="h-12 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-sm font-bold flex items-center justify-center gap-2 transition-all"
          >
            <XCircle size={18} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const ApprovedInstructorRow = ({ user, onDisapprove }) => {
  const [expanded, setExpanded] = useState(false);
  const stamp = formatApprovalStamp(getApprovalDate(user));
  const initial = (user.userName || 'I').charAt(0).toUpperCase();
  const appliedOn = user.enrollmentData?.submittedAt
    ? new Date(user.enrollmentData.submittedAt).toLocaleDateString()
    : null;

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[28px] hover:border-emerald-500/30 dark:hover:border-emerald-400/20 transition-all duration-300">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gradient-start via-gradient-mid to-gradient-end opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full text-left p-5 sm:p-6"
      >
        <div className="flex flex-col xl:flex-row xl:items-center gap-5">
          <div className="flex items-center gap-4 min-w-0 xl:w-[32%]">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gradient-start/20 via-gradient-mid/20 to-gradient-end/20 border border-white/10 flex items-center justify-center text-primary-pink font-black text-xl">
                {initial}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0c091a]">
                <CheckCircle size={11} strokeWidth={3} />
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.userName}</h3>
              <p className="text-[13px] text-gray-500 dark:text-white/40 truncate">{user.userEmail}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Approved Instructor
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:flex-1">
            <div className="min-w-[140px] flex-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-white/30 mb-1">Day</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stamp.day}</p>
            </div>
            <div className="min-w-[140px] flex-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-white/30 mb-1">Date</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stamp.dateLabel}</p>
            </div>
            <div className="min-w-[140px] flex-1 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-white/30 mb-1">Time</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stamp.time}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 xl:w-[240px] xl:justify-end">
            {user.enrollmentData?.expertise && (
              <span className="hidden sm:inline-flex max-w-[140px] truncate px-3 py-1.5 rounded-full bg-primary-purple/10 text-primary-purple text-[11px] font-bold">
                {user.enrollmentData.expertise}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/35 shrink-0">
              {expanded ? 'Hide' : 'View'} application
              <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-200 dark:border-white/5 pt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-[13px]">
              {appliedOn && (
                <p>
                  <span className="text-gray-500 dark:text-white/40">Applied on </span>
                  <span className="font-medium text-gray-800 dark:text-white/80">{appliedOn}</span>
                </p>
              )}
              <p>
                <span className="text-gray-500 dark:text-white/40">Target role </span>
                <span className="font-bold uppercase tracking-tighter text-primary-pink">Instructor</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDisapprove(user)}
              className="h-11 px-5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <ShieldOff size={16} /> Disapprove
            </button>
          </div>
          <ApplicationInputs enrollmentData={user.enrollmentData} />
        </div>
      )}
    </div>
  );
};

/**
 * Instructor approvals content: fetch, filter, approve/reject/disapprove.
 * Used by InstructorApprovalsPage (thin wrapper).
 */
const InstructorApprovals = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { confirm } = useConfirmDialog();
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [approvedInstructors, setApprovedInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = async () => {
    setError(null);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        adminService.getPendingInstructorApplications(),
        adminService.getApprovedInstructors(),
      ]);
      if (pendingRes.success) {
        const list = [...(pendingRes.data || [])].sort((a, b) => {
          const ready = (u) => (u.status === 'pending_approval' || u.enrollmentData?.submittedAt ? 0 : 1);
          return ready(a) - ready(b);
        });
        setPendingInstructors(list);
      }
      if (approvedRes.success) {
        const list = [...(approvedRes.data || [])]
          .filter((u) => !(u.roleNames || []).includes('admin'))
          .sort((a, b) => getApprovalDate(b).getTime() - getApprovalDate(a).getTime());
        setApprovedInstructors(list);
      }
    } catch (err) {
      logger.error('Failed to fetch instructors', err);
      const message = err.response?.data?.message || err.message || 'Failed to load applications.';
      setError(message);
      toast.error('Load failed', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (userId, action) => {
    setError(null);
    try {
      await dispatch(approveInstructor({ userId, action })).unwrap();
      const labels = {
        approve: ['Approved', 'Instructor application approved.'],
        reject: ['Rejected', 'Instructor application rejected.'],
        disapprove: ['Access revoked', 'Instructor privileges have been removed.'],
      };
      const [title, body] = labels[action] || ['Updated', 'Instructor application updated.'];
      toast.success(title, body);
      fetchApplications();
    } catch (err) {
      logger.error(`Failed to ${action} instructor`, err);
      const message = err.response?.data?.message || err.message || `Failed to ${action} application.`;
      setError(message);
      toast.error(`${action === 'approve' ? 'Approve' : action === 'disapprove' ? 'Disapprove' : 'Reject'} failed`, message);
    }
  };

  const handleDisapprove = async (user) => {
    const ok = await confirm({
      title: 'Revoke instructor access?',
      message: `${user.userName} will return to a learner account and must be re-approved from this panel before teaching again.`,
      confirmText: 'Disapprove',
      cancelText: 'Keep approved',
      variant: 'danger',
    });
    if (!ok) return;
    handleAction(user._id, 'disapprove');
  };

  const filteredPending = pendingInstructors.filter((ins) => matchesSearch(ins, searchTerm));
  const filteredApproved = approvedInstructors.filter((ins) => matchesSearch(ins, searchTerm));

  return (
    <DashboardLayout
      title="Instructor Approvals"
      subtitle="Review and manage professional instructor applications."
      headerRight={
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/30 transition-all w-64"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
            <Filter size={18} />
          </button>
        </div>
      }
    >
      <div className="space-y-12">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" aria-label="Dismiss">×</button>
          </div>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors duration-300">
              <Clock size={16} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Pending Applications</h2>
            <span className="bg-primary-purple/10 dark:bg-primary-purple/20 text-primary-purple px-2.5 py-0.5 rounded-full text-xs font-bold">{pendingInstructors.length}</span>
          </div>

          {loading ? (
            <CardListSkeleton count={2} height={256} />
          ) : filteredPending.length === 0 ? (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[32px] p-16 text-center transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-white/20 transition-colors duration-300">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Queue is Clear!</h3>
              <p className="text-gray-500 dark:text-white/40 max-w-xs mx-auto transition-colors duration-300">All instructor applications have been processed. Great job!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPending.map((user) => (
                <ApplicationCard key={user._id} user={user} onAction={handleAction} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Approved Instructors</h2>
            <span className="bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold">{approvedInstructors.length}</span>
          </div>

          {loading ? (
            <CardListSkeleton count={2} height={120} />
          ) : filteredApproved.length === 0 ? (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[32px] p-14 text-center transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/5 flex items-center justify-center mx-auto mb-4 text-emerald-500/40 transition-colors duration-300">
                <CalendarDays size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">No approved instructors yet</h3>
              <p className="text-gray-500 dark:text-white/40 max-w-sm mx-auto transition-colors duration-300">
                Approved instructors will appear here. Click a row to review their original application inputs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApproved.map((user) => (
                <ApprovedInstructorRow key={user._id} user={user} onDisapprove={handleDisapprove} />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default InstructorApprovals;
