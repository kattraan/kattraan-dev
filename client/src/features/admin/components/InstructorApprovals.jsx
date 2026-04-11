import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { approveInstructor } from '@/features/auth/store/authSlice';
import adminService from '@/features/admin/services/adminService';
import { useToast } from '@/components/ui';
import { logger } from '@/utils/logger';
import { CheckCircle, XCircle, Clock, FileText, Linkedin, Globe, Search, Filter, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ApplicationCard = ({ user, onAction }) => {
  const { enrollmentData } = user;
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[32px] p-8 hover:border-gray-300 dark:hover:border-white/15 transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary-purple font-bold text-2xl border border-gray-200 dark:border-white/10 transition-colors duration-300">
              {user.userName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-purple transition-colors duration-300">{user.userName}</h3>
              <p className="text-gray-500 dark:text-white/40 text-[13px] break-all transition-colors duration-300">{user.userEmail}</p>
            </div>
          </div>
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500 dark:text-white/40 transition-colors duration-300">Applied On</span>
              <span className="text-gray-700 dark:text-white/80 font-medium transition-colors duration-300">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500 dark:text-white/40 transition-colors duration-300">Target Role</span>
              <span className="text-primary-pink font-bold uppercase tracking-tighter">Instructor</span>
            </div>
          </div>
        </div>

        <div className="lg:w-2/4 space-y-6 lg:px-8 lg:border-l lg:border-gray-200 dark:lg:border-white/5 transition-colors duration-300">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
              <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-2 transition-colors duration-300">Experience</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white/90 transition-colors duration-300">{enrollmentData?.experience || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors duration-300">
              <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-2 transition-colors duration-300">Expertise</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white/90 transition-colors duration-300">{enrollmentData?.expertise || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.03] p-5 rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden group/bio transition-colors duration-300">
            <span className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-3 transition-colors duration-300">Applicant Bio</span>
            <p className="text-sm text-gray-700 dark:text-white/70 leading-relaxed font-medium transition-colors duration-300">"{enrollmentData?.bio || 'No bio provided for this applicant.'}"</p>
            <div className="absolute top-0 right-0 p-3 text-gray-200 dark:text-white/5 group-hover/bio:text-gray-400 dark:group-hover/bio:text-white/20 transition-colors">
              <FileText size={40} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {enrollmentData?.linkedin && (
              <a href={`https://${enrollmentData.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all">
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {enrollmentData?.website && (
              <a href={`https://${enrollmentData.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-pink/10 text-primary-pink text-xs font-bold hover:bg-primary-pink/20 transition-all">
                <Globe size={14} /> Portfolio
              </a>
            )}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/40 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 dark:hover:text-white transition-all">
              <FileText size={14} /> Resume (PDF)
            </button>
          </div>
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

/**
 * Instructor approvals content: fetch, filter, approve/reject.
 * Used by InstructorApprovalsPage (thin wrapper).
 */
const InstructorApprovals = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPendingInstructors = async () => {
    setError(null);
    try {
      const data = await adminService.getPendingInstructorApplications();
      if (data.success) {
        setInstructors(data.data);
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
    fetchPendingInstructors();
  }, []);

  const handleAction = async (userId, action) => {
    setError(null);
    try {
      await dispatch(approveInstructor({ userId, action })).unwrap();
      toast.success(action === 'approve' ? 'Approved' : 'Rejected', 'Instructor application updated.');
      fetchPendingInstructors();
    } catch (err) {
      logger.error(`Failed to ${action} instructor`, err);
      const message = err.response?.data?.message || err.message || `Failed to ${action} application.`;
      setError(message);
      toast.error(`${action === 'approve' ? 'Approve' : 'Reject'} failed`, message);
    }
  };

  const filteredInstructors = instructors.filter(
    (ins) =>
      ins.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="space-y-8">
        <section>
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="ml-auto text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" aria-label="Dismiss">×</button>
            </div>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors duration-300">
              <Clock size={16} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Pending Applications</h2>
            <span className="bg-primary-purple/10 dark:bg-primary-purple/20 text-primary-purple px-2.5 py-0.5 rounded-full text-xs font-bold">{instructors.length}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[24px] animate-pulse transition-colors duration-300" />
              ))}
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[32px] p-16 text-center transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-white/20 transition-colors duration-300">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Queue is Clear!</h3>
              <p className="text-gray-500 dark:text-white/40 max-w-xs mx-auto transition-colors duration-300">All instructor applications have been processed. Great job!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredInstructors.map((user) => (
                <ApplicationCard key={user._id} user={user} onAction={handleAction} />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default InstructorApprovals;
