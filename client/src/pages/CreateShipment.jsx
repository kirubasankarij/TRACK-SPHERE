import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const generateTrackingId = () => 'TRK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString().slice(-4);

const inputClass = "w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400";

const CreateShipment = () => {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const [form, setForm] = useState({
        senderName: '', senderPhone: '', senderAddress: '',
        receiverName: '', receiverPhone: '', receiverAddress: '',
        packageType: 'parcel', weight: '', length: '', width: '', height: '',
        deliveryType: 'standard', specialInstructions: ''
    });

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1500));
        const id = generateTrackingId();
        // Save to localStorage for ShipmentHistory page
        const existing = JSON.parse(localStorage.getItem('tf_shipments') || '[]');
        existing.unshift({
            trackingNumber: id,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            sender: { name: form.senderName, phone: form.senderPhone, address: form.senderAddress },
            receiver: { name: form.receiverName, phone: form.receiverPhone, address: form.receiverAddress },
            packageType: form.packageType, weight: form.weight, deliveryType: form.deliveryType,
            specialInstructions: form.specialInstructions
        });
        localStorage.setItem('tf_shipments', JSON.stringify(existing));
        setTrackingId(id);
        setSubmitting(false);
        toast.success('Shipment request created!');
    };

    if (trackingId) {
        return (
            <div className="max-w-lg mx-auto mt-10 text-center">
                <div className="glass-card space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter mb-2">Shipment Created! 🎉</h2>
                        <p className="text-gray-500">Your shipment request has been successfully submitted.</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Your Tracking ID</p>
                        <p className="text-3xl font-black text-blue-700 tracking-wider">{trackingId}</p>
                        <p className="text-xs text-gray-400 mt-2">Save this number to track your shipment</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to={`/track?id=${trackingId}`} className="flex-1 btn-primary text-center py-3 rounded-xl font-bold">
                            Track Shipment
                        </Link>
                        <Link to="/history" className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-center">
                            View History
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter">Create <span className="text-blue-600">Shipment</span></h1>
                <p className="text-gray-500">Fill in the details below to request a new delivery</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center gap-4">
                {['Sender & Receiver', 'Package Details', 'Review'].map((label, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-300' : 'bg-gray-100 text-gray-400'}`}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span className={`text-sm font-bold hidden sm:block ${step === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
                        </div>
                        {i < 2 && <div className={`h-0.5 w-10 rounded-full ${step > i + 1 ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Sender & Receiver */}
                {step === 1 && (
                    <div className="glass-card space-y-8 animate-fadeIn">
                        {/* Sender */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">📦</span>
                                Sender Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Full Name *</label>
                                    <input name="senderName" value={form.senderName} onChange={handle} required className={inputClass} placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Phone Number *</label>
                                    <input name="senderPhone" value={form.senderPhone} onChange={handle} required className={inputClass} placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Pickup Address *</label>
                                <input name="senderAddress" value={form.senderAddress} onChange={handle} required className={inputClass} placeholder="123 Main St, Mumbai, Maharashtra 400001" />
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200" />

                        {/* Receiver */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <span className="w-7 h-7 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">🏠</span>
                                Receiver Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Full Name *</label>
                                    <input name="receiverName" value={form.receiverName} onChange={handle} required className={inputClass} placeholder="Jane Smith" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Phone Number *</label>
                                    <input name="receiverPhone" value={form.receiverPhone} onChange={handle} required className={inputClass} placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Delivery Address *</label>
                                <input name="receiverAddress" value={form.receiverAddress} onChange={handle} required className={inputClass} placeholder="456 Park Ave, Delhi, Delhi 110001" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => setStep(2)} className="btn-primary px-8 py-3 rounded-xl font-bold">
                                Next: Package Details →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Package Details */}
                {step === 2 && (
                    <div className="glass-card space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-black">Package Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Package Type *</label>
                                <select name="packageType" value={form.packageType} onChange={handle} className={inputClass}>
                                    <option value="parcel">Parcel / Box</option>
                                    <option value="document">Document / Envelope</option>
                                    <option value="fragile">Fragile Item</option>
                                    <option value="heavy">Heavy / Bulk</option>
                                    <option value="perishable">Perishable / Food</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Weight (kg) *</label>
                                <input name="weight" type="number" step="0.1" min="0.1" value={form.weight} onChange={handle} required className={inputClass} placeholder="2.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Dimensions (cm)</label>
                            <div className="grid grid-cols-3 gap-4">
                                <input name="length" type="number" value={form.length} onChange={handle} className={inputClass} placeholder="Length" />
                                <input name="width" type="number" value={form.width} onChange={handle} className={inputClass} placeholder="Width" />
                                <input name="height" type="number" value={form.height} onChange={handle} className={inputClass} placeholder="Height" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Delivery Type</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'standard', label: '🚚 Standard', sub: '3–5 days' },
                                    { value: 'express', label: '⚡ Express', sub: '1–2 days' },
                                    { value: 'same-day', label: '🚀 Same Day', sub: 'Today' },
                                ].map(opt => (
                                    <label key={opt.value} className={`cursor-pointer border-2 rounded-2xl p-4 transition-all ${form.deliveryType === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <input type="radio" name="deliveryType" value={opt.value} checked={form.deliveryType === opt.value} onChange={handle} className="hidden" />
                                        <p className="font-bold text-sm">{opt.label}</p>
                                        <p className="text-xs text-gray-400 mt-1">{opt.sub}</p>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Special Instructions</label>
                            <textarea name="specialInstructions" value={form.specialInstructions} onChange={handle} rows="3" className={inputClass} placeholder="e.g. Handle with care, Leave at door, Call before delivery..." />
                        </div>

                        <div className="flex justify-between gap-4">
                            <button type="button" onClick={() => setStep(1)} className="px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                                ← Back
                            </button>
                            <button type="button" onClick={() => setStep(3)} className="btn-primary px-8 py-3 rounded-xl font-bold">
                                Next: Review →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="glass-card space-y-6">
                            <h2 className="text-xl font-black">Review Your Shipment</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50/60 rounded-2xl p-5 space-y-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-blue-400">From</p>
                                    <p className="font-black text-lg">{form.senderName}</p>
                                    <p className="text-sm text-gray-500">{form.senderPhone}</p>
                                    <p className="text-sm text-gray-600">{form.senderAddress}</p>
                                </div>
                                <div className="bg-purple-50/60 rounded-2xl p-5 space-y-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-purple-400">To</p>
                                    <p className="font-black text-lg">{form.receiverName}</p>
                                    <p className="text-sm text-gray-500">{form.receiverPhone}</p>
                                    <p className="text-sm text-gray-600">{form.receiverAddress}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-2xl p-4">
                                <div><p className="text-xs text-gray-400 font-bold uppercase">Type</p><p className="font-bold capitalize">{form.packageType}</p></div>
                                <div><p className="text-xs text-gray-400 font-bold uppercase">Weight</p><p className="font-bold">{form.weight || '—'} kg</p></div>
                                <div><p className="text-xs text-gray-400 font-bold uppercase">Delivery</p><p className="font-bold capitalize">{form.deliveryType}</p></div>
                                <div><p className="text-xs text-gray-400 font-bold uppercase">Dimensions</p><p className="font-bold">{form.length && form.width && form.height ? `${form.length}×${form.width}×${form.height}` : '—'}</p></div>
                            </div>

                            {form.specialInstructions && (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                                    <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-1">Special Instructions</p>
                                    <p className="text-sm text-gray-700">{form.specialInstructions}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between gap-4">
                            <button type="button" onClick={() => setStep(2)} className="px-8 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                                ← Back
                            </button>
                            <button type="submit" disabled={submitting} className="btn-primary px-10 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                {submitting ? (
                                    <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting...</>
                                ) : '🚀 Confirm & Create Shipment'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateShipment;
