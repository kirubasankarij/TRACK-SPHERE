import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const navigate = useNavigate();

    const handleTrack = (e) => {
        e.preventDefault();
        if (trackingNumber) {
            navigate(`/track?id=${trackingNumber}`);
        }
    };

    return (
        <div className="space-y-12 md:space-y-20 pb-16 md:pb-20 px-4 md:px-0">
            {/* Hero Section */}
            <section className="relative pt-6 md:pt-12 lg:pt-24 flex flex-col lg:flex-row items-center gap-8 md:gap-12 text-center lg:text-left">
                <div className="flex-1 space-y-6 md:space-y-8 max-w-2xl lg:max-w-none mx-auto">
                    <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-bold tracking-wide uppercase">
                        AI-Powered Logistics
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
                        TrackSphere <br />
                        <span className="text-blue-600">Real-Time</span> Tracking
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                        Optimize your shipment flow with AI-based delay prediction,
                        smart ETA calculation, and professional route optimization.
                    </p>

                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row p-1.5 md:p-2 glass max-w-lg rounded-2xl mx-auto lg:mx-0 gap-2">
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter Tracking ID (e.g. TRK-...)"
                            className="flex-grow bg-transparent px-4 py-3 focus:outline-none text-sm md:text-base"
                        />
                        <button type="submit" className="btn-primary py-3 px-8 text-sm md:text-base">
                            Track Now
                        </button>
                    </form>
                </div>

                <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                    <div className="w-full aspect-square glass-card animate-float overflow-hidden">
                        {/* Mock Live Map / Dashboard View */}
                        <div className="h-full bg-blue-50 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-sm" />
                            <div className="z-10 text-center space-y-3 md:space-y-4 p-4 md:p-0">
                                <div className="p-3 md:p-4 bg-white rounded-2xl shadow-xl space-y-2 w-56 md:w-64 text-left mx-auto">
                                    <div className="h-2 w-20 bg-gray-200 rounded" />
                                    <div className="h-4 w-40 bg-blue-600 rounded" />
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="text-[10px] md:text-xs font-bold text-blue-600 uppercase">Moving to SF</div>
                                        <div className="text-[10px] md:text-xs text-gray-400">ETA: 4:30 PM</div>
                                    </div>
                                </div>
                                <div className="p-3 md:p-4 bg-white/50 border border-white rounded-2xl w-56 md:w-64 text-left mx-auto">
                                    <div className="text-[10px] md:text-xs font-bold text-red-500 uppercase">Delay Prediction: 15%</div>
                                    <div className="text-[9px] md:text-[10px] text-gray-500 italic">Traffic anomaly detected</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[
                    { title: "Predictive ETA", desc: "Our regression model predicts delays based on real-time weather and traffic data.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path> },
                    { title: "Route Optimization", desc: "Dynamically calculate the shortest and most fuel-efficient paths for your fleet.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path> },
                    { title: "Secure OTP Delivery", desc: "Ensure secure drop-offs with role-based OTP verification for every shipment.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> }
                ].map((f, idx) => (
                    <div key={idx} className="glass-card hover:translate-y-[-4px] transition-all duration-300">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{f.icon}</svg>
                        </div>
                        <h3 className="text-xl font-black mb-2">{f.title}</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </section>
            
            {/* Login Portals Section */}
            <section id="portals" className="pt-8 md:pt-10">
                <div className="text-center mb-10 md:mb-12">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Direct User <span className="text-blue-600">Portals</span></h2>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto px-4">Access your dedicated interface to manage shipments, track deliveries, or operate the logistics command center.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Portal Cards */}
                    {[
                        { 
                            title: "Customer Portal", 
                            desc: "Track shipments, manage addresses, and receive real-time notifications.", 
                            btn: "Login as Customer", 
                            navigate: () => navigate('/login'),
                            color: "blue",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> 
                        },
                        { 
                            title: "Driver Terminal", 
                            desc: "Access assigned routes, report delays instantly, and verify OTPs.", 
                            btn: "Login as Driver", 
                            navigate: () => navigate('/login/driver'),
                            color: "orange",
                            icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></>
                        },
                        { 
                            title: "Admin Command", 
                            desc: "Master fleet overview, shipment monitoring, and global analytics.", 
                            btn: "Login as Admin", 
                            navigate: () => navigate('/login/admin'),
                            color: "indigo",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> 
                        }
                    ].map((portal, idx) => (
                        <div key={idx} onClick={portal.navigate} className={`glass-card flex flex-col items-center text-center hover:scale-[1.03] transition-all cursor-pointer border-${portal.color}-500/20 hover:border-${portal.color}-500 shadow-sm hover:shadow-xl`}>
                            <div className={`h-16 w-16 bg-${portal.color}-50 text-${portal.color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">{portal.icon}</svg>
                            </div>
                            <h3 className="text-2xl font-black mb-2">{portal.title}</h3>
                            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed px-2">{portal.desc}</p>
                            <button className={`w-full ${portal.color === 'indigo' ? 'bg-gray-900 hover:bg-indigo-600' : portal.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 'btn-primary'} text-white font-bold py-3.5 rounded-xl transition-all mt-auto shadow-lg shadow-${portal.color}-500/20`}>
                                {portal.btn}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
