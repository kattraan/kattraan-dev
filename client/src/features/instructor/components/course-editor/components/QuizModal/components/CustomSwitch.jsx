import React from 'react';
import { SWITCH_KNOB, SWITCH_OFF_TRACK, SWITCH_ON_TRACK } from '@/components/ui/Switch';

const CustomSwitch = ({ checked, onChange, variant = 'neutral' }) => {
  const checkedClass =
    variant === 'brand'
      ? 'bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end shadow-[0_0_12px_rgba(255,140,66,0.35)]'
      : SWITCH_ON_TRACK;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative h-4 w-8 rounded-full p-[1px] transition-all duration-300 ${
        checked ? checkedClass : SWITCH_OFF_TRACK
      }`}
    >
      <span
        className={`absolute top-[1px] h-3.5 w-3.5 transition-all duration-300 ${SWITCH_KNOB} ${
          checked ? 'left-[17px]' : 'left-[1px]'
        }`}
      />
    </button>
  );
};

export default CustomSwitch;
