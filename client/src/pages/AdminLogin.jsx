import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
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
            toast.success('Admin Authenticated. Accessing Command Center...');
            setTimeout(() => navigate('/admin'), 1500);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full glass-card border-blue-500/30 shadow-2xl p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary shadow-lg"></div>
                <div className="text-center mb-10">
                    <div className="inline-block p-4 rounded-3xl bg-white/5 text-primary mb-6 shadow-sm">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Admin Portal</h2>
                    <p className="text-gray-400 font-medium">Restricted System Access</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Secure ID</label>
                        <input
                            type="email"
                            placeholder="admin@tracksphere.com"
                            className="w-full bg-ai-navbar border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder-gray-600"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Access Key</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-ai-navbar border border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder-gray-600"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Decrypting...' : 'Authenticate'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-primary hover:text-white transition-colors">Standard User Login</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
