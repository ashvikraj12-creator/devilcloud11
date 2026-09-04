import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { apiRequest } from '../api.js';
import type { Order } from '../types.js';
import {
  Copy,
  Check,
  QrCode,
  ShieldAlert,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Server,
  Zap,
} from 'lucide-react';
import { NoticeBanner } from '../components/NoticeBanner.js';

interface PaymentPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [upiDetails, setUpiDetails] = useState<{
    upiId: string;
    payeeName: string;
    amount: number;
    currency: string;
    note: string;
    upiIntentUri: string;
  } | null>(null);

  const [deliveryNotice, setDeliveryNotice] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchOrderData = async () => {
    try {
      const res = await apiRequest(`/orders/${orderId}`);
      if (res.order) {
        setOrder(res.order);
        setUpiDetails(res.upi);
        setDeliveryNotice(res.deliveryNotice || '');

        if (res.order.utrNumber) {
          setUtrNumber(res.order.utrNumber);
          setUtrSubmitted(true);
        }

        // Trigger celebratory confetti if order reached READY
        if (res.order.status === 'ready') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order information.');
    }
  };

  useEffect(() => {
    fetchOrderData();
    // Poll order status every 6 seconds for live state change
    const interval = setInterval(fetchOrderData, 6000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Generate QR Code
  useEffect(() => {
    if (qrCanvasRef.current && upiDetails?.upiIntentUri) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        upiDetails.upiIntentUri,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: '#121316',
            light: '#FFFFFF',
          },
        },
        (err) => {
          if (err) console.error('QR code generation error:', err);
        }
      );
    }
  }, [upiDetails]);

  const handleCopyUpi = () => {
    if (!upiDetails?.upiId) return;
    navigator.clipboard.writeText(upiDetails.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    if (!order?.finalAmount) return;
    navigator.clipboard.writeText(String(order.finalAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 6) {
      setError('Please enter a valid 12-digit UTR/Reference number from your UPI app receipt.');
      return;
    }

    setSubmittingUtr(true);
    setError(null);

    try {
      const res = await apiRequest(`/orders/${orderId}/submit-utr`, {
        method: 'POST',
        body: JSON.stringify({ utrNumber, paymentProofNote: paymentNote }),
      });

      if (res.success) {
        setUtrSubmitted(true);
        setOrder(res.order);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit UTR reference.');
    } finally {
      setSubmittingUtr(false);
    }
  };

  const getStepState = (targetStatus: string) => {
    if (!order) return 'upcoming';
    const states = ['pending_payment', 'payment_verification', 'paid', 'provisioning', 'ready'];
    const currentIndex = states.indexOf(order.status);
    const targetIndex = states.indexOf(targetStatus);

    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'active';
    return 'upcoming';
  };

  if (!order) {
    return (
      <div className="py-20 text-center font-mono text-sm text-zinc-600">
        Loading payment gateway for {orderId}...
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <span>🇮🇳</span>
          <span>INDIAN UPI INSTANT PAYMENT GATEWAY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black uppercase text-[#121316]">
          ORDER PAYMENT: {order.id}
        </h1>
        <p className="text-xs font-mono text-zinc-600">
          SERVER: <strong className="text-[#121316] font-bold">{order.serverName}</strong> ({order.planName})
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-xs text-red-800 font-mono flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. ORDER LIFECYCLE PROGRESS TRACKER */}
      <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard mb-8">
        <h3 className="font-heading text-xs font-black uppercase tracking-wider text-zinc-500 mb-4">
          PROVISIONING PIPELINE PROGRESS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
          {/* Step 1: Pending Payment */}
          <div
            className={`p-3 rounded-lg border-2 ${
              getStepState('pending_payment') === 'completed'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : getStepState('pending_payment') === 'active'
                ? 'bg-[#FFF8E7] border-[#121316] font-bold shadow-hard-sm'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400'
            }`}
          >
            <div className="text-[10px] text-zinc-500">STEP 01</div>
            <div className="font-bold">Awaiting UPI</div>
          </div>

          {/* Step 2: Payment Verification */}
          <div
            className={`p-3 rounded-lg border-2 ${
              getStepState('payment_verification') === 'completed'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : getStepState('payment_verification') === 'active'
                ? 'bg-[#FFF8E7] border-[#121316] font-bold shadow-hard-sm animate-pulse'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400'
            }`}
          >
            <div className="text-[10px] text-zinc-500">STEP 02</div>
            <div className="font-bold">UTR Verification</div>
          </div>

          {/* Step 3: Paid */}
          <div
            className={`p-3 rounded-lg border-2 ${
              getStepState('paid') === 'completed'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : getStepState('paid') === 'active'
                ? 'bg-[#FFF8E7] border-[#121316] font-bold shadow-hard-sm'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400'
            }`}
          >
            <div className="text-[10px] text-zinc-500">STEP 03</div>
            <div className="font-bold">Payment Verified</div>
          </div>

          {/* Step 4: Provisioning */}
          <div
            className={`p-3 rounded-lg border-2 ${
              getStepState('provisioning') === 'completed'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : getStepState('provisioning') === 'active'
                ? 'bg-[#FFF8E7] border-[#121316] font-bold shadow-hard-sm animate-pulse'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400'
            }`}
          >
            <div className="text-[10px] text-zinc-500">STEP 04</div>
            <div className="font-bold">Node Allocation</div>
          </div>

          {/* Step 5: Server Ready */}
          <div
            className={`p-3 rounded-lg border-2 ${
              order.status === 'ready'
                ? 'bg-emerald-500 border-black text-white font-bold shadow-hard'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400'
            }`}
          >
            <div className="text-[10px]">STEP 05</div>
            <div className="font-bold">Server Ready</div>
          </div>
        </div>

        {order.status === 'ready' && (
          <div className="mt-5 p-4 bg-emerald-100 border-2 border-emerald-600 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              <div>
                <strong className="font-heading font-black text-emerald-900 text-base">
                  YOUR SERVER IS DEPLOYED & READY!
                </strong>
                <p className="text-xs text-emerald-800 font-mono">
                  Container online on port. Manage console, files and players in dashboard.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate(`/dashboard/servers/${order.serverId || ''}`)}
              className="btn-press px-5 py-2.5 bg-[#121316] text-[#FFB800] border-2 border-black rounded-md font-mono text-xs font-bold shadow-hard"
            >
              GO TO SERVER CONTROL &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 2. PAYMENT MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
        {/* Left: Dynamic QR Code Box (5 cols) */}
        <div className="md:col-span-5 bg-white border-hard-thick rounded-xl p-6 shadow-hard text-center flex flex-col items-center justify-between">
          <div className="w-full">
            <div className="inline-block px-3 py-1 bg-[#121316] text-white text-[11px] font-mono font-bold rounded mb-4">
              SCAN & PAY WITH ANY UPI APP
            </div>

            {/* QR Canvas */}
            <div className="p-3 bg-[#F8F5EE] border-hard rounded-lg shadow-hard-sm inline-block mb-4">
              <canvas ref={qrCanvasRef} className="rounded" />
            </div>

            <div className="font-heading text-3xl font-black text-[#FF5500] mb-1">
              ₹{order.finalAmount}
            </div>
            <p className="text-xs font-mono text-zinc-500">EXACT PAYABLE AMOUNT (INR)</p>
          </div>

          {/* Pay via UPI App Intent link */}
          <div className="w-full pt-4 border-t border-zinc-200 mt-4 space-y-2">
            {upiDetails?.upiIntentUri && (
              <a
                href={upiDetails.upiIntentUri}
                className="btn-press w-full py-3 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-md font-mono text-xs font-bold uppercase tracking-wider shadow-hard flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN IN UPI APP (MOBILE)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <p className="text-[10px] font-mono text-zinc-400">
              Works with GPay, PhonePe, Paytm, BHIM, Cred, AmazonPay
            </p>
          </div>
        </div>

        {/* Right: UPI Details & UTR Submission Form (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Payee Info Card */}
          <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
            <h3 className="font-heading text-base font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-2">
              UPI TRANSFER CREDENTIALS
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {/* UPI ID Copy Field */}
              <div>
                <label className="text-[11px] text-zinc-500 uppercase block mb-1">
                  PAYEE UPI ID (VPA)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={upiDetails?.upiId || 'ashvikraj@fam'}
                    className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-bold text-sm text-[#121316]"
                  />
                  <button
                    onClick={handleCopyUpi}
                    className="btn-press px-4 py-2.5 bg-[#121316] hover:bg-black text-[#FFB800] border-2 border-[#121316] rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Exact Amount Copy Field */}
              <div>
                <label className="text-[11px] text-zinc-500 uppercase block mb-1">
                  EXACT AMOUNT
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`₹${order.finalAmount}`}
                    className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-bold text-sm text-[#FF5500]"
                  />
                  <button
                    onClick={handleCopyAmount}
                    className="btn-press px-4 py-2.5 bg-[#F0ECE1] hover:bg-[#EAE4D2] text-[#121316] border-2 border-[#121316] rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAmount ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Payee Name */}
              <div className="flex justify-between py-2 border-t border-zinc-200 text-zinc-600">
                <span>Account Name:</span>
                <strong className="text-zinc-900">{upiDetails?.payeeName || 'Ashvik Raj (DevilCloud)'}</strong>
              </div>
            </div>
          </div>

          {/* 3. UTR Reference Submission Form */}
          <div className="bg-[#121316] text-white border-hard-thick rounded-xl p-6 shadow-hard space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-heading text-lg font-black uppercase text-[#FFB800]">
                SUBMIT PAYMENT PROOF (UTR / REF NO.)
              </h3>
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono rounded">
                REQUIRED FOR ACTIVATION
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              After completing the UPI transfer in your banking app, enter the 12-digit UTR / UPI Reference ID below to trigger server provisioning.
            </p>

            <form onSubmit={handleSubmitUtr} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 uppercase mb-1">
                  12-DIGIT UPI REFERENCE / UTR NUMBER
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423871928371 or 248918239102"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white uppercase tracking-widest focus:border-[#FF5500] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 uppercase mb-1">
                  OPTIONAL TRANSACTION NOTE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via GPay from Phone ending in 9876"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingUtr || order.status === 'ready'}
                className="btn-press w-full py-3 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-white rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-hard-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>{submittingUtr ? 'VERIFYING...' : utrSubmitted ? 'UPDATE UTR REFERENCE' : 'SUBMIT UTR & ACTIVATE SERVER'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {utrSubmitted && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded text-center text-xs text-emerald-300 font-mono">
                  ✓ UTR Reference <strong>{order.utrNumber}</strong> submitted. Our bank reconciliation system is verifying the transaction.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Security & Delivery Notice Banner */}
      <NoticeBanner type="both" />
    </div>
  );
};
