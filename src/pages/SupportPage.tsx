import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import type { SupportTicket } from '../types.js';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (path: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'lookup'>('create');

  // Create Ticket Form State
  const [category, setCategory] = useState<'general' | 'billing' | 'technical' | 'plugin'>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ticket Lookup State
  const [lookupId, setLookupId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Follow-up message inside viewed ticket
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Settings for discord and email
  const [discordUrl, setDiscordUrl] = useState('https://discord.gg/EUnQbdx9E8');
  const [contactEmail, setContactEmail] = useState('support@devilcloud.fun');

  useEffect(() => {
    apiRequest('/public/settings')
      .then((res) => {
        if (res.discordUrl) setDiscordUrl(res.discordUrl);
        if (res.contactEmail) setContactEmail(res.contactEmail);
      })
      .catch(() => {});
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setError('Please provide both a subject and detailed description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest('/support/create', {
        method: 'POST',
        body: JSON.stringify({
          category,
          priority,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      if (res.ticket) {
        setSubmittedTicket(res.ticket);
        setCurrentTicket(res.ticket);
        setLookupId(res.ticket.id);
        setSubject('');
        setMessage('');
        setImageUrl('');
      } else {
        setError(res.error || 'Failed to submit ticket');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupTicket = async (idToSearch?: string) => {
    const target = idToSearch || lookupId;
    if (!target.trim()) {
      setLookupError('Please enter your Ticket ID (e.g. TCK-123456).');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);

    try {
      const res = await apiRequest(`/support/${encodeURIComponent(target.trim())}`);
      if (res.ticket) {
        setCurrentTicket(res.ticket);
        setActiveTab('lookup');
      } else {
        setLookupError('Ticket not found. Please verify the ticket ID.');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Ticket not found. Please verify your ID.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSendFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket) return;
    if (!replyText.trim() && !replyImage.trim()) return;

    setReplyLoading(true);
    try {
      const res = await apiRequest(`/support/${currentTicket.id}/message`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText.trim(),
          imageUrl: replyImage.trim() || undefined,
          senderName: currentTicket.userName || 'Customer',
        }),
      });

      if (res.ticket) {
        setCurrentTicket(res.ticket);
        setReplyText('');
        setReplyImage('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold shadow-hard-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>TECHNICAL & BILLING ASSISTANCE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black uppercase text-[#121316]">
          DEVILCLOUD SUPPORT DESK
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600">
          Need help with server provisioning, UPI verification, plugins, or latency? Submit a ticket or message our technicians.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b-2 border-zinc-200 gap-4">
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-0.5 cursor-pointer ${
            activeTab === 'create'
              ? 'border-[#FF5500] text-[#FF5500]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Create Support Ticket
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`pb-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-0.5 cursor-pointer ${
            activeTab === 'lookup'
              ? 'border-[#FF5500] text-[#FF5500]'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Track Existing Ticket {currentTicket ? `(#${currentTicket.id})` : ''}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Content Area (8 cols) */}
        <div className="md:col-span-8">
          {activeTab === 'create' && (
            <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-5">
              <h2 className="font-heading text-xl font-black uppercase text-[#121316] border-b-2 border-zinc-200 pb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#FF5500]" />
                <span>SUBMIT NEW TICKET</span>
              </h2>

              {submittedTicket ? (
                <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="font-heading text-xl font-bold text-emerald-900">
                      TICKET #{submittedTicket.id} SUBMITTED
                    </h3>
                    <p className="text-xs text-emerald-700 font-sans mt-1">
                      Our support engineers have received your inquiry. Keep your ticket ID to check updates.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('lookup');
                        handleLookupTicket(submittedTicket.id);
                      }}
                      className="px-4 py-2 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold hover:bg-black cursor-pointer shadow-hard-sm"
                    >
                      View Live Ticket Thread
                    </button>
                    <button
                      onClick={() => setSubmittedTicket(null)}
                      className="px-4 py-2 bg-white text-zinc-700 border border-zinc-300 rounded font-mono text-xs font-bold hover:bg-zinc-50 cursor-pointer"
                    >
                      Submit Another Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-100 border-2 border-red-500 rounded text-xs text-red-800 font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                        YOUR NAME / MINECRAFT IGN
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SteveCraft or Ashvik"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                        CATEGORY
                      </label>
                      <select
                        value={category}
                        onChange={(e: any) => setCategory(e.target.value)}
                        className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="billing">Billing & UPI Verification</option>
                        <option value="technical">Server & Node Issues</option>
                        <option value="plugin">Plugins, Mods & Config</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                        PRIORITY LEVEL
                      </label>
                      <select
                        value={priority}
                        onChange={(e: any) => setPriority(e.target.value)}
                        className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs font-bold"
                      >
                        <option value="low">Low (General Query)</option>
                        <option value="medium">Medium (Standard Request)</option>
                        <option value="high">High (Server Offline / Payment Blocked)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                      SUBJECT *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Help verifying UPI payment UTR or installing Fabric"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                      DETAILED MESSAGE *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Provide all relevant details: order ID, bank transaction reference, server IP, error logs..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-[#121316] mb-1">
                      ATTACH SCREENSHOT / PROOF URL (OPTIONAL)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://i.imgur.com/... or screenshot URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-2.5 pl-9 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs text-[#121316] focus:outline-none"
                      />
                      <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-press w-full py-3.5 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded-md font-mono text-xs font-black uppercase tracking-wider shadow-hard flex items-center justify-center gap-2 cursor-pointer transition-transform"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'TRANSMITTING TICKET...' : 'SUBMIT SUPPORT TICKET'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'lookup' && (
            <div className="bg-white border-hard-thick rounded-xl p-6 shadow-hard space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-zinc-200 pb-3">
                <h2 className="font-heading text-xl font-black uppercase text-[#121316] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#FF5500]" />
                  <span>TRACK YOUR TICKET</span>
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Ticket ID (e.g. TCK-123456)"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    className="p-2 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs uppercase"
                  />
                  <button
                    onClick={() => handleLookupTicket()}
                    disabled={lookupLoading}
                    className="px-3 py-2 bg-[#121316] text-[#FFB800] rounded font-mono text-xs font-bold hover:bg-black cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${lookupLoading ? 'animate-spin' : ''}`} />
                    <span>LOOKUP</span>
                  </button>
                </div>
              </div>

              {lookupError && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded text-xs text-red-800 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{lookupError}</span>
                </div>
              )}

              {currentTicket ? (
                <div className="space-y-4">
                  {/* Ticket Summary Header */}
                  <div className="p-4 bg-[#F8F5EE] border-2 border-[#121316] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#FF5500]">#{currentTicket.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            currentTicket.status === 'resolved' || currentTicket.status === 'closed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : currentTicket.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {currentTicket.status}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-black text-[#121316] mt-1">{currentTicket.subject}</h3>
                      <p className="text-[11px] font-mono text-zinc-500">
                        Submitted: {new Date(currentTicket.createdAt).toLocaleString()} | Category: {currentTicket.category}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLookupTicket(currentTicket.id)}
                      className="text-xs font-mono text-zinc-600 hover:text-black flex items-center gap-1 self-start sm:self-center"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh Thread</span>
                    </button>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-3 max-h-[450px] overflow-y-auto p-1">
                    {currentTicket.messages.map((m) => {
                      const isStaff = m.senderRole === 'admin';
                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-lg border-2 space-y-2 ${
                            isStaff
                              ? 'bg-[#0E0F12] text-white border-[#FFB800] ml-4'
                              : 'bg-[#F8F5EE] text-[#121316] border-[#121316] mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono border-b pb-1.5 border-zinc-700/30">
                            <span className="flex items-center gap-1.5 font-bold">
                              {isStaff ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
                                  <span className="text-[#00FF66]">DEVILCLOUD STAFF</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>{m.senderName || 'Customer'}</span>
                                </>
                              )}
                            </span>
                            <span className={isStaff ? 'text-zinc-400' : 'text-zinc-500'}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{m.message}</p>

                          {m.imageUrl && (
                            <div className="mt-2">
                              <a
                                href={m.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block border border-zinc-500 rounded overflow-hidden max-w-xs"
                              >
                                <img
                                  src={m.imageUrl}
                                  alt="Attachment"
                                  className="max-h-48 object-cover rounded"
                                  referrerPolicy="no-referrer"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Box */}
                  <form onSubmit={handleSendFollowup} className="pt-2 border-t-2 border-zinc-200 space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Type a response or answer staff question..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs focus:outline-none"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <input
                          type="url"
                          placeholder="Optional screenshot URL..."
                          value={replyImage}
                          onChange={(e) => setReplyImage(e.target.value)}
                          className="w-full p-2 pl-8 bg-[#F8F5EE] border-2 border-[#121316] rounded font-mono text-xs focus:outline-none"
                        />
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                      </div>

                      <button
                        type="submit"
                        disabled={replyLoading}
                        className="w-full sm:w-auto px-5 py-2 bg-[#FF5500] hover:bg-[#E64D00] text-white border-2 border-[#121316] rounded font-mono text-xs font-bold uppercase shadow-hard-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{replyLoading ? 'SENDING...' : 'SEND REPLY'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-zinc-300 rounded-lg space-y-2">
                  <Clock className="w-10 h-10 text-zinc-400 mx-auto" />
                  <p className="font-mono text-xs text-zinc-500">
                    Enter your Ticket ID above or submit a new ticket on the left to see live staff conversation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Support Channels & Discord (4 cols) */}
        <div className="md:col-span-4 space-y-5">
          {/* Discord Community Box */}
          <div className="bg-[#121316] text-white border-hard rounded-xl p-6 shadow-hard space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
              <h3 className="font-heading text-lg font-black uppercase text-[#FFB800]">
                COMMUNITY & DISCORD
              </h3>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Join 1,200+ server owners on our official Discord. Get instantaneous peer help, plugin recommendations, and direct staff assistance.
            </p>
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-press w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hard cursor-pointer"
            >
              <span>JOIN DISCORD SERVER</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Direct Channels */}
          <div className="bg-white border-hard rounded-xl p-5 shadow-hard space-y-3">
            <h4 className="font-heading font-black text-[#121316] uppercase text-sm border-b pb-2 border-zinc-200">
              DIRECT DESK CHANNELS
            </h4>
            <div className="space-y-2 text-xs font-mono text-zinc-700">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Official Email:</span>
                <span className="text-[#121316] font-bold">{contactEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">UPI Support:</span>
                <span className="text-[#121316] font-bold">ashvikraj@fam</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Response SLA:</span>
                <span className="text-[#00FF66] bg-black px-1.5 py-0.5 rounded font-bold">&lt; 15 Minutes</span>
              </div>
            </div>
          </div>

          {/* Quick Guidance */}
          <div className="bg-[#F8F5EE] border-hard rounded-xl p-5 shadow-hard space-y-2 text-xs font-mono text-zinc-700">
            <h4 className="font-heading font-black text-[#121316] uppercase text-sm">
              COMMON INQUIRIES
            </h4>
            <p>
              <strong>UPI Verification:</strong> Make sure you entered your 12-digit UTR in checkout. Staff manually audits the bank statement within 1-15 minutes.
            </p>
            <p>
              <strong>Pterodactyl / Pelican Panel:</strong> Once verified, credentials will be provided in your order status page and sent to your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
