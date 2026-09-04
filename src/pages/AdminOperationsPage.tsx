import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import type { Order, ServerInstance, SupportTicket, Plan, Coupon } from '../types.js';
import {
  ShieldAlert,
  Server,
  DollarSign,
  Layers,
  HelpCircle,
  Tag,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Zap,
  Play,
  Save,
  Plus,
  Trash2,
  Send,
  ArrowRight,
  TrendingUp,
  Cpu,
  KeyRound,
  Edit2,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ExternalLink,
  Globe,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

interface AdminOperationsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminOperationsPage: React.FC<AdminOperationsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'servers' | 'pricing' | 'coupons' | 'tickets' | 'settings'>('orders');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServers: 0,
    onlineServers: 0,
    totalOrders: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    openTickets: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Global Settings state
  const [settingsData, setSettingsData] = useState({
    brandName: 'DEVILCLOUD',
    tagline: 'High-Performance Game Server Infrastructure',
    discordUrl: 'https://discord.gg/EUnQbdx9E8',
    controlPanelUrl: 'https://panel.devilcloud.fun',
    upiId: 'ashvikraj@fam',
    upiPayeeName: 'Ashvik Raj (DevilCloud Hosting)',
    contactEmail: 'support@devilcloud.fun',
    deliveryNotice: 'Server delivery can take between 1 minute and 1 hour after payment verification.',
  });

  // New Coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(20);
  const [newCouponType, setNewCouponType] = useState<'percent' | 'flat'>('percent');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Plans Management state
  const [planCategoryFilter, setPlanCategoryFilter] = useState<'all' | 'intel_mc' | 'ryzen_mc' | 'intel_vps' | 'ryzen_vps'>('all');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<{
    id: string;
    name: string;
    tagline: string;
    category: 'minecraft' | 'vps';
    processor: 'intel' | 'ryzen';
    priceMonth: number;
    price3Months: string;
    priceAnnually: string;
    ram: number;
    cpu: string;
    storage: number;
    backups: number;
    featuresText: string;
    isPopular: boolean;
    isActive: boolean;
  }>({
    id: '',
    name: '',
    tagline: '',
    category: 'vps',
    processor: 'ryzen',
    priceMonth: 280,
    price3Months: '',
    priceAnnually: '',
    ram: 4,
    cpu: '1 vCore (5.7GHz)',
    storage: 40,
    backups: 1,
    featuresText: '4GB DDR5 5600MHz RAM\n1 vCore AMD Ryzen 9 9950X (5.7GHz)\n40GB Gen4 NVMe SSD\nDedicated IPv4 + IPv6\nFull Root / SSH Access\n1 Gbps Unmetered Port',
    isPopular: false,
    isActive: true,
  });

  // Ticket reply state
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyImageUrl, setAdminReplyImageUrl] = useState('');

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [statsRes, ordersRes, serversRes, ticketsRes, couponsRes, plansRes, settingsRes] = await Promise.all([
        apiRequest('/admin/stats').catch(() => null),
        apiRequest('/admin/orders').catch(() => ({ orders: [] })),
        apiRequest('/admin/servers').catch(() => ({ servers: [] })),
        apiRequest('/admin/tickets').catch(() => ({ tickets: [] })),
        apiRequest('/admin/coupons').catch(() => ({ coupons: [] })),
        apiRequest('/admin/plans').catch(() => ({ plans: [] })),
        apiRequest('/admin/settings').catch(() => null),
      ]);

      if (statsRes) setStats(statsRes);
      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (serversRes.servers) setServers(serversRes.servers);
      if (ticketsRes.tickets) setTickets(ticketsRes.tickets);
      if (couponsRes.coupons) setCoupons(couponsRes.coupons);
      if (plansRes.plans) setPlans(plansRes.plans);
      if (settingsRes?.settings) {
        setSettingsData((prev) => ({
          ...prev,
          ...settingsRes.settings,
          discordUrl: settingsRes.settings.discordUrl || prev.discordUrl,
          controlPanelUrl: settingsRes.settings.controlPanelUrl || prev.controlPanelUrl,
        }));
      }
    } catch (err) {
      console.error('Admin data fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiRequest(`/admin/orders/${orderId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      showActionMsg(`Order ${orderId} updated to ${status.toUpperCase()}`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Status update failed');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await apiRequest(`/admin/orders/${orderId}/complete`, { method: 'POST' });
      showActionMsg(`Order ${orderId} marked COMPLETE & active!`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Complete order failed');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Permanently delete order ${orderId}? This cannot be undone.`)) return;
    try {
      await apiRequest(`/admin/orders/${orderId}`, { method: 'DELETE' });
      showActionMsg(`Order ${orderId} deleted successfully.`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Delete failed');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    try {
      await apiRequest('/admin/coupons/create', {
        method: 'POST',
        body: JSON.stringify({
          code: newCouponCode.toUpperCase(),
          discountType: newCouponType,
          discountValue: Number(newCouponDiscount),
          description: newCouponDesc || `${newCouponDiscount}% Discount Voucher`,
        }),
      });
      showActionMsg(`Coupon ${newCouponCode.toUpperCase()} created successfully.`);
      setNewCouponCode('');
      setNewCouponDesc('');
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Coupon creation failed');
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!adminReplyText.trim() && !adminReplyImageUrl.trim()) return;

    try {
      await apiRequest(`/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          message: adminReplyText.trim(),
          imageUrl: adminReplyImageUrl.trim() || undefined,
          status: 'resolved',
        }),
      });
      showActionMsg(`Staff reply posted to ticket #${ticketId}`);
      setAdminReplyText('');
      setAdminReplyImageUrl('');
      setReplyingTicketId(null);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Reply failed');
    }
  };

  const handleRenameTicket = async (ticketId: string, currentSubject: string) => {
    const newSubject = window.prompt('Enter updated ticket subject:', currentSubject);
    if (!newSubject || !newSubject.trim() || newSubject.trim() === currentSubject) return;

    try {
      await apiRequest(`/admin/tickets/${ticketId}/rename`, {
        method: 'POST',
        body: JSON.stringify({ subject: newSubject.trim() }),
      });
      showActionMsg(`Ticket #${ticketId} renamed.`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Rename failed');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm(`Delete support ticket #${ticketId}?`)) return;
    try {
      await apiRequest(`/admin/tickets/${ticketId}`, { method: 'DELETE' });
      showActionMsg(`Ticket #${ticketId} removed.`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Delete ticket failed');
    }
  };

  const handleOpenAddPlan = (preset?: { category: 'minecraft' | 'vps'; processor: 'intel' | 'ryzen' }) => {
    setEditingPlanId(null);
    const cat = preset?.category || (planCategoryFilter.includes('vps') ? 'vps' : 'minecraft');
    const proc = preset?.processor || (planCategoryFilter.includes('ryzen') ? 'ryzen' : 'intel');

    if (cat === 'vps') {
      setPlanForm({
        id: `vps_${proc}_${Date.now().toString().slice(-4)}`,
        name: proc === 'ryzen' ? 'Ryzen VPS Ultra' : 'Intel VPS Standard',
        tagline: proc === 'ryzen' ? 'AMD Ryzen 9 9950X High-Freq VPS • Monthly' : 'Intel Platinum 8269-CY VPS • Monthly',
        category: 'vps',
        processor: proc,
        priceMonth: proc === 'ryzen' ? 350 : 250,
        price3Months: '',
        priceAnnually: '',
        ram: proc === 'ryzen' ? 4 : 4,
        cpu: proc === 'ryzen' ? '1 vCore (5.7GHz)' : '1 vCore',
        storage: proc === 'ryzen' ? 40 : 40,
        backups: 1,
        featuresText: proc === 'ryzen'
          ? '4GB DDR5 5600MHz RAM\n1 vCore AMD Ryzen 9 9950X (5.7GHz)\n40GB Gen4 NVMe SSD\nDedicated IPv4 + IPv6\nFull Root / SSH Access\n1 Gbps Unmetered Port'
          : '4GB DDR4 RAM\n1 vCore Intel Platinum 8269-CY\n40GB NVMe SSD\nDedicated IPv4 Address\nFull Root / SSH Access\n1 Gbps Unmetered Port',
        isPopular: false,
        isActive: true,
      });
    } else {
      setPlanForm({
        id: `${proc}_${Date.now().toString().slice(-4)}`,
        name: proc === 'ryzen' ? 'Ryzen Nitro' : 'Intel Starter',
        tagline: proc === 'ryzen' ? 'High tick-rate survival & modpack hosting' : 'Affordable vanilla & paper hosting',
        category: 'minecraft',
        processor: proc,
        priceMonth: proc === 'ryzen' ? 160 : 80,
        price3Months: proc === 'ryzen' ? '432' : '216',
        priceAnnually: proc === 'ryzen' ? '1536' : '768',
        ram: proc === 'ryzen' ? 6 : 4,
        cpu: proc === 'ryzen' ? '150%' : '100%',
        storage: proc === 'ryzen' ? 15 : 10,
        backups: 2,
        featuresText: proc === 'ryzen'
          ? '6 GB DDR5 RAM\n150% AMD Ryzen 9 9950X\n15 GB NVMe SSD\n2 Auto Backup Slots\nUltra-Low Latency Node\nJava & Bedrock Support'
          : '4 GB DDR4 RAM\n100% Intel Xeon Platinum\n10 GB NVMe SSD\n2 Auto Backup Slots\nSub-30ms India Latency\nStandard Support',
        isPopular: false,
        isActive: true,
      });
    }
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (p: Plan) => {
    setEditingPlanId(p.id);
    setPlanForm({
      id: p.id,
      name: p.name,
      tagline: p.tagline || '',
      category: p.category || 'minecraft',
      processor: p.processor || 'intel',
      priceMonth: p.priceMonth,
      price3Months: p.price3Months !== undefined ? String(p.price3Months) : '',
      priceAnnually: p.priceAnnually !== undefined ? String(p.priceAnnually) : '',
      ram: p.ram,
      cpu: String(p.cpu || '100%'),
      storage: p.storage,
      backups: p.backups || 1,
      featuresText: (p.features || []).join('\n'),
      isPopular: !!p.isPopular,
      isActive: p.isActive !== false,
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim() || !planForm.priceMonth) {
      showActionMsg('Plan name and monthly price are required.');
      return;
    }

    const features = planForm.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: Plan = {
      id: planForm.id.trim() || `plan_${Date.now()}`,
      name: planForm.name.trim(),
      tagline: planForm.tagline.trim(),
      category: planForm.category,
      processor: planForm.processor,
      priceMonth: Number(planForm.priceMonth),
      price3Months: planForm.price3Months ? Number(planForm.price3Months) : undefined,
      priceAnnually: planForm.priceAnnually ? Number(planForm.priceAnnually) : undefined,
      ram: Number(planForm.ram) || 2,
      cpu: planForm.cpu.trim() || '100%',
      storage: Number(planForm.storage) || 10,
      backups: Number(planForm.backups) || 1,
      features: features.length > 0 ? features : ['DDoS Mitigation', 'High Performance Node'],
      isPopular: planForm.isPopular,
      isActive: planForm.isActive,
      sortOrder: editingPlanId ? (plans.find((p) => p.id === editingPlanId)?.sortOrder || 1) : plans.length + 1,
    };

    try {
      const res = await apiRequest('/admin/plans', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.plans) {
        setPlans(res.plans);
      }
      showActionMsg(editingPlanId ? `Plan "${payload.name}" updated successfully!` : `New plan "${payload.name}" created!`);
      setIsPlanModalOpen(false);
      setEditingPlanId(null);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Failed to save plan');
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!window.confirm(`Are you sure you want to permanently delete plan "${plan.name}" (${plan.processor === 'ryzen' ? 'Ryzen 9' : 'Intel'} ${plan.category?.toUpperCase() || 'MC'})?`)) {
      return;
    }
    try {
      const res = await apiRequest(`/admin/plans/${plan.id}`, { method: 'DELETE' });
      if (res?.plans) {
        setPlans(res.plans);
      }
      showActionMsg(`Plan "${plan.name}" deleted.`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Failed to delete plan');
    }
  };

  const handleTogglePlanActive = async (plan: Plan) => {
    try {
      const updated: Plan = { ...plan, isActive: !plan.isActive };
      const res = await apiRequest('/admin/plans', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res?.plans) {
        setPlans(res.plans);
      }
      showActionMsg(`Plan "${plan.name}" is now ${updated.isActive ? 'Active (Live)' : 'Hidden (Inactive)'}.`);
      loadAdminData();
    } catch (err: any) {
      showActionMsg(err.message || 'Toggle failed');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settingsData),
      });
      showActionMsg('Global configuration updated successfully.');
    } catch (err: any) {
      showActionMsg(err.message || 'Settings save failed');
    }
  };

  const showActionMsg = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Operations Header */}
      <div className="bg-[#0E0F12] border-hard-thick rounded-xl p-6 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-red-400 tracking-widest">
              NOC OPERATIONS // ROOT SESSION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white">
            DEVILCLOUD MASTER CONTROL CENTER
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            ADMINISTRATOR: <strong className="text-white">ashvikraj12@gmail.com</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-600 cursor-pointer"
          >
            Storefront View
          </button>
          <button
            onClick={loadAdminData}
            className="px-4 py-2 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-hard-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-[#121316] text-[#00FF66] border-2 border-[#121316] rounded-lg font-mono text-xs font-bold flex items-center gap-2 shadow-hard animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">TOTAL REVENUE (INR)</div>
          <div className="font-heading text-2xl font-black text-[#FF5500]">
            ₹{stats.totalRevenue?.toLocaleString('en-IN') || '1,780'}
          </div>
        </div>

        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">PENDING UTR REFS</div>
          <div className="font-heading text-2xl font-black text-amber-600">
            {stats.pendingPayments || orders.filter((o) => o.status === 'payment_verification').length}
          </div>
        </div>

        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">ONLINE SERVERS</div>
          <div className="font-heading text-2xl font-black text-emerald-600">
            {stats.onlineServers} <span className="text-xs font-mono text-zinc-400">/ {stats.totalServers}</span>
          </div>
        </div>

        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">TOTAL ORDERS</div>
          <div className="font-heading text-2xl font-black text-[#121316]">
            {orders.length} Orders
          </div>
        </div>

        <div className="bg-white border-hard rounded-lg p-4 shadow-hard">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">OPEN TICKETS</div>
          <div className="font-heading text-2xl font-black text-red-600">
            {tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b-2 border-[#121316] gap-1 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Orders & UTR Queue ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('servers')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'servers'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Live Nodes ({servers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Plans Management ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Discount Vouchers ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support Desk ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 rounded-t-lg transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#121316] text-[#FFB800] border-[#121316] shadow-hard-sm'
              : 'bg-white text-zinc-700 border-transparent hover:bg-zinc-100'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Global Settings</span>
        </button>
      </div>

      {/* 1. ORDERS & UTR VERIFICATION QUEUE */}
      {activeTab === 'orders' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
          <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
            <div>
              <h2 className="font-heading text-xl font-black uppercase text-[#121316]">
                PAYMENT APPROVAL & PROVISIONING PIPELINE
              </h2>
              <p className="text-xs font-mono text-zinc-500">
                Verify customer 12-digit UTR numbers against UPI bank records and manage orders.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121316] text-[#FFB800] uppercase text-[11px]">
                <tr>
                  <th className="p-3">ORDER ID</th>
                  <th className="p-3">CLIENT</th>
                  <th className="p-3">SERVER / PLAN</th>
                  <th className="p-3">AMOUNT</th>
                  <th className="p-3">UTR REF</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-zinc-500">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50">
                      <td className="p-3 font-bold text-[#121316]">{ord.id}</td>
                      <td className="p-3">{ord.userId}</td>
                      <td className="p-3">
                        <div className="font-bold">{ord.serverName}</div>
                        <div className="text-[10px] text-zinc-500">{ord.planName}</div>
                      </td>
                      <td className="p-3 font-bold text-[#FF5500]">₹{ord.finalAmount}</td>
                      <td className="p-3">
                        {ord.utrNumber ? (
                          <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            {ord.utrNumber}
                          </span>
                        ) : (
                          <span className="text-zinc-400">Awaiting UTR</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'provisioning'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : ord.status === 'paid'
                              ? 'bg-purple-100 text-purple-800'
                              : ord.status === 'payment_verification'
                              ? 'bg-amber-100 text-amber-800 font-bold'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {ord.status === 'payment_verification' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'paid')}
                            className="px-2.5 py-1 bg-[#00FF66] hover:bg-emerald-400 text-black font-bold rounded cursor-pointer shadow-hard-sm"
                            title="Verify UTR and Mark Paid"
                          >
                            Verify UTR
                          </button>
                        )}

                        {ord.status === 'paid' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'provisioning')}
                            className="px-2.5 py-1 bg-[#FFB800] hover:bg-amber-400 text-black font-bold rounded cursor-pointer shadow-hard-sm"
                            title="Allocate Server Node"
                          >
                            Provision
                          </button>
                        )}

                        {ord.status !== 'ready' && (
                          <button
                            onClick={() => handleCompleteOrder(ord.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer shadow-hard-sm"
                            title="Mark Completed / Ready"
                          >
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SERVERS LIST */}
      {activeTab === 'servers' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
          <h2 className="font-heading text-xl font-black uppercase text-[#121316]">
            DEPLOYED GAME NODES & INSTANCES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.length === 0 ? (
              <div className="col-span-3 p-6 text-center text-zinc-500 font-mono text-xs">
                No active containers deployed yet.
              </div>
            ) : (
              servers.map((srv) => (
                <div key={srv.id} className="p-4 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-[#121316]">{srv.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        srv.status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {srv.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-zinc-600 space-y-1">
                    <div>Address: <strong className="text-zinc-900">{srv.ipAddress}:{srv.port}</strong></div>
                    <div>Specs: {srv.ram}GB RAM | {srv.cpu} | {srv.storage}GB SSD</div>
                    <div>Location: {srv.location}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. HARDWARE & PLANS MANAGEMENT */}
      {activeTab === 'pricing' && (() => {
        const intelMcCount = plans.filter((p) => (p.category === 'minecraft' || !p.category) && (p.processor === 'intel' || !p.processor)).length;
        const ryzenMcCount = plans.filter((p) => (p.category === 'minecraft' || !p.category) && p.processor === 'ryzen').length;
        const intelVpsCount = plans.filter((p) => p.category === 'vps' && (p.processor === 'intel' || !p.processor)).length;
        const ryzenVpsCount = plans.filter((p) => p.category === 'vps' && p.processor === 'ryzen').length;

        const filteredPlans = plans.filter((p) => {
          const cat = p.category || 'minecraft';
          const proc = p.processor || 'intel';
          if (planCategoryFilter === 'intel_mc') return cat === 'minecraft' && proc === 'intel';
          if (planCategoryFilter === 'ryzen_mc') return cat === 'minecraft' && proc === 'ryzen';
          if (planCategoryFilter === 'intel_vps') return cat === 'vps' && proc === 'intel';
          if (planCategoryFilter === 'ryzen_vps') return cat === 'vps' && proc === 'ryzen';
          return true;
        });

        return (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#121316] text-[#FFB800] rounded font-mono text-[11px] font-black uppercase">
                      CATALOG ARCHITECTURE
                    </span>
                    <span className="font-mono text-xs text-zinc-500 font-bold">
                      {plans.length} Total Packages Configured
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl font-black uppercase text-[#121316] mt-1">
                    PLANS & PRICING MANAGEMENT
                  </h2>
                  <p className="text-xs text-zinc-600 font-sans mt-0.5 max-w-2xl">
                    Configure Intel Xeon and AMD Ryzen 9 9950X game servers, cloud VPS packages, pricing models, memory allocations, CPU cores, and live user visibility.
                  </p>
                </div>

                {/* Primary Add Plan Button & Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenAddPlan()}
                    id="btn-admin-add-plan"
                    className="btn-press px-4 py-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-lg font-mono text-xs font-black uppercase shadow-hard flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ ADD NEW PLAN</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddPlan({ category: 'vps', processor: 'ryzen' })}
                    id="btn-admin-add-ryzen-vps"
                    className="btn-press px-3.5 py-2.5 bg-[#121316] hover:bg-black text-[#FFB800] border-2 border-[#121316] rounded-lg font-mono text-xs font-bold uppercase shadow-hard-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>+ Ryzen 9 VPS</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddPlan({ category: 'vps', processor: 'intel' })}
                    id="btn-admin-add-intel-vps"
                    className="btn-press px-3.5 py-2.5 bg-[#121316] hover:bg-black text-[#00FF66] border-2 border-[#121316] rounded-lg font-mono text-xs font-bold uppercase shadow-hard-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Server className="w-3.5 h-3.5 text-[#00FF66]" />
                    <span>+ Intel VPS</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddPlan({ category: 'minecraft', processor: 'ryzen' })}
                    id="btn-admin-add-ryzen-mc"
                    className="btn-press px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-2 border-[#121316] rounded-lg font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    <span>+ Ryzen MC</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddPlan({ category: 'minecraft', processor: 'intel' })}
                    id="btn-admin-add-intel-mc"
                    className="btn-press px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-2 border-[#121316] rounded-lg font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    <span>+ Intel MC</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setPlanCategoryFilter('all')}
                  id="tab-cat-all"
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    planCategoryFilter === 'all'
                      ? 'bg-[#121316] text-[#FFB800] border-2 border-[#121316] shadow-hard-sm'
                      : 'bg-[#F8F5EE] text-zinc-700 border border-zinc-300 hover:border-black'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>ALL PLANS ({plans.length})</span>
                </button>

                <button
                  onClick={() => setPlanCategoryFilter('intel_mc')}
                  id="tab-cat-intel-mc"
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    planCategoryFilter === 'intel_mc'
                      ? 'bg-[#121316] text-[#FFB800] border-2 border-[#121316] shadow-hard-sm'
                      : 'bg-[#F8F5EE] text-zinc-700 border border-zinc-300 hover:border-black'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-500" />
                  <span>INTEL MINECRAFT ({intelMcCount})</span>
                </button>

                <button
                  onClick={() => setPlanCategoryFilter('ryzen_mc')}
                  id="tab-cat-ryzen-mc"
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    planCategoryFilter === 'ryzen_mc'
                      ? 'bg-[#121316] text-[#FFB800] border-2 border-[#121316] shadow-hard-sm'
                      : 'bg-[#F8F5EE] text-zinc-700 border border-zinc-300 hover:border-black'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>RYZEN 9 MINECRAFT ({ryzenMcCount})</span>
                </button>

                <button
                  onClick={() => setPlanCategoryFilter('intel_vps')}
                  id="tab-cat-intel-vps"
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    planCategoryFilter === 'intel_vps'
                      ? 'bg-[#121316] text-[#00FF66] border-2 border-[#121316] shadow-hard-sm'
                      : 'bg-[#F8F5EE] text-zinc-700 border border-zinc-300 hover:border-black'
                  }`}
                >
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>INTEL VPS ({intelVpsCount})</span>
                </button>

                <button
                  onClick={() => setPlanCategoryFilter('ryzen_vps')}
                  id="tab-cat-ryzen-vps"
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    planCategoryFilter === 'ryzen_vps'
                      ? 'bg-[#121316] text-[#FFB800] border-2 border-[#121316] shadow-hard-sm'
                      : 'bg-[#F8F5EE] text-zinc-700 border border-zinc-300 hover:border-black'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>RYZEN 9 VPS ({ryzenVpsCount})</span>
                </button>
              </div>

              {/* 4 Category Architecture Overview Pills */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div
                  onClick={() => setPlanCategoryFilter('intel_mc')}
                  className="p-3 bg-[#F8F5EE] border border-zinc-300 rounded-lg cursor-pointer hover:border-black transition-all"
                >
                  <div className="text-[10px] font-mono text-blue-700 font-bold uppercase flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>INTEL MINECRAFT</span>
                  </div>
                  <div className="font-heading text-lg font-black text-[#121316] mt-0.5">
                    {intelMcCount} Plans
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">From ₹25/month</div>
                </div>

                <div
                  onClick={() => setPlanCategoryFilter('ryzen_mc')}
                  className="p-3 bg-[#F8F5EE] border border-zinc-300 rounded-lg cursor-pointer hover:border-black transition-all"
                >
                  <div className="text-[10px] font-mono text-[#FF5500] font-bold uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>RYZEN 9 MINECRAFT</span>
                  </div>
                  <div className="font-heading text-lg font-black text-[#121316] mt-0.5">
                    {ryzenMcCount} Plans
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">From ₹60/month (5.7GHz)</div>
                </div>

                <div
                  onClick={() => setPlanCategoryFilter('intel_vps')}
                  className="p-3 bg-[#F8F5EE] border border-zinc-300 rounded-lg cursor-pointer hover:border-black transition-all"
                >
                  <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    <span>INTEL XEON VPS</span>
                  </div>
                  <div className="font-heading text-lg font-black text-[#121316] mt-0.5">
                    {intelVpsCount} Plans
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">Root Access • Dedicated IP</div>
                </div>

                <div
                  onClick={() => setPlanCategoryFilter('ryzen_vps')}
                  className="p-3 bg-[#F8F5EE] border border-zinc-300 rounded-lg cursor-pointer hover:border-black transition-all"
                >
                  <div className="text-[10px] font-mono text-amber-700 font-bold uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>RYZEN 9 VPS</span>
                  </div>
                  <div className="font-heading text-lg font-black text-[#121316] mt-0.5">
                    {ryzenVpsCount} Plans
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500">DDR5 • Gen4 NVMe</div>
                </div>
              </div>
            </div>

            {/* Plans List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.length === 0 ? (
                <div className="col-span-full p-12 bg-white border-2 border-dashed border-zinc-300 rounded-xl text-center space-y-3">
                  <Cpu className="w-10 h-10 text-zinc-400 mx-auto" />
                  <h3 className="font-heading text-lg font-black uppercase text-[#121316]">
                    NO PLANS FOUND IN THIS CATEGORY
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Click the buttons above to create and configure new plans in this tier.
                  </p>
                  <button
                    onClick={() => handleOpenAddPlan()}
                    className="px-4 py-2 bg-[#FF5500] text-white font-mono text-xs font-bold rounded shadow-hard-sm cursor-pointer"
                  >
                    + CREATE FIRST PLAN
                  </button>
                </div>
              ) : (
                filteredPlans.map((p) => {
                  const isVPS = p.category === 'vps';
                  const isRyzen = p.processor === 'ryzen';

                  return (
                    <div
                      key={p.id}
                      className={`bg-white border-2 border-[#121316] rounded-xl p-5 shadow-hard flex flex-col justify-between transition-all ${
                        p.isPopular ? 'ring-2 ring-[#FF5500]' : ''
                      } ${!p.isActive ? 'opacity-70 bg-zinc-50' : ''}`}
                    >
                      <div>
                        {/* Header & Badges */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-zinc-100">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase border ${
                                  isRyzen
                                    ? 'bg-orange-100 border-[#FF5500] text-[#FF5500]'
                                    : 'bg-blue-100 border-blue-400 text-blue-800'
                                }`}
                              >
                                {isRyzen ? 'AMD Ryzen 9' : 'Intel Xeon'}
                              </span>

                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase border ${
                                  isVPS
                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                                    : 'bg-purple-100 border-purple-400 text-purple-800'
                                }`}
                              >
                                {isVPS ? 'Cloud VPS' : 'Minecraft SMP'}
                              </span>

                              {p.isPopular && (
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFB800] text-black font-black uppercase rounded flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Popular</span>
                                </span>
                              )}
                            </div>

                            <h3 className="font-heading text-xl font-black text-[#121316] uppercase">
                              {p.name}
                            </h3>
                            <p className="text-xs text-zinc-500 font-sans mt-0.5 line-clamp-1">{p.tagline}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                p.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-zinc-200 text-zinc-600 border border-zinc-400'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              <span>{p.isActive ? 'Active' : 'Hidden'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="py-3">
                          <div className="flex items-baseline gap-1">
                            <span className="font-heading text-3xl font-black text-[#FF5500]">
                              ₹{p.priceMonth}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">/month</span>
                          </div>
                          {!isVPS && (p.price3Months || p.priceAnnually) && (
                            <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                              {p.price3Months ? `3-Mo: ₹${p.price3Months}` : ''}
                              {p.price3Months && p.priceAnnually ? ' • ' : ''}
                              {p.priceAnnually ? `1-Yr: ₹${p.priceAnnually}` : ''}
                            </div>
                          )}
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 py-3 border-y border-zinc-200 font-mono text-xs">
                          <div className="p-2 bg-[#F8F5EE] rounded border border-zinc-200">
                            <span className="text-zinc-500 text-[10px] uppercase block">Memory</span>
                            <span className="font-bold text-[#121316]">
                              {p.ram} GB {isRyzen ? 'DDR5' : 'DDR4'}
                            </span>
                          </div>

                          <div className="p-2 bg-[#F8F5EE] rounded border border-zinc-200">
                            <span className="text-zinc-500 text-[10px] uppercase block">CPU / Cores</span>
                            <span className="font-bold text-[#121316] truncate block">{p.cpu}</span>
                          </div>

                          <div className="p-2 bg-[#F8F5EE] rounded border border-zinc-200">
                            <span className="text-zinc-500 text-[10px] uppercase block">NVMe Storage</span>
                            <span className="font-bold text-[#121316]">{p.storage} GB NVMe</span>
                          </div>

                          <div className="p-2 bg-[#F8F5EE] rounded border border-zinc-200">
                            <span className="text-zinc-500 text-[10px] uppercase block">Backups</span>
                            <span className="font-bold text-[#121316]">{p.backups || 1} Auto Slots</span>
                          </div>
                        </div>

                        {/* Features Preview */}
                        <div className="py-3 space-y-1 text-xs text-zinc-700">
                          {p.features?.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 truncate">
                              <Check className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                          {p.features && p.features.length > 3 && (
                            <div className="text-[10px] font-mono text-zinc-400 pl-5">
                              +{p.features.length - 3} more specifications
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t-2 border-zinc-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditPlan(p)}
                          id={`btn-edit-plan-${p.id}`}
                          className="flex-1 py-2 px-3 bg-[#121316] hover:bg-black text-[#FFB800] rounded font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-hard-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Specs</span>
                        </button>

                        <button
                          onClick={() => handleTogglePlanActive(p)}
                          id={`btn-toggle-plan-${p.id}`}
                          title={p.isActive ? 'Hide plan from website' : 'Publish plan on website'}
                          className={`p-2 rounded border font-mono text-xs font-bold uppercase cursor-pointer ${
                            p.isActive
                              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-400'
                          }`}
                        >
                          {p.isActive ? 'Hide' : 'Publish'}
                        </button>

                        <button
                          onClick={() => handleDeletePlan(p)}
                          id={`btn-delete-plan-${p.id}`}
                          title="Delete plan"
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ADD / EDIT PLAN MODAL */}
            {isPlanModalOpen && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border-hard-thick rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
                    <div>
                      <div className="font-mono text-[11px] font-bold text-[#FF5500] uppercase">
                        {editingPlanId ? 'UPDATE EXISTING SPECIFICATION' : 'NEW CATALOG SPECIFICATION'}
                      </div>
                      <h3 className="font-heading text-2xl font-black uppercase text-[#121316]">
                        {editingPlanId ? `EDIT PLAN: ${planForm.name}` : 'ADD HOSTING / VPS PLAN'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsPlanModalOpen(false)}
                      className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-700 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePlan} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          PLAN NAME *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ryzen Devil - 8"
                          value={planForm.name}
                          onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          PLAN ID (UNIQUE CODE)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. vps_ryzen_devil8"
                          value={planForm.id}
                          onChange={(e) => setPlanForm({ ...planForm, id: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
                          disabled={!!editingPlanId}
                        />
                      </div>
                    </div>

                    {/* Category & Processor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          PRODUCT CATEGORY *
                        </label>
                        <select
                          value={planForm.category}
                          onChange={(e: any) => setPlanForm({ ...planForm, category: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                        >
                          <option value="vps">Cloud VPS (Full Root / SSH)</option>
                          <option value="minecraft">Minecraft Game Server (Game Panel)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          HARDWARE PROCESSOR *
                        </label>
                        <select
                          value={planForm.processor}
                          onChange={(e: any) => setPlanForm({ ...planForm, processor: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                        >
                          <option value="ryzen">AMD Ryzen 9 9950X (5.7GHz DDR5)</option>
                          <option value="intel">Intel Xeon Platinum / 8269-CY</option>
                        </select>
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                        TAGLINE / SHORT DESCRIPTION
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AMD Ryzen 9 9950X High-Freq VPS • Monthly"
                        value={planForm.tagline}
                        onChange={(e) => setPlanForm({ ...planForm, tagline: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
                      />
                    </div>

                    {/* Pricing Tiers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          MONTHLY PRICE (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 280"
                          value={planForm.priceMonth}
                          onChange={(e) => setPlanForm({ ...planForm, priceMonth: Number(e.target.value) })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          3-MONTH PRICE (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Leave empty if monthly only"
                          value={planForm.price3Months}
                          onChange={(e) => setPlanForm({ ...planForm, price3Months: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          ANNUAL PRICE (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Leave empty if monthly only"
                          value={planForm.priceAnnually}
                          onChange={(e) => setPlanForm({ ...planForm, priceAnnually: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          RAM (GB) *
                        </label>
                        <input
                          type="number"
                          value={planForm.ram}
                          onChange={(e) => setPlanForm({ ...planForm, ram: Number(e.target.value) })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          CPU / VCORES *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2 vCores or 200%"
                          value={planForm.cpu}
                          onChange={(e) => setPlanForm({ ...planForm, cpu: e.target.value })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          NVME SSD (GB) *
                        </label>
                        <input
                          type="number"
                          value={planForm.storage}
                          onChange={(e) => setPlanForm({ ...planForm, storage: Number(e.target.value) })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                          AUTO BACKUPS
                        </label>
                        <input
                          type="number"
                          value={planForm.backups}
                          onChange={(e) => setPlanForm({ ...planForm, backups: Number(e.target.value) })}
                          className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Features list */}
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                        PLAN FEATURES (ONE PER LINE)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g.&#10;4GB DDR5 5600MHz RAM&#10;1 vCore AMD Ryzen 9 9950X&#10;40GB Gen4 NVMe SSD&#10;Dedicated IPv4 Address&#10;Full Root Access"
                        value={planForm.featuresText}
                        onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap items-center gap-6 p-3 bg-[#F8F5EE] border-2 border-[#121316] rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={planForm.isPopular}
                          onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                          className="w-4 h-4 accent-[#FF5500] cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold uppercase text-[#121316]">
                          Highlight as "Best Value / Popular"
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={planForm.isActive}
                          onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold uppercase text-[#121316]">
                          Active & Visible on Website
                        </span>
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setIsPlanModalOpen(false)}
                        className="px-5 py-2.5 border-2 border-[#121316] rounded-lg font-mono text-xs font-bold uppercase hover:bg-zinc-100 cursor-pointer"
                      >
                        CANCEL
                      </button>

                      <button
                        type="submit"
                        className="btn-press px-6 py-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-lg font-mono text-xs font-black uppercase shadow-hard flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingPlanId ? 'SAVE SPECIFICATIONS' : 'CREATE PLAN'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
            <h3 className="font-heading text-lg font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-2">
              CREATE PROMO CODE
            </h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  COUPON CODE
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLASH50"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs uppercase font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                    DISCOUNT TYPE
                  </label>
                  <select
                    value={newCouponType}
                    onChange={(e: any) => setNewCouponType(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                    VALUE
                  </label>
                  <input
                    type="number"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  DESCRIPTION
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% off on all monthly plans"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  className="w-full p-2 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="btn-press w-full py-3 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded font-mono text-xs font-black uppercase shadow-hard cursor-pointer"
              >
                CREATE COUPON CODE
              </button>
            </form>
          </div>

          <div className="md:col-span-7 bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
            <h3 className="font-heading text-lg font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-2">
              ACTIVE DISCOUNT CODES
            </h3>
            <div className="space-y-2">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="p-3.5 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <span className="font-bold text-sm text-[#FF5500]">{c.code}</span>
                    <span className="ml-2 text-[11px] bg-[#121316] text-[#FFB800] px-1.5 py-0.5 rounded font-bold">
                      {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </span>
                    <p className="text-zinc-500 text-[11px] mt-0.5">{c.description}</p>
                  </div>
                  <div className="text-right text-[11px] text-zinc-500">
                    <div>Used: {c.usedCount || 0} times</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
          <h2 className="font-heading text-xl font-black uppercase text-[#121316]">
            SUPPORT TICKETS DESK
          </h2>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                No support tickets currently.
              </div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="p-4 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#FF5500]">#{t.id}</span>
                        <button
                          onClick={() => handleRenameTicket(t.id, t.subject)}
                          className="text-zinc-500 hover:text-black cursor-pointer"
                          title="Rename Ticket Subject"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <h3 className="font-heading text-base font-bold text-[#121316]">{t.subject}</h3>
                      <p className="text-[11px] font-mono text-zinc-500">
                        Client: {t.userName || t.userId} ({t.userEmail || 'No Email'}) | Cat: {t.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={t.status}
                        onChange={async (e) => {
                          await apiRequest(`/admin/tickets/${t.id}/status`, {
                            method: 'POST',
                            body: JSON.stringify({ status: e.target.value }),
                          });
                          loadAdminData();
                        }}
                        className="px-2 py-1 bg-[#121316] text-[#FFB800] font-mono text-xs font-bold rounded uppercase cursor-pointer"
                      >
                        <option value="open">OPEN</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="waiting">WAITING</option>
                        <option value="resolved">RESOLVED</option>
                        <option value="closed">CLOSED</option>
                      </select>

                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded cursor-pointer"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {t.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded text-xs font-mono ${
                          m.senderRole === 'admin'
                            ? 'bg-amber-100 border border-amber-300 ml-4'
                            : 'bg-white border border-zinc-300 mr-4'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <strong>{m.senderName} ({m.senderRole.toUpperCase()})</strong>
                          <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-zinc-800 whitespace-pre-wrap">{m.message}</p>
                        {m.imageUrl && (
                          <div className="mt-1">
                            <a href={m.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-[11px]">
                              View Attached Proof
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {replyingTicketId === t.id ? (
                    <div className="pt-2 space-y-2 border-t border-zinc-300">
                      <textarea
                        rows={3}
                        placeholder="Write administrator response..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="w-full p-2.5 bg-white border-2 border-[#121316] rounded font-mono text-xs"
                      />
                      <div className="relative">
                        <input
                          type="url"
                          placeholder="Optional screenshot/proof URL (e.g. https://...)"
                          value={adminReplyImageUrl}
                          onChange={(e) => setAdminReplyImageUrl(e.target.value)}
                          className="w-full p-2 pl-8 bg-white border-2 border-[#121316] rounded font-mono text-xs"
                        />
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingTicketId(null)}
                          className="px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded font-mono text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplyTicket(t.id)}
                          className="px-4 py-1.5 bg-[#FF5500] hover:bg-[#E64D00] text-white rounded font-mono text-xs font-bold cursor-pointer"
                        >
                          Send Staff Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTicketId(t.id)}
                      className="px-4 py-1.5 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold hover:bg-black cursor-pointer"
                    >
                      Reply to Ticket
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. GLOBAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-6">
          <div>
            <h2 className="font-heading text-xl font-black uppercase text-[#121316]">
              PLATFORM CONFIGURATION & LINKS
            </h2>
            <p className="text-xs font-mono text-zinc-500">
              Manage Discord link, control panel link, UPI payment details, and operational notices.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                DISCORD SERVER INVITE URL
              </label>
              <input
                type="url"
                value={settingsData.discordUrl}
                onChange={(e) => setSettingsData({ ...settingsData, discordUrl: e.target.value })}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                GAME CONTROL PANEL URL (PTERODACTYL / PELICAN)
              </label>
              <input
                type="url"
                value={settingsData.controlPanelUrl}
                onChange={(e) => setSettingsData({ ...settingsData, controlPanelUrl: e.target.value })}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  UPI ID (FOR CHECKOUT QR)
                </label>
                <input
                  type="text"
                  value={settingsData.upiId}
                  onChange={(e) => setSettingsData({ ...settingsData, upiId: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  UPI PAYEE NAME
                </label>
                <input
                  type="text"
                  value={settingsData.upiPayeeName}
                  onChange={(e) => setSettingsData({ ...settingsData, upiPayeeName: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                SUPPORT EMAIL
              </label>
              <input
                type="email"
                value={settingsData.contactEmail}
                onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                DELIVERY NOTICE BANNER
              </label>
              <textarea
                rows={2}
                value={settingsData.deliveryNotice}
                onChange={(e) => setSettingsData({ ...settingsData, deliveryNotice: e.target.value })}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="btn-press px-6 py-3 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded font-mono text-xs font-black uppercase shadow-hard flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
