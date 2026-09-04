import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import type { Plan } from '../types.js';
import {
  Check,
  Sparkles,
  Server,
  Cpu,
  Zap,
  Sliders,
  ShieldCheck,
  Clock,
  ArrowRight,
  HardDrive,
  Activity,
  Layers,
} from 'lucide-react';
import { NoticeBanner } from '../components/NoticeBanner.js';

interface PricingPageProps {
  onNavigate: (path: string, state?: any) => void;
  initialState?: any;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, initialState }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeCategory, setActiveCategory] = useState<'minecraft' | 'vps'>(
    initialState?.initialTab === 'vps' ? 'vps' : 'minecraft'
  );
  const [mcProcessor, setMcProcessor] = useState<'intel' | 'ryzen'>(
    initialState?.initialProcessor === 'ryzen' ? 'ryzen' : 'intel'
  );
  const [vpsProcessor, setVpsProcessor] = useState<'intel' | 'ryzen'>('intel');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  useEffect(() => {
    apiRequest('/public/plans')
      .then((res) => {
        if (res?.plans && res.plans.length > 0) {
          setPlans(res.plans);
        }
      })
      .catch(() => {});
  }, []);

  // Filter plans based on selection
  const filteredPlans = plans.filter((p) => {
    if (activeCategory === 'minecraft') {
      return (p.category === 'minecraft' || !p.category) && (p.processor || 'intel') === mcProcessor;
    } else {
      return p.category === 'vps' && (p.processor || 'intel') === vpsProcessor;
    }
  });

  const getCalculatedPrice = (p: Plan) => {
    if (activeCategory === 'vps') {
      return {
        total: p.priceMonth,
        perMonth: p.priceMonth,
        label: 'Monthly billing',
      };
    }

    if (billingPeriod === 'quarterly') {
      const total = p.price3Months || Math.round(p.priceMonth * 3 * 0.90);
      const perMonth = Math.round(total / 3);
      return {
        total,
        perMonth,
        label: `Billed ₹${total} every 3 months`,
      };
    }

    if (billingPeriod === 'annually') {
      const total = p.priceAnnually || Math.round(p.priceMonth * 12 * 0.80);
      const perMonth = Math.round(total / 12);
      return {
        total,
        perMonth,
        label: `Billed ₹${total} every year`,
      };
    }

    return {
      total: p.priceMonth,
      perMonth: p.priceMonth,
      label: 'Billed monthly',
    };
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>ENTERPRISE HARDWARE CLOUD</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase text-[#121316] tracking-tight">
          HIGH PERFORMANCE HOSTING
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">
          Select between our high-frequency dual-processor Minecraft hosting and unmetered cloud VPS nodes.
        </p>

        {/* Primary Service Selector (Minecraft Plans vs VPS Plans) */}
        <div className="pt-3 flex items-center justify-center">
          <div className="bg-white border-2 border-[#121316] rounded-xl p-1.5 shadow-hard flex items-center gap-2 font-mono text-xs font-black">
            <button
              onClick={() => setActiveCategory('minecraft')}
              id="tab-select-minecraft"
              className={`px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === 'minecraft'
                  ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Server className="w-4 h-4 text-[#FF5500]" />
              <span>MINECRAFT PLANS</span>
            </button>

            <button
              onClick={() => setActiveCategory('vps')}
              id="tab-select-vps"
              className={`px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === 'vps'
                  ? 'bg-[#121316] text-[#00FF66] shadow-hard-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#00FF66]" />
              <span>VPS PLANS</span>
            </button>
          </div>
        </div>
      </div>

      {/* MINECRAFT SECTION */}
      {activeCategory === 'minecraft' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Controls Bar: 1. Processor Switch (Intel default & Ryzen 9) and 2. Billing Period Toggle */}
          <div className="bg-white border-2 border-[#121316] rounded-2xl p-6 shadow-hard flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Processor Switch */}
            <div className="w-full md:w-auto">
              <div className="text-[11px] font-mono font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>SELECT PROCESSOR ARCHITECTURE:</span>
              </div>
              <div className="inline-flex bg-[#F0ECE1] p-1.5 rounded-xl border-2 border-[#121316] shadow-hard-sm">
                <button
                  onClick={() => setMcProcessor('intel')}
                  id="btn-processor-intel"
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    mcProcessor === 'intel'
                      ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  <span>INTEL PLANS</span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                    Xeon Plat
                  </span>
                </button>

                <button
                  onClick={() => setMcProcessor('ryzen')}
                  id="btn-processor-ryzen"
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    mcProcessor === 'ryzen'
                      ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  <span>RYZEN 9 PLANS</span>
                  <span className="text-[10px] bg-[#FF5500] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                    9950X
                  </span>
                </button>
              </div>
            </div>

            {/* Billing Period Toggle */}
            <div className="w-full md:w-auto">
              <div className="text-[11px] font-mono font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>SERVER PURCHASE TIME:</span>
              </div>
              <div className="inline-flex bg-[#F0ECE1] p-1.5 rounded-xl border-2 border-[#121316] shadow-hard-sm">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  id="btn-billing-monthly"
                  className={`px-4 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                    billingPeriod === 'monthly'
                      ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  MONTHLY
                </button>

                <button
                  onClick={() => setBillingPeriod('quarterly')}
                  id="btn-billing-quarterly"
                  className={`px-4 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingPeriod === 'quarterly'
                      ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  <span>3 MONTHS</span>
                  <span className="bg-[#00FF66] text-black text-[9px] px-1.5 py-0.5 rounded font-mono font-black">
                    SAVE 10%
                  </span>
                </button>

                <button
                  onClick={() => setBillingPeriod('annually')}
                  id="btn-billing-annually"
                  className={`px-4 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingPeriod === 'annually'
                      ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  <span>ANNUAL</span>
                  <span className="bg-[#FF5500] text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-black">
                    SAVE 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Selection Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 text-[#FFB800] border-2 border-[#121316] rounded-xl font-mono text-xs shadow-hard-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              <span className="font-bold">
                Showing {mcProcessor === 'intel' ? 'Intel Xeon Platinum (Low Latency)' : 'AMD Ryzen 9 9950X (5.7GHz Max)'} Plans
              </span>
            </div>
            <div className="text-white text-[11px]">
              {billingPeriod === 'monthly' ? 'Standard 30-Day Billing' : billingPeriod === 'quarterly' ? '3-Month Bundle (10% Off)' : 'Annual Discount (20% Off)'}
            </div>
          </div>

          {/* 8 Plan Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPlans.map((p) => {
              const pricing = getCalculatedPrice(p);
              const isPopular = p.isPopular;

              return (
                <div
                  key={p.id}
                  id={`plan-card-${p.id}`}
                  className={`relative bg-white border-2 border-[#121316] rounded-xl p-5 shadow-hard flex flex-col justify-between transition-all hover:translate-y-[-4px] ${
                    isPopular ? 'ring-3 ring-[#FF5500] shadow-hard-lg' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#FFB800] text-[#121316] border-2 border-[#121316] text-[10px] font-mono font-black uppercase px-3 py-0.5 rounded-full shadow-hard-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FF5500]" />
                      <span>BEST VALUE</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="pb-3 border-b-2 border-zinc-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-2xl font-black text-[#121316] uppercase">
                          {p.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-mono text-[10px] font-bold text-zinc-700">
                          {p.processor === 'ryzen' ? 'Ryzen 9' : 'Intel Plat'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-sans mt-0.5">{p.tagline}</p>
                    </div>

                    {/* Price Block */}
                    <div className="py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-4xl font-black text-[#FF5500]">
                          ₹{pricing.perMonth}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">/mo</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-600 mt-1 font-bold">
                        {billingPeriod !== 'monthly' ? (
                          <span className="text-[#121316] bg-[#00FF66]/20 px-1.5 py-0.5 rounded">
                            ₹{pricing.total} total for {billingPeriod === 'quarterly' ? '3 months' : '1 year'}
                          </span>
                        ) : (
                          <span>₹{p.priceMonth}/month</span>
                        )}
                      </div>
                    </div>

                    {/* Hardware Specs */}
                    <div className="space-y-2 py-3.5 border-t border-zinc-200 text-xs font-mono">
                      <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-[#FF5500]" />
                          <span>RAM</span>
                        </span>
                        <span className="font-black text-zinc-900">{p.ram} GB</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
                          <span>CPU</span>
                        </span>
                        <span className="font-black text-zinc-900">{p.cpu}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-[#00FF66]" />
                          <span>NVMe SSD</span>
                        </span>
                        <span className="font-black text-zinc-900">{p.storage} GB</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Backups</span>
                        </span>
                        <span className="font-black text-zinc-900">{p.backups} Slots</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="border-t border-zinc-200 pt-3 space-y-1.5 mb-5 text-[11px] text-zinc-700">
                      {p.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#00FF66] bg-[#121316] rounded-full p-0.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={() =>
                      onNavigate('/checkout', {
                        planId: p.id,
                        billingPeriod,
                        calculatedTotal: pricing.total,
                        processor: p.processor,
                      })
                    }
                    id={`btn-order-${p.id}`}
                    className={`w-full py-3 border-2 border-[#121316] rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-hard-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isPopular
                        ? 'bg-[#FF5500] hover:bg-[#E64D00] text-white shadow-hard'
                        : 'bg-[#121316] hover:bg-black text-[#FFB800]'
                    }`}
                  >
                    <span>ORDER {billingPeriod === 'quarterly' ? '(3 MO)' : billingPeriod === 'annually' ? '(1 YR)' : ''}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VPS PLANS SECTION */}
      {activeCategory === 'vps' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* VPS Controls */}
          <div className="bg-white border-2 border-[#121316] rounded-2xl p-6 shadow-hard flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>CHOOSE VPS VENDOR:</span>
              </div>
              <div className="inline-flex bg-[#F0ECE1] p-1.5 rounded-xl border-2 border-[#121316] shadow-hard-sm">
                <button
                  onClick={() => setVpsProcessor('intel')}
                  id="btn-vps-intel"
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    vpsProcessor === 'intel'
                      ? 'bg-[#121316] text-[#00FF66] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-[#00FF66]" />
                  <span>INTEL VPS</span>
                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-mono">
                    8269-CY
                  </span>
                </button>

                <button
                  onClick={() => setVpsProcessor('ryzen')}
                  id="btn-vps-ryzen"
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    vpsProcessor === 'ryzen'
                      ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#FFB800]" />
                  <span>RYZEN VPS</span>
                  <span className="text-[10px] bg-[#FF5500] text-white px-1.5 py-0.5 rounded font-mono">
                    9950X
                  </span>
                </button>
              </div>
            </div>

            {/* Note: VPS is sold monthly only */}
            <div className="bg-[#121316] text-white px-4 py-3 rounded-xl border-2 border-[#121316] font-mono text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#00FF66]" />
              <div>
                <span className="font-bold text-[#00FF66]">MONTHLY SUBSCRIPTION ONLY</span>
                <p className="text-[11px] text-zinc-400">All VPS instances are billed on a recurring monthly cycle.</p>
              </div>
            </div>
          </div>

          {/* VPS Plans Grid */}
          {filteredPlans.length === 0 ? (
            <div className="bg-[#121316] text-white border-2 border-[#121316] rounded-2xl p-12 text-center space-y-4 shadow-hard">
              <div className="w-16 h-16 bg-[#FF5500]/20 border-2 border-[#FF5500] rounded-full flex items-center justify-center mx-auto text-[#FF5500]">
                <Cpu className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
                NO {vpsProcessor.toUpperCase()} VPS PLANS CONFIGURED YET
              </h2>
              <p className="text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm font-mono">
                Log in to the Admin Panel &rarr; Plans Management to add new {vpsProcessor === 'ryzen' ? 'AMD Ryzen 9' : 'Intel Xeon'} VPS packages.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredPlans.map((p) => {
                const isPopular = p.isPopular;

                return (
                  <div
                    key={p.id}
                    id={`vps-card-${p.id}`}
                    className={`relative bg-white border-2 border-[#121316] rounded-2xl p-6 shadow-hard flex flex-col justify-between transition-all hover:translate-y-[-4px] ${
                      isPopular ? 'ring-4 ring-[#00FF66] shadow-hard-lg' : ''
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#00FF66] text-black border-2 border-[#121316] text-[10px] font-mono font-black uppercase px-3.5 py-0.5 rounded-full shadow-hard-sm flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>MOST POPULAR VPS</span>
                      </div>
                    )}

                    <div>
                      {/* Title */}
                      <div className="pb-4 border-b-2 border-zinc-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-3xl font-black text-[#121316] uppercase">
                            {p.name}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded font-mono text-xs font-black uppercase border ${
                              p.processor === 'ryzen'
                                ? 'bg-orange-100 border-[#FF5500] text-[#FF5500]'
                                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            }`}
                          >
                            {p.processor === 'ryzen' ? 'AMD Ryzen 9' : 'Intel Xeon'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-sans mt-1">
                          {p.tagline || `${p.processor === 'ryzen' ? 'AMD Ryzen 9 9950X' : 'Intel Platinum 8269-CY'} • Full Root`}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="py-5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-heading text-5xl font-black text-[#121316]">
                            ₹{p.priceMonth}
                          </span>
                          <span className="font-mono text-sm text-zinc-500">/month</span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mt-1">
                          Full root access • Dedicated IPv4 • Unmetered 1Gbps
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="space-y-3 py-4 border-t-2 border-zinc-100 font-mono text-xs">
                        <div className="flex items-center justify-between p-2 bg-[#F8F5EE] rounded-lg border border-zinc-200">
                          <span className="text-zinc-600 flex items-center gap-2">
                            <Server className="w-4 h-4 text-[#FF5500]" />
                            <span>MEMORY</span>
                          </span>
                          <span className="font-black text-[#121316]">
                            {p.ram} GB {p.processor === 'ryzen' ? 'DDR5' : 'DDR4'} RAM
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-[#F8F5EE] rounded-lg border border-zinc-200">
                          <span className="text-zinc-600 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[#00FF66]" />
                            <span>VCORE / CPU</span>
                          </span>
                          <span className="font-black text-[#121316]">{p.cpu}</span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-[#F8F5EE] rounded-lg border border-zinc-200">
                          <span className="text-zinc-600 flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-blue-500" />
                            <span>STORAGE</span>
                          </span>
                          <span className="font-black text-[#121316]">{p.storage} GB NVMe SSD</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="pt-2 space-y-2 mb-6 text-xs text-zinc-700">
                        {p.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#00FF66] bg-[#121316] rounded-full p-0.5 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order VPS Button */}
                    <button
                      onClick={() =>
                        onNavigate('/checkout', {
                          planId: p.id,
                          billingPeriod: 'monthly',
                          calculatedTotal: p.priceMonth,
                          category: 'vps',
                        })
                      }
                      id={`btn-order-vps-${p.id}`}
                      className="w-full py-3.5 bg-[#00FF66] hover:bg-[#00E65C] text-black border-2 border-[#121316] rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-hard transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>ORDER VPS NOW</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Custom Plan Callout */}
      <div className="mt-14 bg-[#121316] text-white border-2 border-[#121316] rounded-2xl p-8 shadow-hard flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-block px-2.5 py-0.5 bg-[#FFB800] text-black font-mono text-[10px] font-black rounded">
            FLEXIBLE HARDWARE ALLOCATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white">
            WANT CUSTOM SLOTS, RAM, OR NVME STORAGE?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Configure up to 32 GB RAM, 16 vCPUs, and 500 GB NVMe storage dynamically with our real-time plan calculator.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/custom-plan')}
          id="btn-open-custom-builder"
          className="btn-press px-6 py-3.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-white rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-hard-white flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          <span>OPEN CUSTOM BUILDER</span>
        </button>
      </div>

      {/* Delivery Notice */}
      <div className="mt-10">
        <NoticeBanner type="both" />
      </div>
    </div>
  );
};
