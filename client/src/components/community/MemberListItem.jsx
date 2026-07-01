import React from 'react';
import { clsx } from 'clsx';
import { UserMinus } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

/**
 * @param {{ member: object, onRemove?: () => void, busy?: boolean, isOnline?: boolean }} props
 */
const MemberListItem = ({ member, onRemove, busy = false, isOnline }) => (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
        <div className="min-w-0 flex items-center gap-2">
            {isOnline !== undefined && (
                <span
                    className={clsx('w-2 h-2 rounded-full flex-shrink-0', isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-white/20')}
                    aria-label={isOnline ? 'Online' : 'Offline'}
                />
            )}
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{member.user?.userName}</p>
                <p className="text-xs text-gray-500 dark:text-white/40 truncate">{member.user?.userEmail}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {member.role === 'owner' ? (
                <Badge variant="primary">Owner</Badge>
            ) : member.role === 'moderator' ? (
                <Badge variant="success">Moderator</Badge>
            ) : null}
            {onRemove && member.role !== 'owner' && (
                <Button size="sm" variant="muted" disabled={busy} onClick={onRemove}>
                    <UserMinus size={14} className="mr-1" /> Remove
                </Button>
            )}
        </div>
    </div>
);

export default MemberListItem;
