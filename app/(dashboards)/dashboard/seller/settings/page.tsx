"use client";

export const dynamic = 'force-dynamic'
import React, { useEffect, useState } from 'react';
import { Shield, Bell, CreditCard, Store, Mail, MessageSquare, Loader2 } from 'lucide-react';
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

    // ✅ Load notification settings
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

    // ✅ Handle Toggle
    const handleToggle = async (key: 'emailNotificationsEnabled' | 'pushNotificationsEnabled') => {
        setUpdatingNotif(key);
        const newVal = !notifSettings[key];
        
        try {
            await fetcher('/api/notifications/settings', {
                method: 'PATCH',
                body: JSON.stringify({ [key]: newVal })
            });
            setNotifSettings(prev => ({ ...prev, [key]: newVal }));
            toast.success("Settings updated");
        } catch (error) {
            toast.error("Failed to update setting");
        } finally {
            setUpdatingNotif(null);
        }
    };

    const renderNotifications = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#e2e2e2] shadow-sm space-y-6">
                <h3 className="font-bold text-[#243e6b] border-b border-[#e2e2e2] pb-4">Notification Channels</h3>
                
                {loadingNotifs ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-[#243e6b]" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail size={20} /></div>
                                <div>
                                    <p className="text-sm font-bold text-[#243e6b]">Email Notifications</p>
                                    <p className="text-xs text-gray-500">Receive order updates and reports via email.</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => updatingNotif !== 'emailNotificationsEnabled' && handleToggle('emailNotificationsEnabled')}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notifSettings.emailNotificationsEnabled ? 'bg-[#243e6b]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notifSettings.emailNotificationsEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                                {updatingNotif === 'emailNotificationsEnabled' && <div className="absolute -right-6 top-0"><Loader2 size={12} className="animate-spin" /></div>}
                            </div>
                        </div>

                        {/* Push */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Bell size={20} /></div>
                                <div>
                                    <p className="text-sm font-bold text-[#243e6b]">Push Notifications</p>
                                    <p className="text-xs text-gray-500">In-browser notifications for new orders.</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => updatingNotif !== 'pushNotificationsEnabled' && handleToggle('pushNotificationsEnabled')}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notifSettings.pushNotificationsEnabled ? 'bg-[#243e6b]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notifSettings.pushNotificationsEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                                {updatingNotif === 'pushNotificationsEnabled' && <div className="absolute -right-6 top-0"><Loader2 size={12} className="animate-spin" /></div>}
                            </div>
                        </div>

                        {/* SMS (Placeholder) */}
                        <div className="flex items-center justify-between opacity-50 grayscale">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><MessageSquare size={20} /></div>
                                <div>
                                    <p className="text-sm font-bold text-[#243e6b]">SMS Alerts (Coming Soon)</p>
                                    <p className="text-xs text-gray-500">Get critical alerts sent to your phone.</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-not-allowed">
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                )}
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-[#243e6b]">Settings</h1>
                <p className="text-gray-500 text-sm">Configure your store preferences and account details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <nav className="flex flex-col gap-2">
                        {subTabs.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSubTab(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                                    ${activeSubTab === item.id
                                        ? 'bg-[#243e6b] text-white shadow-lg translate-x-1'
                                        : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-[#243e6b]'}
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="md:col-span-3">
                    {activeSubTab === 'general' && <GeneralSettings />}
                    {activeSubTab === 'payment' && <PaymentSettings />}
                    {activeSubTab === 'security' && <Security />}
                    {activeSubTab === 'notifications' && renderNotifications()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
