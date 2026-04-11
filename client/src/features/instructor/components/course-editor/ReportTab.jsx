import React from 'react';
import { User, Search, Download, ArrowUpDown, Users } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';

/**
 * Report tab for course analytics and performance tracking
 */
const ReportTab = ({ 
    activeReportSubTab, 
    setActiveReportSubTab 
}) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 font-satoshi">
            <h1 className="text-2xl font-black text-white">Reports</h1>

            <Card className="rounded-[24px] overflow-hidden">
                {/* Sub-navigation Tabs */}
                <div className="flex items-center gap-1 p-2 bg-white/[0.02] border-b border-white/5">
                    {['Course Completion', 'Chapter Completion', 'Leaderboard'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveReportSubTab(tab)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                activeReportSubTab === tab 
                                    ? 'bg-[#2D2D2D] text-white shadow-lg' 
                                    : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="">
                    {activeReportSubTab === 'Course Completion' && (
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
                            {/* Percentage Breakdown (Left Column) */}
                            <div className="lg:col-span-2 space-y-8 lg:border-r border-white/5 lg:pr-8">
                                <div className="space-y-1">
                                    <h2 className="text-[17px] font-black text-white">Percentage Breakdown</h2>
                                    <p className="text-[12px] text-white/40 font-medium">Percentage of completion by users</p>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex items-center justify-between px-6 py-3 text-[11px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
                                        <span>Percentage of Completion</span>
                                        <span>All Users (0)</span>
                                    </div>
                                    {[
                                        '0% - 1%',
                                        '1% - 25%',
                                        '26% - 50%',
                                        '51% - 75%',
                                        '76% - 99%',
                                        '100%'
                                    ].map((range) => (
                                        <div key={range} className="flex items-center justify-between px-6 py-4 border-b border-white/5 group hover:bg-white/[0.02] transition-all">
                                            <span className="text-[14px] font-bold text-white/60">{range}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-[13px] font-bold text-white/30">0 user (0%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Average Rate (Right Column) */}
                            <div className="flex flex-col items-center justify-start py-4 space-y-12">
                                <div className="space-y-1 text-center">
                                    <h2 className="text-[17px] font-black text-white">Average Completion Rate</h2>
                                    <p className="text-[12px] text-white/40 font-medium">Percentage of chapters marked as completed</p>
                                </div>

                                {/* Circular Doughnut Chart */}
                                <div className="relative w-56 h-56 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle 
                                            cx="112" cy="112" r="90" 
                                            fill="transparent" 
                                            stroke="currentColor" 
                                            strokeWidth="10" 
                                            className="text-white/[0.05]" 
                                        />
                                        <circle 
                                            cx="112" cy="112" r="90" 
                                            fill="transparent" 
                                            stroke="currentColor" 
                                            strokeWidth="10" 
                                            strokeDasharray={2 * Math.PI * 90}
                                            strokeDashoffset={2 * Math.PI * 90}
                                            strokeLinecap="round"
                                            className="text-primary-pink transition-all duration-1000 ease-out" 
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center gap-1">
                                        <span className="text-5xl font-black text-white tracking-tighter">0%</span>
                                        <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">No of Users: 0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeReportSubTab === 'Chapter Completion' && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-bottom-2">
                            <div className="space-y-1">
                                <h2 className="text-[17px] font-black text-white">Percentage Breakdown</h2>
                                <p className="text-[12px] text-white/40 font-medium">Percentage of users who completed a chapter</p>
                            </div>

                            <Card className="rounded-2xl overflow-hidden border border-white/10 shadow-none">
                                <div className="grid grid-cols-4 bg-white/[0.02] border-b border-white/10 px-6 py-4 text-[11px] font-black text-white/20 uppercase tracking-widest">
                                    <div className="col-span-2">Chapter</div>
                                    <div className="text-center">Users</div>
                                    <div className="text-right pr-4">Action</div>
                                </div>

                                <div className="py-24 flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5 border-dashed">
                                            <Search size={40} className="text-primary-pink/30" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-pink/20 shadow-[0_0_15px_rgba(255,63,180,0.3)]" />
                                        <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-primary-purple/20" />
                                        <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 rounded-full bg-white/20" />
                                    </div>
                                    <p className="text-[13px] text-white/20 font-bold text-center max-w-[300px]">
                                        Percentage of users who completed a chapter will appear here
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeReportSubTab === 'Leaderboard' && (
                        <div className="p-8 space-y-6 animate-in slide-in-from-bottom-2">
                            <div className="space-y-1">
                                <h2 className="text-[17px] font-black text-white">Leaderboard</h2>
                                <p className="text-[12px] text-white/40 font-medium">List of users sorted by completion % and organized by progress level</p>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Input 
                                        placeholder="Search by name, phone or email"
                                        className="pl-12 bg-white/5 border-white/10 rounded-xl text-sm font-medium focus:border-primary-pink/50"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                                </div>
                                <Button 
                                    variant="secondary"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest shadow-sm active:scale-95 border border-white/10 bg-white/5"
                                >
                                    <Download size={14} /> Export CSV
                                </Button>
                            </div>

                            <Card className="rounded-2xl overflow-hidden border border-white/10 shadow-none">
                                <div className="grid grid-cols-7 bg-white/[0.02] border-b border-white/10 px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-tighter">
                                    <div>Rank</div>
                                    <div>User</div>
                                    <div>Contact</div>
                                    <div className="flex items-center gap-1">Completion <ArrowUpDown size={10} /></div>
                                    <div className="flex items-center gap-1">Purchased <ArrowUpDown size={10} /></div>
                                    <div className="flex items-center gap-1">First Progress <ArrowUpDown size={10} /></div>
                                    <div className="flex items-center gap-1 text-right">Last Progress <ArrowUpDown size={10} /></div>
                                </div>

                                <div className="py-24 flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5 border-dashed">
                                            <Search size={40} className="text-primary-pink/30" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-pink/20 shadow-[0_0_15px_rgba(255,63,180,0.3)]" />
                                        <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-primary-purple/20" />
                                        <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 rounded-full bg-white/20" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-[17px] font-black text-white">No users found!</h3>
                                        <p className="text-[13px] text-white/20 font-bold max-w-sm px-4">
                                            List of users with individual completion % and last visit will appear here
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportTab;

