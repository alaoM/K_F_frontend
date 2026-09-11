'use client';

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { 
  Shield, Bell, CreditCard, Store, Mail, CheckCircle2, ChevronRight, Sliders, Lock, Zap, ArrowUpRight
} from 'lucide-react';
import Security from '@/app/components/AdminComponents/Security';
import GeneralSettings from '@/app/components/AdminComponents/GeneralSettings';
import Link from 'next/link';

const Settings: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [settings, setSettings] = useState({ 
    emailNotificationsEnabled: true, 
    pushNotificationsEnabled: true 
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/notifications/settings');
        const data = await res.json();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const toggleSetting = async (key: 'emailNotificationsEnabled' | 'pushNotificationsEnabled') => {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));

    try {
      await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal }),
      });
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  const renderGeneral = () => (
    <GeneralSettings />
  );

  const renderPayments = () => (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-gray-200 shadow-xs space-y-6">
        <div className="border-b-2 border-gray-200 pb-5">
          <div className="flex items-center gap-2 text-[#111111] mb-1">
            <CreditCard size={20} className="text-[#f6c947]" />
            <h3 className="text-xl font-black uppercase tracking-tight">Platform Payment & Gateway Architecture</h3>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Manage system-level payment providers, settlement policies, and revenue splits.
          </p>
        </div>

        {/* Gateway Config Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 border-2 border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#111111]">Primary Gateway</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase tracking-wider">
                Live & Active
              </span>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
              Paystack API & Webhook listeners are initialized via encrypted environment configuration with escrow protection.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono font-bold bg-white border border-gray-300 px-2 py-1 text-gray-700">
                PROVIDER: PAYSTACK_LIVE
              </span>
            </div>
          </div>

          <div className="p-5 border-2 border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#111111]">Escrow & Payout Cycle</span>
              <span className="px-2 py-0.5 bg-[#111111] text-[#f6c947] text-[9px] font-black uppercase tracking-wider">
                Instant / T+1
              </span>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
              Funds are held in secure platform escrow until customer fulfillment confirmation or mediation clearance.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono font-bold bg-white border border-gray-300 px-2 py-1 text-gray-700">
                SETTLEMENT_CURRENCY: NGN (₦)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-2 border-t-2 border-gray-200 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className="text-xs font-black uppercase tracking-wider text-[#111111] bg-[#f6c947] border border-[#f6c947] hover:bg-[#111111] hover:text-[#f6c947] hover:border-[#111111] px-4 py-2.5 rounded-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Global Commission Matrix</span>
            <ArrowUpRight size={14} />
          </button>
          <Link
            href="/dashboard/admin/categories"
            className="text-xs font-black uppercase tracking-wider text-[#111111] bg-white border-2 border-[#111111] hover:bg-[#111111] hover:text-white px-4 py-2.5 rounded-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Category-Specific Commissions</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <Security />
  );

  const [eventPreferences, setEventPreferences] = useState<Record<string, boolean>>({
    'New Order Placed': true,
    'Stock Level Alerts': true,
    'Customer Dispute Opened': true,
    'Payout Processing': true,
    'Seller Verification Application': true,
    'Platform Security Warnings': true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_event_preferences');
      if (saved) setEventPreferences(JSON.parse(saved));
    } catch {
      // fallback
    }
  }, []);

  const toggleEventPreference = (label: string) => {
    setEventPreferences((prev) => {
      const updated = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem('admin_event_preferences', JSON.stringify(updated));
      } catch {
        // fallback
      }
      return updated;
    });
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Primary Dispatch Channels */}
      <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-gray-200 shadow-xs space-y-6">
        <div className="border-b-2 border-gray-200 pb-5">
          <div className="flex items-center gap-2 text-[#111111] mb-1">
            <Bell size={20} className="text-[#f6c947]" />
            <h3 className="text-xl font-black uppercase tracking-tight">Notification Channels</h3>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Configure system-wide broadcast pathways and administrative alerts.
          </p>
        </div>

        <div className="space-y-4">
          {/* EMAIL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-gray-200 bg-gray-50/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#111111] text-[#f6c947] border border-[#111111] rounded-none flex items-center justify-center shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-[#111111] uppercase tracking-tight">Email Notifications</p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md mt-0.5">
                  Receive executive order summaries, daily settlement records, and critical security digests directly in your inbox.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleSetting('emailNotificationsEnabled')}
              className={`w-16 h-8 rounded-none relative transition-all duration-200 border-2 cursor-pointer shrink-0 ${
                settings.emailNotificationsEnabled 
                  ? 'bg-[#111111] border-[#111111]' 
                  : 'bg-gray-200 border-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-none transition-all duration-200 flex items-center justify-center font-black text-[9px] ${
                  settings.emailNotificationsEnabled 
                    ? 'right-0.5 bg-[#f6c947] text-[#111111]' 
                    : 'left-0.5 bg-white text-gray-400'
                }`}
              >
                {settings.emailNotificationsEnabled ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>

          {/* PUSH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-gray-200 bg-gray-50/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#111111] text-[#f6c947] border border-[#111111] rounded-none flex items-center justify-center shrink-0">
                <Zap size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-[#111111] uppercase tracking-tight">Real-time Browser Push Alerts</p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md mt-0.5">
                  Instant live sound and desktop notifications for inbound customer orders, seller verification queues, and dispute submissions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleSetting('pushNotificationsEnabled')}
              className={`w-16 h-8 rounded-none relative transition-all duration-200 border-2 cursor-pointer shrink-0 ${
                settings.pushNotificationsEnabled 
                  ? 'bg-[#111111] border-[#111111]' 
                  : 'bg-gray-200 border-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-none transition-all duration-200 flex items-center justify-center font-black text-[9px] ${
                  settings.pushNotificationsEnabled 
                    ? 'right-0.5 bg-[#f6c947] text-[#111111]' 
                    : 'left-0.5 bg-white text-gray-400'
                }`}
              >
                {settings.pushNotificationsEnabled ? 'ON' : 'OFF'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Event Specific Preferences */}
      <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-gray-200 shadow-xs space-y-6">
        <div className="border-b-2 border-gray-200 pb-5">
          <h3 className="text-xl font-black uppercase tracking-tight text-[#111111]">Event Trigger Filters</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Fine-tune granular notification triggers according to administrative role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'New Order Placed', desc: 'Trigger alert whenever a customer checks out successfully' },
            { label: 'Stock Level Alerts', desc: 'Notify when high-velocity products reach reorder thresholds' },
            { label: 'Customer Dispute Opened', desc: 'High priority alert for mediation case filings' },
            { label: 'Payout Processing', desc: 'Notifications on merchant revenue withdrawals and escrow cycles' },
            { label: 'Seller Verification Application', desc: 'Alert when a new merchant completes onboarding verification' },
            { label: 'Platform Security Warnings', desc: 'Critical alerts for login anomalies or 2FA resets' }
          ].map((item) => (
            <div 
              key={item.label} 
              onClick={() => toggleEventPreference(item.label)}
              className={`flex items-start gap-3.5 p-4 border-2 rounded-none transition-all cursor-pointer ${
                eventPreferences[item.label]
                  ? 'border-[#111111] bg-gray-50/80 shadow-2xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(eventPreferences[item.label])}
                onChange={() => {}} // Handled by parent container click
                className="mt-0.5 w-4 h-4 accent-[#111111] rounded-none cursor-pointer shrink-0"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-black text-[#111111] uppercase tracking-tight">{item.label}</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const subTabs = [
    { id: 'general', label: 'General & Commission', icon: <Store size={17} />, badge: 'Platform' },
    { id: 'payment', label: 'Payment Architecture', icon: <CreditCard size={17} />, badge: 'Gateways' },
    { id: 'notifications', label: 'Alerts & Channels', icon: <Bell size={17} />, badge: 'Events' },
    { id: 'security', label: 'Account & Security', icon: <Shield size={17} />, badge: '2FA' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
            Platform Administration Settings
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
            Configure system rules, revenue splits, security policies, and communications
          </p>
        </div>
      </div>

      {/* Grid: Sharp Navigation Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white border-2 border-gray-200 shadow-xs rounded-none p-2 space-y-1.5">
            <div className="px-3 py-2 border-b-2 border-gray-100 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Configuration Hub
              </span>
            </div>

            {subTabs.map((item) => {
              const active = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-l-4
                    ${active
                      ? 'bg-[#111111] text-[#f6c947] border-[#f6c947] shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-[#111111]'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={active ? 'text-[#f6c947]' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight size={13} className={active ? 'text-[#f6c947]' : 'text-gray-400'} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-3">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {activeSubTab === 'general' && renderGeneral()}
            {activeSubTab === 'payment' && renderPayments()}
            {activeSubTab === 'security' && renderSecurity()}
            {activeSubTab === 'notifications' && renderNotifications()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
