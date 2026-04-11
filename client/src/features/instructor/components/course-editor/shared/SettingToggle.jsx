import React from 'react';
import { Switch } from '@/components/ui';

/**
 * Reusable toggle component for course settings
 */
const SettingToggle = ({ title, description, value, onChange }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:border-white/20 transition-all">
        <div className="space-y-1">
            <h3 className="text-[15px] font-black text-white">{title}</h3>
            <p className="text-[12px] text-white/40 font-medium">{description}</p>
        </div>
        <Switch checked={value} onChange={onChange} />
    </div>
);

export default SettingToggle;

