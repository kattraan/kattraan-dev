import React from 'react';
import EmptyState from './shared/EmptyState';
import { Card } from '@/components/ui';

/**
 * Reviews tab for managing learner course reviews
 */
const ReviewsTab = () => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 font-satoshi">
            <div className="space-y-1">
                <h1 className="text-2xl font-black text-white">Reviews</h1>
                <p className="text-[12px] text-white/40 font-medium">List of all the reviews by the learners</p>
            </div>

            <Card className="rounded-[24px] overflow-hidden">
                <div className="grid grid-cols-4 bg-white/[0.02] border-b border-white/10 px-8 py-4 text-[11px] font-black text-white/20 uppercase tracking-widest">
                    <div>User</div>
                    <div className="text-center">Phone</div>
                    <div className="text-center">Review</div>
                    <div className="text-right">Date of Review</div>
                </div>

                <EmptyState 
                    message="Learner reviews will appear here when submitted"
                />
            </Card>
        </div>
    );
};

export default ReviewsTab;

