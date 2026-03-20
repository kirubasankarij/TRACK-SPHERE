import React, { useState } from 'react';

const FuelTracker = () => {
    const [logs, setLogs] = useState([
        { id: 1, date: '2026-03-10', station: 'Indian Oil', amount: 45.5, cost: 4641.00, mileage: 45200 },
        { id: 2, date: '2026-03-05', station: 'Bharat Petroleum', amount: 38.2, cost: 3896.40, mileage: 44850 }
    ]);

    const [form, setForm] = useState({
        station: '',
        amount: '',
        cost: '',
        mileage: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const newLog = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            ...form,
            amount: parseFloat(form.amount),
            cost: parseFloat(form.cost),
            mileage: parseInt(form.mileage)
        };
        setLogs([newLog, ...logs]);
        setForm({ station: '', amount: '', cost: '', mileage: '' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="glass-card p-8 sticky top-8">
                    <h3 className="text-xl font-black mb-6 text-orange-600">Log Fuel Intake</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Station Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-white/5 border-none rounded-xl p-4 font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-orange-500" 
                                placeholder="e.g. Shell Global"
                                value={form.station}
                                onChange={e => setForm({...form, station: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Liters</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full bg-white/5 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" 
                                    placeholder="45"
                                    value={form.amount}
                                    onChange={e => setForm({...form, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cost (₹)</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full bg-white/5 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" 
                                    placeholder="85.50"
                                    value={form.cost}
                                    onChange={e => setForm({...form, cost: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Odometer Reading</label>
                            <input 
                                type="number" 
                                required
                                className="w-full bg-white/5 border-none rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" 
                                placeholder="45200"
                                value={form.mileage}
                                onChange={e => setForm({...form, mileage: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="w-full btn-primary bg-orange-600 hover:bg-orange-700 py-4 mt-4 shadow-orange-500/20">
                            Confirm Entry
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="glass-card overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="text-xl font-black">Expense Logs</h3>
                            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Avg Cost: ₹102/L</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Station</th>
                                    <th className="px-8 py-4">Usage</th>
                                    <th className="px-8 py-4">Odometer</th>
                                    <th className="px-8 py-4 text-right">Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5 font-bold text-sm text-gray-500">{log.date}</td>
                                        <td className="px-8 py-5 font-black text-white">{log.station}</td>
                                        <td className="px-8 py-5 font-bold text-sm">{log.amount} L</td>
                                        <td className="px-8 py-5 font-mono text-xs text-blue-600">{log.mileage} km</td>
                                        <td className="px-8 py-5 text-right font-black text-lg text-white">₹{log.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuelTracker;
