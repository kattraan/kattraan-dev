import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * @param {{ request: object, onApprove: () => void, onReject: () => void, busy?: boolean }} props
 */
const JoinRequestRow = ({ request, onApprove, onReject, busy = false }) => (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
        <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{request.user?.userName}</p>
            <p className="text-xs text-gray-500 dark:text-white/40 truncate">{request.user?.userEmail}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant="success" disabled={busy} onClick={onApprove}>
                <Check size={14} className="mr-1" /> Approve
            </Button>
            <Button size="sm" variant="muted" disabled={busy} onClick={onReject}>
                <X size={14} className="mr-1" /> Reject
            </Button>
        </div>
    </div>
);

export default JoinRequestRow;
