import React from 'react';
import {
  Cpu,
  HardDrive,
  Shield,
  Activity,
  RotateCcw,
  Zap,
  Terminal,
  Layers,
  ArrowRight,
  Globe,
  Sliders,
  Sparkles,
  Headphones,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { NoticeBanner } from '../components/NoticeBanner.js';

interface FeaturesPageProps {
  onNavigate: (path: string) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const featureGroups = [
    {
      category: 'HARDWARE & COMPUTE ARCHITECTURE',
      icon: Cpu,
      items: [
        {
          title: 'AMD Ryzen 9 9950X & 7950X',
          desc: 'High-frequency single-core clocks up to 5.7GHz, tuned specifically for single-threaded Minecraft world tick handling and 20.0 TPS.',
          badge: 'EXTREME PERFORMANCE',
        },
        {
          title: 'Intel Xeon Platinum 8269CY',
          desc: 'Enterprise multi-threaded workhorses designed for high-density survival worlds, large modpacks, and dedicated Cloud VPS workloads.',
          badge: 'ENTERPRISE DEDICATED',
        },
        {
          title: 'DDR4 3200MHz ECC Memory',
          desc: 'High-speed error-correcting RAM prevents server memory corruption during massive mob farms, hopper arrays, and redstone contraptions.',
          badge: 'ZERO MEMORY LEAKS',
        },
      ],
    },
    {
      category: 'STORAGE & DATA INTEGRITY',
      icon: HardDrive,
      items: [
        {
          title: 'PCIe Gen4 Enterprise NVMe SSDs',
          desc: '7,000 MB/s sequential read and write speeds ensure instantaneous Nether/End portal transitions and zero lag during world saves.',
          badge: '7,000 MB/s SPEEDS',
        },
        {
          title: 'Automated Off-Site S3 Backups',
          desc: 'Scheduled daily snapshots encrypted and stored on off-site S3 cloud repositories. Restore your entire Minecraft world with a single click.',
          badge: 'DISASTER RECOVERY',
        },
        {
          title: 'Uncapped I/O & Burst Protection',
          desc: 'No arbitrary disk throttles or throttled IOPS. Generate vast chunk borders or load 500+ mods without disk bottlenecks.',
          badge: 'UNCAPPED IOPS',
        },
      ],
    },
    {
      category: 'NETWORK & DDOS IMMUNITY',
      icon: Shield,
      items: [
        {
          title: '12 Tbps Corero SmartWall Defense',
          desc: 'Always-on Layer 3, 4, and Layer 7 Minecraft-specific packet filtering that absorbs volumetric UDP/TCP floods without dropping legitimate players.',
          badge: '12 TBPS FILTER',
        },
        {
          title: 'Indian Low-Latency Edge (Sub-15ms)',
          desc: 'Direct BGP peering in Mumbai (BBY-01) and Delhi NCR (DEL-01) with NIXI and Extreme-IX for ultra-smooth PvP knockback and hit registration.',
          badge: 'SUB-15MS INDIA',
        },
        {
          title: 'Dedicated Port & Custom Subdomain',
          desc: 'Get default 25565 ports or custom yourserver.devilcloud.fun subdomains so your players connect easily without port numbers.',
          badge: 'CLEAN CONNECTIVITY',
        },
      ],
    },
    {
      category: 'SERVER MANAGEMENT & MODPACKS',
      icon: Layers,
      items: [
        {
          title: 'Pterodactyl Control Panel',
          desc: 'Industry-standard control panel featuring live web console, real-time resource graphs, SFTP access, and schedule managers.',
          badge: 'FULL ROOT ACCESS',
        },
        {
          title: 'Java & Bedrock Cross-Play Ready',
          desc: 'Pre-configured GeyserMC and Floodgate plugins let mobile, console, and PC players join the exact same server world simultaneously.',
          badge: 'CROSSPLAY READY',
        },
        {
          title: '1-Click Software & Modpack Switcher',
          desc: 'Effortlessly switch between Paper, Purpur, Spigot, Fabric, Forge, and Bedrock Dedicated with a single click in your control panel.',
          badge: 'ANY SOFTWARE',
        },
      ],
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>CUTTING-EDGE GAMING INFRASTRUCTURE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase text-[#121316] tracking-tight">
          OUR FEATURES & HARDWARE
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 font-sans">
          Built without compromises. Discover why over 140+ communities trust DevilCloud for high-tickrate Minecraft & Cloud VPS hosting.
        </p>
      </div>

      {/* Feature Groups */}
      <div className="space-y-10 mb-14">
        {featureGroups.map((group, idx) => {
          const GroupIcon = group.icon;
          return (
            <div key={idx} className="bg-white border-2 border-[#121316] rounded-2xl p-6 sm:p-8 shadow-hard">
              <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#121316] text-[#00FF66] flex items-center justify-center shadow-hard-sm">
                    <GroupIcon className="w-5 h-5" />
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-black uppercase text-[#121316]">
                    {group.category}
                  </h2>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-400">
                  CATEGORY // 0{idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-[#F8F5EE] border-2 border-[#121316] rounded-xl p-5 shadow-hard-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-[#121316] text-[#FFB800] rounded font-mono text-[9px] font-black uppercase">
                          {item.badge}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                      </div>
                      <h3 className="font-heading text-base font-black text-[#121316] uppercase">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-600 leading-relaxed font-mono mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-[#121316] text-white border-2 border-[#121316] rounded-2xl p-8 sm:p-10 shadow-hard text-center space-y-5">
        <div className="inline-block px-3 py-1 bg-[#00FF66] text-black font-mono text-xs font-black uppercase rounded shadow-hard-sm">
          READY IN 60 SECONDS
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#FFB800] tracking-tight">
          DEPLOY YOUR SERVER WITH INSTANT PROVISIONING
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-mono">
          Pick from Intel or Ryzen 9 Minecraft tiers starting at ₹99/month, or launch high-speed Cloud VPS instances.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('/pricing')}
            className="btn-press px-8 py-3.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-white rounded-xl font-heading text-sm font-black uppercase tracking-wider shadow-hard-white cursor-pointer transition-all flex items-center gap-2"
          >
            <span>VIEW ALL HOSTING PLANS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('/team')}
            className="btn-press px-6 py-3.5 bg-[#F8F5EE] hover:bg-white text-[#121316] border-2 border-white rounded-xl font-heading text-sm font-black uppercase tracking-wider shadow-hard cursor-pointer transition-all"
          >
            <span>MEET THE FOUNDERS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
