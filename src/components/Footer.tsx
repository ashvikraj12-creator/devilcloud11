import React from 'react';
import { Logo } from './Logo.js';
import { ShieldCheck, Zap, Radio, Globe, Terminal, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#121316] text-[#F8F5EE] border-t-4 border-[#FF5500] relative z-10">
      {/* Top Status Ticker */}
      <div className="border-b border-zinc-800 bg-[#0A0B0D] py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
            <span className="text-zinc-300 font-bold">ALL SYSTEMS OPERATIONAL</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">GLOBAL NODES: 4 ACTIVE</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>UPTIME: <strong className="text-[#FFB800]">99.98%</strong></span>
            <span>AVG PING: <strong className="text-[#00FF66]">14ms</strong></span>
            <span>DDoS MITIGATION: <strong className="text-[#FF5500]">ACTIVE (12Tbps)</strong></span>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-3 bg-[#1A1C22] border-2 border-zinc-700 rounded-lg inline-block shadow-hard-sm">
              <Logo size="md" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-sm">
              DEVILCLOUD provides enterprise-grade, low-latency Minecraft server infrastructure. Powered by high-frequency AMD Ryzen CPUs, Gen4 NVMe arrays, and native Indian UPI payment workflows.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>CORERO ANTI-DDOS</span>
              </div>
              <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>INSTANT SETUP</span>
              </div>
            </div>
          </div>

          {/* Hosting Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5500]">
              SERVER HOSTING
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-400">
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:text-white hover:underline cursor-pointer">
                  Starter Plan (₹99/mo)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:text-white hover:underline cursor-pointer">
                  Gamer Plan (₹179/mo)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:text-white hover:underline cursor-pointer">
                  Pro SMP Tier (₹299/mo)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/custom-plan')} className="text-[#FFB800] hover:underline font-bold cursor-pointer">
                  Custom Plan Builder &rarr;
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/locations')} className="hover:text-white hover:underline cursor-pointer">
                  India & Global Locations
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFB800]">
              SUPPORT & HELP
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-400">
              <li>
                <button onClick={() => onNavigate('/support')} className="hover:text-white hover:underline cursor-pointer">
                  Knowledge Base & FAQ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/support')} className="hover:text-white hover:underline cursor-pointer">
                  Create Support Ticket
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/features')} className="hover:text-white hover:underline cursor-pointer">
                  Hardware Specifications
                </button>
              </li>
              <li>
                <span className="text-zinc-500">Discord Community (24/7)</span>
              </li>
              <li>
                <span className="text-zinc-500">UPI Payment Guide</span>
              </li>
            </ul>
          </div>

          {/* Security & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              OPERATIONS
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-400">
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-white hover:underline cursor-pointer">
                  Client Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin-login')} className="hover:text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer">
                  <Terminal className="w-3 h-3 text-[#FF5500]" />
                  <span>Admin Operations Panel</span>
                </button>
              </li>
              <li>
                <span className="text-zinc-500 text-[11px]">UPI: ashvikraj@fam</span>
              </li>
              <li>
                <span className="text-zinc-500 text-[11px]">Node OS: Ubuntu 24.04 LTS</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Legal */}
        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} DEVILCLOUD HOSTING. ALL RIGHTS RESERVED.
          </div>
          <div className="text-center md:text-right text-[11px] max-w-lg">
            Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Minecraft is a registered trademark of Mojang Synergies AB.
          </div>
        </div>
      </div>
    </footer>
  );
};
