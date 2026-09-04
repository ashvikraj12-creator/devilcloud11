import React from 'react';
import {
  ShieldCheck,
  Zap,
  Award,
  Server,
  Cpu,
  HeartHandshake,
  Headphones,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { NoticeBanner } from '../components/NoticeBanner.js';

interface TeamPageProps {
  onNavigate: (path: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <Award className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>LEADERSHIP & CORE ENGINEERING</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase text-[#121316] tracking-tight">
          MEET OUR TEAM
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 font-sans">
          The infrastructure architects and operational leaders behind DevilCloud's ultra-low latency game nodes.
        </p>
      </div>

      {/* 2 Distinct Boxes Stacked One by One */}
      <div className="space-y-8 mb-14">
        {/* BOX 1: ASHVIK RAJ - OWNER & FOUNDER */}
        <div className="bg-white border-2 border-[#121316] rounded-2xl p-6 sm:p-8 shadow-hard hover:shadow-hard-lg transition-all relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5500]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF5500] text-white font-mono text-xs font-black uppercase rounded-md shadow-hard-sm mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>OWNER AND FOUNDER</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-[#121316] tracking-tight">
                ASHVIK RAJ
              </h2>
              <p className="text-xs font-mono text-zinc-500 font-bold uppercase mt-1">
                Founder, Chief Systems Architect & Infrastructure Lead
              </p>
            </div>

            <div className="px-3.5 py-2 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg font-mono text-xs font-bold text-[#121316] flex items-center gap-2 self-start md:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
              <span>FOUNDER ACTIVE // ROOT ACCESS</span>
            </div>
          </div>

          {/* Highlights & Good Points about Ashvik Raj */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-black uppercase text-[#121316] tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF5500]" />
              <span>KEY LEADERSHIP & TECHNICAL HIGHLIGHTS:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <Server className="w-4 h-4 text-[#FF5500]" />
                  <span>Enterprise Infrastructure Visionary</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Founded DevilCloud with the explicit mission to eliminate lag, high costs, and deceptive server hosting practices, bringing authentic enterprise hardware to every gamer.
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <Zap className="w-4 h-4 text-[#00FF66]" />
                  <span>Low-Latency Network Pioneer</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Engineered direct BGP peering with Tier-1 Indian exchanges (NIXI, Extreme IX) across Mumbai and Delhi, delivering sub-15ms ping for Indian competitive players.
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <Cpu className="w-4 h-4 text-[#FFB800]" />
                  <span>JVM & Minecraft Engine Tuning</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Deep mastery in custom JVM garbage collector arguments (Aikar's Flags), PaperMC/Purpur thread optimizations, and anti-crash crash dumps to sustain 20.0 TPS under heavy load.
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <HeartHandshake className="w-4 h-4 text-purple-600" />
                  <span>Community-First Commitment</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Personally accessible to community members—frequently guiding new server owners on plugin setups, modpack installations, and world optimization on Discord.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOX 2: SAMAR PRATAP - ADMIN & CEO */}
        <div className="bg-white border-2 border-[#121316] rounded-2xl p-6 sm:p-8 shadow-hard hover:shadow-hard-lg transition-all relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00FF66]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121316] text-[#00FF66] font-mono text-xs font-black uppercase rounded-md shadow-hard-sm mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>ADMIN & CEO</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-[#121316] tracking-tight">
                SAMAR PRATAP
              </h2>
              <p className="text-xs font-mono text-zinc-500 font-bold uppercase mt-1">
                Chief Executive Officer & Head of Platform Operations
              </p>
            </div>

            <div className="px-3.5 py-2 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg font-mono text-xs font-bold text-[#121316] flex items-center gap-2 self-start md:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
              <span>EXECUTIVE // OPERATIONS ONLINE</span>
            </div>
          </div>

          {/* Highlights & Good Points about Samar Pratap */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-black uppercase text-[#121316] tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00FF66]" />
              <span>KEY LEADERSHIP & OPERATIONAL HIGHLIGHTS:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                  <span>Executive Leadership & 99.98% SLA</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Steers corporate strategy and oversees active datacenter operations, ensuring zero unplanned downtimes and rapid node resource allocation.
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <Lock className="w-4 h-4 text-cyan-600" />
                  <span>DDoS Defense & Security Strategy</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Directs the deployment of 12 Tbps Corero SmartWall packet inspection engines, guaranteeing full immunity against Layer 3/4 SYN floods and UDP exploits.
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <Headphones className="w-4 h-4 text-[#FF5500]" />
                  <span>Client-First Experience & Fast Support</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Spearheads customer satisfaction initiatives, instituting rapid automated provisioning via Indian UPI and establishing a high-touch 24/7 technical support desk.
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EE] border-2 border-zinc-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-heading font-black text-[#121316] uppercase">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                  <span>Platform Scaling & VPS Innovations</span>
                </div>
                <p className="text-xs font-mono text-zinc-700 leading-relaxed">
                  Drives the expansion into cloud VPS infrastructure, automated multi-region backup systems, and developer-centric Pterodactyl panel extensions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bottom Box */}
      <div className="bg-[#121316] text-white border-2 border-[#121316] rounded-2xl p-6 sm:p-8 shadow-hard flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-heading text-2xl font-black uppercase text-[#FFB800]">
            READY TO DEPLOY YOUR HIGH-PERFORMANCE SERVER?
          </h3>
          <p className="text-xs font-mono text-zinc-300">
            Backed by Ashvik Raj and Samar Pratap with zero-lag hardware and direct founder support.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/pricing')}
          className="btn-press px-6 py-3.5 bg-[#00FF66] hover:bg-[#00E65C] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl border-2 border-white shadow-hard-white cursor-pointer transition-all flex items-center gap-2 shrink-0"
        >
          <span>VIEW PLANS & PRICING</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
