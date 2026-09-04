import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo.js';
import {
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Server,
  Sliders,
  Cpu,
  ExternalLink,
  ShieldAlert,
  Headphones,
  Globe,
  LogOut,
  Zap,
  Users,
} from 'lucide-react';
import { apiRequest } from '../api.js';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string, state?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hostingDropdownOpen, setHostingDropdownOpen] = useState(false);
  const [mobileHostingOpen, setMobileHostingOpen] = useState(true);
  const [controlPanelUrl, setControlPanelUrl] = useState('https://panel.devilcloud.fun');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check admin status
    const token = localStorage.getItem('devilcloud_token');
    if (token) {
      apiRequest('/auth/me')
        .then((res) => {
          if (res?.authenticated && res?.role === 'admin') {
            setIsAdminLoggedIn(true);
          } else {
            setIsAdminLoggedIn(false);
          }
        })
        .catch(() => setIsAdminLoggedIn(false));
    } else {
      setIsAdminLoggedIn(false);
    }

    // Fetch dynamic platform settings for control panel URL
    apiRequest('/public/settings')
      .then((res) => {
        if (res?.controlPanelUrl) {
          setControlPanelUrl(res.controlPanelUrl);
        }
      })
      .catch(() => {});

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHostingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentPath]);

  const handleNav = (path: string, state?: any) => {
    onNavigate(path, state);
    setMobileOpen(false);
    setHostingDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('devilcloud_token');
    setIsAdminLoggedIn(false);
    handleNav('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F5EE]/95 backdrop-blur-md border-b-2 border-[#121316]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('/')}
          className="focus:outline-none cursor-pointer flex items-center gap-2 group"
          id="btn-nav-logo"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
          <button
            onClick={() => handleNav('/')}
            id="nav-link-home"
            className={`px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer ${
              currentPath === '/'
                ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                : 'text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500]'
            }`}
          >
            Home
          </button>

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setHostingDropdownOpen(!hostingDropdownOpen)}
              id="nav-link-services"
              className={`px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                hostingDropdownOpen || currentPath === '/pricing' || currentPath === '/custom-plan'
                  ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                  : 'text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500]'
              }`}
            >
              <span>Services</span>
              {hostingDropdownOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#FFB800]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {hostingDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-[#121316] rounded-xl p-2 shadow-hard-lg z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => handleNav('/pricing', { initialProcessor: 'intel' })}
                  id="dropdown-minecraft-plans"
                  className="w-full text-left p-2.5 rounded-lg hover:bg-[#F8F5EE] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-md bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-white transition-colors">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading text-xs font-black uppercase text-[#121316]">
                      Minecraft Plans
                    </div>
                    <div className="text-[11px] text-zinc-500">Intel Xeon & Ryzen 9 tiers</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('/custom-plan')}
                  id="dropdown-mc-custom-plan"
                  className="w-full text-left p-2.5 rounded-lg hover:bg-[#F8F5EE] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-md bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#B38000] group-hover:bg-[#FFB800] group-hover:text-black transition-colors">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading text-xs font-black uppercase text-[#121316]">
                      MC Custom Plan
                    </div>
                    <div className="text-[11px] text-zinc-500">Custom RAM, CPU & Storage</div>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('/pricing', { initialTab: 'vps' })}
                  id="dropdown-vps-plans"
                  className="w-full text-left p-2.5 rounded-lg hover:bg-[#F8F5EE] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#009933] group-hover:bg-[#00FF66] group-hover:text-black transition-colors">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading text-xs font-black uppercase text-[#121316]">
                      VPS Plans
                    </div>
                    <div className="text-[11px] text-zinc-500">Intel Platinum 8269-CY VPS</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav('/features')}
            id="nav-link-features"
            className={`px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentPath === '/features'
                ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                : 'text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Features</span>
          </button>

          <button
            onClick={() => handleNav('/team')}
            id="nav-link-team"
            className={`px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentPath === '/team'
                ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                : 'text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Team</span>
          </button>

          <button
            onClick={() => handleNav('/locations')}
            id="nav-link-locations"
            className={`px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer ${
              currentPath === '/locations'
                ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                : 'text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500]'
            }`}
          >
            Locations
          </button>

          <button
            onClick={() => handleNav('/support')}
            id="nav-link-support"
            className={`px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentPath === '/support'
                ? 'bg-[#121316] text-[#FFB800] shadow-hard-sm'
                : 'text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Support</span>
          </button>

          <a
            href={controlPanelUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="nav-link-control-panel"
            className="px-3.5 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer text-[#121316] hover:bg-[#EAE4D2] hover:text-[#FF5500] flex items-center gap-1"
          >
            <span>Control Panel</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('/admin')}
                id="btn-nav-admin-dashboard"
                className="btn-press flex items-center gap-1.5 px-4 py-2 bg-[#121316] text-[#FFB800] border-2 border-[#121316] rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>ADMIN PANEL</span>
              </button>
              <button
                onClick={handleLogout}
                title="Logout Admin"
                id="btn-nav-admin-logout"
                className="p-2 bg-zinc-200 hover:bg-red-100 hover:text-red-600 rounded-md border-2 border-[#121316] text-zinc-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/pricing')}
              id="btn-nav-get-started"
              className="btn-press flex items-center gap-1.5 px-5 py-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard hover:translate-y-[-2px] hover:shadow-hard-lg transition-all cursor-pointer"
            >
              <span>GET STARTED</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle (3-lines) */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            id="btn-nav-mobile-toggle"
            aria-label="Toggle navigation menu"
            className="p-2.5 bg-[#F0ECE1] border-2 border-[#121316] rounded-md shadow-hard-sm text-[#121316] focus:outline-none cursor-pointer"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (3-lines menu) */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden border-t-2 border-[#121316] bg-[#F8F5EE] px-4 pt-4 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto"
        >
          {/* Home */}
          <button
            onClick={() => handleNav('/')}
            id="mobile-link-home"
            className={`w-full text-left px-4 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 ${
              currentPath === '/'
                ? 'bg-[#121316] text-[#FFB800] border-[#121316]'
                : 'bg-white border-[#121316] text-[#121316]'
            }`}
          >
            Home
          </button>

          {/* Services dropdown with ^ option */}
          <div className="border-2 border-[#121316] rounded-lg bg-white overflow-hidden shadow-hard-sm">
            <button
              onClick={() => setMobileHostingOpen(!mobileHostingOpen)}
              id="mobile-toggle-services"
              className="w-full flex items-center justify-between px-4 py-3 bg-[#121316] text-[#FFB800] font-mono text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#FF5500]" />
                <span>Services</span>
              </div>
              {mobileHostingOpen ? (
                <ChevronUp className="w-4 h-4 text-[#FFB800]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#FFB800]" />
              )}
            </button>

            {mobileHostingOpen && (
              <div className="p-2 space-y-1.5 bg-[#FAF8F5]">
                <button
                  onClick={() => handleNav('/custom-plan')}
                  id="mobile-link-mc-custom-plan"
                  className="w-full text-left px-3 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider text-[#121316] hover:bg-[#EAE4D2] flex items-center gap-2.5 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#FF5500]" />
                  <span>MC Custom Plan</span>
                </button>

                <button
                  onClick={() => handleNav('/pricing', { initialProcessor: 'intel' })}
                  id="mobile-link-minecraft-plans"
                  className="w-full text-left px-3 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider text-[#121316] hover:bg-[#EAE4D2] flex items-center gap-2.5 cursor-pointer"
                >
                  <Server className="w-4 h-4 text-[#FF5500]" />
                  <span>Minecraft Plans</span>
                </button>

                <button
                  onClick={() => handleNav('/pricing', { initialTab: 'vps' })}
                  id="mobile-link-vps-plans"
                  className="w-full text-left px-3 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider text-[#121316] hover:bg-[#EAE4D2] flex items-center gap-2.5 cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-[#00FF66]" />
                  <span>VPS Plans</span>
                </button>
              </div>
            )}
          </div>

          {/* Features Button in 3-lines */}
          <button
            onClick={() => handleNav('/features')}
            id="mobile-link-features"
            className={`w-full text-left px-4 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 flex items-center gap-2 ${
              currentPath === '/features'
                ? 'bg-[#121316] text-[#FFB800] border-[#121316]'
                : 'bg-white border-[#121316] text-[#121316]'
            }`}
          >
            <Zap className="w-4 h-4 text-[#00FF66]" />
            <span>Features</span>
          </button>

          {/* Team Option in 3-lines */}
          <button
            onClick={() => handleNav('/team')}
            id="mobile-link-team"
            className={`w-full text-left px-4 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 flex items-center gap-2 ${
              currentPath === '/team'
                ? 'bg-[#121316] text-[#FFB800] border-[#121316]'
                : 'bg-white border-[#121316] text-[#121316]'
            }`}
          >
            <Users className="w-4 h-4 text-[#FF5500]" />
            <span>Team</span>
          </button>

          {/* Locations */}
          <button
            onClick={() => handleNav('/locations')}
            id="mobile-link-locations"
            className={`w-full text-left px-4 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 flex items-center gap-2 ${
              currentPath === '/locations'
                ? 'bg-[#121316] text-[#FFB800] border-[#121316]'
                : 'bg-white border-[#121316] text-[#121316]'
            }`}
          >
            <Globe className="w-4 h-4 text-[#FF5500]" />
            <span>Server Locations & Latency</span>
          </button>

          {/* Support Page */}
          <button
            onClick={() => handleNav('/support')}
            id="mobile-link-support"
            className={`w-full text-left px-4 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 flex items-center gap-2 ${
              currentPath === '/support'
                ? 'bg-[#121316] text-[#FFB800] border-[#121316]'
                : 'bg-white border-[#121316] text-[#121316]'
            }`}
          >
            <Headphones className="w-4 h-4 text-[#FF5500]" />
            <span>Support & Ticket Desk</span>
          </button>

          {/* Control Panel Link */}
          <a
            href={controlPanelUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="mobile-link-control-panel"
            className="w-full text-left px-4 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 bg-white border-[#121316] text-[#121316] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#121316]" />
              <span>Control Panel</span>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>

          {/* Divider */}
          <div className="pt-2 border-t-2 border-[#121316]/20"></div>

          {/* Admin Access Button at the bottom of 3-lines menu */}
          {isAdminLoggedIn ? (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleNav('/admin')}
                id="mobile-btn-admin-panel"
                className="w-full text-center px-4 py-3.5 bg-[#121316] text-[#00FF66] border-2 border-[#121316] rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-hard flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#00FF66]" />
                <span>OPEN ADMIN PANEL</span>
              </button>
              <button
                onClick={handleLogout}
                id="mobile-btn-admin-logout"
                className="w-full text-center px-4 py-2 bg-red-100 text-red-700 border-2 border-red-300 rounded-lg font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Logout Admin
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/admin-login')}
              id="mobile-btn-admin-access"
              className="w-full text-center px-4 py-3.5 bg-zinc-900 hover:bg-black text-[#FFB800] border-2 border-[#121316] rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-hard flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-[#FF5500]" />
              <span>ADMIN ACCESS</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

