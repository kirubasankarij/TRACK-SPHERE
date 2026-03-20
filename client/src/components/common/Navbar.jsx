import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center mb-6 md:mb-8 mx-2 md:mx-4 mt-2 md:mt-4 bg-ai-navbar/50 backdrop-blur-lg border-white/10">
            <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter shrink-0 text-white" onClick={() => setIsMenuOpen(false)}>
                Track<span className="text-primary">Sphere</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 font-bold text-gray-400">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <Link to="/track" className="hover:text-primary transition-colors">Tracking</Link>
                {user?.role === 'admin' && (
                    <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
                )}
                {user?.role === 'driver' && (
                    <Link to="/driver" className="hover:text-primary transition-colors">Driver</Link>
                )}
                <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                {user ? (
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Welcome back</span>
                            <span className="font-black text-white text-sm">{user.name || user.email.split('@')[0]}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-glass py-1.5 md:py-2 px-4 md:px-6 text-xs md:text-sm font-bold border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-all whitespace-nowrap"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 md:gap-4">
                        <a href="#portals" className="hidden sm:block btn-glass py-2 px-6 text-sm font-bold whitespace-nowrap border-white/10 hover:bg-white/5">Portals</a>
                        <Link to="/register" className="btn-primary py-1.5 md:py-2 px-4 md:px-6 text-xs md:text-sm font-bold shadow-lg shadow-primary/20 whitespace-nowrap">Join Now</Link>
                    </div>
                )}

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-gray-400 hover:text-primary transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 mx-2 p-6 glass-card md:hidden flex flex-col space-y-4 font-bold text-gray-400 animate-in fade-in slide-in-from-top-4 duration-300 bg-ai-navbar/90 backdrop-blur-2xl border-white/10">
                    <Link to="/" className="hover:text-primary py-2 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/track" className="hover:text-primary py-2 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Tracking</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="hover:text-primary py-2 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                    )}
                    {user?.role === 'driver' && (
                        <Link to="/driver" className="hover:text-primary py-2 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Driver</Link>
                    )}
                    <Link to="/support" className="hover:text-primary py-2 border-b border-white/5" onClick={() => setIsMenuOpen(false)}>Support</Link>
                    {!user && (
                        <a href="#portals" className="text-blue-600 py-2" onClick={() => setIsMenuOpen(false)}>Access Portals</a>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
