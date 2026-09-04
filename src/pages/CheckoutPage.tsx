import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import type { Plan, ServerLocation } from '../types.js';
import {
  ShieldCheck,
  Tag,
  ArrowRight,
  Server,
  Check,
  AlertCircle,
  Sparkles,
  Cpu,
  Mail,
  User,
  HardDrive,
  Clock,
} from 'lucide-react';
import { NoticeBanner } from '../components/NoticeBanner.js';

interface CheckoutNavState {
  planId?: string;
  isCustom?: boolean;
  specs?: any;
  billingPeriod?: 'monthly' | 'quarterly' | 'annually';
  location?: string;
  processor?: 'intel' | 'ryzen';
  category?: 'minecraft' | 'vps';
}

interface CheckoutPageProps {
  initialState?: CheckoutNavState;
  onNavigate: (path: string, state?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ initialState, onNavigate }) => {
  const init = initialState || {};
  const [plans, setPlans] = useState<Plan[]>([]);
  const [locations, setLocations] = useState<ServerLocation[]>([]);

  // Order configuration
  const [selectedPlanId, setSelectedPlanId] = useState<string>(init.planId || 'mc_intel_standard');
  const [isCustom, setIsCustom] = useState<boolean>(!!init.isCustom);
  const [customSpecs, setCustomSpecs] = useState(
    init.specs || {
      ram: 4,
      cpu: 2,
      storage: 40,
      backups: 3,
      location: init.location || 'loc_in_mum',
      software: 'Paper 1.21',
      version: '1.21.4 (Latest)',
    }
  );

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annually'>(
    init.billingPeriod || 'monthly'
  );

  // Customer identity
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Server metadata
  const [serverName, setServerName] = useState('My DevilCloud Node');
  const [mcUsername, setMcUsername] = useState('Player1');
  const [location, setLocation] = useState(init.location || 'loc_in_mum');
  const [software, setSoftware] = useState('Paper 1.21');
  const [version, setVersion] = useState('1.21.4 (Latest)');
  const [osTemplate, setOsTemplate] = useState('Ubuntu 22.04 LTS');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'stripe'>('upi');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/public/plans')
      .then((res) => {
        const loadedPlans: Plan[] = res.plans || [];
        setPlans(loadedPlans);
        if (loadedPlans.length > 0 && init.planId) {
          setSelectedPlanId(init.planId);
        } else if (loadedPlans.length > 0 && !selectedPlanId) {
          setSelectedPlanId(loadedPlans[0].id);
        }
      })
      .catch(() => {});

    apiRequest('/public/locations')
      .then((res) => setLocations(res.locations || []))
      .catch(() => {});
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isVps = selectedPlan?.category === 'vps';

  // Force monthly billing for VPS
  useEffect(() => {
    if (isVps && billingPeriod !== 'monthly') {
      setBillingPeriod('monthly');
    }
  }, [isVps, billingPeriod]);

  // Compute Base Subtotal
  let subtotal = 60;
  if (!isCustom && selectedPlan) {
    if (isVps) {
      subtotal = selectedPlan.priceMonth;
    } else if (billingPeriod === 'quarterly') {
      subtotal = selectedPlan.price3Months || Math.round(selectedPlan.priceMonth * 3 * 0.90);
    } else if (billingPeriod === 'annually') {
      subtotal = selectedPlan.priceAnnually || Math.round(selectedPlan.priceMonth * 12 * 0.80);
    } else {
      subtotal = selectedPlan.priceMonth;
    }
  } else if (isCustom) {
    const basePrice =
      49 +
      customSpecs.ram * 40 +
      customSpecs.cpu * 35 +
      customSpecs.storage * 1.5 +
      customSpecs.backups * 10;
    const periodMultiplier = billingPeriod === 'annually' ? 12 : billingPeriod === 'quarterly' ? 3 : 1;
    const cycleDiscount = billingPeriod === 'annually' ? 0.20 : billingPeriod === 'quarterly' ? 0.10 : 0;
    subtotal = Math.ceil(basePrice * periodMultiplier * (1 - cycleDiscount));
  }

  const discount = couponApplied ? couponApplied.discountAmount : 0;
  const finalAmount = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await apiRequest('/public/validate-coupon', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, amount: subtotal }),
      });

      if (res.valid) {
        setCouponApplied({
          code: res.coupon.code,
          discountAmount: res.discountAmount,
          description: res.coupon.description,
        });
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!serverName.trim()) {
      setError('Please provide a server name or hostname.');
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please enter a valid email address so we can deliver your server credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/orders/create', {
        method: 'POST',
        body: JSON.stringify({
          planId: isCustom ? 'custom' : selectedPlanId,
          isCustom,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || 'Valued Customer',
          specs: isCustom
            ? customSpecs
            : {
                ram: selectedPlan?.ram,
                cpu: selectedPlan?.cpu,
                storage: selectedPlan?.storage,
                backups: selectedPlan?.backups,
                location,
                software: isVps ? osTemplate : software,
                version: isVps ? 'Latest' : version,
              },
          billingPeriod: isVps ? 'monthly' : billingPeriod,
          serverName: serverName.trim(),
          mcUsername: isVps ? 'root' : mcUsername.trim() || 'Player1',
          location,
          software: isVps ? osTemplate : software,
          version: isVps ? 'Latest' : version,
          couponCode: couponApplied?.code,
          paymentMethod,
        }),
      });

      if (res.order) {
        onNavigate(`/payment/${res.order.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <Server className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>INSTANT PROVISIONING CHECKOUT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#121316]">
          {isVps ? 'VPS CONFIGURATION & CHECKOUT' : 'SERVER CONFIGURATION & CHECKOUT'}
        </h1>
        <p className="text-zinc-600 font-mono text-xs">
          No registration required. Complete payment to activate your instance immediately.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-xs text-red-800 font-mono flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Details */}
          <div className="bg-white border-2 border-[#121316] rounded-xl p-6 shadow-hard space-y-4">
            <h2 className="font-heading text-lg font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FF5500]" />
              <span>1. DELIVERY EMAIL & CLIENT DETAILS</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="checkout-customer-email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                  required
                />
                <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                  Server access credentials and invoice will be sent here.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  FULL NAME / ALIAS
                </label>
                <input
                  type="text"
                  id="checkout-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ashvik Kumar"
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Server Identifier & Settings */}
          <div className="bg-white border-2 border-[#121316] rounded-xl p-6 shadow-hard space-y-4">
            <h2 className="font-heading text-lg font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00FF66]" />
              <span>2. INSTANCE METADATA</span>
            </h2>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                {isVps ? 'VPS HOSTNAME' : 'SERVER NAME'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="checkout-server-name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder={isVps ? 'e.g. vps.devilcloud.net' : 'e.g. DragonSlayer SMP'}
                className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                required
              />
            </div>

            {!isVps && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  MINECRAFT OPERATOR (IGN)
                </label>
                <input
                  type="text"
                  id="checkout-mc-username"
                  value={mcUsername}
                  onChange={(e) => setMcUsername(e.target.value)}
                  placeholder="e.g. AshvikPlayz"
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                />
                <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                  This username receives automatic OP permissions on server launch.
                </span>
              </div>
            )}
          </div>

          {/* 3. OS Template / Software & Location */}
          <div className="bg-white border-2 border-[#121316] rounded-xl p-6 shadow-hard space-y-4">
            <h2 className="font-heading text-lg font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-2">
              3. ENVIRONMENT & LOCATION
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  SERVER LOCATION
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold text-[#121316] focus:outline-none cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.flag} {loc.name} ({loc.latency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                  {isVps ? 'OPERATING SYSTEM TEMPLATE' : 'SERVER SOFTWARE'}
                </label>
                {isVps ? (
                  <select
                    value={osTemplate}
                    onChange={(e) => setOsTemplate(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold text-[#121316] focus:outline-none cursor-pointer"
                  >
                    <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS (Recommended)</option>
                    <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (Latest)</option>
                    <option value="Debian 12 Bookworm">Debian 12 Bookworm</option>
                    <option value="CentOS Stream 9">CentOS Stream 9</option>
                    <option value="AlmaLinux 9">AlmaLinux 9</option>
                  </select>
                ) : (
                  <select
                    value={software}
                    onChange={(e) => setSoftware(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold text-[#121316] focus:outline-none cursor-pointer"
                  >
                    <option value="Paper 1.21">Paper 1.21 (Recommended)</option>
                    <option value="Purpur 1.21">Purpur 1.21 (High Performance)</option>
                    <option value="Spigot 1.21">Spigot 1.21</option>
                    <option value="Fabric 1.21">Fabric 1.21</option>
                    <option value="Forge 1.20.1">Forge 1.20.1 (Modpack Ready)</option>
                    <option value="Bedrock Dedicated">Bedrock Dedicated</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* 4. Payment Gateway (UPI Only) */}
          <div className="bg-white border-2 border-[#121316] rounded-xl p-6 shadow-hard space-y-3">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-2">
              <h2 className="font-heading text-lg font-black uppercase text-[#121316]">
                4. PAYMENT GATEWAY (UPI ONLY)
              </h2>
              <span className="px-2 py-0.5 bg-[#00FF66] text-black font-mono text-[9px] font-black rounded">
                0% CONVENIENCE FEE
              </span>
            </div>

            <div className="p-4 rounded-xl border-2 border-[#121316] bg-[#FFF8E7] shadow-hard-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇮🇳</span>
                  <span className="font-heading font-black text-sm sm:text-base text-[#121316] uppercase">
                    INDIAN UPI INSTANT GATEWAY
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-[#121316] text-[#FFB800] text-[10px] font-mono font-black rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-700 font-mono">
                Scan dynamic QR code or open via Google Pay, PhonePe, Paytm, BHIM, Cred, or any UPI app. Instant automated verification with zero gateway charges.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Billing Period (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121316] text-white border-2 border-[#121316] rounded-2xl p-6 shadow-hard-lg space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-heading text-xl font-black uppercase text-[#FFB800]">
                ORDER SUMMARY
              </h3>
              <span className="px-2 py-0.5 bg-zinc-800 text-[#00FF66] text-[10px] font-mono font-bold rounded">
                {isCustom ? 'CUSTOM PLAN' : selectedPlan?.name}
              </span>
            </div>

            {/* Plan Specs */}
            <div className="space-y-2 text-xs font-mono">
              {!isCustom && selectedPlan?.processor && (
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Processor:</span>
                  <span className="font-bold text-[#FFB800]">
                    {selectedPlan.processor === 'ryzen' ? 'AMD Ryzen 9 9950X' : 'Intel Xeon Platinum'}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">RAM:</span>
                <span className="font-bold text-white">
                  {isCustom ? `${customSpecs.ram} GB` : `${selectedPlan?.ram} GB`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">CPU:</span>
                <span className="font-bold text-white">
                  {isCustom ? `${customSpecs.cpu} Cores` : `${selectedPlan?.cpu}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">NVMe SSD:</span>
                <span className="font-bold text-white">
                  {isCustom ? `${customSpecs.storage} GB` : `${selectedPlan?.storage} GB`}
                </span>
              </div>
            </div>

            {/* Billing Cycle Selector for Minecraft (VPS is monthly only) */}
            {!isVps && !isCustom && (
              <div className="border-t border-zinc-800 pt-3 space-y-2">
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold">
                  BILLING CYCLE:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`py-2 px-1 text-center font-mono text-[11px] font-black rounded-lg border cursor-pointer ${
                      billingPeriod === 'monthly'
                        ? 'bg-[#FF5500] border-[#FF5500] text-white shadow-hard-sm'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    1 MONTH
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingPeriod('quarterly')}
                    className={`py-2 px-1 text-center font-mono text-[11px] font-black rounded-lg border cursor-pointer relative ${
                      billingPeriod === 'quarterly'
                        ? 'bg-[#FF5500] border-[#FF5500] text-white shadow-hard-sm'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span>3 MO (-10%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingPeriod('annually')}
                    className={`py-2 px-1 text-center font-mono text-[11px] font-black rounded-lg border cursor-pointer relative ${
                      billingPeriod === 'annually'
                        ? 'bg-[#FF5500] border-[#FF5500] text-white shadow-hard-sm'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span>1 YR (-20%)</span>
                  </button>
                </div>
              </div>
            )}

            {isVps && (
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xs text-[#00FF66] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>VPS instances are billed monthly (₹{selectedPlan?.priceMonth}/mo)</span>
              </div>
            )}

            {/* Coupon Code Input */}
            <div className="border-t border-zinc-800 pt-3">
              <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                DISCOUNT COUPON
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="TRY 'DEVIL10'"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-xs font-mono uppercase text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode}
                  className="px-3 py-2 bg-[#FFB800] text-[#121316] font-mono text-xs font-black rounded border border-[#FFB800] cursor-pointer disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'APPLY'}
                </button>
              </div>

              {couponError && (
                <div className="text-[10px] text-red-400 font-mono mt-1">{couponError}</div>
              )}

              {couponApplied && (
                <div className="text-[11px] text-[#00FF66] font-mono mt-1 flex items-center justify-between">
                  <span>Coupon {couponApplied.code} applied!</span>
                  <span>-₹{couponApplied.discountAmount}</span>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({billingPeriod}):</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>

              {couponApplied && (
                <div className="flex justify-between text-[#00FF66]">
                  <span>Discount:</span>
                  <span className="font-bold">-₹{couponApplied.discountAmount}</span>
                </div>
              )}

              <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Due Today:</span>
                <span className="text-3xl font-heading font-black text-[#00FF66]">
                  ₹{finalAmount}
                </span>
              </div>
            </div>

            {/* Order Confirmation Button */}
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              id="btn-confirm-checkout"
              className="w-full py-3.5 bg-[#00FF66] hover:bg-[#00E65C] text-black font-mono text-sm font-black uppercase tracking-wider rounded-xl border-2 border-white shadow-hard-white cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'INITIALIZING ORDER...' : 'PROCEED TO PAYMENT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] text-zinc-400 font-mono">
              ⚡ Instant automated provisioning upon UPI verification
            </div>
          </div>

          <NoticeBanner type="delivery" />
        </div>
      </div>
    </div>
  );
};
