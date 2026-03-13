import React, { useState } from 'react';
import TrackingMap from '../components/tracking/TrackingMap';
import StatusTimeline from '../components/tracking/StatusTimeline';
import { useTracking } from '../hooks/useTracking';
import { toast } from 'react-hot-toast';

// Normalized multi-carrier status model
const STATUS_LEGEND = [
    { code: 'pending', label: 'Pending', icon: '⏳', color: 'bg-yellow-100 text-yellow-700' },
    { code: 'in-transit', label: 'In Transit', icon: '🚚', color: 'bg-blue-100 text-blue-700' },
    { code: 'out-for-delivery', label: 'Out for Delivery', icon: '🚀', color: 'bg-orange-100 text-orange-700' },
    { code: 'awaiting-customs', label: 'Awaiting Customs', icon: '🛃', color: 'bg-purple-100 text-purple-700' },
    { code: 'delayed', label: 'Delayed', icon: '⚠️', color: 'bg-red-100 text-red-700' },
    { code: 'delivered', label: 'Delivered', icon: '✅', color: 'bg-green-100 text-green-700' },
];

const DEMO_IDS = ['TF-TN-DEMO', 'TF-DEMO-001', 'TRK-DEMO-2002'];

const TrackShipment = () => {
    const [trackingInput, setTrackingInput] = useState('');
    const [searchId, setSearchId] = useState(null);
    const [copied, setCopied] = useState(false);
    const { shipment, loading, error } = useTracking(searchId);

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
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
                        Track <span className="text-blue-600">Shipment</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Live evolution & AI intelligence</p>
                </div>
                <div className="w-full md:w-auto space-y-4">
                    <form onSubmit={handleSearch} className="flex p-1.5 md:p-2 bg-gray-100 rounded-2xl w-full md:w-96">
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Enter ID (e.g. TF-TN-DEMO)..."
                            className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none"
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
                                className="text-[10px] px-2.5 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
                            >
                                {id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="glass-card text-center py-10 border-red-100 bg-red-50/50">
                    <p className="text-red-600 font-bold">Shipment node not found. Verify identifier.</p>
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
                        <div className="glass-card p-0 overflow-hidden relative group h-[350px] md:h-[500px]">
                            <div className="absolute top-4 left-4 z-10 space-y-2">
                                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Status</p>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{shipment.status}</p>
                                </div>
                                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Last seen</p>
                                    <p className="text-xs font-bold text-gray-800">{shipment.lastLocation || 'Central Sorting'}</p>
                                </div>
                            </div>
                            <TrackingMap shipments={[shipment]} />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card hover:border-blue-200 transition-all bg-white">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="text-lg">📦</span> Ship-to Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                        <span className="text-xs font-bold text-gray-400">Recipient</span>
                                        <span className="text-sm font-black text-gray-800">{shipment.receiver?.name}</span>
                                    </div>
                                    <div className="pb-3 border-b border-gray-50">
                                        <span className="text-xs font-bold text-gray-400 block mb-1">Destination</span>
                                        <span className="text-sm font-bold text-gray-600 leading-relaxed">{shipment.receiver?.address}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                                        <span>Security check</span>
                                        <span className="text-green-600">OTP PROTECTED</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card hover:border-blue-200 transition-all bg-white">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="text-lg">🚚</span> Operator Details
                                </h3>
                                {shipment.assignedDriver ? (
                                    <div className="flex items-center gap-4">
                                        <img src={shipment.assignedDriver.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover bg-gray-100 shadow-inner" />
                                        <div className="min-w-0">
                                            <p className="font-black text-gray-800 truncate">{shipment.assignedDriver.name}</p>
                                            <p className="text-xs text-blue-600 font-bold mb-1">★ {shipment.assignedDriver.rating} Rating</p>
                                            <p className="text-[10px] text-gray-400 font-black flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                COMM-LINK ACTIVE
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 font-bold py-4 italic">Assigning operator...</p>
                                )}
                            </div>
                        </div>

                        {/* Shared Link */}
                        <div className="glass-card flex flex-col md:flex-row items-center gap-4 p-4 md:p-6 bg-blue-50/50 border-blue-100">
                            <div className="flex-1 min-w-0 w-full">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Shareable Node Link</p>
                                <p className="text-xs font-bold text-gray-500 truncate">{window.location.origin}/track?id={searchId}</p>
                            </div>
                            <button onClick={handleCopyLink} className="w-full md:w-auto btn-primary px-6 py-2.5 text-xs font-black shadow-lg shadow-blue-500/20">
                                {copied ? '✓ COPIED' : 'COPY LINK'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: AI & Timeline */}
                    <div className="space-y-6 md:space-y-8">
                        {/* AI Intelligence Card */}
                        <div className="glass-card bg-gray-900 border-none shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Neural Engine</h3>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping delay-75" />
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
                        <div className="glass-card p-6 bg-white">
                             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Comm-Link</h3>
                             <div className="space-y-4">
                                 {shipment.notifications?.length > 0 ? (
                                     shipment.notifications.map((n, i) => (
                                         <div key={i} className="flex gap-3 text-xs">
                                             <span className="text-blue-500">⦿</span>
                                             <div>
                                                 <p className="font-black text-gray-800">{n.message}</p>
                                                 <p className="text-[10px] text-gray-400 font-bold mt-1">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                             </div>
                                         </div>
                                     ))
                                 ) : (
                                     <p className="text-xs text-gray-400 italic">No recent comms.</p>
                                 )}
                             </div>
                        </div>

                        {/* Journey Evolution */}
                        <div className="glass-card bg-white">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Evolution</h3>
                            <StatusTimeline history={shipment.history} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-card text-center py-20 bg-white">
                    <div className="text-6xl mb-6">🛰️</div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Initialize Node</h3>
                    <p className="text-gray-500 font-medium">Input a valid shipment identifier to bridge with tracking nodes.</p>
                </div>
            )}
        </div>
    );
};

export default TrackShipment;
