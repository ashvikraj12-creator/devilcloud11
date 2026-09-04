import React from 'react';
import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

interface NoticeBannerProps {
  type?: 'delivery' | 'security' | 'both';
  className?: string;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ type = 'both', className = '' }) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {(type === 'delivery' || type === 'both') && (
        <div className="bg-[#FFF8E7] border-2 border-[#121316] p-3.5 rounded-lg shadow-hard-sm flex items-start gap-3">
          <div className="bg-[#FFB800] border border-[#121316] p-1.5 rounded text-[#121316] shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#121316] flex items-center gap-1.5">
              <span>PROVISIONING NOTICE</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
            </div>
            <p className="text-xs text-gray-800 mt-0.5 leading-relaxed">
              Server delivery can take between <strong className="font-semibold text-[#121316]">1 minute and 1 hour</strong> after payment verification. Please don't worry if your server is not available immediately.
            </p>
          </div>
        </div>
      )}

      {(type === 'security' || type === 'both') && (
        <div className="bg-[#FFF0EB] border-2 border-[#121316] p-3 rounded-lg shadow-hard-sm flex items-center gap-2.5">
          <div className="bg-[#FF5500] border border-[#121316] p-1.5 rounded text-white shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-gray-900 leading-snug">
            <strong className="text-[#FF5500] font-bold">SECURITY ALERT:</strong> Never share your UPI PIN, OTP or banking password with anyone. Our team will never ask for your PIN.
          </p>
        </div>
      )}
    </div>
  );
};
