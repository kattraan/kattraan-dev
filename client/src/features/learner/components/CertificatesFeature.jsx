import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Award, Linkedin, Link2, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { getMyCertificates } from '@/features/learner/services/certificateService';
import { openCertificateView, getCertificateForCourse } from '@/features/learner/services/certificateService';
import { openLinkedInAddCertification } from '@/features/courses/utils/certificateShare';
import CertificatePreview from '@/features/courses/components/CertificatePreview';
import { ROUTES } from '@/config/routes';

function formatIssuedDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const CertificatesFeature = () => {
    const toast = useToast();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await getMyCertificates();
                if (!cancelled) setCertificates(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) setCertificates([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredCertificates = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return certificates;
        return certificates.filter(
            (cert) =>
                cert.courseTitle.toLowerCase().includes(q) ||
                cert.instructorName.toLowerCase().includes(q) ||
                cert.certificateId.toLowerCase().includes(q),
        );
    }, [certificates, search]);

    const handleView = (cert) => {
        openCertificateView({ certificateId: cert.certificateId });
    };

    const handleCopyVerifyLink = async (cert) => {
        const url = cert.verifyUrl || `${window.location.origin}${ROUTES.CERTIFICATE_VERIFY}/${cert.certificateId}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied', 'Verification link copied to clipboard.');
        } catch {
            toast.error('Copy failed', 'Could not copy the link.');
        }
    };

    const handleLinkedIn = (cert) => {
        openLinkedInAddCertification({
            courseTitle: cert.courseTitle,
            certificateId: cert.certificateId,
            verifyUrl: cert.verifyUrl,
            issuedAt: cert.issuedAt,
        });
    };

    return (
        <DashboardLayout title="Certificates" subtitle="Showcase your achievements and acquired skills.">
            <div className="space-y-10 font-satoshi">
                <div className="relative w-full max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 transition-colors duration-300" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search certificates..."
                        className="w-full bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 transition-all duration-300 shadow-sm dark:shadow-none"
                    />
                </div>

                {loading && (
                    <div className="py-16 text-center text-gray-500 dark:text-white/50">
                        Loading your certificates...
                    </div>
                )}

                {!loading && filteredCertificates.length === 0 && (
                    <div className="bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[28px] p-12 flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-6">
                            <Award size={32} className="text-gray-400 dark:text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            {certificates.length === 0 ? 'No certificates yet' : 'No matches found'}
                        </h3>
                        <p className="text-gray-500 dark:text-white/40 text-sm max-w-[320px] transition-colors duration-300">
                            {certificates.length === 0
                                ? 'Complete a course by watching all lessons to earn your certificate.'
                                : 'Try a different search term.'}
                        </p>
                    </div>
                )}

                {!loading && filteredCertificates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCertificates.map((cert) => (
                            <div
                                key={cert.certificateId}
                                className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col group rounded-[28px] shadow-sm dark:shadow-none hover:shadow-lg hover:border-primary-pink/30 dark:hover:border-primary-pink/30 transition-all duration-300"
                            >
                                <div className="aspect-[3368/2380] relative overflow-hidden bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
                                    <CertificatePreview
                                        courseTitle={cert.courseTitle}
                                        learnerName={cert.learnerName}
                                        instructorName={cert.instructorName}
                                        issuedDate={cert.issuedAt ? new Date(cert.issuedAt) : new Date()}
                                        durationMinutes={cert.durationMinutes}
                                        className="w-full h-full"
                                    />
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2 group-hover:text-primary-pink transition-colors duration-300">
                                        {cert.courseTitle}
                                    </h3>
                                    <div className="space-y-2 mb-6 text-sm">
                                        <p className="text-gray-500 dark:text-white/40 transition-colors duration-300">
                                            Issued:{' '}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatIssuedDate(cert.issuedAt)}
                                            </span>
                                        </p>
                                        <p className="text-gray-500 dark:text-white/40 transition-colors duration-300">
                                            By:{' '}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {cert.instructorName}
                                            </span>
                                        </p>
                                        <p className="text-gray-500 dark:text-white/40 transition-colors duration-300 font-mono text-xs">
                                            ID: {cert.certificateId}
                                        </p>
                                    </div>

                                    <div className="mt-auto grid grid-cols-3 gap-2 pt-6 border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
                                        <Button
                                            type="button"
                                            onClick={() => handleView(cert)}
                                            className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white border-0 flex items-center justify-center gap-1.5 text-xs transition-all duration-300"
                                            title="View certificate"
                                        >
                                            View
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleLinkedIn(cert)}
                                            className="w-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/20 flex items-center justify-center gap-1.5 text-xs transition-all duration-300"
                                            title="Add to LinkedIn profile"
                                        >
                                            <Linkedin size={14} /> LinkedIn
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleCopyVerifyLink(cert)}
                                            className="w-full bg-primary-pink/10 hover:bg-primary-pink/20 text-primary-pink border border-primary-pink/20 flex items-center justify-center gap-1.5 text-xs transition-all duration-300"
                                            title="Copy verification link"
                                        >
                                            <Link2 size={14} /> Link
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CertificatesFeature;
