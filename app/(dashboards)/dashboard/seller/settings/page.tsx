'use client';

export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { Shield, Bell, CreditCard, Store, Mail, MessageSquare, Loader2, ChevronRight, Zap } from 'lucide-react';
import Security from '@/app/components/AdminComponents/Security';
import GeneralSettings from '@/app/components/AdminComponents/GeneralSettings';
import PaymentSettings from '@/app/components/AdminComponents/PaymentSettings';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';

const Settings: React.FC = () => {
  const fetcher = useApi();
  const [activeSubTab, setActiveSubTab] = useState('general');

  // Notification Settings State
  const [notifSettings, setNotifSettings] = useState({
    emailNotificationsEnabled: false,
    pushNotificationsEnabled: false
  });
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [updatingNotif, setUpdatingNotif] = useState<string | null>(null);

  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetcher('/api/notifications/settings');
        if (res) {
          setNotifSettings({
            emailNotificationsEnabled: !!res.emailNotificationsEnabled,
            pushNotificationsEnabled: !!res.pushNotificationsEnabled
          });
        }
      } catch (error) {
        console.error("Failed to load notification settings", error);
      } finally {
        setLoadingNotifs(false);
      }
    };
    loadSettings();
  }, [fetcher]);

  // Handle Toggle
  const handleToggle = async (key: 'emailNotificationsEnabled' | 'pushNotificationsEnabled') => {
    setUpdatingNotif(key);
    const newVal = !notifSettings[key];

    try {
      await fetcher('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal })
      });
      setNotifSettings(prev => ({ ...prev, [key]: newVal }));
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update notification setting");
    } finally {
      setUpdatingNotif(null);
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-gray-200 shadow-xs space-y-6">
        <div className="border-b-2 border-gray-200 pb-5">
          <div className="flex items-center gap-2 text-[#111111] mb-1">
            <Bell size={20} className="text-[#f6c947]" />
            <h3 className="text-xl font-black uppercase tracking-tight">Merchant Notification Channels</h3>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Choose how you receive live order alerts, settlement receipts, and customer messages.
          </p>
        </div>

        {loadingNotifs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#111111]" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-gray-200 bg-gray-50/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#111111] text-[#f6c947] border border-[#111111] rounded-none flex items-center justify-center shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#111111] uppercase tracking-tight">Email Notifications</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md mt-0.5">
                    Receive invoices, payout confirmations, and order manifest summaries to your registered email.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updatingNotif !== 'emailNotificationsEnabled' && handleToggle('emailNotificationsEnabled')}
                disabled={updatingNotif === 'emailNotificationsEnabled'}
                className={`w-16 h-8 rounded-none relative transition-all duration-200 border-2 cursor-pointer shrink-0 ${
                  notifSettings.emailNotificationsEnabled 
                    ? 'bg-[#111111] border-[#111111]' 
                    : 'bg-gray-200 border-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-none transition-all duration-200 flex items-center justify-center font-black text-[9px] ${
                    notifSettings.emailNotificationsEnabled 
                      ? 'right-0.5 bg-[#f6c947] text-[#111111]' 
                      : 'left-0.5 bg-white text-gray-400'
                  }`}
                >
                  {updatingNotif === 'emailNotificationsEnabled' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : notifSettings.emailNotificationsEnabled ? 'ON' : 'OFF'}
                </div>
              </button>
            </div>

            {/* Push */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-gray-200 bg-gray-50/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#111111] text-[#f6c947] border border-[#111111] rounded-none flex items-center justify-center shrink-0">
                  <Zap size={22} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#111111] uppercase tracking-tight">Browser Push Notifications</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md mt-0.5">
                    Get instant audio & visual notifications the second a shopper places an order or raises a dispute.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updatingNotif !== 'pushNotificationsEnabled' && handleToggle('pushNotificationsEnabled')}
                disabled={updatingNotif === 'pushNotificationsEnabled'}
                className={`w-16 h-8 rounded-none relative transition-all duration-200 border-2 cursor-pointer shrink-0 ${
                  notifSettings.pushNotificationsEnabled 
                    ? 'bg-[#111111] border-[#111111]' 
                    : 'bg-gray-200 border-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-none transition-all duration-200 flex items-center justify-center font-black text-[9px] ${
                    notifSettings.pushNotificationsEnabled 
                      ? 'right-0.5 bg-[#f6c947] text-[#111111]' 
                      : 'left-0.5 bg-white text-gray-400'
                  }`}
                >
                  {updatingNotif === 'pushNotificationsEnabled' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : notifSettings.pushNotificationsEnabled ? 'ON' : 'OFF'}
                </div>
              </button>
            </div>

            {/* SMS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-gray-200 bg-gray-50/50 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-none flex items-center justify-center shrink-0">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-[#111111] uppercase tracking-tight">SMS Dispatch Alerts</p>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-black uppercase">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md mt-0.5">
                    Direct SMS messages for courier dispatch confirmation and driver handover.
                  </p>
                </div>
              </div>

              <div className="w-16 h-8 rounded-none bg-gray-200 border-2 border-gray-300 relative cursor-not-allowed opacity-50 shrink-0">
                <div className="absolute top-0.5 left-0.5 w-6 h-6 rounded-none bg-white flex items-center justify-center font-black text-[9px] text-gray-400">
                  OFF
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const subTabs = [
    { id: 'general', label: 'Store Profile', icon: <Store size={17} /> },
    { id: 'payment', label: 'Payout & Banking', icon: <CreditCard size={17} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={17} /> },
    { id: 'security', label: 'Security & 2FA', icon: <Shield size={17} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
            Store & Account Settings
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">
            Manage your storefront branding, settlement bank accounts, and security preferences
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
                Settings Menu
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
            {activeSubTab === 'general' && <GeneralSettings />}
            {activeSubTab === 'payment' && <PaymentSettings />}
            {activeSubTab === 'security' && <Security />}
            {activeSubTab === 'notifications' && renderNotifications()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
