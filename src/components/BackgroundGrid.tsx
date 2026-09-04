import React from 'react';

export const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 bg-tech-grid opacity-60" />
      <div className="absolute inset-0 bg-tech-dots opacity-40" />

      {/* Decorative Technical Coordinates & Marks */}
      <div className="absolute top-24 left-6 font-mono text-[10px] text-gray-500 hidden lg:block tracking-widest">
        SYS.LOC: 19.0760° N, 72.8777° E [IN-MUM-01]
      </div>
      <div className="absolute top-24 right-6 font-mono text-[10px] text-gray-500 hidden lg:block tracking-widest">
        CLK: 4.80GHz | NVMe Gen4 | 10Gbps
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-gray-500 hidden lg:block tracking-widest">
        SEC: ANTI-DDOS CORERO 12Tbps
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-gray-500 hidden lg:block tracking-widest">
        ENGINE: DEVILCLOUD-V4-ENTERPRISE
      </div>

      {/* Subtle Corner Crosshairs */}
      <div className="absolute top-4 left-4 text-gray-400 font-mono text-xs">+</div>
      <div className="absolute top-4 right-4 text-gray-400 font-mono text-xs">+</div>
      <div className="absolute bottom-4 left-4 text-gray-400 font-mono text-xs">+</div>
      <div className="absolute bottom-4 right-4 text-gray-400 font-mono text-xs">+</div>
    </div>
  );
};
