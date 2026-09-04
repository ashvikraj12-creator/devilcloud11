import React, { useState, useEffect, useRef } from 'react';
import { Wifi, ChevronDown, ChevronUp, Check, Zap, Server, Activity, ShieldCheck } from 'lucide-react';

interface LocationPingData {
  id: string;
  name: string;
  code: string;
  flag: string;
  city: string;
  country: string;
  ryzenBasePing: number;
  intelBasePing: number;
  jitter: string;
  status: string;
}

const LOCATIONS: LocationPingData[] = [
  {
    id: 'loc_in_mum',
    name: 'Mumbai',
    code: 'BBY-01',
    flag: '🇮🇳',
    city: 'Mumbai',
    country: 'India',
    ryzenBasePing: 12,
    intelBasePing: 14,
    jitter: '0.2ms',
    status: 'OPTIMAL // DIRECT NIXI PEERING',
  },
  {
    id: 'loc_in_del',
    name: 'Delhi NCR',
    code: 'DEL-01',
    flag: '🇮🇳',
    city: 'Noida / Delhi',
    country: 'India',
    ryzenBasePing: 18,
    intelBasePing: 21,
    jitter: '0.3ms',
    status: 'LOW LATENCY // EXTREME-IX',
  },
  {
    id: 'loc_sgp',
    name: 'Singapore',
    code: 'SGP-01',
    flag: '🇸🇬',
    city: 'Jurong',
    country: 'Singapore',
    ryzenBasePing: 39,
    intelBasePing: 43,
    jitter: '0.5ms',
    status: 'SOUTHEAST ASIA HUB // EQUINIX SG1',
  },
  {
    id: 'loc_de_fra',
    name: 'Frankfurt',
    code: 'FRA-01',
    flag: '🇩🇪',
    city: 'Frankfurt',
    country: 'Germany',
    ryzenBasePing: 118,
    intelBasePing: 124,
    jitter: '0.8ms',
    status: 'EUROPE EDGE // DE-CIX',
  },
  {
    id: 'loc_us_iad',
    name: 'Ashburn',
    code: 'IAD-01',
    flag: '🇺🇸',
    city: 'Virginia',
    country: 'USA',
    ryzenBasePing: 182,
    intelBasePing: 189,
    jitter: '1.1ms',
    status: 'US EAST COAST // DATA ALLEY',
  },
];

export const HeroTerminal: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationPingData>(LOCATIONS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ryzenPing, setRyzenPing] = useState(selectedLocation.ryzenBasePing);
  const [intelPing, setIntelPing] = useState(selectedLocation.intelBasePing);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update pings when location changes
  useEffect(() => {
    setIsUpdating(true);
    setRyzenPing(selectedLocation.ryzenBasePing);
    setIntelPing(selectedLocation.intelBasePing);

    const timer = setTimeout(() => {
      setIsUpdating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedLocation]);

  // Subtle real-time latency micro-fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const ryzenVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      const intelVariation = Math.floor(Math.random() * 3) - 1;
      setRyzenPing(Math.max(8, selectedLocation.ryzenBasePing + ryzenVariation));
      setIntelPing(Math.max(10, selectedLocation.intelBasePing + intelVariation));
    }, 2400);

    return () => clearInterval(interval);
  }, [selectedLocation]);

  const handleSelectLocation = (loc: LocationPingData) => {
    setSelectedLocation(loc);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Background brutalist offset shadow */}
      <div className="absolute -inset-1.5 bg-[#FF5500] rounded-xl transform translate-x-2 translate-y-2 border-2 border-[#121316] opacity-90 hidden sm:block" />

      {/* Main Small Console Frame */}
      <div className="relative bg-[#0D0E12] border-2 border-[#121316] rounded-xl p-4 sm:p-5 text-white shadow-2xl overflow-hidden">
        {/* Console Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] inline-block" />
            </div>
            <span className="font-mono text-xs text-[#FFB800] font-black tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00FF66]" />
              PROCESSOR PING CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#00FF66] uppercase">
              LIVE NETWORK
            </span>
          </div>
        </div>

        {/* Location Selector with ^ / v Button */}
        <div className="relative mb-3.5" ref={dropdownRef}>
          <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1 flex items-center justify-between">
            <span>SELECTED EDGE NODE:</span>
            <span className="text-zinc-500">TAP BUTTON TO CHANGE</span>
          </div>

          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            id="btn-console-toggle-location"
            className="w-full flex items-center justify-between p-2.5 bg-[#171920] hover:bg-[#1f222b] border-2 border-zinc-700 hover:border-[#FF5500] rounded-lg transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{selectedLocation.flag}</span>
              <div>
                <div className="font-heading font-black text-xs text-white uppercase flex items-center gap-2">
                  <span>{selectedLocation.name}, {selectedLocation.country}</span>
                  <span className="px-1.5 py-0.2 bg-zinc-800 text-[#00FF66] rounded font-mono text-[9px]">
                    {selectedLocation.code}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {selectedLocation.status}
                </div>
              </div>
            </div>

            {/* ^ / v Toggle Button */}
            <div className="p-1.5 bg-zinc-800 group-hover:bg-[#FF5500] text-zinc-300 group-hover:text-white rounded border border-zinc-700 transition-colors">
              {dropdownOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Location Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#171920] border-2 border-[#FF5500] rounded-lg p-1.5 shadow-2xl z-30 space-y-1 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1 text-[9px] font-mono text-zinc-400 uppercase font-bold border-b border-zinc-800">
                AVAILABLE LOCATIONS:
              </div>
              {LOCATIONS.map((loc) => {
                const isSelected = loc.id === selectedLocation.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#121316] text-[#FFB800] border border-[#FFB800]/40'
                        : 'hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{loc.flag}</span>
                      <div>
                        <span className="font-heading font-black text-xs uppercase">
                          {loc.name}, {loc.country}
                        </span>
                        <span className="ml-1.5 font-mono text-[9px] text-zinc-400">
                          ({loc.code})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#00FF66]">
                        {loc.ryzenBasePing}ms
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#00FF66]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2 Dedicated Processor Ping Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          {/* 1. AMD Ryzen 9 9950X Card */}
          <div className="p-3 bg-[#13151B] border-2 border-[#FF5500]/60 rounded-lg relative overflow-hidden group">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5500] inline-block animate-ping" />
                <span className="font-black text-[#FF5500]">RYZEN 9 9950X</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FF5500]/20 text-[#FF5500] rounded">
                5.7 GHz
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-heading text-3xl sm:text-4xl font-black transition-all ${
                    isUpdating ? 'opacity-40 scale-95' : 'text-[#00FF66]'
                  }`}
                >
                  {ryzenPing}
                </span>
                <span className="font-mono text-xs text-zinc-400 font-bold">ms</span>
              </div>

              {/* Signal strength indicator */}
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 h-1.5 bg-[#00FF66] rounded-sm" />
                <span className="w-1 h-2.5 bg-[#00FF66] rounded-sm" />
                <span className="w-1 h-3.5 bg-[#00FF66] rounded-sm" />
                <span className="w-1 h-4 bg-[#00FF66] rounded-sm" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mt-1.5 pt-1.5 border-t border-zinc-800">
              <span>Jitter: {selectedLocation.jitter}</span>
              <span className="text-[#00FF66] font-bold">0% LOSS // 20.0 TPS</span>
            </div>
          </div>

          {/* 2. Intel Xeon Platinum Card */}
          <div className="p-3 bg-[#13151B] border-2 border-cyan-500/50 rounded-lg relative overflow-hidden group">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
                <span className="font-black text-cyan-400">INTEL PLATINUM</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                XEON 8269CY
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-heading text-3xl sm:text-4xl font-black transition-all ${
                    isUpdating ? 'opacity-40 scale-95' : 'text-cyan-400'
                  }`}
                >
                  {intelPing}
                </span>
                <span className="font-mono text-xs text-zinc-400 font-bold">ms</span>
              </div>

              {/* Signal strength indicator */}
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 h-1.5 bg-cyan-400 rounded-sm" />
                <span className="w-1 h-2.5 bg-cyan-400 rounded-sm" />
                <span className="w-1 h-3.5 bg-cyan-400 rounded-sm" />
                <span className="w-1 h-4 bg-cyan-400 rounded-sm" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mt-1.5 pt-1.5 border-t border-zinc-800">
              <span>Jitter: {selectedLocation.jitter}</span>
              <span className="text-cyan-400 font-bold">0% LOSS // TIER-1</span>
            </div>
          </div>
        </div>

        {/* Compact Console Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>12 Tbps Anti-DDoS Protected</span>
          </div>
          <span className="text-[#FFB800] font-bold">ICMP ECHO OK</span>
        </div>
      </div>
    </div>
  );
};
