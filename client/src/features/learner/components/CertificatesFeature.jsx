import React from 'react';
import { Award, Download, Share2, CheckCircle, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CertificatesFeature = () => {
    // Dummy Data
    const certificates = [
        { id: 1, title: 'Complete Node.js Microservices', date: 'Oct 15, 2025', instructor: 'Alex Rivera', credentialId: 'NJS-8X2-911', image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80' },
        { id: 2, title: 'Front-End Web Development', date: 'Aug 22, 2025', instructor: 'Sarah Johnson', credentialId: 'FEW-M2K-400', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' },
        { id: 3, title: 'Cloud Computing Foundations', date: 'Mar 10, 2025', instructor: 'Michael Chen', credentialId: 'CCF-P9Q-102', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' },
    ];

    return (
        <DashboardLayout title="Certificates" subtitle="Showcase your achievements and acquired skills.">
        <div className="space-y-10 font-satoshi">
            <div className="relative w-full max-w-md mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 transition-colors duration-300" />
                <input 
                    type="text" 
                    placeholder="Search certificates..."
                    className="w-full bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 transition-all duration-300 shadow-sm dark:shadow-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col group rounded-[28px] shadow-sm dark:shadow-none hover:shadow-lg hover:border-primary-pink/30 dark:hover:border-primary-pink/30 transition-all duration-300 cursor-pointer">
                        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-white/5 p-8 flex items-center justify-center border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
                             {/* Simulated Certificate Preview Graphic */}
                             <div className="w-full h-full bg-white shadow-xl dark:shadow-none p-6 rounded-lg flex flex-col items-center justify-center relative transform group-hover:scale-[1.02] transition-transform duration-500 text-center border-2 border-gray-100 italic font-serif">
                                  <Award size={40} className="text-[#FF8C42] mb-3 opacity-80" />
                                  <h2 className="text-sm font-bold text-gray-900 tracking-widest uppercase mb-1">Certificate of Completion</h2>
                                  <p className="text-[10px] text-gray-500 mb-4">This certifies that</p>
                                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 w-full pb-1">Kattraan Learner</h3>
                                  <p className="text-[10px] text-gray-500 mb-1">has successfully completed</p>
                                  <p className="text-xs font-bold text-primary-pink text-center px-4 leading-tight">{cert.title}</p>
                             </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2 group-hover:text-primary-pink transition-colors duration-300">
                                {cert.title}
                            </h3>
                            <div className="space-y-2 mb-6 text-sm">
                                <p className="text-gray-500 dark:text-white/40 transition-colors duration-300">Issued: <span className="font-medium text-gray-900 dark:text-white">{cert.date}</span></p>
                                <p className="text-gray-500 dark:text-white/40 transition-colors duration-300">By: <span className="font-medium text-gray-900 dark:text-white">{cert.instructor}</span></p>
                                <p className="text-gray-500 dark:text-white/40 transition-colors duration-300 font-mono text-xs">ID: {cert.credentialId}</p>
                            </div>
                            
                            <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
                                <Button className="w-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 transition-all duration-300">
                                     <Download size={16} /> Save
                                </Button>
                                <Button className="w-full bg-[#0e76a8]/10 hover:bg-[#0e76a8]/20 text-[#0e76a8] dark:text-[#0e76a8] border border-[#0e76a8]/20 flex items-center justify-center gap-2 transition-all duration-300">
                                     <Share2 size={16} /> Link
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                 {/* Empty State/Placeholder for learning */}
                 <div className="bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[28px] p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[400px]">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-6">
                           <Award size={32} className="text-gray-400 dark:text-white/20" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Keep Learning!</h3>
                      <p className="text-gray-500 dark:text-white/40 text-sm max-w-[250px] transition-colors duration-300">Complete more courses to earn your certificates and showcase your skills.</p>
                 </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default CertificatesFeature;
