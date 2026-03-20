import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer'
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(formData.name, formData.email, formData.phone, formData.password, formData.role);

        if (result.success) {
            setIsSuccess(true);
            toast.success('Registration successful! Please login.');
        } else {
            toast.error(result.message);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto bg-ai-card/50 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 text-center glass-card">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-accent/20 text-accent rounded-full">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tighter text-white">Account Created!</h2>
                <p className="text-gray-400 mb-8">Your TrackSphere account has been successfully stored in our database. You can now log in to track your shipments.</p>
                <Link to="/login" className="btn-primary w-full inline-block py-4 rounded-2xl text-center font-bold bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-ai-card/50 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 glass-card mt-10">
            <h2 className="text-4xl font-black mb-6 text-center tracking-tighter text-white">Join Track<span className="text-primary">Sphere</span></h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-bold text-gray-400 ml-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-gray-600"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-400 ml-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-gray-600"
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-400 ml-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-gray-600"
                        placeholder="+91 98765 43210"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-400 ml-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-gray-600"
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" className="w-full btn-primary font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary-dark">
                    Register Account
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login here</Link>
            </p>
        </div>
    );
};

export default Register;
