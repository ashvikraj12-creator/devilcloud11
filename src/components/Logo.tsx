import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Geometric Server + Devil Horns + Lightning Cube Symbol */}
      <div
        className={`${iconSizes[size]} relative bg-[#121316] border-2 border-[#121316] shadow-hard-sm flex items-center justify-center overflow-hidden rounded-md group`}
      >
        {/* Background diagonal stripe */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5500] via-[#121316] to-[#FFB800] opacity-30" />
        
        {/* SVG Geometric Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5/6 h-5/6 text-[#FF5500] drop-shadow-[0_2px_4px_rgba(255,85,0,0.5)]"
        >
          {/* Server chassis box */}
          <path
            d="M3 5H21V19H3V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lightning / Devil blade strike */}
          <path
            d="M13 2L7 12H13L11 22L17 12H11L13 2Z"
            fill="#FFB800"
            stroke="#121316"
            strokeWidth="1"
          />
          {/* Status LEDs */}
          <circle cx="6" cy="8" r="1" fill="#00FF66" />
          <circle cx="6" cy="12" r="1" fill="#FF5500" />
          <circle cx="6" cy="16" r="1" fill="#FFB800" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-heading font-black tracking-tight text-[#121316] ${textSizes[size]}`}>
              DEVIL<span className="text-[#FF5500]">CLOUD</span>
            </span>
            <span className="bg-[#121316] text-[#FFB800] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-widest border border-[#121316]">
              NODE
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-700 tracking-wider font-semibold">
            MINECRAFT INFRASTRUCTURE
          </span>
        </div>
      )}
    </div>
  );
};
