import React from 'react';

const CustomSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
      checked ? 'bg-primary-pink shadow-[0_0_12px_rgba(255,46,155,0.4)]' : 'bg-white/10'
    }`}
  >
    <div
      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${
        checked ? 'left-4.5' : 'left-0.5'
      }`}
    />
  </button>
);

export default CustomSwitch;
