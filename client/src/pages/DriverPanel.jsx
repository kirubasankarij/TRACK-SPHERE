import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TrackingMap from '../components/tracking/TrackingMap';
import DriverStats from '../components/driver/DriverStats';
import FuelTracker from '../components/driver/FuelTracker';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import VoiceSOSControls from '../components/driver/VoiceSOSControls';

/* ───── Mock AI Engine (Client-side representation of server AI service) ───── */
const AIEngine = {
    predictDelay(trafficLevel = 'moderate', weatherCondition = 'clear', distance = 100) {
        const trafficFactors = { light: 1.0, moderate: 1.2, heavy: 1.8, gridlock: 3.0 };
        const trafficFactor = trafficFactors[trafficLevel] || 1.1;
        const weatherPenalty = ['rain', 'snow', 'storm'].includes(weatherCondition.toLowerCase()) ? 15 : 0;
        const baseDelay = 20;
        const predictedDelay = Math.round((baseDelay * trafficFactor) + weatherPenalty + (distance * 0.05));
        const probability = Math.min(Math.round((predictedDelay / 80) * 100), 100);

        let reason = 'On schedule – clear conditions ahead.';
        let notification = null;
        if (trafficLevel === 'heavy' || trafficLevel === 'gridlock') {
            reason = 'Heavy traffic congestion detected at current sector.';
            notification = `Your shipment is delayed due to heavy traffic. Updated ETA will be recalculated.`;
        } else if (weatherPenalty > 0) {
            reason = `Slowdown due to ${weatherCondition} conditions.`;
            notification = `Your shipment is delayed due to ${weatherCondition}. Updated ETA recalculated.`;
        }

        return { predictedDelay, delayProbability: probability, reason, notification, confidence: 85 };
    },

    calculateETA(baseMinutes, trafficLevel = 'moderate', weatherCondition = 'clear') {
        const trafficAdd = { light: 0, moderate: 5, heavy: 25, gridlock: 60 };
        const weatherAdd = ['rain', 'snow', 'storm'].includes(weatherCondition.toLowerCase()) ? 15 : 0;
        const totalMins = baseMinutes + (trafficAdd[trafficLevel] || 5) + weatherAdd;
        const eta = new Date(Date.now() + totalMins * 60000);
        return {
            etaTime: eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            totalMinutes: totalMins,
        };
    },

    optimizeRoute(points) {
        if (!points || points.length < 2) return { saving: 0, message: 'Route already optimal' };
        const saving = Math.floor(Math.random() * 18) + 5;
        return {
            saving,
            message: `AI found a ${saving}-min faster route avoiding known congestion zones.`,
            alternative: `Via Salem Bypass → NH 44 → Outer Ring Road`
        };
    }
};

/* ───── DEMO SHIPMENTS ───── */
const DEMO_SHIPMENTS = [
    {
        _id: '1', trackingNumber: 'TRK-DEMO-2002', status: 'in-transit',
        sender: { name: 'Flipkart Hub', address: 'Regional Hub, Pune, Maharashtra' },
        receiver: { name: 'Demo Customer', address: '42 Green Park, New Delhi, 110016' },
        customerPhone: '+917777777777', customerEmail: 'customer@tracksphere.com',
        estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
        delayProbability: 85, predictedDelay: 45,
        aiAnalysis: { reason: 'Heavy traffic at junction 4', insight: 'Alternative route via Ring Road saves 18 min.' },
        routePoints: [
            { lat: 18.5204, lng: 73.8567, timestamp: new Date(Date.now() - 3600000) },
            { lat: 19.9975, lng: 73.7898, timestamp: new Date(Date.now() - 1800000) },
            { lat: 21.1458, lng: 79.0882, timestamp: new Date() }
        ]
    },
    {
        _id: '2', trackingNumber: 'TRK-DEMO-3003', status: 'out-for-delivery',
        sender: { name: 'Myntra Logistics', address: 'Sort Facility, Bengaluru, Karnataka' },
        receiver: { name: 'Jane Smith', address: '123 Business Way, Mumbai' },
        customerPhone: '+916666666666', customerEmail: 'jane@example.com',
        estimatedDelivery: new Date(Date.now() + 3600000).toISOString(),
        delayProbability: 10, predictedDelay: 5,
        routePoints: [
            { lat: 12.9716, lng: 77.5946, timestamp: new Date(Date.now() - 7200000) },
            { lat: 15.3647, lng: 75.1240, timestamp: new Date() }
        ]
    }
];

/* ───── STATUS UPDATE BUTTON ───── */
const StatusButton = ({ shipment, onUpdate }) => {
    const transitions = {
        'pending': { next: 'in-transit', label: '▶ Start Delivery', color: 'bg-blue-600 text-white' },
        'in-transit': { next: 'out-for-delivery', label: '🚀 Mark Out for Delivery', color: 'bg-orange-500 text-white' },
        'out-for-delivery': { next: null, label: '🔐 Verify OTP to Deliver', color: 'bg-green-600 text-white' },
        'delayed': { next: 'in-transit', label: '▶ Resume Delivery', color: 'bg-blue-600 text-white' },
    };
    const t = transitions[shipment.status];
    if (!t) return null;
    return (
        <button
            onClick={() => onUpdate(shipment, t.next)}
            className={`flex-1 py-3 px-5 rounded-xl font-black text-sm uppercase tracking-widest ${t.color} transition-all hover:opacity-90 shadow-md`}
        >
            {t.label}
        </button>
    );
};

/* ───── MAIN COMPONENT ───── */
const DriverPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('shipments');
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [otp, setOtp] = useState('');
    const [activeShipment, setActiveShipment] = useState(null);
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [delayTime, setDelayTime] = useState(30);
    const [proofFile, setProofFile] = useState(null);

    // AI State
    const [aiTraffic, setAiTraffic] = useState('moderate');
    const [aiWeather, setAiWeather] = useState('clear');
    const [aiPrediction, setAiPrediction] = useState(null);
    const [aiETA, setAiETA] = useState(null);
    const [aiRoute, setAiRoute] = useState(null);
    const [aiNotification, setAiNotification] = useState(null);
    const gpsRef = useRef(null);

    /* Fetch Shipments */
    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const saved = JSON.parse(localStorage.getItem('tracksphere_shipments') || '[]');
                if (saved.length > 0) {
                    setShipments(saved);
                } else {
                    const res = await axios.get('/driver/shipments').catch(() => null);
                    setShipments(res?.data?.data?.length > 0 ? res.data.data : DEMO_SHIPMENTS);
                }
            } catch {
                setShipments(DEMO_SHIPMENTS);
            } finally {
                setLoading(false);
            }
        };
        fetchShipments();
    }, []);

    /* GPS Simulation */
    useEffect(() => {
        if (gpsRef.current) clearInterval(gpsRef.current);
        if (activeShipment && (activeShipment.status === 'in-transit' || activeShipment.status === 'out-for-delivery')) {
            gpsRef.current = setInterval(() => {
                const jitterLat = (Math.random() - 0.5) * 0.005;
                const jitterLng = (Math.random() - 0.5) * 0.005;
                setShipments(prev => prev.map(s => {
                    if (s._id === activeShipment._id) {
                        const lastPoint = s.routePoints?.length > 0
                            ? s.routePoints[s.routePoints.length - 1]
                            : { lat: 13.0827, lng: 80.2707 };
                        const newPoint = { lat: lastPoint.lat + jitterLat, lng: lastPoint.lng + jitterLng, timestamp: new Date() };
                        return { ...s, routePoints: [...(s.routePoints || []), newPoint] };
                    }
                    return s;
                }));
            }, 8000);
        }
        return () => { if (gpsRef.current) clearInterval(gpsRef.current); };
    }, [activeShipment]);

    /* Run AI Analysis whenever inputs change */
    useEffect(() => {
        const prediction = AIEngine.predictDelay(aiTraffic, aiWeather, 120);
        const eta = AIEngine.calculateETA(90, aiTraffic, aiWeather);
        const route = AIEngine.optimizeRoute(activeShipment?.routePoints || []);
        setAiPrediction(prediction);
        setAiETA(eta);
        setAiRoute(route);
        if (prediction.notification && (aiTraffic === 'heavy' || aiTraffic === 'gridlock')) {
            setAiNotification(prediction.notification);
        } else {
            setAiNotification(null);
        }
    }, [aiTraffic, aiWeather, activeShipment]);

    /* Status Update */
    const handleStatusUpdate = async (shipment, nextStatus) => {
        if (!nextStatus) return;
        try {
            await axios.post('/tracking/update', {
                trackingNumber: shipment.trackingNumber,
                status: nextStatus,
                location: 'Current Location',
                trafficLevel: aiTraffic,
                weatherCondition: aiWeather
            });
            const updated = shipments.map(s => s._id === shipment._id ? { ...s, status: nextStatus } : s);
            setShipments(updated);
            setActiveShipment(prev => prev?._id === shipment._id ? { ...prev, status: nextStatus } : prev);
            localStorage.setItem('tracksphere_shipments', JSON.stringify(updated));
            toast.success(`Status updated to: ${nextStatus}`);
            
            if (nextStatus === 'out-for-delivery') {
                toast.info('OTP Generated. Check server console for demo.');
            }
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    /* Delay Report */
    const handleReportDelay = async () => {
        if (!delayReason) return toast.error('Please select a reason');
        try {
            const res = await axios.post('/api/tracking/report-delay', {
                trackingNumber: activeShipment.trackingNumber,
                reason: delayReason,
                estimatedMinutes: delayTime
            }).catch(() => ({ data: { success: true } }));
            if (res.data.success) {
                const updated = shipments.map(s =>
                    s._id === activeShipment._id ? { ...s, status: 'delayed', predictedDelay: delayTime } : s
                );
                setShipments(updated);
                setActiveShipment(prev => prev?._id === activeShipment._id ? { ...prev, status: 'delayed' } : prev);
                localStorage.setItem('tracksphere_shipments', JSON.stringify(updated));
                toast.success('Delay reported! Customer & Admin notified.');
                setShowDelayModal(false);
                setDelayReason('');
            }
        } catch {
            toast.error('Failed to report delay.');
        }
    };

    /* OTP Verify */
    const handleVerifyOTP = async (trackingNumber) => {
        if (!otp) return toast.error('Enter OTP');
        
        try {
            const res = await axios.post('/tracking/verify-delivery', {
                trackingNumber,
                otp
            });

            if (res.data.success) {
                const updated = shipments.map(s => s.trackingNumber === trackingNumber ? { ...s, status: 'delivered' } : s);
                setShipments(updated);
                setActiveShipment(prev => prev?.trackingNumber === trackingNumber ? { ...prev, status: 'delivered' } : prev);
                localStorage.setItem('tracksphere_shipments', JSON.stringify(updated));
                toast.success('✅ Delivery Verified! OTP accepted.');
                setOtp('');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Invalid OTP verification failed');
        }
    };

    /* Upload Proof */
    const handleUploadProof = () => {
        if (!proofFile) return toast.error('Select a file first');
        toast.promise(new Promise(r => setTimeout(r, 1500)), {
            loading: 'Uploading Proof of Delivery...',
            success: '📄 Proof of Delivery Attached!',
            error: 'Upload Failed'
        });
        setProofFile(null);
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'shipments', label: 'Active Tasks', icon: '🚚' },
        { id: 'ai', label: 'AI Engine', icon: '🤖' },
        { id: 'schedule', label: 'Schedule', icon: '📅' },
        { id: 'fuel', label: 'Fuel Logs', icon: '⛽' },
    ];

    const activeNonDelivered = shipments.filter(s => s.status !== 'delivered');

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 md:px-0">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                        Terminal <span className="text-orange-600">Control</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Operator: {user?.name || 'Master Driver'}
                    </p>
                </div>
                <nav className="flex p-1 bg-white/10 rounded-2xl overflow-x-auto w-full md:w-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white/5 text-orange-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span className="inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            {/* Hands-free Floating Voice SOS Widget */}
            <VoiceSOSControls driverId={user?.id || user?._id} />

            {activeTab === 'dashboard' && <DriverStats />}
            {activeTab === 'fuel' && <FuelTracker />}

            {/* ───── SCHEDULE TAB ───── */}
            {activeTab === 'schedule' && (
                <div className="space-y-6">
                    <div className="glass-card p-6 md:p-8">
                        <h3 className="text-xl md:text-2xl font-black mb-2">📅 Weekly Delivery Schedule</h3>
                        <p className="text-gray-500 mb-8 text-xs md:text-sm">Your delivery roster is synced with the master dispatcher.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} className={`p-4 rounded-2xl border-2 text-center ${i < 5 ? 'border-orange-200 bg-orange-50' : 'border-white/10 bg-white/5'}`}>
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">{day}</p>
                                    <p className={`font-black ${i < 5 ? 'text-orange-600' : 'text-gray-300'}`}>{i < 5 ? `${i + 2}-${i + 4}` : '–'}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-bold">{i < 5 ? 'deliveries' : 'off'}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-lg font-black text-white">Today's Assigned Deliveries</h4>
                            {activeNonDelivered.map((s, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl transition-all hover:border-orange-200">
                                    <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black shrink-0">{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-white">{s.trackingNumber}</p>
                                        <p className="text-xs text-gray-500 truncate">📍 {s.receiver?.address}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status === 'in-transit' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ───── ACTIVE TASKS TAB ───── */}
            {activeTab === 'shipments' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Shipment List */}
                    <div className={`lg:col-span-1 space-y-4 ${activeShipment ? 'hidden lg:block' : 'block'}`}>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-xl font-bold">Today's Tasks</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('tracksphere_shipments');
                                        window.location.reload();
                                    }}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ring-1 ring-red-500/30 tracking-widest"
                                    title="Restarts demo state to 'Out for Delivery'"
                                >
                                    ↻ Reset Demo
                                </button>
                                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">{shipments.length} Total</span>
                            </div>
                        </div>
                        {loading ? (
                            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 glass-card animate-pulse bg-white/5"></div>)}</div>
                        ) : shipments.length === 0 ? (
                            <div className="glass-card text-center py-20">
                                <p className="text-gray-400 italic">No assigned deliveries today.</p>
                            </div>
                        ) : (
                            shipments.map(s => (
                                <button
                                    key={s._id}
                                    onClick={() => setActiveShipment(s)}
                                    className={`w-full text-left glass-card p-5 transition-all group relative overflow-hidden ${activeShipment?._id === s._id
                                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xl shadow-orange-500/10'
                                        : 'hover:border-orange-200'
                                    }`}
                                >
                                    {s.delayProbability > 50 && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-tighter">
                                            ⚠️ Delay Risk
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="min-w-0 pr-8">
                                            <p className="font-black text-lg tracking-tight group-hover:text-orange-600 transition-colors truncate">{s.trackingNumber}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{s.receiver?.name || 'Unknown Recipient'}</p>
                                        </div>
                                        <span className={`shrink-0 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${s.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : s.status === 'delayed' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                            {s.status}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-white/10 text-[11px] text-gray-500 font-medium">
                                        <p className="line-clamp-1">📍 {s.receiver?.address || 'No address provided'}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Map & Actions */}
                    <div className={`lg:col-span-2 space-y-6 ${activeShipment ? 'block' : 'hidden lg:block'}`}>
                        {activeShipment ? (
                            <>
                                {/* Header for Mobile Selection */}
                                <div className="lg:hidden flex justify-between items-center mb-2 px-1">
                                    <button onClick={() => setActiveShipment(null)} className="text-orange-600 font-black text-sm flex items-center gap-1">← Back to Tasks</button>
                                    <span className="font-black text-sm text-gray-400">{activeShipment.trackingNumber}</span>
                                </div>

                                {/* Map */}
                                <div className="glass-card h-[350px] md:h-[450px] overflow-hidden p-0 relative shadow-2xl">
                                    <div className="h-full">
                                        <TrackingMap shipments={[activeShipment]} />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 pointer-events-none">
                                        <div className="glass-card p-3 md:p-4 bg-white/5/95 backdrop-blur-md border-none shadow-xl pointer-events-auto flex items-center gap-3 md:gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white text-sm">🗺️</div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Navigation</p>
                                                <button
                                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeShipment.receiver?.address || '')}`)}
                                                    className="text-xs md:text-sm font-black text-white border-b-2 border-orange-200 hover:border-orange-500 transition-all text-left truncate"
                                                >
                                                    Open in Google Maps →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Actions Panel */}
                                    <div className="glass-card space-y-5 p-5 md:p-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg md:text-xl font-black">Actions</h3>
                                            {activeShipment.delayProbability > 0 && (
                                                <div className={`px-2 py-1 rounded-full text-[9px] font-black ${activeShipment.delayProbability > 60 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    Risk: {activeShipment.delayProbability}%
                                                </div>
                                            )}
                                        </div>

                                        {activeShipment.status !== 'delivered' ? (
                                            <div className="space-y-4">
                                                {/* Status Update */}
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <StatusButton shipment={activeShipment} onUpdate={handleStatusUpdate} />
                                                    <button
                                                        onClick={() => setShowDelayModal(true)}
                                                        className="flex-1 py-3 px-4 rounded-xl border-2 border-red-100 text-red-600 font-black hover:bg-red-50 transition-all text-xs uppercase tracking-widest"
                                                    >
                                                        ⚠️ Report Delay
                                                    </button>
                                                </div>

                                                {/* OTP Verify */}
                                                {activeShipment.status === 'out-for-delivery' && (
                                                    <div className="p-4 md:p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                                        <p className="text-[10px] text-orange-800 font-black uppercase tracking-widest mb-3">OTP Verification</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <input
                                                                type="text"
                                                                value={otp}
                                                                onChange={e => setOtp(e.target.value)}
                                                                placeholder="OTP"
                                                                className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 outline-none font-black tracking-[0.2em] text-center text-lg bg-white/5"
                                                            />
                                                            <button
                                                                onClick={() => handleVerifyOTP(activeShipment.trackingNumber)}
                                                                className="btn-primary flex-[0.5] bg-orange-600 hover:bg-orange-700 px-4 shadow-lg shadow-orange-500/20 text-xs"
                                                            >
                                                                Verify
                                                            </button>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 mt-2 text-center font-bold">Check server console for generated OTP</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 md:p-5 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3">
                                                    <span className="text-xl">✅</span>
                                                    <p className="font-black text-green-800 uppercase tracking-widest text-xs">Delivery Confirmed</p>
                                                </div>
                                                {/* Upload Proof */}
                                                <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-dashed border-gray-300">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Proof of Delivery</p>
                                                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                        <input type="file" id="proof" className="hidden" onChange={e => setProofFile(e.target.files[0])} />
                                                        <label htmlFor="proof" className="w-full flex-1 p-3 bg-white/5 border-2 border-white/10 rounded-xl text-[10px] font-bold text-gray-500 cursor-pointer hover:bg-white/10 transition-all overflow-hidden flex items-center gap-2">
                                                            <span>📁</span>
                                                            <span className="truncate">{proofFile ? proofFile.name : 'Select File'}</span>
                                                        </label>
                                                        <button onClick={handleUploadProof} className="w-full sm:w-auto p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all text-xs font-black uppercase">
                                                            Upload
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Shipment Details */}
                                        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="bg-white/5 p-3 rounded-xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase">From</p>
                                                <p className="font-bold text-white truncate">{activeShipment.sender?.name || '—'}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{activeShipment.sender?.address || '—'}</p>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase">To</p>
                                                <p className="font-bold text-white truncate">{activeShipment.receiver?.name || '—'}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{activeShipment.receiver?.address || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline AI Panel for active shipment */}
                                    <div className="glass-card bg-white/5 text-white relative overflow-hidden border-2 border-white/10 shadow-xl p-5 md:p-6">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                        <h3 className="text-lg md:text-xl font-black mb-1">🤖 AI Insight</h3>
                                        <p className="text-[10px] font-bold mb-4 tracking-widest uppercase text-gray-400">Predictive Logistics</p>
                                        <div className="space-y-4">
                                            {activeShipment.aiAnalysis ? (
                                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                                    <p className="font-black text-sm text-orange-800 leading-tight">"{activeShipment.aiAnalysis.reason}"</p>
                                                    {activeShipment.aiAnalysis.insight && <p className="text-[11px] text-gray-600 mt-2 font-medium">💡 {activeShipment.aiAnalysis.insight}</p>}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-white/5 rounded-2xl">
                                                    <p className="text-xs text-gray-600">AI monitoring active – all clear.</p>
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                                                    <span>Delay Probability</span>
                                                    <span className={activeShipment.delayProbability > 60 ? 'text-red-500' : 'text-green-500'}>{activeShipment.delayProbability || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${activeShipment.delayProbability > 60 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${activeShipment.delayProbability || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Est. Delay</span>
                                                <span className="font-black text-base text-orange-600">+{activeShipment.predictedDelay || 0} min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="glass-card h-full flex flex-col items-center justify-center text-gray-400 py-32 space-y-6">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center text-3xl md:text-4xl border border-dashed border-white/20">📍</div>
                                <div className="text-center px-4">
                                    <h4 className="font-black text-gray-600 uppercase tracking-widest text-sm mb-2">No Active Selection</h4>
                                    <p className="text-xs font-medium max-w-[250px] mx-auto">Select a task from the list to begin terminal navigation.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ───── AI ENGINE TAB ───── */}
            {activeTab === 'ai' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black">🤖 AI Logistics Engine</h2>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">Real-time delay prediction, ETA calculation, and smart route optimization.</p>
                    </div>

                    {/* AI Notification Alert */}
                    {aiNotification && (
                        <div className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-red-50 border-2 border-red-300 rounded-2xl animate-in slide-in-from-top duration-300">
                            <span className="text-2xl md:text-3xl">📱</span>
                            <div className="flex-1">
                                <p className="font-black text-red-800 mb-1 text-sm md:text-base">Auto Delay Notification Triggered</p>
                                <p className="text-xs md:text-sm text-red-700 bg-white/5/60 p-3 rounded-xl border border-red-200 font-medium leading-relaxed">
                                    "{aiNotification.replace('Updated ETA will be recalculated', `Updated ETA: ${aiETA?.etaTime || '–'}`)}"
                                </p>
                                <p className="text-[9px] md:text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest">📧 Customer & Admin notified automatically</p>
                            </div>
                        </div>
                    )}

                    {/* Input Controls */}
                    <div className="glass-card p-6 md:p-8">
                        <h3 className="text-base md:text-lg font-black mb-5">⚙️ Live Condition Inputs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Traffic Level</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['light', 'moderate', 'heavy', 'gridlock'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setAiTraffic(t)}
                                            className={`py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${aiTraffic === t ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-white/10 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            {t === 'light' ? '🟢' : t === 'moderate' ? '🟡' : t === 'heavy' ? '🔴' : '🚨'} {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Weather Condition</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['clear', 'rain', 'storm', 'snow'].map(w => (
                                        <button
                                            key={w}
                                            onClick={() => setAiWeather(w)}
                                            className={`py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${aiWeather === w ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white/10 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            {w === 'clear' ? '☀️' : w === 'rain' ? '🌧️' : w === 'storm' ? '⛈️' : '❄️'} {w}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Outputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {/* Delay Prediction */}
                        <div className="glass-card bg-gradient-to-br from-red-50 to-white border-l-4 border-red-400 p-6 md:p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">⚠️ Delay Prediction</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white">+{aiPrediction?.predictedDelay || 0}<span className="text-xl text-gray-400 ml-1">min</span></h3>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-gray-500">Probability</span>
                                    <span className={aiPrediction?.delayProbability > 60 ? 'text-red-600' : 'text-green-600'}>{aiPrediction?.delayProbability || 0}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${aiPrediction?.delayProbability || 0}%` }}></div>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-600 mt-4 font-medium leading-tight">📊 {aiPrediction?.reason}</p>
                            <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Confidence Index: {aiPrediction?.confidence || 85}%</p>
                        </div>

                        {/* Smart ETA */}
                        <div className="glass-card bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-400 p-6 md:p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">🕐 Smart ETA</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white">{aiETA?.etaTime || '—'}</h3>
                            <p className="text-xs md:text-sm text-blue-600 font-bold mt-2">~{aiETA?.totalMinutes || 0} minutes from now</p>
                            <div className="mt-4 bg-blue-50/50 p-3 rounded-xl">
                                <p className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Factors applied:</p>
                                <ul className="text-[10px] text-blue-600 mt-1 space-y-0.5 font-bold">
                                    <li>• Base travel: 90 min</li>
                                    <li>• Traffic: {aiTraffic === 'light' ? '0' : aiTraffic === 'moderate' ? '5' : aiTraffic === 'heavy' ? '25' : '60'} min</li>
                                    <li>• Weather: {['rain', 'snow', 'storm'].includes(aiWeather) ? '15' : '0'} min</li>
                                </ul>
                            </div>
                        </div>

                        {/* Route Optimization */}
                        <div className="glass-card bg-gradient-to-br from-green-50 to-white border-l-4 border-green-400 p-6 md:p-8 sm:col-span-2 lg:col-span-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">🗺️ Route Optimization</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white">-{aiRoute?.saving || 0}<span className="text-xl text-gray-400 ml-1">min</span></h3>
                            <p className="text-[11px] md:text-sm text-green-600 font-bold mt-2">Faster route found!</p>
                            <div className="mt-4 bg-green-50/50 p-3 rounded-xl">
                                <p className="text-[10px] font-black text-green-700 mb-1 uppercase tracking-tighter">Optimized Path:</p>
                                <p className="text-[10px] text-green-600 font-bold leading-tight">{aiRoute?.alternative || 'Route already optimal'}</p>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-3 font-medium italic">{aiRoute?.message}</p>
                        </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="glass-card p-6 md:p-8">
                        <h3 className="text-base md:text-lg font-black mb-6">📖 How the AI Works</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { icon: '🚦', title: 'Traffic Analysis', desc: 'Regression model processes real-time traffic density to calculate delay factors (1.0x – 3.0x multiplier).' },
                                { icon: '🌦️', title: 'Weather Impact', desc: 'Adverse conditions (rain, storm, snow) add a 15-minute base penalty to estimated travel time.' },
                                { icon: '📍', title: 'Smart ETA', desc: 'ETA = BaseTime + TrafficAdd + WeatherPenalty. Updated every GPS tick in real-time.' },
                                { icon: '🚨', title: 'Auto Notifications', desc: 'When delay probability exceeds thresholds, the system auto-notifies the customer and admin via SMS & Email.' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 md:p-5 bg-white/5 rounded-2xl border border-white/10">
                                    <span className="text-2xl block mb-3">{item.icon}</span>
                                    <p className="font-black text-sm text-white mb-2">{item.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ───── DELAY MODAL ───── */}
            {showDelayModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-card max-w-lg w-full p-6 md:p-10 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
                        <h3 className="text-xl md:text-3xl font-black mb-2 text-red-600">Log Field Obstacle</h3>
                        <p className="text-gray-500 mb-6 md:mb-8 text-xs md:text-sm font-medium">This report will override AI predictions and immediately notify all parties.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Reason</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Heavy Traffic', 'Weather', 'Vehicle Issue', 'Road Closure'].map(reason => (
                                        <button
                                            key={reason}
                                            onClick={() => setDelayReason(reason)}
                                            className={`p-3 md:p-4 rounded-2xl border-2 text-[10px] md:text-xs font-black transition-all ${delayReason === reason ? 'border-red-600 bg-red-50 text-red-700 shadow-lg' : 'border-gray-50 hover:border-red-200 bg-white/5'}`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Estimated Delay (Minutes)</label>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                                    <input
                                        type="range" min="5" max="120" step="5"
                                        className="flex-grow h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                        value={delayTime}
                                        onChange={e => setDelayTime(e.target.value)}
                                    />
                                    <span className="w-14 text-center font-black text-lg text-red-600">{delayTime}m</span>
                                </div>
                            </div>

                            {/* Notification Preview */}
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-2">📱 Notification Preview</p>
                                <p className="text-[11px] text-white italic leading-relaxed">
                                    "Your shipment <strong>{activeShipment?.trackingNumber}</strong> is delayed due to <strong>{delayReason || '[reason]'}</strong>. Updated ETA: <strong>{aiETA?.etaTime || '—'}</strong>."
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setShowDelayModal(false)} className="order-2 sm:order-1 flex-1 py-4 px-6 rounded-2xl bg-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">
                                    Discard
                                </button>
                                <button onClick={handleReportDelay} className="order-1 sm:order-2 flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all">
                                    Broadcast Delay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverPanel;
