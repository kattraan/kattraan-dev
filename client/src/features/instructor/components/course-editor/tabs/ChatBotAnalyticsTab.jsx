import React from 'react';
import { Users, MessageSquare, CheckCircle2, Star, AlertCircle, Calendar, ChevronDown, Search, Inbox } from 'lucide-react';
import { Card, Input, ContentCard } from '@/components/ui';

/**
 * ChatBot Analytics tab for monitoring AI interactions and performance
 */
const ChatBotAnalyticsTab = () => {
    return (
        <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
            <ContentCard
                title="ChatBot Analytics"
                subtitle="Monitor your chatbot performance and user interactions."
                variant="flat"
                className="flex-1 min-w-0"
            >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Users', value: '0', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                    { label: 'Total Questions', value: '0', icon: MessageSquare, color: 'text-green-500', bgColor: 'bg-green-500/10' },
                    { label: 'Satisfied Conversations', value: '0', total: '0', icon: CheckCircle2, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
                    { label: 'Satisfaction Rate', value: '0%', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
                    { label: 'Unsatisfied Conversations', value: '0', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' }
                ].map((stat) => (
                    <Card key={stat.label} className="p-6 space-y-3 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
                        <span className="text-[13px] font-bold text-gray-500 dark:text-white/60 transition-colors duration-300">{stat.label}</span>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors duration-300">{stat.value}</span>
                                {stat.total && <span className="text-gray-400 dark:text-white/20 text-sm font-bold transition-colors duration-300">/ {stat.total}</span>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-8 space-y-6 rounded-[24px] bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 gap-3 transition-colors duration-300">
                        <span className="text-xs font-bold text-gray-400 dark:text-white/20 transition-colors duration-300">Start Date</span>
                        <span className="text-gray-300 dark:text-white/10 transition-colors duration-300">—</span>
                        <span className="text-xs font-bold text-gray-400 dark:text-white/20 transition-colors duration-300">End Date</span>
                        <Calendar size={16} className="text-gray-400 dark:text-white/20 ml-2 transition-colors duration-300" />
                    </div>
                    <div className="relative">
                        <select className="appearance-none bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl pl-4 pr-10 py-3 text-xs font-bold text-gray-600 dark:text-white/60 focus:outline-none focus:border-orange-500/30 transition-all duration-300 cursor-pointer min-w-[160px]">
                            <option>All Questions</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 pointer-events-none transition-colors duration-300" />
                    </div>
                    <div className="relative flex-1">
                        <Input 
                            placeholder="Search questions or users.."
                            className="pl-12 bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/5 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus:border-orange-500/30 transition-colors duration-300"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 pointer-events-none transition-colors duration-300" size={18} />
                    </div>
                </div>

                {/* Chat Questions Card */}
                <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors duration-300">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/[0.02] transition-colors duration-300">
                        <MessageSquare size={16} className="text-orange-500/60" />
                        <h2 className="text-sm font-black text-gray-900 dark:text-white transition-colors duration-300">Chat Questions (0)</h2>
                    </div>

                    <div className="grid grid-cols-4 bg-gray-50 dark:bg-white/[0.01] px-6 py-4 text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
                        <div>Subscriber</div>
                        <div>Question</div>
                        <div>Bot Answer</div>
                        <div className="text-right">Date & Time</div>
                    </div>

                    <div className="py-24 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-300 dark:text-white/10 transition-colors duration-300">
                            <Inbox size={32} />
                        </div>
                        <p className="text-[13px] text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest transition-colors duration-300">No Data</p>
                    </div>
                </div>
            </Card>
            </ContentCard>
        </div>
    );
};

export default ChatBotAnalyticsTab;
