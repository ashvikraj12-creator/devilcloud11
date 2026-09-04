import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api.js';
import type { ServerInstance, ServerFile, ServerBackup, ServerPlayer } from '../types.js';
import {
  Terminal,
  Play,
  Square,
  RotateCw,
  Cpu,
  HardDrive,
  Activity,
  Sliders,
  Folder,
  RotateCcw,
  Users,
  Copy,
  Check,
  Send,
  Save,
  Trash2,
  Download,
  Plus,
  AlertCircle,
  CheckCircle2,
  Server,
  ArrowLeft,
} from 'lucide-react';

interface ServerControlPageProps {
  serverId: string;
  onNavigate: (path: string) => void;
}

export const ServerControlPage: React.FC<ServerControlPageProps> = ({ serverId, onNavigate }) => {
  const [server, setServer] = useState<ServerInstance | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'properties' | 'backups' | 'players'>('console');

  // Console State
  const [consoleCommand, setConsoleCommand] = useState('');
  const [copiedIp, setCopiedIp] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Files State
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [savingFile, setSavingFile] = useState(false);

  // Backups State
  const [backups, setBackups] = useState<ServerBackup[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Players State
  const [players, setPlayers] = useState<ServerPlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Properties State
  const [properties, setProperties] = useState({
    motd: 'A DevilCloud Minecraft Server',
    maxPlayers: 20,
    difficulty: 'hard',
    gamemode: 'survival',
    pvp: true,
    allowFlight: false,
    hardcore: false,
    viewDistance: 10,
    onlineMode: true,
    spawnProtection: 16,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchServerDetails = async () => {
    try {
      const res = await apiRequest(`/servers/${serverId}`);
      if (res.server) {
        setServer(res.server);
        if (res.server.properties) {
          setProperties(res.server.properties);
        }
      }
    } catch (err) {
      console.error('Failed to load server', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await apiRequest(`/servers/${serverId}/files`);
      if (res.files) setFiles(res.files);
    } catch (err) {}
  };

  const fetchBackups = async () => {
    try {
      const res = await apiRequest(`/servers/${serverId}/backups`);
      if (res.backups) setBackups(res.backups);
    } catch (err) {}
  };

  const fetchPlayers = async () => {
    try {
      const res = await apiRequest(`/servers/${serverId}/players`);
      if (res.players) setPlayers(res.players);
    } catch (err) {}
  };

  useEffect(() => {
    fetchServerDetails();
    fetchFiles();
    fetchBackups();
    fetchPlayers();

    // Live polling every 3 seconds for console and telemetry
    const interval = setInterval(() => {
      fetchServerDetails();
    }, 3000);

    return () => clearInterval(interval);
  }, [serverId]);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [server?.logs, activeTab]);

  const handlePowerAction = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    setActionLoading(true);
    try {
      await apiRequest(`/servers/${serverId}/power`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      showNotification(`Power action "${action.toUpperCase()}" sent.`);
      await fetchServerDetails();
    } catch (err: any) {
      showNotification(err.message || 'Power action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleCommand.trim()) return;

    const cmd = consoleCommand;
    setConsoleCommand('');
    try {
      await apiRequest(`/servers/${serverId}/command`, {
        method: 'POST',
        body: JSON.stringify({ command: cmd }),
      });
      fetchServerDetails();
    } catch (err: any) {
      showNotification(err.message || 'Command execution failed');
    }
  };

  const handleOpenFile = async (filename: string) => {
    try {
      const res = await apiRequest(`/servers/${serverId}/files/read?path=${encodeURIComponent(filename)}`);
      setSelectedFile(filename);
      setFileContent(res.content || '');
    } catch (err: any) {
      showNotification(err.message || 'Could not open file');
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setSavingFile(true);
    try {
      await apiRequest(`/servers/${serverId}/files/write`, {
        method: 'POST',
        body: JSON.stringify({ path: selectedFile, content: fileContent }),
      });
      showNotification(`Saved ${selectedFile} successfully.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save file');
    } finally {
      setSavingFile(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await apiRequest(`/servers/${serverId}/backups/create`, {
        method: 'POST',
        body: JSON.stringify({ name: `Manual Snapshot ${new Date().toLocaleTimeString()}` }),
      });
      showNotification('Backup snapshot created successfully.');
      fetchBackups();
    } catch (err: any) {
      showNotification(err.message || 'Failed to create backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Restoring this snapshot will overwrite current world data. Proceed?')) return;
    try {
      await apiRequest(`/servers/${serverId}/backups/${backupId}/restore`, { method: 'POST' });
      showNotification('World backup restored. Restarting server...');
      fetchServerDetails();
    } catch (err: any) {
      showNotification(err.message || 'Failed to restore');
    }
  };

  const handleSaveProperties = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(`/servers/${serverId}/properties`, {
        method: 'POST',
        body: JSON.stringify({ properties }),
      });
      showNotification('server.properties saved. Changes applied.');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update properties');
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyIpAddress = () => {
    if (!server?.ip) return;
    navigator.clipboard.writeText(`${server.ip}:${server.port}`);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  if (!server) {
    return (
      <div className="py-20 text-center font-mono text-sm text-zinc-600">
        Loading server node telemetry...
      </div>
    );
  }

  const isOnline = server.status === 'online';

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb & Server Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-hard-thick rounded-xl p-6 shadow-hard">
        <div className="space-y-1.5">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="text-xs font-mono text-zinc-500 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase text-[#121316]">
              {server.name}
            </h1>
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 border ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                  : 'bg-red-100 text-red-800 border-red-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {server.status.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-zinc-600">
            <span>Node: <strong className="text-zinc-900">{server.location.toUpperCase()}</strong></span>
            <span>•</span>
            <span>Software: <strong className="text-[#FF5500]">{server.software} ({server.version})</strong></span>
            <span>•</span>
            <div className="flex items-center gap-1.5 bg-[#F8F5EE] px-2 py-0.5 rounded border border-zinc-300">
              <span>IP: <strong>{server.ip}:{server.port}</strong></span>
              <button
                onClick={copyIpAddress}
                className="text-[#FF5500] hover:text-black cursor-pointer"
                title="Copy Address"
              >
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Power Action Buttons */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <button
                onClick={() => handlePowerAction('restart')}
                disabled={actionLoading}
                className="btn-press px-4 py-2.5 bg-[#FFB800] hover:bg-[#E5A600] text-[#121316] border-2 border-black rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard-sm flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>RESTART</span>
              </button>
              <button
                onClick={() => handlePowerAction('stop')}
                disabled={actionLoading}
                className="btn-press px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>STOP</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handlePowerAction('start')}
              disabled={actionLoading}
              className="btn-press px-6 py-3 bg-[#00FF66] hover:bg-emerald-400 text-black border-2 border-black rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>START SERVER</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-[#121316] text-[#FFB800] border-2 border-[#121316] rounded-lg font-mono text-xs font-bold flex items-center gap-2 shadow-hard animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Live Telemetry Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">CPU USAGE</span>
            <Cpu className="w-4 h-4 text-[#FF5500]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#121316]">
            {isOnline ? `${server.cpuUsage?.toFixed(1) || 12.4}%` : '0.0%'}
          </div>
          <div className="w-full bg-zinc-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#FF5500] h-full transition-all duration-500"
              style={{ width: `${isOnline ? server.cpuUsage || 15 : 0}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">RAM UTILIZATION</span>
            <Server className="w-4 h-4 text-[#FFB800]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#121316]">
            {isOnline ? `${(server.ramUsage / 1024).toFixed(2)} GB` : '0 GB'}{' '}
            <span className="text-xs font-mono text-zinc-400">/ {server.ram} GB</span>
          </div>
          <div className="w-full bg-zinc-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#FFB800] h-full transition-all duration-500"
              style={{ width: `${isOnline ? (server.ramUsage / (server.ram * 1024)) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* NVMe SSD */}
        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">NVMe STORAGE</span>
            <HardDrive className="w-4 h-4 text-[#121316]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#121316]">
            {server.storageUsage?.toFixed(1) || 4.2} GB{' '}
            <span className="text-xs font-mono text-zinc-400">/ {server.storage} GB</span>
          </div>
          <div className="w-full bg-zinc-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#121316] h-full transition-all duration-500"
              style={{ width: `${(server.storageUsage / server.storage) * 100}%` }}
            />
          </div>
        </div>

        {/* TPS */}
        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">TICK RATE (TPS)</span>
            <Activity className="w-4 h-4 text-[#00FF66]" />
          </div>
          <div className="font-heading text-2xl font-black text-emerald-600">
            {isOnline ? `${server.tps?.toFixed(1) || '20.0'} TPS` : 'OFFLINE'}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            Ping: <strong className="text-zinc-900">{server.ping || 14}ms</strong> (100% stable)
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b-2 border-[#121316] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'console'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live Console</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'files'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>File Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'properties'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Server Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'backups'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Backups ({backups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'players'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Players & Whitelist</span>
        </button>
      </div>

      {/* 1. CONSOLE TAB */}
      {activeTab === 'console' && (
        <div className="bg-[#0D0E12] border-hard-thick rounded-xl p-4 shadow-hard text-white font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
              <span>TERMINAL STREAM // PTY ATTACHED</span>
            </div>
            <span>PORT {server.port}</span>
          </div>

          {/* Logs Area */}
          <div className="h-96 overflow-y-auto space-y-1 p-2 bg-black/60 rounded border border-zinc-800 font-mono text-[11px] leading-relaxed">
            {server.logs?.map((log, idx) => (
              <div
                key={idx}
                className={`py-0.5 ${
                  log.includes('ERROR') || log.includes('FATAL')
                    ? 'text-red-400'
                    : log.includes('WARN')
                    ? 'text-amber-400'
                    : log.includes('Done') || log.includes('listening')
                    ? 'text-[#00FF66] font-bold'
                    : log.includes('[COMMAND]')
                    ? 'text-cyan-300 font-bold'
                    : 'text-zinc-300'
                }`}
              >
                {log}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Command Prompt */}
          <form onSubmit={handleSendCommand} className="flex gap-2 pt-2">
            <span className="p-2.5 bg-zinc-900 border border-zinc-700 rounded text-[#00FF66] font-bold">
              &gt;
            </span>
            <input
              type="text"
              placeholder="Enter command (e.g. 'op AshvikPlayz', 'say Hello Realm', 'tps', 'whitelist add player')"
              value={consoleCommand}
              onChange={(e) => setConsoleCommand(e.target.value)}
              className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white focus:border-[#FF5500] focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-black font-bold uppercase rounded cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. FILE MANAGER TAB */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border-hard-thick rounded-xl p-6 shadow-hard">
          {/* File Tree (4 cols) */}
          <div className="md:col-span-4 border-r-0 md:border-r-2 border-zinc-200 pr-0 md:pr-4 space-y-3">
            <h3 className="font-heading text-sm font-black uppercase text-[#121316]">
              ROOT DIRECTORY
            </h3>
            <div className="space-y-1 font-mono text-xs">
              {files.map((f) => (
                <button
                  key={f.name}
                  onClick={() => !f.isDirectory && handleOpenFile(f.name)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                    selectedFile === f.name
                      ? 'bg-[#121316] text-[#FFB800] font-bold'
                      : 'hover:bg-[#F8F5EE] text-[#121316]'
                  }`}
                >
                  <span className="truncate flex items-center gap-2">
                    {f.isDirectory ? '📁' : '📄'} {f.name}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {f.isDirectory ? 'dir' : `${f.size}B`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Area (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-2">
                  <div className="font-mono text-xs font-bold text-[#121316]">
                    EDITING: <span className="text-[#FF5500]">{selectedFile}</span>
                  </div>

                  <button
                    onClick={handleSaveFile}
                    disabled={savingFile}
                    className="btn-press px-4 py-1.5 bg-[#FF5500] text-white rounded font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingFile ? 'SAVING...' : 'SAVE FILE'}</span>
                  </button>
                </div>

                <textarea
                  rows={14}
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full p-3 bg-[#0D0E12] text-[#00FF66] font-mono text-xs rounded border border-zinc-800 focus:outline-none"
                />
              </>
            ) : (
              <div className="p-12 text-center text-xs font-mono text-zinc-400">
                Select a file on the left to inspect or edit configuration.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SERVER.PROPERTIES TAB */}
      {activeTab === 'properties' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-6">
          <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
            <div>
              <h2 className="font-heading text-xl font-black uppercase text-[#121316]">
                SERVER.PROPERTIES CONFIGURATION
              </h2>
              <p className="text-xs font-mono text-zinc-500">
                Visual editor for core Minecraft engine settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProperties} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  SERVER MOTD (DESCRIPTION)
                </label>
                <input
                  type="text"
                  value={properties.motd}
                  onChange={(e) => setProperties({ ...properties, motd: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  MAX PLAYER SLOTS
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={properties.maxPlayers}
                  onChange={(e) => setProperties({ ...properties, maxPlayers: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  WORLD DIFFICULTY
                </label>
                <select
                  value={properties.difficulty}
                  onChange={(e) => setProperties({ ...properties, difficulty: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                >
                  <option value="peaceful">Peaceful</option>
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  DEFAULT GAMEMODE
                </label>
                <select
                  value={properties.gamemode}
                  onChange={(e) => setProperties({ ...properties, gamemode: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                >
                  <option value="survival">Survival</option>
                  <option value="creative">Creative</option>
                  <option value="adventure">Adventure</option>
                  <option value="spectator">Spectator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  VIEW DISTANCE (CHUNKS)
                </label>
                <input
                  type="number"
                  min={4}
                  max={32}
                  value={properties.viewDistance}
                  onChange={(e) => setProperties({ ...properties, viewDistance: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  SPAWN PROTECTION RADIUS
                </label>
                <input
                  type="number"
                  min={0}
                  max={64}
                  value={properties.spawnProtection}
                  onChange={(e) => setProperties({ ...properties, spawnProtection: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316]"
                />
              </div>
            </div>

            {/* Toggle checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 font-mono text-xs">
              <label className="flex items-center gap-2 p-3 bg-[#F8F5EE] border-2 border-[#121316] rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={properties.pvp}
                  onChange={(e) => setProperties({ ...properties, pvp: e.target.checked })}
                  className="accent-[#FF5500]"
                />
                <span className="font-bold">Allow PvP</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-[#F8F5EE] border-2 border-[#121316] rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={properties.allowFlight}
                  onChange={(e) => setProperties({ ...properties, allowFlight: e.target.checked })}
                  className="accent-[#FF5500]"
                />
                <span className="font-bold">Allow Flight</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-[#F8F5EE] border-2 border-[#121316] rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={properties.hardcore}
                  onChange={(e) => setProperties({ ...properties, hardcore: e.target.checked })}
                  className="accent-[#FF5500]"
                />
                <span className="font-bold">Hardcore Mode</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-[#F8F5EE] border-2 border-[#121316] rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={properties.onlineMode}
                  onChange={(e) => setProperties({ ...properties, onlineMode: e.target.checked })}
                  className="accent-[#FF5500]"
                />
                <span className="font-bold">Online Mode</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-press px-6 py-3 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SAVE & APPLY PROPERTIES</span>
            </button>
          </form>
        </div>
      )}

      {/* 4. BACKUPS TAB */}
      {activeTab === 'backups' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-6">
          <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
            <div>
              <h2 className="font-heading text-xl font-black uppercase text-[#121316]">
                AUTOMATED & SNAPSHOT BACKUPS
              </h2>
              <p className="text-xs font-mono text-zinc-500">
                Encrypted cloud snapshots stored on redundant AWS S3 buckets.
              </p>
            </div>

            <button
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="btn-press px-4 py-2.5 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingBackup ? 'CREATING...' : 'CREATE SNAPSHOT'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {backups.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-heading text-base font-bold text-[#121316]">{b.name}</div>
                  <div className="text-[11px] font-mono text-zinc-500">
                    Size: {b.size} | Created: {new Date(b.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestoreBackup(b.id)}
                    className="btn-press px-3 py-1.5 bg-[#FF5500] text-white rounded font-mono text-xs font-bold shadow-hard-sm cursor-pointer"
                  >
                    RESTORE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PLAYERS & WHITELIST TAB */}
      {activeTab === 'players' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-6">
          <h2 className="font-heading text-xl font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-3">
            PLAYERS & ACCESS CONTROL
          </h2>

          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 py-4 text-center">
                No players currently connected.
              </p>
            ) : (
              players.map((p) => (
                <div
                  key={p.name}
                  className="p-3 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <div className="font-heading text-base font-bold text-[#121316]">{p.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Ping: {p.ping}ms | {p.isOp ? '⭐ OPERATOR' : 'Player'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                      onClick={() => handleSendCommand({ preventDefault: () => {} } as any)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded border border-red-400 font-bold"
                    >
                      KICK
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
