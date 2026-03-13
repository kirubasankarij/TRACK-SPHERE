import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        const result = await login(formData.email, formData.password);
        setIsLoggingIn(false);

        if (result.success) {
            toast.success('Login successful! Welcome back.');
            // Redirection logic based on role if needed, or just home
            setTimeout(() => navigate('/'), 1500);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-md">
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 glass">
                <h2 className="text-4xl font-black mb-8 text-center tracking-tighter">Welcome <span className="text-blue-600">Back</span></h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full bg-white/50 border border-gray-200 rounded-2xl shadow-sm p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full bg-white/50 border border-gray-200 rounded-2xl shadow-sm p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full btn-primary font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoggingIn ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600 font-medium">
                    New to TrackSphere? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
