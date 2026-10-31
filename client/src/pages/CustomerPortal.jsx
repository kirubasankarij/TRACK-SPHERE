import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CustomerPortal = () => {
    const { quickLogin, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const shareableUrl = `${window.location.protocol}//${window.location.host}/portal/customer`;

    const handleLaunch = async () => {
        setLoading(true);
        const res = await quickLogin('customer', true);
        setLoading(false);
        if (res.success) {
            toast.success('📦 Logged in as Demo Customer!');
            navigate('/dashboard');
        } else {
            toast.error('Failed to log into Customer Portal');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareableUrl);
        toast.success('📋 Customer Portal link copied! Share this link to open on another device.');
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full glass-card border-cyan-500/30 shadow-2xl p-8 md:p-12 relative overflow-hidden rounded-3xl bg-[#0F172A]/90 backdrop-blur-xl">
                {/* Top Glowing Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-lg" />
                
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        Customer Tracking Portal
                    </div>
                    <span className="text-xs text-gray-400 font-mono">ROLE: DEMO_CUSTOMER</span>
                </div>

                {/* Main Hero Icon & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-5 rounded-3xl bg-cyan-500/10 text-cyan-400 mb-4 shadow-inner border border-cyan-500/20">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Customer Self-Service Gateway</h1>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Live shipment tracking, AI delivery ETA predictions, OTP drop-off codes, and support desk.
                    </p>
                </div>

                {/* Features Checklist */}
                <div className="grid grid-cols-2 gap-3 mb-8 text-xs font-medium text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400">✓</span> Real-Time Package Location Tracking
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400">✓</span> AI Smart Delay & Weather Insight
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400">✓</span> Secure OTP Delivery Confirmation
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400">✓</span> Create New Dispatch Requests
                    </div>
                </div>

                {/* Quick Driver & Shipment Tracker Box */}
                <div className="bg-cyan-950/40 rounded-2xl p-5 border border-cyan-500/30 mb-8 space-y-3">
                    <label className="block text-xs font-black text-cyan-300 uppercase tracking-widest">
                        🔍 Track Driver &amp; Package by Tracker ID
                    </label>
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            const id = e.target.trackerId.value.trim();
                            if (id) navigate(`/track?id=${id}`);
                            else toast.error('Please enter a valid Tracker ID');
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            name="trackerId"
                            placeholder="Enter Tracker ID (e.g. TF-DEMO-001)..."
                            className="flex-1 bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
                        >
                            Track Driver
                        </button>
                    </form>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-[10px] font-bold text-gray-400">Quick Track:</span>
                        {[
                            { id: 'TF-TN-DEMO', label: '🚚 Chennai → Coimbatore' },
                            { id: 'TF-DEMO-001', label: '🚚 Bengaluru → Madurai' },
                            { id: 'TRK-DEMO-2002', label: '🚚 Mumbai → Pune' }
                        ].map(pkg => (
                            <button
                                key={pkg.id}
                                type="button"
                                onClick={() => navigate(`/track?id=${pkg.id}`)}
                                className="text-[10px] px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold transition-all"
                            >
                                {pkg.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                        Enter any Tracker ID above or tap a shipment to locate your delivery truck live in India.
                    </p>
                </div>

                {/* Preset Credentials Box */}
                <div className="bg-black/40 rounded-2xl p-4 border border-cyan-500/20 mb-8 font-mono text-xs">
                    <div className="flex justify-between items-center text-gray-400 mb-2">
                        <span>Preset Customer Account:</span>
                        <span className="text-cyan-400 font-bold">Pre-Configured</span>
                    </div>
                    <div className="text-gray-200 font-semibold">Email: <span className="text-cyan-300">customer@tracksphere.com</span></div>
                    <div className="text-gray-200 font-semibold">Password: <span className="text-cyan-300">password123</span></div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleLaunch}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-base hover:brightness-110 transition-all shadow-xl shadow-cyan-500/25 active:scale-98 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Authenticating...' : '📦 Launch Customer Portal'}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            🔗 Copy Shareable Link
                        </button>
                        <a
                            href={shareableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 rounded-xl bg-white/5 border border-white/10 text-cyan-400 font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            ↗ Open in New Window
                        </a>
                    </div>
                </div>

                {/* Connected status if already logged in */}
                {user?.role === 'customer' && (
                    <div className="mt-6 text-center text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 py-2 rounded-xl">
                        🟢 Currently Authenticated as {user.name} ({user.email})
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerPortal;
