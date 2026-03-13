import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const DriverLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            toast.success('Terminal Ready. Loading Route Data...');
            setTimeout(() => navigate('/driver'), 1500);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full glass-card border-orange-500/30 shadow-2xl p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg"></div>
                
                <div className="text-center mb-10">
                    <div className="inline-block p-4 rounded-3xl bg-orange-50 text-orange-600 mb-6 shadow-sm">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Driver Terminal</h2>
                    <p className="text-gray-500 font-medium">Logistics Field Interface</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Driver ID (Email)</label>
                        <input
                            type="email"
                            placeholder="driver@tracksphere.com"
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-lg font-bold"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Terminal PIN</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-lg font-bold"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white font-bold py-5 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 text-xl"
                    >
                        {loading ? 'Initializing...' : 'Start Shift'}
                    </button>
                </form>

                <div className="mt-10 text-center grid grid-cols-2 gap-4">
                    <Link to="/login" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-tighter">Standard Login</Link>
                    <Link to="/support" className="text-xs font-bold text-gray-400 hover:text-red-600 uppercase tracking-tighter">Terminal Help</Link>
                </div>
            </div>
        </div>
    );
};

export default DriverLogin;
