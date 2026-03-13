import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock default shipments for demo when localStorage is empty
const DEMO_SHIPMENTS = [
    {
        trackingNumber: 'TRK-DEMO-1001',
        status: 'delivered',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        estimatedDelivery: new Date(Date.now() - 2 * 86400000).toISOString(),
        deliveredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        sender: { name: 'Amazon Warehouse', phone: '+91 80000 00001', address: 'Fulfillment Centre, Bhiwandi, Mumbai' },
        receiver: { name: 'You', phone: '+91 99999 00001', address: '42 Green Park, New Delhi, 110016' },
        packageType: 'parcel', weight: '1.2', deliveryType: 'express',
        assignedDriver: { name: 'S. Wilson', phone: '+91 88888 77777' }
    },
    {
        trackingNumber: 'TRK-DEMO-2002',
        status: 'in-transit',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 1 * 86400000).toISOString(),
        sender: { name: 'Flipkart Hub', phone: '+91 80000 00002', address: 'Regional Hub, Pune, Maharashtra' },
        receiver: { name: 'You', phone: '+91 99999 00001', address: '42 Green Park, New Delhi, 110016' },
        packageType: 'fragile', weight: '3.0', deliveryType: 'standard',
        assignedDriver: { name: 'Amit Verma', phone: '+91 99999 11111' }
    },
    {
        trackingNumber: 'TRK-DEMO-3003',
        status: 'out-for-delivery',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        estimatedDelivery: new Date().toISOString(),
        sender: { name: 'Myntra Logistics', phone: '+91 80000 00003', address: 'Sort Facility, Bengaluru, Karnataka' },
        receiver: { name: 'You', phone: '+91 99999 00001', address: '42 Green Park, New Delhi, 110016' },
        packageType: 'parcel', weight: '0.8', deliveryType: 'same-day',
        assignedDriver: { name: 'Raj Kumar', phone: '+91 98765 43210' }
    },
];

const STATUS_STYLES = {
    'pending':          'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'in-transit':       'bg-blue-100 text-blue-700 border border-blue-200',
    'out-for-delivery': 'bg-orange-100 text-orange-700 border border-orange-200',
    'delivered':        'bg-green-100 text-green-700 border border-green-200',
    'cancelled':        'bg-red-100 text-red-700 border border-red-200',
};

const STATUS_LABELS = {
    'pending': '🕐 Pending',
    'in-transit': '🚚 In Transit',
    'out-for-delivery': '🚀 Out for Delivery',
    'delivered': '✅ Delivered',
    'cancelled': '❌ Cancelled',
};

/* ────────────────────────── OTP MODAL ────────────────────────── */
const OTPModal = ({ trackingNumber, onClose, onSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [resent, setResent] = useState(false);
    const DEMO_OTP = '123456';

    const refs = Array(6).fill(null).map(() => React.createRef());

    const handleInput = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const updated = [...otp];
        updated[i] = val.slice(-1);
        setOtp(updated);
        if (val && i < 5) refs[i + 1].current?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code === DEMO_OTP) {
            toast.success('Delivery verified! OTP accepted ✅');
            onSuccess();
            onClose();
        } else {
            setError('Incorrect OTP. Try: 123456');
        }
    };

    const handleResend = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        setResent(true);
        toast('OTP resent to your registered phone number!', { icon: '📱' });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-2">
                        <span className="text-3xl">🔐</span>
                    </div>
                    <h3 className="text-2xl font-black">Verify Delivery</h3>
                    <p className="text-gray-500 text-sm">Enter the 6-digit OTP sent to your registered phone to confirm receipt of <span className="font-bold text-blue-600">{trackingNumber}</span></p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs text-blue-600 font-bold">
                        Demo OTP: 123456
                    </div>
                </div>

                {/* OTP Boxes */}
                <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={refs[i]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleInput(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className={`w-11 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                        />
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                <button onClick={handleVerify} className="w-full btn-primary py-3 rounded-xl font-bold text-lg">
                    Verify & Confirm Delivery
                </button>

                <div className="text-center">
                    <button onClick={handleResend} className="text-sm text-blue-600 hover:underline font-bold">
                        {resent ? '✓ OTP Resent' : 'Resend OTP'}
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 text-2xl">×</button>
            </div>
        </div>
    );
};

/* ────────────────────────── FEEDBACK MODAL ────────────────────────── */
const FeedbackModal = ({ trackingNumber, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (!rating) { toast.error('Please select a star rating'); return; }
        const feedbacks = JSON.parse(localStorage.getItem('tf_feedbacks') || '{}');
        feedbacks[trackingNumber] = { rating, comment, submittedAt: new Date().toISOString() };
        localStorage.setItem('tf_feedbacks', JSON.stringify(feedbacks));
        toast.success('Thank you for your feedback! ⭐');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-6 relative" onClick={e => e.stopPropagation()}>
                <div className="text-center space-y-1">
                    <span className="text-4xl">💬</span>
                    <h3 className="text-2xl font-black">Rate Your Experience</h3>
                    <p className="text-gray-500 text-sm">Tracking ID: <span className="font-bold text-blue-600">{trackingNumber}</span></p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                            className={`text-4xl transition-transform hover:scale-125 ${star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-200'}`}>
                            ★
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-center text-sm font-bold text-gray-500">
                        {['', 'Very Poor 😞', 'Poor 😕', 'Okay 😐', 'Good 😊', 'Excellent! 🎉'][rating]}
                    </p>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Additional Comments (optional)</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows="3"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="Tell us about your delivery experience..." />
                </div>

                <button onClick={handleSubmit} className="w-full btn-primary py-3 rounded-xl font-bold">
                    Submit Feedback
                </button>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 text-2xl">×</button>
            </div>
        </div>
    );
};

/* ────────────────────────── PROOF OF DELIVERY ────────────────────────── */
const downloadProof = (shipment) => {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>Proof of Delivery – ${shipment.trackingNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #1a1a2e; }
            h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }
            .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { color: #6b7280; font-size: 13px; }
            .val { font-weight: bold; }
            .section { background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
        </style></head><body>
        <h1>📦 Proof of Delivery</h1>
        <div class="section">
            <div class="row"><span class="label">Tracking Number</span><span class="val">${shipment.trackingNumber}</span></div>
            <div class="row"><span class="label">Status</span><span class="badge">✅ Delivered</span></div>
            <div class="row"><span class="label">Delivery Date</span><span class="val">${new Date(shipment.deliveredAt || shipment.estimatedDelivery).toLocaleString()}</span></div>
            <div class="row"><span class="label">Package Type</span><span class="val">${shipment.packageType || 'Parcel'}</span></div>
            <div class="row"><span class="label">Weight</span><span class="val">${shipment.weight || '—'} kg</span></div>
        </div>
        <div class="section">
            <p class="label">FROM</p>
            <p class="val">${shipment.sender?.name}</p>
            <p>${shipment.sender?.address}</p>
        </div>
        <div class="section">
            <p class="label">TO (DELIVERED TO)</p>
            <p class="val">${shipment.receiver?.name}</p>
            <p>${shipment.receiver?.address}</p>
        </div>
        <div class="footer">
            <p>TrackSphere Logistics System • Generated on ${new Date().toLocaleString()}</p>
            <p>This is a digitally generated proof of delivery.</p>
        </div>
        </body></html>
    `);
    win.document.close();
    win.print();
};

/* ────────────────────────── MAIN PAGE ────────────────────────── */
const ShipmentHistory = () => {
    const [shipments, setShipments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [otpTarget, setOtpTarget] = useState(null);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [feedbacks, setFeedbacks] = useState({});

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Check if in demo mode via localStorage (client-side flag)
                const isDemo = localStorage.getItem('demo_mode') === 'true';
                
                if (isDemo) {
                    const stored = JSON.parse(localStorage.getItem('tf_shipments') || '[]');
                    setShipments(stored.length > 0 ? stored : DEMO_SHIPMENTS);
                } else {
                    const res = await axios.get('/customer/shipments');
                    setShipments(res.data.data);
                }
                setFeedbacks(JSON.parse(localStorage.getItem('tf_feedbacks') || '{}'));
            } catch (err) {
                console.error('Failed to fetch history', err);
                // Fallback to demo if API fails
                setShipments(DEMO_SHIPMENTS);
            }
        };
        fetchHistory();
    }, []);

    const filtered = filter === 'all' ? shipments : shipments.filter(s => s.status === filter);

    const markDelivered = (trackingNumber) => {
        setShipments(prev => {
            const updated = prev.map(s => s.trackingNumber === trackingNumber
                ? { ...s, status: 'delivered', deliveredAt: new Date().toISOString() }
                : s
            );
            localStorage.setItem('tf_shipments', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Shipment <span className="text-blue-600">History</span></h1>
                    <p className="text-gray-500 mt-1">{shipments.length} total shipment{shipments.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/create-shipment" className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <span>+</span> New Shipment
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'in-transit', 'out-for-delivery', 'delivered'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'}`}>
                        {f === 'all' ? 'All' : STATUS_LABELS[f]}
                    </button>
                ))}
            </div>

            {/* Shipment Cards */}
            {filtered.length === 0 ? (
                <div className="glass-card text-center py-16 space-y-4">
                    <span className="text-5xl">📭</span>
                    <p className="text-xl font-bold text-gray-400">No shipments found</p>
                    <Link to="/create-shipment" className="btn-primary inline-block px-6 py-3 rounded-xl font-bold">Create your first shipment</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(shipment => {
                        const hasFeedback = !!feedbacks[shipment.trackingNumber];
                        return (
                            <div key={shipment.trackingNumber} className="glass-card hover:shadow-lg transition-shadow">
                                {/* Top Row */}
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Tracking Number</p>
                                        <p className="text-xl font-black text-blue-700">{shipment.trackingNumber}</p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${STATUS_STYLES[shipment.status] || STATUS_STYLES.pending}`}>
                                        {STATUS_LABELS[shipment.status] || shipment.status}
                                    </span>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-3 my-4 flex-wrap">
                                    <div className="bg-blue-50 rounded-xl px-4 py-2 flex-1 min-w-[120px]">
                                        <p className="text-xs text-gray-400 font-bold">FROM</p>
                                        <p className="font-black text-gray-800 text-sm">{shipment.sender?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{shipment.sender?.address}</p>
                                    </div>
                                    <div className="text-blue-400 font-bold text-xl">→</div>
                                    <div className="bg-purple-50 rounded-xl px-4 py-2 flex-1 min-w-[120px]">
                                        <p className="text-xs text-gray-400 font-bold">TO</p>
                                        <p className="font-black text-gray-800 text-sm">{shipment.receiver?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{shipment.receiver?.address}</p>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/80 rounded-2xl p-4 mb-4">
                                    <div><p className="text-xs text-gray-400">Created</p><p className="text-sm font-bold">{new Date(shipment.createdAt).toLocaleDateString()}</p></div>
                                    <div><p className="text-xs text-gray-400">ETA</p><p className="text-sm font-bold">{new Date(shipment.estimatedDelivery).toLocaleDateString()}</p></div>
                                    <div><p className="text-xs text-gray-400">Type</p><p className="text-sm font-bold capitalize">{shipment.packageType || '—'}</p></div>
                                    <div><p className="text-xs text-gray-400">Weight</p><p className="text-sm font-bold">{shipment.weight || '—'} kg</p></div>
                                </div>

                                {/* Driver Info */}
                                {shipment.assignedDriver && (
                                    <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl mb-4 border border-blue-100">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">
                                            🚚
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Courier Partner</p>
                                            <p className="font-black text-gray-800">{shipment.assignedDriver.name}</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</p>
                                            <p className="font-black text-blue-600">{shipment.assignedDriver.phone || 'Available via App'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    <Link to={`/track?id=${shipment.trackingNumber}`} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition">
                                        🗺️ Track Live
                                    </Link>

                                    {shipment.status === 'out-for-delivery' && (
                                        <button onClick={() => setOtpTarget(shipment.trackingNumber)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-100 transition border border-orange-200">
                                            🔐 Verify Delivery (OTP)
                                        </button>
                                    )}

                                    {shipment.status === 'delivered' && (
                                        <button onClick={() => downloadProof(shipment)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition border border-green-200">
                                            📄 Download Proof
                                        </button>
                                    )}

                                    {shipment.status === 'delivered' && (
                                        <button onClick={() => setFeedbackTarget(shipment.trackingNumber)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition border ${hasFeedback ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'}`}>
                                            {hasFeedback ? `⭐ Feedback Submitted (${feedbacks[shipment.trackingNumber].rating}/5)` : '💬 Leave Feedback'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* OTP Modal */}
            {otpTarget && (
                <OTPModal
                    trackingNumber={otpTarget}
                    onClose={() => setOtpTarget(null)}
                    onSuccess={() => markDelivered(otpTarget)}
                />
            )}

            {/* Feedback Modal */}
            {feedbackTarget && (
                <FeedbackModal
                    trackingNumber={feedbackTarget}
                    onClose={() => {
                        setFeedbackTarget(null);
                        setFeedbacks(JSON.parse(localStorage.getItem('tf_feedbacks') || '{}'));
                    }}
                />
            )}
        </div>
    );
};

export default ShipmentHistory;
