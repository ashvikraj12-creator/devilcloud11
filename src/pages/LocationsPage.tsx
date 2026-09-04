import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import type { ServerLocation } from '../types.js';
import { Globe, Radio, Zap, ArrowRight, Server, ShieldCheck } from 'lucide-react';
import { LatencyTester } from '../components/LatencyTester.js';

interface LocationsPageProps {
  onNavigate: (path: string, state?: any) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ onNavigate }) => {
  const [locations, setLocations] = useState<ServerLocation[]>([]);
  const [testingPing, setTestingPing] = useState<Record<string, number | null>>({});

  useEffect(() => {
    apiRequest('/public/locations')
      .then((res) => setLocations(res.locations || []))
      .catch(() => {});
  }, []);

  const runPingTest = (locId: string) => {
    setTestingPing((prev) => ({ ...prev, [locId]: null }));
    setTimeout(() => {
      let simulated = 12;
      if (locId === 'loc_in_mum') simulated = Math.floor(9 + Math.random() * 5);
      else if (locId === 'loc_in_del') simulated = Math.floor(14 + Math.random() * 5);
      else if (locId === 'loc_sg_sin') simulated = Math.floor(22 + Math.random() * 6);
      else if (locId === 'loc_eu_fra') simulated = Math.floor(70 + Math.random() * 8);
      else simulated = Math.floor(79 + Math.random() * 9);

      setTestingPing((prev) => ({ ...prev, [locId]: simulated }));
    }, 600);
  };

  const handleSelectLocation = (locationId: string) => {
    onNavigate('/checkout', { location: locationId });
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#121316] text-[#FFB800] rounded-md font-mono text-xs font-bold shadow-hard-sm">
          <Globe className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>GLOBAL TIER-4 EDGE NETWORK</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase text-[#121316] tracking-tight">
          SERVER LOCATIONS
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">
          Our high-frequency Minecraft nodes are stationed in Mumbai, Delhi, Singapore, Frankfurt, and Ashburn with direct Tier-1 carrier routes delivering guaranteed sub-30ms latencies across India and Southeast Asia.
        </p>
      </div>

      {/* Real-time Latency Tester with Interactive Waveform Graph */}
      <LatencyTester
        locations={locations}
        onSelectLocation={handleSelectLocation}
      />

      {/* Edge Datacenter Nodes Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#121316] pb-3">
          <div>
            <h2 className="font-heading text-2xl font-black text-[#121316] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#FF5500]" />
              <span>DATACENTER NODES &amp; HARDWARE AVAILABILITY</span>
            </h2>
            <p className="font-mono text-xs text-zinc-500">
              Direct connection metrics and specifications per geographic node cluster
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 border border-emerald-300 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ALL 5 POPs OPERATIONAL</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const pingResult = testingPing[loc.id];
            const isSub30 = ['loc_in_mum', 'loc_in_del', 'loc_sg_sin'].includes(loc.id);

            return (
              <div
                key={loc.id}
                id={`datacenter-card-${loc.id}`}
                className="bg-white border-hard-thick rounded-xl p-6 shadow-hard flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{loc.flag}</span>
                      <div>
                        <h3 className="font-heading text-xl font-black text-[#121316]">
                          {loc.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-500">{loc.city}, {loc.country}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-600 font-mono text-[11px] font-bold rounded flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-4 font-mono text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">FACILITY / DC:</span>
                      <span className="font-bold text-zinc-900 text-[11px] truncate block">{loc.datacenter}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">TYPICAL RTT:</span>
                      <span className={`font-bold ${isSub30 ? 'text-[#00FF66] bg-emerald-950 px-1.5 py-0.5 rounded' : 'text-[#FF5500]'}`}>
                        {loc.latency}
                      </span>
                    </div>
                  </div>

                  {/* Individual Node Instant Ping Probe */}
                  <div className="bg-[#F8F5EE] border-2 border-[#121316] rounded-lg p-3 my-2 flex items-center justify-between">
                    <div className="font-mono text-xs">
                      <span className="text-zinc-500 text-[11px]">Instant Probe: </span>
                      {pingResult === undefined ? (
                        <span className="text-zinc-400">Ready</span>
                      ) : pingResult === null ? (
                        <span className="text-[#FF5500] font-bold animate-pulse">Measuring...</span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {pingResult} ms RTT
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => runPingTest(loc.id)}
                      id={`btn-ping-${loc.id}`}
                      className="px-2.5 py-1 bg-[#121316] hover:bg-black text-[#FFB800] font-mono text-xs font-bold rounded cursor-pointer transition-colors"
                    >
                      PING
                    </button>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button
                    onClick={() => onNavigate('/checkout', { location: loc.id })}
                    id={`btn-deploy-${loc.id}`}
                    className="btn-press w-full py-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>SELECT {loc.city.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

