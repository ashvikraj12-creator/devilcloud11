import React, { useState, useEffect } from 'react';
import { HeroTerminal } from '../components/HeroTerminal.js';
import { NoticeBanner } from '../components/NoticeBanner.js';
import { apiRequest } from '../api.js';
import type { Plan, ServerLocation } from '../types.js';
import {
  Zap,
  Shield,
  HardDrive,
  Cpu,
  RotateCcw,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Layers,
  Globe,
  MessageSquare,
  Users,
  Gift,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string, state?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [locations, setLocations] = useState<ServerLocation[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [discordCopied, setDiscordCopied] = useState(false);
  const [liveStats, setLiveStats] = useState({
    totalServers: 148,
    onlineServers: 136,
    onlinePlayers: 892,
    activeNodes: 4,
    averagePing: '14ms',
    uptimePercentage: '99.98%',
  });

  useEffect(() => {
    apiRequest('/public/plans')
      .then((res) => setPlans(res.plans || []))
      .catch(() => {});

    apiRequest('/public/locations')
      .then((res) => setLocations(res.locations || []))
      .catch(() => {});

    apiRequest('/public/live-stats')
      .then((res) => setLiveStats(res))
      .catch(() => {});
  }, []);

  const featuresList = [
    {
      icon: Cpu,
      title: 'High Performance',
      tag: 'RYZEN 9 7950X / 9950X',
      desc: 'Blazing fast single-core clock speeds up to 5.7GHz, ensuring high tickrates (20 TPS) even with heavy entity counts.',
    },
    {
      icon: Activity,
      title: 'Ultra-Low Latency',
      tag: 'INDIA FIBER NODES',
      desc: 'Optimized routing to Mumbai and Tier-1 peering exchanges in Delhi, Bangalore & Singapore with sub-20ms ping.',
    },
    {
      icon: HardDrive,
      title: 'Gen4 NVMe Storage',
      tag: '7,000 MB/s READ/WRITE',
      desc: 'Ultra-fast world chunk loading, instant Nether/End portal transitions, and zero lag spikes during auto-saves.',
    },
    {
      icon: RotateCcw,
      title: 'Automatic Backups',
      tag: 'OFFSITE DISASTER RECOVERY',
      desc: 'Scheduled snapshots stored on redundant S3 cloud storage. Restore your entire Minecraft world with a single click.',
    },
    {
      icon: Shield,
      title: 'DDoS Protection',
      tag: '12 Tbps CORERO SMARTWALL',
      desc: 'Always-on Layer 3, 4 and Layer 7 Minecraft-specific packet filtering that absorbs volumetric attacks automatically.',
    },
    {
      icon: Layers,
      title: 'Java + Bedrock Support',
      tag: 'CROSS-PLAY READY',
      desc: 'Run Paper, Purpur, Fabric, Forge, or Bedrock Dedicated with pre-installed GeyserMC crossplay capabilities.',
    },
    {
      icon: Server,
      title: 'Server Monitoring',
      tag: 'REAL-TIME TELEMETRY',
      desc: 'Interactive web console, live CPU/RAM utilization gauges, player logs, and real-time TPS monitoring.',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      tag: 'AUTOMATED PROVISIONING',
      desc: 'Your server node is prepared, configured, and assigned a dedicated port immediately upon payment verification.',
    },
  ];

  const faqs = [
    {
      q: 'How fast is server delivery?',
      a: 'After successful payment verification, server delivery usually takes between 1 minute and 1 hour depending on node resource allocation and initial Minecraft world generation.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We natively support Indian UPI (Google Pay, PhonePe, Paytm, BHIM, Cred) via direct payee ID ashvikraj@fam, as well as credit/debit card gateways.',
    },
    {
      q: 'How does UPI payment work?',
      a: 'When you place an order, an exact amount and unique Order ID are generated along with a QR code and UPI link. Pay through your preferred UPI app and submit your 12-digit UTR/Reference number for verification.',
    },
    {
      q: 'Do you support Java and Bedrock crossplay?',
      a: 'Yes! All DevilCloud servers support PaperMC, Purpur, Spigot, Fabric, Forge, and GeyserMC, allowing PC Java players and mobile/console Bedrock players to play together seamlessly.',
    },
    {
      q: 'Can I create a custom plan?',
      a: 'Yes! Use our interactive "Build Your Server" custom plan builder to pick your exact RAM (2-32GB), vCPU cores (1-16), and NVMe storage slots with transparent live pricing.',
    },
    {
      q: 'How do I manage my server after purchase?',
      a: 'You get full access to our customer control panel featuring an interactive live console, file manager, server.properties editor, and restart controls.',
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121316] text-[#FFB800] border-2 border-[#121316] rounded-md shadow-hard-sm font-mono text-xs font-bold tracking-wider">
                <span className="text-[#FF5500]">⚡</span>
                <span>PREMIUM MINECRAFT SERVER HOSTING</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-heading font-black tracking-tight text-[#121316] uppercase leading-[0.95]">
                ULTRA-FAST <br />
                <span className="text-[#FF5500] drop-shadow-[2px_2px_0px_#121316]">MINECRAFT</span> <br />
                HOSTING
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-zinc-700 font-medium max-w-xl leading-relaxed">
                Power your Minecraft community with fast, reliable and affordable server hosting. Powered by high-clock Ryzen CPUs, NVMe Gen4 storage, and native Indian UPI payments.
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs font-bold">
                <span className="px-2.5 py-1 bg-white border-2 border-[#121316] rounded shadow-hard-sm text-[#121316]">
                  ⚡ HIGH PERFORMANCE
                </span>
                <span className="px-2.5 py-1 bg-white border-2 border-[#121316] rounded shadow-hard-sm text-[#121316]">
                  📶 LOW LATENCY (12ms)
                </span>
                <span className="px-2.5 py-1 bg-white border-2 border-[#121316] rounded shadow-hard-sm text-[#121316]">
                  💾 NVMe GEN4 STORAGE
                </span>
                <span className="px-2.5 py-1 bg-[#FFB800] border-2 border-[#121316] rounded shadow-hard-sm text-black">
                  🚀 INSTANT SETUP
                </span>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('/pricing')}
                  id="btn-hero-get-started"
                  className="btn-press flex items-center gap-2 px-8 py-4 bg-[#FF5500] hover:bg-[#E64D00] text-white border-hard-thick rounded-lg font-heading text-lg font-black uppercase tracking-wider shadow-hard-lg hover:translate-y-[-2px] transition-all cursor-pointer"
                >
                  <span>GET STARTED</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onNavigate('/custom-plan')}
                  id="btn-hero-custom-plan"
                  className="btn-press flex items-center gap-2 px-6 py-4 bg-[#F0ECE1] hover:bg-white text-[#121316] border-hard-thick rounded-lg font-heading text-lg font-black uppercase tracking-wider shadow-hard hover:translate-y-[-2px] transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-[#FF5500]" />
                  <span>CUSTOM PLAN BUILDER</span>
                </button>
              </div>

              {/* Micro specs note */}
              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-600">
                <span>Plans starting at ₹99/mo</span>
                <span>•</span>
                <span>Instant UPI Checkout</span>
                <span>•</span>
                <span>Zero Setup Fees</span>
              </div>
            </div>

            {/* Right Hero Column: Hardware Control Panel Terminal */}
            <div className="lg:col-span-5">
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE PLATFORM METRICS TICKER */}
      <section className="w-full bg-[#121316] border-y-4 border-[#121316] py-6 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r-0 md:border-r border-zinc-800 p-2">
              <div className="font-heading text-3xl sm:text-4xl font-black text-[#FF5500]">
                {liveStats.totalServers}+
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                Active Game Servers
              </div>
            </div>

            <div className="border-r-0 md:border-r border-zinc-800 p-2">
              <div className="font-heading text-3xl sm:text-4xl font-black text-[#00FF66]">
                {liveStats.uptimePercentage}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                Network SLA Uptime
              </div>
            </div>

            <div className="border-r-0 md:border-r border-zinc-800 p-2">
              <div className="font-heading text-3xl sm:text-4xl font-black text-[#FFB800]">
                {liveStats.averagePing}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                Average India Ping
              </div>
            </div>

            <div className="p-2">
              <div className="font-heading text-3xl sm:text-4xl font-black text-cyan-400">
                12 Tbps
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                Corero Anti-DDoS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HARDWARE & INFRASTRUCTURE FEATURES GRID ("BUILT FOR YOUR SERVER") */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-block px-3 py-1 bg-[#121316] text-[#FFB800] font-mono text-xs font-bold rounded shadow-hard-sm">
              ENGINEERED FOR EXTREME TICKRATES
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#121316] tracking-tight">
              BUILT FOR YOUR SERVER
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-sans">
              From small vanilla survival worlds to massive public PvP networks, our hardware architecture is built without bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresList.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="bg-white border-hard rounded-xl p-6 shadow-hard hover:translate-y-[-3px] hover:shadow-hard-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg shadow-hard-sm flex items-center justify-center text-[#FF5500] group-hover:bg-[#121316] group-hover:text-[#FFB800] transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-zinc-400">
                        MOD.0{i + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-lg font-black text-[#121316] uppercase">
                        {feat.title}
                      </h3>
                      <div className="font-mono text-[10px] font-bold text-[#FF5500] tracking-wider mt-0.5">
                        {feat.tag}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-200 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>HARDWARE VERIFIED</span>
                    <span className="text-[#00FF66]">● OK</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PLANS PREVIEW (5 DEFAULT PLANS) */}
      <section className="py-20 bg-[#F0ECE1] border-y-2 border-[#121316]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-block px-3 py-1 bg-[#FF5500] text-white font-mono text-xs font-bold rounded shadow-hard-sm mb-2">
                TRANSPARENT INR PRICING
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#121316] tracking-tight">
                POPULAR SERVER PLANS
              </h2>
              <p className="text-sm text-zinc-600 mt-1">
                Choose a pre-configured tier or build your custom instance.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/pricing')}
              className="btn-press self-start md:self-auto px-5 py-2.5 bg-[#121316] text-[#FFB800] border-2 border-[#121316] rounded-md font-mono text-xs font-bold shadow-hard hover:bg-black transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>VIEW ALL SPECIFICATIONS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {plans.slice(0, 8).map((p) => {
              const isPopular = p.isPopular;
              return (
                <div
                  key={p.id}
                  className={`relative bg-white border-2 border-[#121316] rounded-xl p-5 shadow-hard flex flex-col justify-between transition-all hover:translate-y-[-4px] ${
                    isPopular ? 'ring-2 ring-[#FF5500] shadow-hard-lg' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#FFB800] text-[#121316] border-2 border-[#121316] text-[10px] font-mono font-black uppercase px-3 py-0.5 rounded-full shadow-hard-sm">
                      MOST POPULAR
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200">
                      <div>
                        <h3 className="font-heading text-xl font-black text-[#121316]">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-sans">{p.ram} GB RAM Setup</p>
                      </div>
                      <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-mono text-[9px] font-bold text-zinc-700 uppercase">
                        {p.category === 'vps' ? 'VPS' : p.processor === 'ryzen' ? 'Ryzen 9' : 'Intel'}
                      </span>
                    </div>

                    <div className="py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-3xl font-black text-[#FF5500]">
                          ₹{p.priceMonth}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">/month</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1 leading-snug">{p.tagline}</p>
                    </div>

                    {/* Specs Pills */}
                    <div className="space-y-1.5 py-3 border-t border-zinc-200 text-xs font-mono">
                      <div className="flex justify-between py-0.5">
                        <span className="text-zinc-500">RAM:</span>
                        <span className="font-bold text-[#121316]">{p.ram} GB</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-zinc-500">CPU:</span>
                        <span className="font-bold text-[#121316]">{p.cpu}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-zinc-500">NVMe:</span>
                        <span className="font-bold text-[#121316]">{p.storage} GB</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-zinc-500">Backups:</span>
                        <span className="font-bold text-[#121316]">{p.backups} Slots</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('/checkout', { planId: p.id })}
                    className={`w-full py-2.5 border-2 border-[#121316] rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard-sm transition-all cursor-pointer ${
                      isPopular
                        ? 'bg-[#FF5500] hover:bg-[#E64D00] text-white'
                        : 'bg-[#F8F5EE] hover:bg-[#121316] hover:text-white text-[#121316]'
                    }`}
                  >
                    ORDER NOW
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SERVER LOCATIONS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-block px-3 py-1 bg-[#121316] text-[#FFB800] font-mono text-xs font-bold rounded shadow-hard-sm">
              GLOBAL EDGE NODES
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#121316] tracking-tight">
              SERVER LOCATIONS
            </h2>
            <p className="text-sm text-zinc-600">
              Low ping is everything in Minecraft PvP and redstone contraptions. Deploy directly to our Tier-4 datacenters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white border-hard rounded-xl p-5 shadow-hard flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{loc.flag}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-500 font-mono text-[10px] font-bold rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      OPERATIONAL
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-heading text-lg font-black text-[#121316]">
                      {loc.name}
                    </h3>
                    <p className="text-xs font-mono text-zinc-500">{loc.city}, {loc.country}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Latency:</span>
                      <span className="font-bold text-[#00FF66] bg-[#121316] px-1.5 py-0.5 rounded text-[11px]">
                        {loc.latency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Datacenter:</span>
                      <span className="text-zinc-800 truncate max-w-[130px] font-medium">{loc.datacenter}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => onNavigate('/checkout', { location: loc.id })}
                    className="w-full py-2 bg-[#F8F5EE] hover:bg-[#121316] hover:text-white border-2 border-[#121316] rounded font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    DEPLOY HERE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROVISIONING & SECURITY NOTICE BANNER */}
      <div className="max-w-4xl mx-auto px-4 my-8">
        <NoticeBanner type="both" />
      </div>

      {/* 7. FAQ SECTION */}
      <section className="py-16 bg-[#F0ECE1] border-t-2 border-[#121316]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-[#121316]">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-xs font-mono text-zinc-600 mt-1 uppercase tracking-wider">
              CLEAR ANSWERS ABOUT PROVISIONING, PAYMENTS AND HARDWARE
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border-hard rounded-lg shadow-hard overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-heading text-base font-bold text-[#121316] flex items-center justify-between cursor-pointer hover:bg-[#F8F5EE]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#FF5500] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-700 leading-relaxed font-sans border-t border-zinc-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. JOIN DISCORD COMMUNITY SECTION */}
      <section className="py-16 bg-[#171922] border-t-2 border-[#121316] text-white relative overflow-hidden" id="section-join-discord">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#5865F2]/10 border-2 border-[#5865F2] rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-hard-lg backdrop-blur-sm">
            {/* Background branding glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-3 text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5865F2] text-white rounded-md font-mono text-xs font-black uppercase shadow-hard-sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>OFFICIAL COMMUNITY</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white">
                  JOIN OUR DISCORD COMMUNITY
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  Connect with over 1,500+ Minecraft server owners, receive instant setup help directly from Ashvik Raj and Samar Pratap, claim monthly RAM & Nitro giveaways, and get live maintenance alerts.
                </p>

                {/* Discord Highlights */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 font-mono text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                    <span className="text-[#00FF66] font-bold">1,420+ Online</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded border border-white/10">
                    <Gift className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>Monthly Giveaways</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded border border-white/10">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Direct Founder Support</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
                <a
                  href="https://discord.gg/devilcloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-join-discord-external"
                  className="btn-press flex items-center justify-center gap-2 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl border-2 border-white shadow-hard cursor-pointer transition-all text-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>JOIN DISCORD SERVER</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('https://discord.gg/devilcloud');
                    setDiscordCopied(true);
                    setTimeout(() => setDiscordCopied(false), 3000);
                  }}
                  id="btn-copy-discord-link"
                  className="px-6 py-3 bg-[#121316] hover:bg-black text-zinc-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {discordCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                      <span className="text-[#00FF66]">INVITE COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY INVITE LINK</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CTA SECTION */}
      <section className="py-20 bg-[#121316] text-white border-t-4 border-[#FF5500]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-[#FF5500] text-black font-mono text-xs font-bold rounded uppercase">
            ⚡ START PLAYING IN MINUTES
          </div>
          <h2 className="text-4xl sm:text-6xl font-heading font-black uppercase tracking-tight">
            READY TO POWER YOUR MINECRAFT COMMUNITY?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base font-sans">
            Choose your plan now and get high-frequency hardware backed by 24/7 technical assistance and seamless UPI billing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/pricing')}
              className="btn-press px-8 py-4 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-white rounded-lg font-heading text-lg font-black uppercase tracking-wider shadow-hard-white cursor-pointer"
            >
              CHOOSE A PLAN
            </button>
            <button
              onClick={() => onNavigate('/custom-plan')}
              className="btn-press px-6 py-4 bg-zinc-900 hover:bg-black text-[#FFB800] border-2 border-zinc-700 rounded-lg font-heading text-lg font-black uppercase tracking-wider cursor-pointer"
            >
              BUILD CUSTOM SERVER
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
