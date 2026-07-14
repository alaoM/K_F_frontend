"use client";
import React, { useState, useEffect } from 'react';
import { Save, Globe, Shield, Bell, CreditCard, Store, Lock, Smartphone, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import Security from '@/app/components/AdminComponents/Security';
import GeneralSettings from '@/app/components/AdminComponents/GeneralSettings';
import PaymentSettings from '@/app/components/AdminComponents/PaymentSettings';

const Settings: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [settings, setSettings] = useState({ emailNotificationsEnabled: true, pushNotificationsEnabled: true });

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
    <PaymentSettings />
  );

  const renderSecurity = () => (
    <Security />
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-[#e2e2e2] shadow-sm space-y-8">
        <div className="border-b border-[#e2e2e2] pb-6">
          <h3 className="text-xl font-black text-[#243e6b] uppercase tracking-tighter">Communication Channels</h3>
          <p className="text-sm text-gray-400 font-medium">Choose how you want to receive important updates from the platform.</p>
        </div>

        <div className="space-y-8">
          {/* EMAIL */}
          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"><Mail size={24} /></div>
              <div>
                <p className="text-md font-black text-[#243e6b] uppercase tracking-tight">Email Notifications</p>
                <p className="text-sm text-gray-400 font-medium max-w-xs">Receive detailed order summaries, sales reports, and customer insights directly to your inbox.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('emailNotificationsEnabled')}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${settings.emailNotificationsEnabled ? 'bg-[#243e6b]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.emailNotificationsEnabled ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          {/* PUSH */}
          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"><Bell size={24} /></div>
              <div>
                <p className="text-md font-black text-[#243e6b] uppercase tracking-tight">Real-time Push Alerts</p>
                <p className="text-sm text-gray-400 font-medium max-w-xs">Get instant browser notifications for new orders, customer messages, and critical system events.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('pushNotificationsEnabled')}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${settings.pushNotificationsEnabled ? 'bg-[#243e6b]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.pushNotificationsEnabled ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-[#e2e2e2] shadow-sm space-y-8">
        <div className="border-b border-[#e2e2e2] pb-6">
          <h3 className="text-xl font-black text-[#243e6b] uppercase tracking-tighter">Event-Specific Preferences</h3>
          <p className="text-sm text-gray-400 font-medium">Fine-tune your notification triggers for granular control.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'New Order Placed', desc: 'Alert when a customer makes a purchase' },
            { label: 'Stock Level Alerts', desc: 'Notify when products are running low' },
            { label: 'Customer Dispute', desc: 'Critical alert for opened disputes' },
            { label: 'Payout Processing', desc: 'Status updates on your revenue withdrawals' },
            { label: 'Platform Announcements', desc: 'Important news from the F&K team' },
            { label: 'Creator Insights', desc: 'Weekly analytics and growth tips' }
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 p-4 border border-gray-50 rounded-xl hover:border-[#243e6b]/20 transition-all bg-gray-50/50">
              <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 accent-[#243e6b] rounded cursor-pointer" />
              <div>
                <p className="text-sm font-bold text-[#243e6b] leading-none">{item.label}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const subTabs = [
    { id: 'general', label: 'General', icon: <Store size={18} /> },
    { id: 'payment', label: 'Payments', icon: <CreditCard size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#243e6b] uppercase tracking-tighter">Settings</h1>
          <p className="text-gray-400 font-medium">Orchestrate your store operations and account architecture.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-200">
            V2.4.0-Stable
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="space-y-2 bg-white p-4 rounded-2xl border border-[#e2e2e2] shadow-sm">
            {subTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                  ${activeSubTab === item.id
                    ? 'bg-[#243e6b] text-white shadow-xl shadow-blue-900/20 scale-[1.02]'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-[#243e6b]'}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
