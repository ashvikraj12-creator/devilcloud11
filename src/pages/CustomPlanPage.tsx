import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import type { CustomPlanConfig, ServerLocation } from '../types.js';
import { Cpu, HardDrive, RotateCcw, Server, Shield, Sparkles, ArrowRight, Check } from 'lucide-react';
import { NoticeBanner } from '../components/NoticeBanner.js';

interface CustomPlanPageProps {
  onNavigate: (path: string, state?: any) => void;
}

export const CustomPlanPage: React.FC<CustomPlanPageProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<CustomPlanConfig>({
    minRam: 2,
    maxRam: 32,
    ramPricePerGb: 40,
    minCpu: 1,
    maxCpu: 16,
    cpuPricePerCore: 35,
    minStorage: 10,
    maxStorage: 500,
    storagePricePerGb: 1.5,
    minBackups: 0,
    maxBackups: 30,
    backupPricePerSlot: 10,
    basePrice: 49,
    supportedSoftware: ['Paper 1.21', 'Purpur 1.21', 'Spigot 1.21', 'Vanilla 1.21', 'Fabric 1.21', 'Forge 1.20.1', 'Bedrock Dedicated'],
    supportedVersions: ['1.21.4 (Latest)', '1.21.1', '1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2', '1.8.9'],
    supportedLocations: ['loc_in_mum', 'loc_sg_sin', 'loc_eu_fra', 'loc_us_east'],
  });

  const [locations, setLocations] = useState<ServerLocation[]>([]);

  // State sliders
  const [ram, setRam] = useState(8);
  const [cpu, setCpu] = useState(4);
  const [storage, setStorage] = useState(80);
  const [backups, setBackups] = useState(5);
  const [location, setLocation] = useState('loc_in_mum');
  const [software, setSoftware] = useState('Paper 1.21');
  const [version, setVersion] = useState('1.21.4 (Latest)');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Backend calculated total
  const [calculatedPrice, setCalculatedPrice] = useState({
    monthlyPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    apiRequest('/public/custom-plan-config')
      .then((res) => {
        if (res.config) setConfig(res.config);
      })
      .catch(() => {});

    apiRequest('/public/locations')
      .then((res) => {
        if (res.locations) setLocations(res.locations);
      })
      .catch(() => {});
  }, []);

  // Recalculate price on backend whenever specs change
  useEffect(() => {
    apiRequest('/public/calculate-price', {
      method: 'POST',
      body: JSON.stringify({ ram, cpu, storage, backups, billingPeriod }),
    })
      .then((res) => {
        setCalculatedPrice({
          monthlyPrice: res.monthlyPrice,
          totalPrice: res.totalPrice,
        });
      })
      .catch(() => {
        // Fallback local calc
        const base = config.basePrice + ram * config.ramPricePerGb + cpu * config.cpuPricePerCore + storage * config.storagePricePerGb + backups * config.backupPricePerSlot;
        const total = billingPeriod === 'annually' ? Math.ceil(base * 12 * 0.85) : billingPeriod === 'quarterly' ? Math.ceil(base * 3 * 0.95) : Math.ceil(base);
        setCalculatedPrice({ monthlyPrice: Math.ceil(base), totalPrice: total });
      });
  }, [ram, cpu, storage, backups, billingPeriod, config]);

  const handleCheckout = () => {
    onNavigate('/checkout', {
      isCustom: true,
      specs: {
        ram,
        cpu,
        storage,
        backups,
        location,
        software,
        version,
      },
      billingPeriod,
    });
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <span>⚡</span>
          <span>BUILD YOUR MINECRAFT SERVER</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase text-[#121316] tracking-tight">
          CUSTOM PLAN BUILDER
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">
          Design your exact hardware profile with interactive sliders. Scale up to 32 GB RAM, 16 Cores, and 500 GB NVMe storage with real-time transparent pricing.
        </p>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Sliders & Selectors (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. RAM Allocation Slider */}
          <div className="bg-white border-hard rounded-xl p-6 shadow-hard space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F8F5EE] border-2 border-[#121316] rounded-md text-[#FF5500] shadow-hard-sm">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-[#121316]">
                    MEMORY (RAM)
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">DDR4 3200MHz ECC High-Speed RAM</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-[#121316] text-[#FFB800] font-mono text-base font-bold rounded border-2 border-[#121316]">
                {ram} GB
              </div>
            </div>

            <input
              type="range"
              min={config.minRam}
              max={config.maxRam}
              step={1}
              value={ram}
              onChange={(e) => setRam(Number(e.target.value))}
              className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
            />

            <div className="flex justify-between text-xs font-mono text-zinc-500">
              <span>Min: {config.minRam} GB</span>
              <span className="text-[#FF5500] font-bold">₹{config.ramPricePerGb}/GB</span>
              <span>Max: {config.maxRam} GB</span>
            </div>
          </div>

          {/* 2. CPU Cores Allocation Slider */}
          <div className="bg-white border-hard rounded-xl p-6 shadow-hard space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F8F5EE] border-2 border-[#121316] rounded-md text-[#FFB800] shadow-hard-sm">
                  <Cpu className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-[#121316]">
                    VCPU CORES
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">High-Frequency AMD Ryzen 9 Cores</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-[#121316] text-[#00FF66] font-mono text-base font-bold rounded border-2 border-[#121316]">
                {cpu} {cpu === 1 ? 'Core' : 'Cores'}
              </div>
            </div>

            <input
              type="range"
              min={config.minCpu}
              max={config.maxCpu}
              step={1}
              value={cpu}
              onChange={(e) => setCpu(Number(e.target.value))}
              className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
            />

            <div className="flex justify-between text-xs font-mono text-zinc-500">
              <span>Min: {config.minCpu} Core</span>
              <span className="text-[#FF5500] font-bold">₹{config.cpuPricePerCore}/Core</span>
              <span>Max: {config.maxCpu} Cores</span>
            </div>
          </div>

          {/* 3. NVMe Storage Slider */}
          <div className="bg-white border-hard rounded-xl p-6 shadow-hard space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F8F5EE] border-2 border-[#121316] rounded-md text-[#121316] shadow-hard-sm">
                  <HardDrive className="w-5 h-5 text-[#FF5500]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-[#121316]">
                    GEN4 NVMe STORAGE
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">7,000 MB/s Read Speed for Fast Chunk Loading</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-[#121316] text-white font-mono text-base font-bold rounded border-2 border-[#121316]">
                {storage} GB
              </div>
            </div>

            <input
              type="range"
              min={config.minStorage}
              max={config.maxStorage}
              step={10}
              value={storage}
              onChange={(e) => setStorage(Number(e.target.value))}
              className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
            />

            <div className="flex justify-between text-xs font-mono text-zinc-500">
              <span>Min: {config.minStorage} GB</span>
              <span className="text-[#FF5500] font-bold">₹{config.storagePricePerGb}/GB</span>
              <span>Max: {config.maxStorage} GB</span>
            </div>
          </div>

          {/* 4. Automated Backup Slots Slider */}
          <div className="bg-white border-hard rounded-xl p-6 shadow-hard space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F8F5EE] border-2 border-[#121316] rounded-md text-[#121316] shadow-hard-sm">
                  <RotateCcw className="w-5 h-5 text-[#00FF66]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-[#121316]">
                    AUTO BACKUP SLOTS
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">Encrypted Offsite S3 Cloud Backups</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-[#121316] text-[#FFB800] font-mono text-base font-bold rounded border-2 border-[#121316]">
                {backups} Slots
              </div>
            </div>

            <input
              type="range"
              min={config.minBackups}
              max={config.maxBackups}
              step={1}
              value={backups}
              onChange={(e) => setBackups(Number(e.target.value))}
              className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
            />

            <div className="flex justify-between text-xs font-mono text-zinc-500">
              <span>Min: {config.minBackups}</span>
              <span className="text-[#FF5500] font-bold">₹{config.backupPricePerSlot}/Slot</span>
              <span>Max: {config.maxBackups} Slots</span>
            </div>
          </div>

          {/* 5. Software & Location Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Selector */}
            <div className="bg-white border-hard rounded-xl p-5 shadow-hard space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-[#121316]">
                DEPLOYMENT REGION
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded-md font-mono text-xs font-bold text-[#121316] focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.flag} {loc.name} ({loc.city}) - {loc.latency}
                  </option>
                ))}
              </select>
            </div>

            {/* Software Selector */}
            <div className="bg-white border-hard rounded-xl p-5 shadow-hard space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-[#121316]">
                SERVER SOFTWARE
              </label>
              <select
                value={software}
                onChange={(e) => setSoftware(e.target.value)}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded-md font-mono text-xs font-bold text-[#121316] focus:outline-none"
              >
                {config.supportedSoftware?.map((soft) => (
                  <option key={soft} value={soft}>
                    {soft}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculated Blueprint Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-[#121316] text-white border-hard-thick rounded-xl p-6 shadow-hard-lg space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
                <h3 className="font-heading text-xl font-black uppercase text-[#FFB800]">
                  YOUR SERVER
                </h3>
              </div>
              <span className="text-zinc-500 font-mono text-[10px] font-bold">CUSTOM SPEC</span>
            </div>

            {/* Live Spec List */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">RAM:</span>
                <span className="font-bold text-white">{ram} GB DDR4</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">CPU:</span>
                <span className="font-bold text-white">{cpu} vCPU Cores</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">STORAGE:</span>
                <span className="font-bold text-white">{storage} GB NVMe</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">BACKUPS:</span>
                <span className="font-bold text-white">{backups} Slots</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">SOFTWARE:</span>
                <span className="font-bold text-[#FF5500] truncate max-w-[130px]">{software}</span>
              </div>
            </div>

            {/* Billing Cycle Selector */}
            <div className="pt-2">
              <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-2">
                BILLING CYCLE
              </label>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold text-center">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`py-2 rounded border ${
                    billingPeriod === 'monthly'
                      ? 'bg-[#FF5500] text-white border-[#FF5500]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('quarterly')}
                  className={`py-2 rounded border ${
                    billingPeriod === 'quarterly'
                      ? 'bg-[#FF5500] text-white border-[#FF5500]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  3-Mo (-5%)
                </button>
                <button
                  onClick={() => setBillingPeriod('annually')}
                  className={`py-2 rounded border ${
                    billingPeriod === 'annually'
                      ? 'bg-[#FF5500] text-white border-[#FF5500]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  1-Yr (-15%)
                </button>
              </div>
            </div>

            {/* Total Price Display */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-zinc-400 uppercase">TOTAL:</span>
                <div className="text-right">
                  <div className="font-heading text-4xl font-black text-[#FF5500]">
                    ₹{calculatedPrice.totalPrice}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    ₹{calculatedPrice.monthlyPrice}/mo equivalent
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCheckout}
              id="btn-custom-checkout"
              className="btn-press w-full py-4 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-white rounded-lg font-heading text-base font-black uppercase tracking-wider shadow-hard-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE TO CHECKOUT</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <NoticeBanner type="both" />
    </div>
  );
};
