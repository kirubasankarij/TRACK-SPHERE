import React, { useState, useEffect } from 'react';
import TrackingMap from '../components/tracking/TrackingMap';
import StatusTimeline from '../components/tracking/StatusTimeline';
import { useTracking } from '../hooks/useTracking';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

// Normalized multi-carrier status model
const STATUS_LEGEND = [
    { code: 'pending', label: 'Pending', icon: '⏳', color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
    { code: 'in-transit', label: 'In Transit', icon: '🚚', color: 'bg-primary/10 text-primary border border-primary/20' },
    { code: 'out-for-delivery', label: 'Out for Delivery', icon: '🚀', color: 'bg-secondary/10 text-secondary border border-secondary/20' },
    { code: 'awaiting-customs', label: 'Awaiting Customs', icon: '🛃', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
    { code: 'delayed', label: 'Delayed', icon: '⚠️', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
    { code: 'delivered', label: 'Delivered', icon: '✅', color: 'bg-accent/10 text-accent border border-accent/20' },
];

const DEMO_IDS = ['TF-DEMO-001', 'TF-DEMO-002', 'TF-DEMO-003'];

const TrackShipment = () => {
    const [searchParams] = useSearchParams();
    const initialId = searchParams.get('id') || '';

    const [trackingInput, setTrackingInput] = useState(initialId);
    const [searchId, setSearchId] = useState(initialId || null);
    const [copied, setCopied] = useState(false);
    const { shipment, loading, error } = useTracking(searchId);
    const [delayNotifications, setDelayNotifications] = useState([]);
    const [dismissedDelay, setDismissedDelay] = useState(false);

    // Fetch delay notifications for this shipment whenever tracking result changes
    useEffect(() => {
        setDismissedDelay(false);
        if (!searchId) { setDelayNotifications([]); return; }
        fetch(`/api/notifications?role=customer&trackingNumber=${searchId}`)
            .then(r => r.json())
            .then(d => setDelayNotifications(d.notifications || []))
            .catch(() => setDelayNotifications([]));
    }, [searchId, shipment]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (!trackingInput.trim()) { 
            toast.error('Please enter a tracking ID');
            return;
        }
        setSearchId(trackingInput);
    };

    const handleCopyLink = () => {
        if (!searchId) return;
        navigator.clipboard.writeText(`${window.location.origin}/track?id=${searchId}`);
        setCopied(true);
        toast.success('Tracking link copied!');
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-16 md:pb-20 px-4 md:px-0">
            {/* Search Header */}
            <div className="glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8">
                <div className="w-full md:w-auto">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                        Track <span className="text-primary">Shipment</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-sm md:text-base">Live evolution & AI intelligence</p>
                </div>
                <div className="w-full md:w-auto space-y-4">
                    <form onSubmit={handleSearch} className="flex p-1.5 md:p-2 bg-ai-navbar/50 border border-white/5 rounded-2xl w-full md:w-96">
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Enter ID (e.g. TF-TN-DEMO)..."
                            className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none text-white placeholder-gray-600"
                        />
                        <button type="submit" className="btn-primary text-sm py-2 px-6" disabled={loading}>
                            {loading ? '...' : 'Find'}
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Demo nodes:</span>
                        {DEMO_IDS.map(id => (
                            <button 
                                key={id} 
                                onClick={() => { setTrackingInput(id); setSearchId(id); }}
                                className="text-[10px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-gray-400 hover:border-primary hover:text-primary transition"
                            >
                                {id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="glass-card text-center py-10 border-red-500/20 bg-red-500/5">
                    <p className="text-red-400 font-bold">Shipment node not found. Verify identifier.</p>
                </div>
            )}

            {/* ── Auto Delay Alert Banner ── */}
            {shipment && !dismissedDelay && (shipment.predictedDelay > 0 || shipment.delayProbability >= 30) && (
                <div className="flex items-start gap-4 p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-md animate-in fade-in slide-in-from-top-2 duration-500">
                    <span className="text-2xl shrink-0 animate-bounce">⚠️</span>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-amber-200 text-sm md:text-base">
                            Delay Detected — Shipment {shipment.trackingNumber}
                        </p>
                        <p className="text-amber-400 text-xs md:text-sm font-medium mt-1">
                            {shipment.predictedDelay > 0
                                ? `A delay of ~${shipment.predictedDelay} minutes is predicted. `
                                : ''}
                            {shipment.delayProbability >= 30
                                ? `Delay probability: ${shipment.delayProbability}%. `
                                : ''}
                            Our team has been automatically notified and is working to resolve this.
                        </p>
                        <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-2">
                            📧 Notification sent to admin &amp; your registered contact
                        </p>
                    </div>
                    <button
                        onClick={() => setDismissedDelay(true)}
                        className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs transition-colors"
                        title="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 animate-pulse">
                    <div className="text-4xl mb-4">🛸</div>
                    <p className="text-gray-400 font-bold">Synchronizing with AI nodes...</p>
                </div>
            ) : shipment ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                    {/* Left Column: Map and Core Info */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        {/* Map Section */}
                        <div className="glass-card p-0 overflow-hidden relative group h-[350px] md:h-[500px] border-white/5">
                            <div className="absolute top-4 left-4 z-10 space-y-2">
                                <div className="bg-ai-navbar/90 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-500 uppercase leading-none mb-1">Status</p>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{shipment.status}</p>
                                </div>
                                <div className="bg-ai-navbar/90 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                    <p className="text-[10px] font-black text-white/80 uppercase leading-none mb-1">Last seen</p>
                                    <p className="text-xs font-bold text-white">{shipment.lastLocation || 'Central Sorting'}</p>
                                </div>
                                {shipment.assignedVehicle && (
                                    <div className="bg-ai-navbar/90 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                        <p className="text-[10px] font-black text-white/80 uppercase leading-none mb-1">Vehicle</p>
                                        <p className="text-xs font-bold text-accent uppercase tracking-wider">{shipment.assignedVehicle.plateNumber}</p>
                                    </div>
                                )}
                            </div>
                            <TrackingMap shipments={[shipment]} />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card hover:border-primary/20 transition-all bg-ai-card/40 border-white/5">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="text-lg">📦</span> Ship-to Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <span className="text-xs font-bold text-gray-500">Recipient</span>
                                        <span className="text-sm font-black text-white">{shipment.receiver?.name}</span>
                                    </div>
                                    <div className="pb-3 border-b border-white/5">
                                        <span className="text-xs font-bold text-gray-500 block mb-1">Destination</span>
                                        <span className="text-sm font-bold text-gray-300 leading-relaxed">{shipment.receiver?.address}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Security check</span>
                                        <span className="text-accent">OTP PROTECTED</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card hover:border-primary/20 transition-all bg-ai-card/40 border-white/5">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="text-lg">🚚</span> Operator Details
                                </h3>
                                {shipment.assignedDriver ? (
                                    <div className="flex items-center gap-4">
                                        {shipment.assignedDriver.avatar ? (
                                            <img src={shipment.assignedDriver.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover bg-white/5 shadow-inner" />
                                        ) : (
                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner uppercase">
                                                {shipment.assignedDriver.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-black text-white truncate">{shipment.assignedDriver.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-primary font-bold">★ {shipment.assignedDriver.rating} Rating</p>
                                                {shipment.assignedVehicle && (
                                                    <p className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400 font-black tracking-tighter uppercase">
                                                        {shipment.assignedVehicle.plateNumber}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-black flex items-center gap-1 mt-1">
                                                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                                                COMM-LINK ACTIVE
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 font-bold py-4 italic">Assigning operator...</p>
                                )}
                            </div>
                        </div>

                        {/* Shared Link */}
                        <div className="glass-card flex flex-col md:flex-row items-center gap-4 p-4 md:p-6 bg-ai-navbar/30 border-white/5">
                            <div className="flex-1 min-w-0 w-full">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Shareable Node Link</p>
                                <p className="text-xs font-bold text-gray-500 truncate">{window.location.origin}/track?id={searchId}</p>
                            </div>
                            <button onClick={handleCopyLink} className="w-full md:w-auto btn-primary px-6 py-2.5 text-xs font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary-dark">
                                {copied ? '✓ COPIED' : 'COPY LINK'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: AI & Timeline */}
                    <div className="space-y-6 md:space-y-8">
                        {/* AI Intelligence Card */}
                        <div className="glass-card bg-ai-card border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Neural Engine</h3>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                                        <div className="w-1 h-1 bg-primary rounded-full animate-ping delay-75" />
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-white mb-1">AI Intelligence</h4>
                                <p className="text-[10px] text-gray-500 font-black mb-8 tracking-widest uppercase">Telemetry Analysis</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-gray-500 uppercase">Delay Prop.</span>
                                            <span className={`text-xs font-black ${shipment.delayProbability > 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {shipment.delayProbability || 0}%
                                            </span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${shipment.delayProbability > 50 ? 'bg-red-500' : 'bg-yellow-400'}`}
                                                style={{ width: `${shipment.delayProbability || 0}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                                        <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Neural Insight</p>
                                        <p className="text-xs text-gray-300 font-medium leading-relaxed italic">
                                            "{shipment.aiAnalysis?.insight || "Analyzing route telemetry for optimal trajectory..."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comm-Link notifications */}
                        <div className="glass-card p-6 bg-ai-card/40 border-white/5">
                             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Comm-Link</h3>
                             <div className="space-y-4">
                                 {shipment.notifications?.length > 0 ? (
                                     shipment.notifications.map((n, i) => (
                                         <div key={i} className="flex gap-3 text-xs">
                                             <span className="text-primary">⦿</span>
                                             <div>
                                                 <p className="font-black text-white">{n.message}</p>
                                                 <p className="text-[10px] text-gray-500 font-bold mt-1">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                             </div>
                                         </div>
                                     ))
                                 ) : (
                                     <p className="text-xs text-gray-500 italic">No recent comms.</p>
                                 )}
                             </div>
                        </div>

                        {/* Journey Evolution */}
                        <div className="glass-card bg-ai-card/40 border-white/5">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-8 text-white">Evolution</h3>
                            <StatusTimeline history={shipment.history} />
                        </div>

                        {/* Auto-Sent Delay Notifications for this Shipment */}
                        {delayNotifications.length > 0 && (
                            <div className="glass-card bg-ai-card/40 border-white/5">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span>🔔</span> Delay Notifications
                                </h3>
                                <div className="space-y-3">
                                    {delayNotifications.slice(0, 5).map((n, i) => (
                                        <div key={n._id || i} className="flex gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                            <span className="text-red-400 shrink-0 text-sm">🚨</span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-200 leading-relaxed">{n.message}</p>
                                                <p className="text-[10px] text-gray-500 font-bold mt-1">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : error ? null : (
                <div className="glass-card text-center py-20 bg-ai-card/40 border-white/5">
                    <div className="text-6xl mb-6">🛰️</div>
                    <h3 className="text-2xl font-black text-white mb-2">Initialize Node</h3>
                    <p className="text-gray-400 font-medium">Input a valid shipment identifier to bridge with tracking nodes.</p>
                </div>
            )}
        </div>
    );
};

export default TrackShipment;
