import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DEMO_SHIPMENTS = [
    {
        trackingNumber: 'TRK-DEMO-1001', status: 'delivered',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        estimatedDelivery: new Date(Date.now() - 2 * 86400000).toISOString(),
        sender: { name: 'Amazon Warehouse', address: 'Bhiwandi, Mumbai' },
        receiver: { name: 'You', address: '42 Green Park, New Delhi' },
        packageType: 'parcel', weight: '1.2', deliveryType: 'express',
        assignedDriver: { name: 'S. Wilson', phone: '+91 88888 77777', rating: 4.7 }
    },
    {
        trackingNumber: 'TRK-DEMO-2002', status: 'in-transit',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 1 * 86400000).toISOString(),
        sender: { name: 'Flipkart Hub', address: 'Pune, Maharashtra' },
        receiver: { name: 'You', address: '42 Green Park, New Delhi' },
        packageType: 'fragile', weight: '3.0', deliveryType: 'standard',
        assignedDriver: { name: 'Amit Verma', phone: '+91 99999 11111', rating: 4.2 },
        delayProbability: 85, predictedDelay: 45,
        aiAnalysis: { reason: 'Heavy traffic detected at junction 4', insight: 'Alternative route suggested via Ring Road.' }
    },
    {
        trackingNumber: 'TRK-DEMO-3003', status: 'out-for-delivery',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        estimatedDelivery: new Date().toISOString(),
        sender: { name: 'Myntra Logistics', address: 'Bengaluru, Karnataka' },
        receiver: { name: 'You', address: '42 Green Park, New Delhi' },
        packageType: 'parcel', weight: '0.8', deliveryType: 'same-day',
        assignedDriver: { name: 'Raj Kumar', phone: '+91 98765 43210', rating: 4.9 },
        delayProbability: 10, predictedDelay: 0
    },
];

const DEMO_NOTIFICATIONS = [
    { id: 1, type: 'delay', icon: '⚠️', title: 'Delay Alert', message: 'Your shipment TRK-DEMO-2002 is delayed by ~45 minutes due to heavy traffic.', time: '15 min ago', read: false, trackingNumber: 'TRK-DEMO-2002' },
    { id: 2, type: 'update', icon: '🚀', title: 'Out for Delivery', message: 'TRK-DEMO-3003 is now out for delivery! Your driver Raj Kumar is on the way.', time: '1 hr ago', read: false, trackingNumber: 'TRK-DEMO-3003' },
    { id: 3, type: 'success', icon: '✅', title: 'Delivered!', message: 'Your shipment TRK-DEMO-1001 has been successfully delivered.', time: '2 days ago', read: true, trackingNumber: 'TRK-DEMO-1001' },
    { id: 4, type: 'info', icon: '📦', title: 'Shipment Picked Up', message: 'Flipkart Hub has handed your package to our system.', time: '3 days ago', read: true, trackingNumber: 'TRK-DEMO-2002' },
];

const StatusBadge = ({ status }) => {
    const styles = {
        'delivered': 'bg-green-100 text-green-700',
        'in-transit': 'bg-blue-100 text-blue-700',
        'out-for-delivery': 'bg-orange-100 text-orange-700',
        'pending': 'bg-yellow-100 text-yellow-700',
    };
    const labels = {
        'delivered': '✅ Delivered', 'in-transit': '🚚 In Transit',
        'out-for-delivery': '🚀 Out for Delivery', 'pending': '⏳ Pending',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-black ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{labels[status] || status}</span>;
};

const Dashboard = () => {
    const { user } = useAuth();
    const [shipments, setShipments] = useState([]);
    const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
    const [activeTab, setActiveTab] = useState('overview');
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    useEffect(() => {
        const loadShipments = async () => {
            try {
                const stored = JSON.parse(localStorage.getItem('tf_shipments') || '[]');
                if (stored.length > 0) {
                    setShipments(stored);
                } else {
                    const res = await axios.get('/customer/shipments').catch(() => null);
                    setShipments(res?.data?.data?.length > 0 ? res.data.data : DEMO_SHIPMENTS);
                }
            } catch {
                setShipments(DEMO_SHIPMENTS);
            }
        };
        loadShipments();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const stats = {
        total: shipments.length,
        delivered: shipments.filter(s => s.status === 'delivered').length,
        inTransit: shipments.filter(s => s.status === 'in-transit').length,
        pending: shipments.filter(s => s.status === 'pending' || s.status === 'out-for-delivery').length,
    };

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const delayedShipments = shipments.filter(s => s.delayProbability > 50);
    const activeShipments = shipments.filter(s => s.status !== 'delivered');

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
                        My <span className="text-blue-600">Dashboard</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Welcome back, {user?.name || 'Customer'} 👋</p>
                </div>
                <div className="flex gap-3 items-center w-full md:w-auto">
                    {/* Notifications Bell */}
                    <div className="relative flex-1 md:flex-none">
                        <button
                            onClick={() => setShowNotifPanel(!showNotifPanel)}
                            className="relative w-full md:w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-300 transition-all shadow-sm"
                        >
                            <span className="text-xl">🔔</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 md:-top-1 md:-right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifPanel && (
                            <div className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:right-0 md:top-14 w-auto md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[80vh] flex flex-col">
                                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white sticky top-0">
                                    <h3 className="font-black text-gray-800">Notifications</h3>
                                    <button onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:underline">Mark all read</button>
                                </div>
                                <div className="overflow-y-auto divide-y divide-gray-50">
                                    {notifications.length === 0 ? (
                                        <div className="py-10 text-center text-gray-400 font-medium">No notifications yet</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className={`flex gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                                                <span className="text-xl mt-0.5">{notif.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-black text-sm text-gray-800 truncate">{notif.title}</p>
                                                        <span className="text-[10px] text-gray-400 font-bold ml-2 shrink-0">{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                                    <Link to={`/track?id=${notif.trackingNumber}`} onClick={() => setShowNotifPanel(false)} className="text-[10px] text-blue-600 font-bold mt-1 hover:underline block">
                                                        View Shipment →
                                                    </Link>
                                                </div>
                                                {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link to="/create-shipment" className="flex-1 md:flex-none btn-primary px-5 py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md shadow-blue-300/30 whitespace-nowrap text-sm md:text-base">
                        + New Shipment
                    </Link>
                </div>
            </header>

            {/* Delay Alerts Banner */}
            {delayedShipments.length > 0 && (
                <div className="space-y-3">
                    {delayedShipments.map(s => (
                        <div key={s.trackingNumber} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                            <span className="text-2xl hidden sm:block">⚠️</span>
                            <div className="flex-1">
                                <p className="font-black text-red-800 text-sm flex items-center gap-2">
                                    <span className="sm:hidden text-lg">⚠️</span>
                                    Delay Alert: {s.trackingNumber}
                                </p>
                                <p className="text-xs text-red-600 font-medium mt-0.5">
                                    {s.aiAnalysis?.reason || `Your shipment is delayed by ~${s.predictedDelay} minutes.`}
                                    {s.aiAnalysis?.insight && ` ${s.aiAnalysis.insight}`}
                                </p>
                            </div>
                            <Link to={`/track?id=${s.trackingNumber}`} className="w-full sm:w-auto text-center text-xs font-bold bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition shadow-sm">
                                Track Now
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {[
                    { label: 'Total Shipments', value: stats.total, icon: '📦', color: 'blue' },
                    { label: 'In Transit', value: stats.inTransit, icon: '🚚', color: 'orange' },
                    { label: 'Delivered', value: stats.delivered, icon: '✅', color: 'green' },
                    { label: 'Active / Pending', value: stats.pending, icon: '⏳', color: 'yellow' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card flex items-center justify-between sm:flex-col sm:items-start sm:justify-start">
                        <div className="flex items-center sm:justify-between sm:w-full sm:mb-3 gap-3">
                            <span className="text-3xl md:text-2xl">{stat.icon}</span>
                            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest text-left sm:text-right hidden sm:block">{stat.label}</p>
                        </div>
                        <div className="text-right sm:text-left">
                            <p className="sm:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                            <h3 className={`text-2xl md:text-3xl lg:text-4xl font-black text-${stat.color}-600`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-full sm:w-max overflow-x-auto scrollbar-hide">
                {[
                    { id: 'overview', label: 'Active', icon: '🚛' },
                    { id: 'notifications', label: 'Alerts', icon: '🔔' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 sm:flex-none px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                            <span className="bg-red-500 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Active Shipments Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-4 md:space-y-6">
                    {activeShipments.length === 0 ? (
                        <div className="glass-card text-center py-12 md:py-16">
                            <span className="text-4xl md:text-5xl block mb-4">📭</span>
                            <p className="text-lg md:text-xl font-bold text-gray-400 mb-4">No active shipments</p>
                            <Link to="/create-shipment" className="btn-primary inline-block px-6 py-3 rounded-xl font-bold text-sm md:text-base">Create primary shipment</Link>
                        </div>
                    ) : (
                        activeShipments.map(s => (
                            <div key={s.trackingNumber} className="glass-card hover:shadow-xl transition-all border-none shadow-sm md:shadow-md">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">Tracking ID</p>
                                        <p className="text-lg md:text-xl font-black text-blue-700 truncate">{s.trackingNumber}</p>
                                    </div>
                                    <div className="shrink-0 scale-90 md:scale-100 origin-right">
                                        <StatusBadge status={s.status} />
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 mb-4">
                                    <div className="flex-1 bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">From</p>
                                                <p className="font-black text-xs md:text-sm text-gray-800 truncate">{s.sender?.name}</p>
                                            </div>
                                            <span className="text-blue-300 text-xs sm:hidden">🛫</span>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{s.sender?.address}</p>
                                    </div>
                                    <div className="hidden sm:block text-blue-200 font-black text-xl lg:text-2xl">→</div>
                                    <div className="flex-1 bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">To</p>
                                                <p className="font-black text-xs md:text-sm text-gray-800 truncate">{s.receiver?.name}</p>
                                            </div>
                                            <span className="text-purple-300 text-xs sm:hidden">🏁</span>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{s.receiver?.address}</p>
                                    </div>
                                </div>

                                {/* ETA + Driver + Delay */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">Estimated Delivery</p>
                                        <p className="font-black text-sm text-gray-800">{new Date(s.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        <p className="text-[11px] text-gray-500 font-bold">{new Date(s.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {s.assignedDriver && (
                                        <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100/30">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">Assigned Operator</p>
                                            <p className="font-black text-sm text-gray-800 truncate">{s.assignedDriver.name}</p>
                                            <p className="text-[10px] text-blue-600 font-bold truncate">★ {s.assignedDriver.rating} • {s.assignedDriver.phone}</p>
                                        </div>
                                    )}
                                    {s.delayProbability > 0 && (
                                        <div className={`p-3 rounded-xl border ${s.delayProbability > 50 ? 'bg-red-50/30 border-red-100/50' : 'bg-yellow-50/30 border-yellow-100/50'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">AI Intelligence Risk</p>
                                                <p className={`font-black text-xs ${s.delayProbability > 50 ? 'text-red-600' : 'text-yellow-600'}`}>{s.delayProbability}%</p>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${s.delayProbability > 50 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${s.delayProbability}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Link to={`/track?id=${s.trackingNumber}`} className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                                        <span className="text-base">🗺️</span> Track Live Location
                                    </Link>
                                    <Link to="/history" className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-black hover:bg-gray-200 transition-all">
                                        <span className="text-base">📋</span> View Evolution Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                    <div className="text-center pt-4">
                        <Link to="/history" className="text-blue-600 font-bold hover:underline text-sm flex items-center justify-center gap-2">
                            View full shipment history <span className="text-base">→</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-800">All Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-sm font-bold text-blue-600 hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <div className="glass-card divide-y divide-gray-100">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`flex gap-4 py-5 first:pt-0 last:pb-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${notif.type === 'delay' ? 'bg-red-100' : notif.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-black text-gray-800">{notif.title}</p>
                                        <span className="text-xs text-gray-400 font-bold shrink-0">{notif.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                    <Link to={`/track?id=${notif.trackingNumber}`} className="text-xs font-bold text-blue-600 hover:underline mt-2 block">
                                        View shipment {notif.trackingNumber} →
                                    </Link>
                                </div>
                                {!notif.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
