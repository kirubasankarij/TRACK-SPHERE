import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackingMap from '../components/tracking/TrackingMap';

const mockShipments = [
    { id: 'TF-TN-DEMO', from: 'Chennai', to: 'Coimbatore', driver: 'Raj Kumar', risk: 'Low', status: 'in-transit' },
    { id: 'TF-DEMO-001', from: 'New York', to: 'London', driver: 'Sarah Wilson', risk: 'Medium', status: 'delayed' },
    { id: 'TF-DEMO-002', from: 'Berlin', to: 'Paris', driver: 'Amit Verma', risk: 'Low', status: 'delivered' },
    { id: 'TF-DEMO-003', from: 'Tokyo', to: 'Osaka', driver: 'Unassigned', risk: 'Critical', status: 'pending' },
];

const mockDrivers = [
    { name: 'Raj Kumar', status: 'Active', load: '85%', rating: 4.9, phone: '+91 98765 43210', license: 'TN-38-2022-001', avatar: 'rajkumar', trips: 156 },
    { name: 'Sarah Wilson', status: 'Resting', load: '0%', rating: 4.7, phone: '+91 88888 77777', license: 'MH-12-2021-044', avatar: 'sarah', trips: 98 },
    { name: 'Amit Verma', status: 'Critical', load: '100%', rating: 4.2, phone: '+91 99999 11111', license: 'DL-04-2020-088', avatar: 'amit', trips: 212 },
];

const mockVehicles = [
    { plateNumber: 'TN-01-AX-1234', model: 'Tata Prima 4028.S', type: 'Truck', capacity: '40 tons', status: 'moving', assignedDriver: { name: 'Raj Kumar', phone: '+91 98765 43210' } },
    { plateNumber: 'MH-12-PQ-5678', model: 'Ashok Leyland Dost', type: 'Van', capacity: '10 tons', status: 'active', assignedDriver: { name: 'Sarah Wilson', phone: '+91 88888 77777' } },
    { plateNumber: 'KA-05-LM-9012', model: 'Mahindra Bolero Pik-Up', type: 'Truck', capacity: '15 tons', status: 'maintenance', assignedDriver: null },
    { plateNumber: 'TS-09-EV-7890', model: 'DJI Matrice 300 RTK', type: 'Drone', capacity: '2.7 kg', status: 'active', assignedDriver: null },
];

const mockSupportTickets = [
    { id: 'TKT-001', customer: 'Demo Customer', issue: 'Shipment delayed beyond expected time', status: 'open', priority: 'high', time: '10 min ago' },
    { id: 'TKT-002', customer: 'John Doe', issue: 'Package not received at destination', status: 'in-progress', priority: 'medium', time: '1 hr ago' },
    { id: 'TKT-003', customer: 'Jane Smith', issue: 'Wrong address on shipment label', status: 'resolved', priority: 'low', time: '3 hrs ago' },
];

const mockStations = [
    { id: 'STA-01', name: 'Chennai Hub', type: 'station', location: 'Guindy, Chennai', facilities: ['Fuel', 'Rest Area', 'Canteen'], lat: 13.0067, lng: 80.2206, status: 'active' },
    { id: 'STA-02', name: 'Erode Stop', type: 'food', location: 'Erode, TN', facilities: ['Food', 'Restroom', 'Parking'], lat: 11.3410, lng: 77.7172, status: 'active' },
    { id: 'STA-03', name: 'Coimbatore Terminal', type: 'station', location: 'Peelamedu, Coimbatore', facilities: ['Fuel', 'Maintenance', 'Rest Area', 'Food'], lat: 11.0168, lng: 76.9558, status: 'active' },
    { id: 'STA-04', name: 'Salem Pit-Stop', type: 'food', location: 'Salem, TN', facilities: ['Food', 'Parking'], lat: 11.6643, lng: 78.1460, status: 'closed' },
];

const StatusBadge = ({ status }) => {
    const map = {
        'in-transit': 'bg-blue-100 text-blue-700',
        'delayed': 'bg-red-100 text-red-700',
        'delivered': 'bg-green-100 text-green-700',
        'pending': 'bg-yellow-100 text-yellow-700',
        'open': 'bg-red-100 text-red-700',
        'in-progress': 'bg-yellow-100 text-yellow-700',
        'resolved': 'bg-green-100 text-green-700',
        'active': 'bg-green-100 text-green-700',
        'closed': 'bg-gray-100 text-gray-500',
        'moving': 'bg-blue-100 text-blue-700',
        'maintenance': 'bg-orange-100 text-orange-700',
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-500">✕</button>
            </div>
            {children}
        </div>
    </div>
);

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data state
    const [shipments, setShipments] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [stations, setStations] = useState([]);
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            try {
                const [shipRes, driveRes, vehRes, staRes, tktRes] = await Promise.all([
                    axios.get('/shipments', config),
                    axios.get('/driver', config),
                    axios.get('/vehicles', config),
                    axios.get('/stations', config),
                    axios.get('/support', config)
                ]);

                setShipments(shipRes.data.data || shipRes.data);
                setDrivers(driveRes.data.data || driveRes.data);
                setVehicles(vehRes.data.data || vehRes.data);
                setStations(staRes.data.data || staRes.data);
                setTickets(tktRes.data.data || tktRes.data);
            } catch (err) {
                console.error("Error fetching admin data:", err);
            }
        };
        fetchData();
    }, []);

    // Create Shipment form state
    const [showCreateShipment, setShowCreateShipment] = useState(false);
    const [newShipment, setNewShipment] = useState({ trackingNumber: '', senderName: '', senderAddress: '', receiverName: '', receiverAddress: '', carrier: '', assignedDriver: '' });
    const [shipmentCreated, setShipmentCreated] = useState(false);

    // Add Vehicle form state
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ plateNumber: '', model: '', type: 'Truck', capacity: '' });

    // Add Driver form state
    const [showAddDriver, setShowAddDriver] = useState(false);
    const [newDriver, setNewDriver] = useState({ name: '', phone: '', license: '' });

    // Add Station form state
    const [showAddStation, setShowAddStation] = useState(false);
    const [newStation, setNewStation] = useState({ name: '', type: 'station', location: '', facilities: '' });

    // Assign Driver state
    const [assignModal, setAssignModal] = useState(null); // shipment id
    const [assignDriver, setAssignDriver] = useState('');

    // Support
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const [statsRes, aiRes] = await Promise.all([
                    axios.get('/analytics/global', config).catch(() => ({ data: { data: { inTransitShipments: 12, deliveredShipments: 87, deliverySuccessRate: 96 } } })),
                    axios.get('/analytics/delays', config).catch(() => ({ data: { data: { averageDelayMinutes: 18, trafficImpact: 65, weatherImpact: 30, mostDelayedRoutes: [{ origin: 'Mumbai', destination: 'Pune', avgDelay: 45 }, { origin: 'Chennai', destination: 'Bangalore', avgDelay: 32 }] } } }))
                ]);
                setStats(statsRes.data.data);
                setAiData(aiRes.data.data);
            } catch (err) {
                console.error('Failed to fetch admin data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'shipments', label: 'Shipments', icon: '📦' },
        { id: 'drivers', label: 'Drivers', icon: '🚛' },
        { id: 'vehicles', label: 'Vehicles', icon: '⚙️' },
        { id: 'support', label: 'Support', icon: '🎧' },
        { id: 'stations', label: 'Stations', icon: '⛽' },
        { id: 'ai', label: 'AI Alerts', icon: '🤖' },
    ];

    const handleCreateShipment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                trackingNumber: newShipment.trackingNumber,
                sender: { name: newShipment.senderName, address: newShipment.senderAddress },
                receiver: { name: newShipment.receiverName, address: newShipment.receiverAddress },
                carrier: newShipment.carrier,
                assignedDriver: newShipment.assignedDriver
            };
            const res = await axios.post('/shipments', data, { headers: { Authorization: `Bearer ${token}` } });
            setShipments([...shipments, res.data.data || res.data]);
            setShipmentCreated(true);
            setShowCreateShipment(false);
            setNewShipment({ trackingNumber: '', senderName: '', senderAddress: '', receiverName: '', receiverAddress: '', carrier: '', assignedDriver: '' });
        } catch (err) {
            alert("Failed to create shipment");
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/vehicles', newVehicle, { headers: { Authorization: `Bearer ${token}` } });
            setVehicles([...vehicles, res.data.data || res.data]);
            setShowAddVehicle(false);
            setNewVehicle({ plateNumber: '', model: '', type: 'Truck', capacity: '' });
        } catch (err) {
            alert("Failed to add vehicle");
        }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/driver', newDriver, { headers: { Authorization: `Bearer ${token}` } });
            setDrivers([...drivers, res.data.data || res.data]);
            setShowAddDriver(false);
            setNewDriver({ name: '', phone: '', license: '' });
        } catch (err) {
            alert("Failed to add driver");
        }
    };

    const handleAddStation = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                ...newStation,
                facilities: newStation.facilities.split(',').map(f => f.trim())
            };
            const res = await axios.post('/stations', data, { headers: { Authorization: `Bearer ${token}` } });
            setStations([...stations, res.data.data || res.data]);
            setShowAddStation(false);
            setNewStation({ name: '', type: 'station', location: '', facilities: '' });
        } catch (err) {
            alert("Failed to add station");
        }
    };

    const handleRespondTicket = async () => {
        if (!adminResponse) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/support/${selectedTicket._id}/respond`, { message: adminResponse }, { headers: { Authorization: `Bearer ${token}` } });
            setTickets(tickets.map(t => t._id === selectedTicket._id ? res.data.data : t));
            setSelectedTicket(res.data.data);
            setAdminResponse('');
        } catch (err) {
            alert("Failed to send response");
        }
    };

    const handleResolveTicket = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`/support/${selectedTicket._id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setTickets(tickets.map(t => t._id === selectedTicket._id ? res.data.data : t));
            setSelectedTicket(res.data.data);
        } catch (err) {
            alert("Failed to resolve ticket");
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium";



    const liveMapShipments = [
        { _id: 'map1', trackingNumber: 'TF-TN-DEMO', routePoints: [{ lat: 13.0827, lng: 80.2707 }, { lat: 11.9416, lng: 79.4861 }, { lat: 11.4102, lng: 77.7334 }] },
        { _id: 'map2', trackingNumber: 'TF-DEMO-001', routePoints: [{ lat: 40.7128, lng: -74.0060 }, { lat: 51.5074, lng: -0.1278 }] },
    ];

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Admin <span className="text-blue-600">Command</span></h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Logistics Intelligence & Fleet Management</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none btn-glass text-xs md:text-sm py-2 px-4 shadow-sm">Export</button>
                    <button onClick={() => setShowCreateShipment(true)} className="flex-2 md:flex-none btn-primary text-xs md:text-sm px-6 py-2 shadow-md shadow-blue-300/30">+ New Shipment</button>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="px-4 md:px-0">
                <div className="flex overflow-x-auto gap-1 p-1 bg-gray-200/50 rounded-2xl w-full sm:w-max scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 md:px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">

                {/* ─── OVERVIEW ─── */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 md:space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: 'Active Shipments', value: stats?.inTransitShipments ?? 12, trend: '+12%', color: 'blue', icon: '🚚' },
                                { label: 'Delivered (MTD)', value: stats?.deliveredShipments ?? 87, trend: '+5%', color: 'green', icon: '✅' },
                                { label: 'Success Rate', value: `${stats?.deliverySuccessRate ?? 96}%`, trend: '+1%', color: 'purple', icon: '📈' },
                                { label: 'Active Drivers', value: drivers.filter(d => d.status === 'Active').length, trend: 'Stable', color: 'orange', icon: '👤' },
                            ].map((stat, i) => (
                                <div key={i} className="glass-card flex flex-col justify-between p-5">
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">{stat.label}</p>
                                        <span className="text-2xl">{stat.icon}</span>
                                    </div>
                                    <div className="flex items-end justify-between mt-4">
                                        <h3 className="text-2xl md:text-3xl font-black">{stat.value}</h3>
                                        <span className={`text-${stat.color}-500 text-[10px] font-black`}>{stat.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Delivery Status Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { label: 'Pending', count: shipments.filter(s => s.status === 'pending').length, color: 'yellow', icon: '⏳' },
                                { label: 'In Transit', count: shipments.filter(s => s.status === 'in-transit').length, color: 'blue', icon: '🚛' },
                                { label: 'Delivered', count: shipments.filter(s => s.status === 'delivered').length, color: 'green', icon: '📬' },
                            ].map((item, i) => (
                                <div key={i} className={`glass-card flex items-center gap-4 border-l-4 border-${item.color}-400 p-5`}>
                                    <span className="text-3xl md:text-2xl">{item.icon}</span>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.label}</p>
                                        <h3 className="text-2xl md:text-3xl font-black">{item.count}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            {/* Live Map */}
                            <div className="lg:col-span-2 glass-card overflow-hidden h-[350px] md:h-[450px] p-0 shadow-lg">
                                <div className="px-6 pt-5 pb-3 flex items-center gap-2 bg-white/50 backdrop-blur sticky top-0 z-10 border-b border-gray-100">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <h3 className="text-sm md:text-base font-black uppercase tracking-tighter">Live Logistics Feed</h3>
                                </div>
                                <div className="h-full">
                                    <TrackingMap shipments={liveMapShipments} />
                                </div>
                            </div>
                            {/* AI Alerts */}
                            <div className="glass-card space-y-4 p-6 bg-white overflow-hidden">
                                <h3 className="text-lg md:text-xl font-black mb-2 flex items-center gap-2">
                                    <span className="animate-pulse">🤖</span> Neural Alerts
                                </h3>
                                <div className="space-y-3 max-h-[300px] md:max-h-none overflow-y-auto pr-1">
                                    {[
                                        { msg: 'Weather Anomaly in NY', type: 'Delay Risk: 85%', status: 'critical' },
                                        { msg: 'Driver 402 Offline', type: 'Route stalled', status: 'warning' },
                                        { msg: 'High Traffic: I-95 South', type: 'ETA +45m', status: 'warning' },
                                        { msg: 'TF-DEMO-001: Manual Delay', type: 'Weather Reported', status: 'critical' },
                                    ].map((alert, i) => (
                                        <div key={i} className={`p-4 rounded-xl border-l-4 transition-all hover:translate-x-1 ${alert.status === 'critical' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-yellow-50 border-yellow-500 text-yellow-700'}`}>
                                            <p className="font-black text-xs md:text-sm">{alert.msg}</p>
                                            <p className="text-[10px] opacity-70 font-bold mt-1 uppercase tracking-tighter">{alert.type}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full btn-glass text-[10px] font-black uppercase py-2.5 tracking-widest mt-2" onClick={() => setActiveTab('ai')}>Intelligence Center →</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SHIPMENTS ─── */}
                {activeTab === 'shipments' && (
                    <div className="space-y-6">
                        {shipmentCreated && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <span className="text-xl">✅</span> 
                                <p className="text-sm">New shipment successfully bridged to the network.</p>
                            </div>
                        )}
                        <div className="glass-card p-6 overflow-hidden">
                            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                                <h3 className="text-xl md:text-2xl font-black">Fleet-Wide Shipments</h3>
                                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                                    <input type="text" placeholder="Search..." className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]" />
                                    <select className="bg-gray-50 border-none rounded-xl px-3 py-2.5 text-sm outline-none font-bold text-gray-500">
                                        <option>Status: All</option>
                                        <option>In Transit</option>
                                        <option>Delivered</option>
                                    </select>
                                    <button onClick={() => setShowCreateShipment(true)} className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap">+ Create</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead>
                                        <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-4">Tracking ID</th>
                                            <th className="pb-4">Endpoint</th>
                                            <th className="pb-4">Operator</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4">AI Risk</th>
                                            <th className="pb-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {shipments.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 font-black text-blue-700">{row.trackingNumber}</td>
                                                <td className="py-4">
                                                    <p className="font-bold text-gray-700 truncate max-w-[150px]">{row.receiver?.address || row.to}</p>
                                                </td>
                                                <td className="py-4 font-bold text-gray-500">{row.assignedDriver?.name || row.driver || 'Pending...'}</td>
                                                <td className="py-4"><StatusBadge status={row.status} /></td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-tighter ${row.risk === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{row.risk || 'Normal'}</span>
                                                </td>
                                                <td className="py-4 text-right flex gap-2 justify-end">
                                                    <button onClick={() => setAssignModal(row._id)} className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 uppercase tracking-tighter">Assign</button>
                                                    <button className="text-[10px] font-black bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 uppercase tracking-tighter">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── DRIVERS ─── */}
                {activeTab === 'drivers' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl md:text-2xl font-black">Operator Management</h3>
                            <button onClick={() => setShowAddDriver(true)} className="btn-primary text-xs px-5 py-2.5">+ Add Operator</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                            {drivers.map((driver, i) => (
                                <div key={i} className="glass-card hover:translate-y-[-4px] transition-all p-5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative">
                                            <img src={`https://i.pravatar.cc/150?u=${driver.user?.name || driver.name}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" alt="" />
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${driver.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-800 truncate">{driver.user?.name || driver.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{driver.status}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Total Tasks</p>
                                            <p className="text-sm font-black text-gray-800">{driver.performance?.totalDeliveries || driver.trips || 0}</p>
                                        </div>
                                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">AI Rating</p>
                                            <p className="text-sm font-black text-yellow-500">★ {driver.performance?.rating || driver.rating || 0}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-gray-400">Current Capacity</span>
                                            <span className="text-gray-700">{driver.load || '0%'}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)]" style={{ width: driver.load || '0%' }}></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-5 pt-5 border-t border-gray-50">
                                        <button className="flex-1 py-2 text-[10px] font-black text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 uppercase tracking-widest">Connect</button>
                                        <button className="flex-1 py-2 text-[10px] font-black text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-100 uppercase tracking-widest">File</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── VEHICLES ─── */}
                {activeTab === 'vehicles' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl md:text-2xl font-black">Fleet Assets</h3>
                            <button onClick={() => setShowAddVehicle(true)} className="btn-primary text-xs px-5 py-2.5">+ Add Asset</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                            {vehicles.map((vehicle, i) => (
                                <div key={i} className="glass-card hover:border-blue-200 transition-all space-y-5 p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-xl text-gray-900 tracking-tighter leading-tight">{vehicle.plateNumber}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{vehicle.model}</p>
                                        </div>
                                        <StatusBadge status={vehicle.status} />
                                    </div>
                                    <div className="flex gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-50">
                                        <div className="flex-1">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Class</p>
                                            <p className="text-xs font-black capitalize text-gray-700">{vehicle.type}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Limit</p>
                                            <p className="text-xs font-black text-gray-700">{vehicle.capacity || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        {vehicle.assignedDriver ? (
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Operator</p>
                                                <p className="text-xs font-black text-blue-600 truncate">{vehicle.assignedDriver.name}</p>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-black text-gray-300 uppercase italic">Standby</p>
                                        )}
                                        <button className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center shadow-inner transition-colors">⚙️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── SUPPORT ─── */}
                {activeTab === 'support' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 min-h-[500px]">
                        <div className={`lg:col-span-1 space-y-4 ${selectedTicket ? 'hidden lg:block' : 'block'}`}>
                            <h3 className="text-xl md:text-2xl font-black mb-4">Support Queue</h3>
                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-hide">
                                {tickets.map((ticket, i) => (
                                    <button key={i} onClick={() => setSelectedTicket(ticket)} className={`w-full text-left glass-card p-4 transition-all hover:border-blue-200 group relative ${selectedTicket?._id === ticket._id ? 'border-blue-500 ring-2 ring-blue-500/10' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-xs text-blue-700 tracking-tighter">ID: {ticket._id.substring(0, 8)}</p>
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <p className="text-xs font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tighter truncate">{ticket.customer?.name || ticket.customer || 'Guest'}</p>
                                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-medium italic">"{ticket.issue}"</p>
                                        <p className="text-[9px] text-gray-400 mt-3 font-black uppercase tracking-widest text-right">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={`lg:col-span-2 ${selectedTicket ? 'block' : 'hidden lg:flex lg:items-center lg:justify-center'}`}>
                            {selectedTicket ? (
                                <div className="glass-card space-y-6 flex flex-col p-6 h-full bg-white shadow-xl">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setSelectedTicket(null)} className="lg:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">←</button>
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight">{selectedTicket._id.substring(0, 12)}...</h3>
                                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Origin: {selectedTicket.customer?.name || selectedTicket.customer}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 scale-90 md:scale-100 origin-right">
                                            <StatusBadge status={selectedTicket.status} />
                                            <span className={`px-2 py-1 rounded-[4px] text-[9px] font-black uppercase ${selectedTicket.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{selectedTicket.priority}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex-1">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Transmission Content</p>
                                        <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed italic">"{selectedTicket.issue}"</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Bridge Response</p>
                                            <textarea rows={4} className={inputClass} placeholder="Synthesize response..." value={adminResponse} onChange={e => setAdminResponse(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button onClick={handleRespondTicket} className="flex-1 btn-primary py-3.5 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">Transmit Reponse</button>
                                            <button onClick={handleResolveTicket} className="flex-1 py-3.5 font-black text-xs text-green-700 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 uppercase tracking-[0.2em]">Close Node</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card h-full flex items-center justify-center p-12 text-center bg-gray-50/50 border-dashed border-2 border-gray-200">
                                    <div>
                                        <div className="text-6xl mb-6 opacity-30 select-none">📡</div>
                                        <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Awaiting Signal Selection</p>
                                        <p className="text-xs text-gray-400 mt-2">Connect to a transmission to bridge communications.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── STATIONS ─── */}
                {activeTab === 'stations' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black">Logistic Hubs & Stops</h3>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">Network nodes and driver infrastructure.</p>
                            </div>
                            <button onClick={() => setShowAddStation(true)} className="w-full md:w-auto btn-primary text-xs px-6 py-2.5">+ Add Node</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                            {stations.map((station, i) => (
                                <div key={i} className="glass-card space-y-5 p-5 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-inner border border-gray-100">
                                                {station.type === 'food' ? '🍽️' : '⛽'}
                                            </div>
                                            <div>
                                                <p className="font-black text-base text-gray-800 leading-none">{station.name}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{station.type === 'food' ? 'Nutrition Stop' : 'Fuel Matrix'}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={station.status} />
                                    </div>
                                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Coordinates</p>
                                        <p className="text-xs font-bold text-gray-600 truncate">📍 {station.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 px-1">Infrastructure</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {station.facilities.map((facility, fi) => (
                                                <span key={fi} className="px-2 py-0.5 bg-blue-50/70 text-blue-600 rounded-[4px] text-[8px] font-black uppercase tracking-tighter border border-blue-100/50">{facility}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button className="flex-1 py-1.5 text-[9px] font-black text-blue-600 bg-blue-50/50 rounded-lg hover:bg-blue-100 uppercase tracking-widest border border-blue-100">Config</button>
                                        <button className={`flex-1 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest border ${station.status === 'active' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                            {station.status === 'active' ? 'Disable' : 'Online'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── AI ANALYTICS ─── */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card bg-gradient-to-br from-indigo-50 to-white shadow-indigo-100/50">
                                <p className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-1">Avg. System Delay</p>
                                <h3 className="text-4xl font-black text-indigo-900">{aiData?.averageDelayMinutes || 18}<span className="text-xl text-indigo-300 ml-1">min</span></h3>
                                <p className="text-sm font-medium text-indigo-600 mt-2">Across all active routes</p>
                            </div>
                            <div className="glass-card flex flex-col justify-center">
                                <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">Delay Factors</p>
                                <div className="space-y-3">
                                    {[['Traffic Congestion', aiData?.trafficImpact || 65, 'red'], ['Weather Conditions', aiData?.weatherImpact || 30, 'blue'], ['Driver Delays', 15, 'orange']].map(([label, value, color], i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-gray-600">{label}</span>
                                                <span className={`text-${color}-500`}>{value}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card border-l-4 border-l-orange-500 bg-orange-50/50">
                                <h3 className="text-lg font-black text-gray-800 mb-2">Predictive Recommendation</h3>
                                <p className="text-sm font-medium text-gray-600">
                                    "High probability of heavy congestion on <span className="font-bold text-orange-600">I-95 North</span> between 14:00 and 17:00. Recommend rerouting upcoming shipments via Route 1."
                                </p>
                                <button className="mt-4 text-sm font-bold text-orange-600 hover:text-orange-700 underline">Apply Rerouting</button>
                            </div>
                        </div>

                        <div className="glass-card">
                            <h3 className="text-xl font-black mb-6">All AI Alerts & Delay Events</h3>
                            <div className="space-y-3">
                                {[
                                    { shipment: 'TF-TN-DEMO', msg: 'Approaching Coimbatore — Minor congestion detected on Salem Bypass.', severity: 'low', time: '2 min ago' },
                                    { shipment: 'TF-DEMO-001', msg: 'Driver manually reported delay: Weather Conditions (+30 mins)', severity: 'high', time: '15 min ago' },
                                    { shipment: 'TRK-XP-992', msg: 'AI predicts 85% delay probability due to gridlock on I-95', severity: 'critical', time: '32 min ago' },
                                    { shipment: 'TF-DEMO-003', msg: 'Shipment still pending — no driver assigned', severity: 'medium', time: '1 hr ago' },
                                ].map((alert, i) => (
                                    <div key={i} className={`p-4 rounded-2xl flex items-start gap-4 border ${alert.severity === 'critical' ? 'bg-red-50 border-red-200' : alert.severity === 'high' ? 'bg-orange-50 border-orange-200' : alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                        <span className="text-2xl">{alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : alert.severity === 'medium' ? '🔔' : 'ℹ️'}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-black text-sm text-gray-800">{alert.shipment}</p>
                                                <p className="text-xs text-gray-400 font-bold">{alert.time}</p>
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium">{alert.msg}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card">
                            <h3 className="text-xl font-black mb-6">Most Delayed Routes (AI Detected)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-4">Origin</th>
                                            <th className="pb-4">Destination</th>
                                            <th className="pb-4">Avg. Delay</th>
                                            <th className="pb-4 text-right">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {(aiData?.mostDelayedRoutes || [{ origin: 'Mumbai', destination: 'Pune', avgDelay: 45 }, { origin: 'Chennai', destination: 'Bangalore', avgDelay: 32 }]).map((route, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 font-bold text-gray-800">{route.origin}</td>
                                                <td className="py-4 font-bold text-gray-800">{route.destination}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${route.avgDelay > 30 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        +{route.avgDelay} min
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right text-gray-400">📈</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODALS ─── */}

            {/* Create Shipment Modal */}
            {showCreateShipment && (
                <Modal title="Create New Shipment" onClose={() => setShowCreateShipment(false)}>
                    <form onSubmit={handleCreateShipment} className="space-y-4">
                        <input className={inputClass} required placeholder="Tracking Number (e.g. TF-2026-001)" value={newShipment.trackingNumber} onChange={e => setNewShipment({ ...newShipment, trackingNumber: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <input className={inputClass} required placeholder="Sender Name" value={newShipment.senderName} onChange={e => setNewShipment({ ...newShipment, senderName: e.target.value })} />
                            <input className={inputClass} required placeholder="Sender Address" value={newShipment.senderAddress} onChange={e => setNewShipment({ ...newShipment, senderAddress: e.target.value })} />
                            <input className={inputClass} required placeholder="Receiver Name" value={newShipment.receiverName} onChange={e => setNewShipment({ ...newShipment, receiverName: e.target.value })} />
                            <input className={inputClass} required placeholder="Receiver Address" value={newShipment.receiverAddress} onChange={e => setNewShipment({ ...newShipment, receiverAddress: e.target.value })} />
                        </div>
                        <input className={inputClass} placeholder="Carrier Name" value={newShipment.carrier} onChange={e => setNewShipment({ ...newShipment, carrier: e.target.value })} />
                        <select className={inputClass} value={newShipment.assignedDriver} onChange={e => setNewShipment({ ...newShipment, assignedDriver: e.target.value })}>
                            <option value="">Assign Driver (Optional)</option>
                            {drivers.map(d => <option key={d._id} value={d._id}>{d.user?.name || d.name}</option>)}
                        </select>
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all">Create Shipment</button>
                    </form>
                </Modal>
            )}

            {/* Assign Driver Modal */}
            {assignModal && (
                <Modal title={`Assign Driver to ${assignModal}`} onClose={() => setAssignModal(null)}>
                    <div className="space-y-4">
                        <select className={inputClass} value={assignDriver} onChange={e => setAssignDriver(e.target.value)}>
                            <option value="">Select Driver</option>
                            {drivers.map(d => <option key={d._id} value={d._id}>{d.user?.name || d.name} — {d.status}</option>)}
                        </select>
                        <button
                            onClick={() => { setAssignModal(null); setAssignDriver(''); }}
                            className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all"
                        >
                            Confirm Assignment
                        </button>
                    </div>
                </Modal>
            )}

            {/* Add Vehicle Modal */}
            {showAddVehicle && (
                <Modal title="Add New Vehicle" onClose={() => setShowAddVehicle(false)}>
                    <form onSubmit={handleAddVehicle} className="space-y-4">
                        <input required className={inputClass} placeholder="Plate Number (e.g. TN-01-AX-1234)" value={newVehicle.plateNumber} onChange={e => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })} />
                        <input required className={inputClass} placeholder="Model (e.g. Tata Prima 4028.S)" value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                        <select className={inputClass} value={newVehicle.type} onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}>
                            <option>Truck</option><option>Van</option><option>Bike</option><option>Drone</option>
                        </select>
                        <input required className={inputClass} placeholder="Capacity (e.g. 15 tons)" value={newVehicle.capacity} onChange={e => setNewVehicle({ ...newVehicle, capacity: e.target.value })} />
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all">Add Vehicle</button>
                    </form>
                </Modal>
            )}

            {/* Add Driver Modal */}
            {showAddDriver && (
                <Modal title="Add New Driver" onClose={() => setShowAddDriver(false)}>
                    <form onSubmit={handleAddDriver} className="space-y-4">
                        <input required className={inputClass} placeholder="Full Name" value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} />
                        <input required className={inputClass} placeholder="Phone Number" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} />
                        <input required className={inputClass} placeholder="License Number" value={newDriver.license} onChange={e => setNewDriver({ ...newDriver, license: e.target.value })} />
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all">Add Driver</button>
                    </form>
                </Modal>
            )}

            {/* Add Station Modal */}
            {showAddStation && (
                <Modal title="Add Station / Food Stop" onClose={() => setShowAddStation(false)}>
                    <form onSubmit={handleAddStation} className="space-y-4">
                        <input required className={inputClass} placeholder="Station Name" value={newStation.name} onChange={e => setNewStation({ ...newStation, name: e.target.value })} />
                        <select className={inputClass} value={newStation.type} onChange={e => setNewStation({ ...newStation, type: e.target.value })}>
                            <option value="station">⛽ Travel Station</option>
                            <option value="food">🍽️ Food Stop</option>
                        </select>
                        <input required className={inputClass} placeholder="Location (City, State)" value={newStation.location} onChange={e => setNewStation({ ...newStation, location: e.target.value })} />
                        <input required className={inputClass} placeholder="Facilities (Fuel, Food, Restroom, Parking...)" value={newStation.facilities} onChange={e => setNewStation({ ...newStation, facilities: e.target.value })} />
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all">Add Station</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AdminPanel;
