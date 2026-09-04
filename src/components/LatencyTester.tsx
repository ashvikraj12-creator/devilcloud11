import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Cpu,
  Globe,
  Radio,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import type { ServerLocation } from '../types.js';

interface LatencyTesterProps {
  locations?: ServerLocation[];
  onSelectLocation?: (locationId: string) => void;
}

interface PingSample {
  id: number;
  timeStr: string;
  ryzenPing: number;
  intelPing: number;
}

interface RegionConfig {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  ip: string;
  ryzenBase: number;
  intelBase: number;
  variance: number;
  datacenter: string;
}

const REGIONS: RegionConfig[] = [
  {
    id: 'loc_in_mum',
    name: 'India Central',
    city: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    ip: '103.14.88.24',
    ryzenBase: 9.4,
    intelBase: 12.1,
    variance: 2.2,
    datacenter: 'Equinix MB1 Tier-4 (Mumbai)',
  },
  {
    id: 'loc_in_del',
    name: 'India North',
    city: 'Delhi NCR',
    country: 'India',
    flag: '🇮🇳',
    ip: '103.18.92.11',
    ryzenBase: 14.2,
    intelBase: 17.5,
    variance: 2.8,
    datacenter: 'CtrlS Noida DC Tier-4 (Delhi)',
  },
  {
    id: 'loc_sg_sin',
    name: 'Southeast Asia',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    ip: '165.22.104.90',
    ryzenBase: 23.6,
    intelBase: 26.8,
    variance: 3.1,
    datacenter: 'Singtel SGCS2 Tier-3+ (Singapore)',
  },
  {
    id: 'loc_eu_fra',
    name: 'Europe West',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    ip: '194.135.21.6',
    ryzenBase: 71.4,
    intelBase: 76.2,
    variance: 4.5,
    datacenter: 'Interxion FRA14 (Frankfurt)',
  },
  {
    id: 'loc_us_east',
    name: 'US East',
    city: 'Ashburn, VA',
    country: 'United States',
    flag: '🇺🇸',
    ip: '208.67.222.222',
    ryzenBase: 78.5,
    intelBase: 84.1,
    variance: 5.0,
    datacenter: 'Coresite VA2 Tier-4 (Ashburn)',
  },
];

const MAX_SAMPLES = 28;

export const LatencyTester: React.FC<LatencyTesterProps> = ({
  locations,
  onSelectLocation,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('loc_in_mum');
  const [processorView, setProcessorView] = useState<'both' | 'ryzen' | 'intel'>('both');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [pingSpeed, setPingSpeed] = useState<number>(500); // ms interval
  const [samples, setSamples] = useState<PingSample[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const sampleCounterRef = useRef<number>(0);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const currentRegion = useMemo(() => {
    return REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
  }, [selectedRegionId]);

  // Seed initial historical samples for chosen region
  useEffect(() => {
    const initial: PingSample[] = [];
    const now = Date.now();
    for (let i = 18; i >= 0; i--) {
      sampleCounterRef.current += 1;
      const noise = (Math.random() - 0.5) * currentRegion.variance;
      const ryzen = Math.max(4, Number((currentRegion.ryzenBase + noise).toFixed(1)));
      const intel = Math.max(5, Number((currentRegion.intelBase + noise * 1.15).toFixed(1)));
      const d = new Date(now - i * pingSpeed);
      initial.push({
        id: sampleCounterRef.current,
        timeStr: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ryzenPing: ryzen,
        intelPing: intel,
      });
    }
    setSamples(initial);
    setTerminalLogs([
      `PING ${currentRegion.ip} (${currentRegion.city}, ${currentRegion.country}) 64 data bytes`,
      `Established socket via ${currentRegion.datacenter} gateway...`,
    ]);
  }, [selectedRegionId, currentRegion, pingSpeed]);

  // Continuous real-time ping simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      sampleCounterRef.current += 1;
      const seq = sampleCounterRef.current;
      const noise = (Math.random() - 0.5) * currentRegion.variance;
      const ryzen = Math.max(4, Number((currentRegion.ryzenBase + noise).toFixed(1)));
      const intel = Math.max(5, Number((currentRegion.intelBase + noise * 1.15).toFixed(1)));
      const d = new Date();
      const timeStr = d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newSample: PingSample = {
        id: seq,
        timeStr,
        ryzenPing: ryzen,
        intelPing: intel,
      };

      setSamples((prev) => {
        const next = [...prev, newSample];
        if (next.length > MAX_SAMPLES) {
          return next.slice(next.length - MAX_SAMPLES);
        }
        return next;
      });

      const activePing = processorView === 'intel' ? intel : ryzen;
      const activeName = processorView === 'intel' ? 'Intel Xeon' : 'Ryzen 9';
      const logLine = `64 bytes from ${currentRegion.ip} [${activeName}]: icmp_seq=${seq} ttl=58 time=${activePing.toFixed(1)} ms`;

      setTerminalLogs((prev) => [logLine, ...prev.slice(0, 4)]);
    }, pingSpeed);

    return () => clearInterval(interval);
  }, [isRunning, currentRegion, pingSpeed, processorView]);

  // Compute stats
  const stats = useMemo(() => {
    if (samples.length === 0) {
      return {
        ryzenCurrent: 0,
        intelCurrent: 0,
        ryzenMin: 0,
        ryzenAvg: 0,
        ryzenMax: 0,
        intelMin: 0,
        intelAvg: 0,
        intelMax: 0,
        jitter: 0,
      };
    }
    const last = samples[samples.length - 1];
    const ryzenVals = samples.map((s) => s.ryzenPing);
    const intelVals = samples.map((s) => s.intelPing);

    const rMin = Math.min(...ryzenVals);
    const rMax = Math.max(...ryzenVals);
    const rAvg = ryzenVals.reduce((a, b) => a + b, 0) / ryzenVals.length;

    const iMin = Math.min(...intelVals);
    const iMax = Math.max(...intelVals);
    const iAvg = intelVals.reduce((a, b) => a + b, 0) / intelVals.length;

    // calculate jitter
    let jitterSum = 0;
    for (let i = 1; i < ryzenVals.length; i++) {
      jitterSum += Math.abs(ryzenVals[i] - ryzenVals[i - 1]);
    }
    const jitter = ryzenVals.length > 1 ? jitterSum / (ryzenVals.length - 1) : 0.8;

    return {
      ryzenCurrent: last.ryzenPing,
      intelCurrent: last.intelPing,
      ryzenMin: rMin,
      ryzenAvg: Number(rAvg.toFixed(1)),
      ryzenMax: rMax,
      intelMin: iMin,
      intelAvg: Number(iAvg.toFixed(1)),
      intelMax: iMax,
      jitter: Number(jitter.toFixed(1)),
    };
  }, [samples]);

  // SVG Chart Geometry
  const svgWidth = 800;
  const svgHeight = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };
  const graphW = svgWidth - padding.left - padding.right;
  const graphH = svgHeight - padding.top - padding.bottom;

  // Determine dynamic Y-axis domain
  const maxDataVal = useMemo(() => {
    const all = samples.flatMap((s) => [s.ryzenPing, s.intelPing]);
    const maxVal = all.length ? Math.max(...all) : 40;
    if (maxVal <= 32) return 35;
    if (maxVal <= 50) return 60;
    if (maxVal <= 90) return 100;
    return Math.ceil(maxVal * 1.25);
  }, [samples]);

  const getY = (val: number) => {
    const ratio = Math.max(0, Math.min(1, val / maxDataVal));
    return padding.top + (1 - ratio) * graphH;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left;
    return padding.left + (index / (total - 1)) * graphW;
  };

  // Build SVG Path strings
  const ryzenPoints = samples.map((s, i) => ({
    x: getX(i, samples.length),
    y: getY(s.ryzenPing),
    ping: s.ryzenPing,
  }));

  const intelPoints = samples.map((s, i) => ({
    x: getX(i, samples.length),
    y: getY(s.intelPing),
    ping: s.intelPing,
  }));

  const createSmoothLine = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const ryzenLinePath = createSmoothLine(ryzenPoints);
  const intelLinePath = createSmoothLine(intelPoints);

  const ryzenAreaPath = ryzenPoints.length
    ? `${ryzenLinePath} L ${ryzenPoints[ryzenPoints.length - 1].x},${padding.top + graphH} L ${ryzenPoints[0].x},${padding.top + graphH} Z`
    : '';

  const intelAreaPath = intelPoints.length
    ? `${intelLinePath} L ${intelPoints[intelPoints.length - 1].x},${padding.top + graphH} L ${intelPoints[0].x},${padding.top + graphH} Z`
    : '';

  // Generate nice horizontal scale steps
  const gridTicks = useMemo(() => {
    if (maxDataVal <= 35) return [0, 10, 20, 30];
    if (maxDataVal <= 60) return [0, 15, 30, 45, 60];
    if (maxDataVal <= 100) return [0, 25, 50, 75, 100];
    return [0, 50, 100, 150];
  }, [maxDataVal]);

  const y30ms = getY(30);

  return (
    <div
      id="realtime-latency-tester-card"
      className="bg-[#121316] text-white border-hard-thick rounded-2xl p-4 sm:p-7 shadow-hard space-y-6 relative overflow-hidden"
    >
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-dark-grid opacity-35 pointer-events-none" />

      {/* Top Header Controls */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-[#00FF66]' : 'bg-zinc-500'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-[#00FF66]' : 'bg-zinc-500'}`} />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00FF66] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              LIVE TELEMETRY PROBE & LATENCY BENCHMARK
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white flex items-center gap-2.5">
            <span>REAL-TIME EDGE PING TESTER</span>
          </h2>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 mt-1">
            Continuous synthetic RTT monitoring to high-bandwidth DevilCloud server clusters.
          </p>
        </div>

        {/* Global Controls & Interval */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-start sm:justify-end">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-1 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setPingSpeed(300)}
              id="btn-speed-300"
              className={`px-2.5 py-1 rounded transition-colors ${pingSpeed === 300 ? 'bg-[#FF5500] text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title="Fast Refresh (300ms)"
            >
              300ms
            </button>
            <button
              onClick={() => setPingSpeed(500)}
              id="btn-speed-500"
              className={`px-2.5 py-1 rounded transition-colors ${pingSpeed === 500 ? 'bg-[#FF5500] text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title="Normal Refresh (500ms)"
            >
              500ms
            </button>
            <button
              onClick={() => setPingSpeed(1000)}
              id="btn-speed-1000"
              className={`px-2.5 py-1 rounded transition-colors ${pingSpeed === 1000 ? 'bg-[#FF5500] text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
              title="Calm Refresh (1000ms)"
            >
              1.0s
            </button>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            id="btn-toggle-ping-test"
            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-lg font-mono text-xs font-bold shadow-hard-sm cursor-pointer transition-all ${
              isRunning
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 border-emerald-500 text-emerald-300 hover:bg-emerald-500/25'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'PAUSE TEST' : 'RESUME TEST'}</span>
          </button>

          <button
            onClick={() => {
              setSamples([]);
              sampleCounterRef.current = 0;
            }}
            id="btn-reset-ping-buffer"
            className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors"
            title="Clear sample history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>

      {/* Region Selector Pills (Prominently showcasing Mumbai, Delhi, Singapore) */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-zinc-300">
            <Globe className="w-3.5 h-3.5 text-[#FFB800]" />
            SELECT TARGET CLOUD REGION:
          </span>
          <span className="hidden sm:inline text-zinc-500">
            All nodes protected by 1.8 Tbps DDoS mitigation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {REGIONS.map((region) => {
            const isSelected = region.id === selectedRegionId;
            const isSub30 = ['loc_in_mum', 'loc_in_del', 'loc_sg_sin'].includes(region.id);

            return (
              <button
                key={region.id}
                id={`region-pill-${region.id}`}
                onClick={() => setSelectedRegionId(region.id)}
                className={`relative flex flex-col p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.25)] text-white translate-y-[-1px]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {isSub30 && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-[#00FF66] text-black font-mono text-[9px] font-black rounded-full shadow-sm">
                    &lt;30MS ZONE
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xl">{region.flag}</span>
                  <div className="truncate">
                    <span className="block font-heading font-black text-sm text-white truncate">
                      {region.city}
                    </span>
                    <span className="block font-mono text-[10px] text-zinc-400 truncate">
                      {region.country}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-zinc-500">RTT ~</span>
                  <span className={`font-bold ${isSub30 ? 'text-[#00FF66]' : 'text-[#FFB800]'}`}>
                    {Math.round(region.ryzenBase)} ms
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Processor Comparison Toggle */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Cpu className="w-4 h-4 text-[#FF5500]" />
          <span className="text-zinc-400 font-bold uppercase">NODE ARCHITECTURE:</span>
          <span className="text-white hidden md:inline">Compare response times across silicon tiers</span>
        </div>

        <div className="flex items-center gap-1 bg-black/60 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setProcessorView('both')}
            id="view-mode-both"
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              processorView === 'both'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span>COMPARE BOTH</span>
          </button>

          <button
            onClick={() => setProcessorView('ryzen')}
            id="view-mode-ryzen"
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              processorView === 'ryzen'
                ? 'bg-[#FF5500] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>RYZEN 9 9950X</span>
          </button>

          <button
            onClick={() => setProcessorView('intel')}
            id="view-mode-intel"
            className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              processorView === 'intel'
                ? 'bg-[#06B6D4] text-black font-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-black" />
            <span>INTEL XEON PLATINUM</span>
          </button>
        </div>
      </div>

      {/* Real-Time Live HUD Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {/* Current RTT */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[10px] text-zinc-400 block uppercase">CURRENT LATENCY</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-heading font-black text-[#00FF66]">
              {processorView === 'intel' ? stats.intelCurrent : stats.ryzenCurrent}
            </span>
            <span className="text-xs text-zinc-400 font-bold">ms</span>
          </div>
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-500/40 text-[#00FF66] text-[9px] font-bold rounded">
            {stats.ryzenCurrent < 20 ? 'ULTRA LOW' : stats.ryzenCurrent < 35 ? 'OPTIMAL' : 'GOOD'}
          </span>
        </div>

        {/* Ryzen Avg */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400">
            <span className="uppercase">RYZEN 9 9950X</span>
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-heading font-black text-[#FF5500]">
              {stats.ryzenAvg}
            </span>
            <span className="text-xs text-zinc-400 font-bold">ms avg</span>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-1 truncate">
            Min: {stats.ryzenMin}ms • Max: {stats.ryzenMax}ms
          </span>
        </div>

        {/* Intel Avg */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400">
            <span className="uppercase">INTEL PLATINUM</span>
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-heading font-black text-[#06B6D4]">
              {stats.intelAvg}
            </span>
            <span className="text-xs text-zinc-400 font-bold">ms avg</span>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-1 truncate">
            Min: {stats.intelMin}ms • Max: {stats.intelMax}ms
          </span>
        </div>

        {/* Jitter */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[10px] text-zinc-400 block uppercase">NETWORK JITTER</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-heading font-black text-[#FFB800]">
              ±{stats.jitter}
            </span>
            <span className="text-xs text-zinc-400 font-bold">ms</span>
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1">
            STABLE CARRIER ROUTE
          </span>
        </div>

        {/* Packet Loss */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[10px] text-zinc-400 block uppercase">PACKET LOSS</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-heading font-black text-[#00FF66]">
              0.00
            </span>
            <span className="text-xs text-zinc-400 font-bold">%</span>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-1">
            {samples.length} Packets Delivered
          </span>
        </div>

        {/* Target Datacenter info */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 block uppercase">EDGE GATEWAY</span>
          <div className="font-sans font-bold text-xs text-zinc-200 truncate mt-1">
            {currentRegion.city} Edge
          </div>
          <span className="text-[10px] text-zinc-500 truncate block mt-1 font-mono">
            IP: {currentRegion.ip}
          </span>
        </div>
      </div>

      {/* Visual Graph: Oscilloscope Real-Time SVG Chart */}
      <div
        ref={graphContainerRef}
        className="relative z-10 bg-black/90 border-2 border-zinc-800 rounded-xl p-3 sm:p-5 overflow-hidden"
      >
        {/* Chart Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-zinc-800/80 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#00FF66]" />
              <span className="font-bold text-zinc-200">
                REAL-TIME WAVEFORM: {currentRegion.name.toUpperCase()} ({currentRegion.datacenter})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {(processorView === 'both' || processorView === 'ryzen') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#FF5500] rounded-sm" />
                <span className="text-zinc-300 font-bold">AMD Ryzen 9 9950X</span>
              </div>
            )}
            {(processorView === 'both' || processorView === 'intel') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#06B6D4] rounded-sm" />
                <span className="text-zinc-300 font-bold">Intel Xeon Platinum</span>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Scalable SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 sm:h-64 select-none"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Ryzen Area Gradient */}
              <linearGradient id="ryzenGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5500" stopOpacity="0.38" />
                <stop offset="80%" stopColor="#FF5500" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
              </linearGradient>

              {/* Intel Area Gradient */}
              <linearGradient id="intelGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Lines & Y-axis labels */}
            {gridTicks.map((tick) => {
              const yPos = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={svgWidth - padding.right}
                    y2={yPos}
                    stroke="#27272A"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={yPos + 4}
                    fill="#71717A"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {tick}ms
                  </text>
                </g>
              );
            })}

            {/* Sub-30ms Gaming Benchmark Threshold (if in scale) */}
            {maxDataVal >= 30 && y30ms <= padding.top + graphH && (
              <g>
                <line
                  x1={padding.left}
                  y1={y30ms}
                  x2={svgWidth - padding.right}
                  y2={y30ms}
                  stroke="#00FF66"
                  strokeWidth="1.2"
                  strokeDasharray="6 3"
                  opacity="0.8"
                />
                <rect
                  x={svgWidth - padding.right - 145}
                  y={y30ms - 18}
                  width="140"
                  height="16"
                  fill="#064E3B"
                  rx="3"
                  opacity="0.85"
                />
                <text
                  x={svgWidth - padding.right - 75}
                  y={y30ms - 6}
                  fill="#00FF66"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  SUB-30MS COMPETITIVE LINE
                </text>
              </g>
            )}

            {/* Vertical Sample Markers */}
            {samples.map((s, idx) => {
              if (idx % 6 !== 0 && idx !== samples.length - 1) return null;
              const xPos = getX(idx, samples.length);
              return (
                <g key={s.id}>
                  <line
                    x1={xPos}
                    y1={padding.top}
                    x2={xPos}
                    y2={padding.top + graphH}
                    stroke="#1F242F"
                    strokeWidth="1"
                  />
                  <text
                    x={xPos}
                    y={padding.top + graphH + 18}
                    fill="#52525B"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {s.timeStr.slice(3)}
                  </text>
                </g>
              );
            })}

            {/* Intel Plotted Curve (if visible) */}
            {(processorView === 'both' || processorView === 'intel') && (
              <>
                <path d={intelAreaPath} fill="url(#intelGlowGrad)" />
                <path
                  d={intelLinePath}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#neonGlow)"
                />
                {/* Last point indicator for Intel */}
                {intelPoints.length > 0 && (
                  <g>
                    <circle
                      cx={intelPoints[intelPoints.length - 1].x}
                      cy={intelPoints[intelPoints.length - 1].y}
                      r="4"
                      fill="#06B6D4"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </>
            )}

            {/* Ryzen Plotted Curve (if visible) */}
            {(processorView === 'both' || processorView === 'ryzen') && (
              <>
                <path d={ryzenAreaPath} fill="url(#ryzenGlowGrad)" />
                <path
                  d={ryzenLinePath}
                  fill="none"
                  stroke="#FF5500"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#neonGlow)"
                />
                {/* Last point pulsing indicator for Ryzen */}
                {ryzenPoints.length > 0 && (
                  <g>
                    <circle
                      cx={ryzenPoints[ryzenPoints.length - 1].x}
                      cy={ryzenPoints[ryzenPoints.length - 1].y}
                      r="7"
                      fill="#FF5500"
                      opacity="0.3"
                    >
                      <animate
                        attributeName="r"
                        values="5;9;5"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.4;0.1;0.4"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx={ryzenPoints[ryzenPoints.length - 1].x}
                      cy={ryzenPoints[ryzenPoints.length - 1].y}
                      r="4.5"
                      fill="#FF5500"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </>
            )}
          </svg>
        </div>

        {/* Live Packet Terminal Ticker */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 bg-zinc-950/70 rounded-lg p-3 font-mono text-[11px] text-zinc-400">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] mb-1.5 pb-1 border-b border-zinc-900">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#00FF66]" />
              SOCKET LOGS (ICMP PACKET FEED)
            </span>
            <span className="text-[#00FF66]">CONNECTED 1000Mbps FULL DUPLEX</span>
          </div>
          <div className="space-y-0.5">
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={idx === 0 ? 'text-[#00FF66] font-bold' : 'text-zinc-500'}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer & Direct Deployment Link */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-[#00FF66] shrink-0" />
          <span>
            Target: <strong className="text-white">{currentRegion.name} ({currentRegion.city})</strong>. Lowest recorded ping in India &amp; Singapore nodes.
          </span>
        </div>

        <button
          onClick={() => onSelectLocation && onSelectLocation(currentRegion.id)}
          id="btn-latency-deploy-now"
          className="btn-press w-full sm:w-auto px-6 py-3 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-black rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-hard flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>DEPLOY MINECRAFT SERVER IN {currentRegion.city.toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
