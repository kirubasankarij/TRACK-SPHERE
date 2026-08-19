import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 3D Rotating Glassmorphic Cube ───────────────────────────────────────────
const SpinningCube = () => (
    <div className="cube-container">
        <div className="cube">
            <div className="cube-face cube-face-front" />
            <div className="cube-face cube-face-back" />
            <div className="cube-face cube-face-right" />
            <div className="cube-face cube-face-left" />
            <div className="cube-face cube-face-top" />
            <div className="cube-face cube-face-bottom" />
        </div>
    </div>
);

// ─── 3D Receding Road / Grid ─────────────────────────────────────────────────
const RoadGrid = () => (
    <div className="road-container">
        <div className="road-plane" />
    </div>
);

// ─── 3D Gyroscope Rings ──────────────────────────────────────────────────────
const Gyroscope = () => (
    <div style={{ perspective: '300px', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="gyro-container">
            <div className="gyro-ring gyro-ring-1" />
            <div className="gyro-ring gyro-ring-2" />
            <div className="gyro-ring gyro-ring-3" />
            <div className="gyro-core" />
        </div>
    </div>
);

// ─── Interactive 3D Portal Card ──────────────────────────────────────────────
const PORTAL_COLORS = {
    blue:   { primary: '#22D3EE', glow: 'glow-backdrop-blue',   warp: '#22D3EE', btnBg: 'rgba(34,211,238,0.15)',  btnBorder: 'rgba(34,211,238,0.5)',  border: 'rgba(34,211,238,0.3)'  },
    orange: { primary: '#FB923C', glow: 'glow-backdrop-orange', warp: '#FB923C', btnBg: 'rgba(251,146,60,0.15)', btnBorder: 'rgba(251,146,60,0.5)', border: 'rgba(251,146,60,0.3)' },
    indigo: { primary: '#818CF8', glow: 'glow-backdrop-indigo', warp: '#818CF8', btnBg: 'rgba(129,140,248,0.15)',btnBorder: 'rgba(129,140,248,0.5)',border: 'rgba(129,140,248,0.3)' },
};

const PortalCard = ({ title, desc, btn, onNavigate, color, graphic: Graphic, badge }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [warping, setWarping] = useState(false);
    const c = PORTAL_COLORS[color];

    const handleMouseMove = useCallback((e) => {
        const rect = cardRef.current.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width  - 0.5;
        const cy = (e.clientY - rect.top)  / rect.height - 0.5;
        setTilt({ x: cy * -16, y: cx * 16 });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    }, []);

    const handleClick = useCallback(() => {
        setWarping(true);
        setTimeout(() => onNavigate(), 850);
    }, [onNavigate]);

    return (
        <>
            {warping && (
                <div className="portal-warp-overlay">
                    <div className="portal-warp-tunnel" style={{ '--warp-color': c.warp }} />
                </div>
            )}
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                style={{
                    perspective: '900px',
                    cursor: 'pointer',
                }}
            >
                <div
                    style={{
                        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.04 : 1})`,
                        transition: isHovered ? 'transform 0.08s linear' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                        transformStyle: 'preserve-3d',
                        background: 'rgba(15, 23, 42, 0.75)',
                        border: `1.5px solid ${isHovered ? c.border : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '24px',
                        backdropFilter: 'blur(20px)',
                        padding: '32px 28px 28px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: isHovered
                            ? `0 30px 80px -15px ${c.primary}55, 0 0 0 1px ${c.primary}22, inset 0 1px 0 rgba(255,255,255,0.1)`
                            : '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '340px',
                    }}
                >
                    {/* Radial glow backdrop that tracks mouse */}
                    <div
                        className={c.glow}
                        style={{
                            position: 'absolute', inset: 0,
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.4s ease',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Floating 3D graphic – appears to hover above card surface */}
                    <div
                        style={{
                            transform: `translateZ(${isHovered ? 40 : 0}px)`,
                            transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                            marginBottom: 20,
                            position: 'relative',
                            zIndex: 2,
                        }}
                    >
                        <Graphic />
                    </div>

                    {/* Badge */}
                    {badge && (
                        <div style={{
                            position: 'absolute', top: 16, right: 16,
                            fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em',
                            textTransform: 'uppercase', padding: '3px 10px',
                            borderRadius: 999,
                            background: `${c.primary}22`,
                            border: `1px solid ${c.primary}55`,
                            color: c.primary,
                            transform: `translateZ(${isHovered ? 30 : 0}px)`,
                            transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                        }}>{badge}</div>
                    )}

                    {/* Title */}
                    <h3 style={{
                        fontSize: '1.4rem', fontWeight: 900, color: '#fff',
                        marginBottom: 8, fontFamily: 'Poppins, sans-serif',
                        letterSpacing: '-0.01em',
                        transform: `translateZ(${isHovered ? 30 : 0}px)`,
                        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                        position: 'relative', zIndex: 2,
                    }}>{title}</h3>

                    {/* Description */}
                    <p style={{
                        fontSize: '0.875rem', color: 'rgba(156, 163, 175, 1)',
                        lineHeight: 1.7, marginBottom: 24, padding: '0 4px',
                        transform: `translateZ(${isHovered ? 20 : 0}px)`,
                        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                        position: 'relative', zIndex: 2,
                        flexGrow: 1,
                    }}>{desc}</p>

                    {/* CTA Button */}
                    <button
                        style={{
                            width: '100%', padding: '14px 0',
                            borderRadius: 14, fontWeight: 800,
                            fontSize: '0.9rem', letterSpacing: '0.03em',
                            background: isHovered ? c.btnBg : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${isHovered ? c.btnBorder : 'rgba(255,255,255,0.1)'}`,
                            color: isHovered ? c.primary : 'rgba(229, 231, 235, 0.8)',
                            transition: 'all 0.35s ease',
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            transform: `translateZ(${isHovered ? 35 : 0}px)`,
                            boxShadow: isHovered ? `0 0 24px ${c.primary}44` : 'none',
                            marginTop: 'auto',
                            position: 'relative', zIndex: 2,
                        }}
                    >
                        {btn} →
                    </button>
                </div>
            </div>
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const navigate = useNavigate();

    const trackLetters = "Track".split("");
    const sphereLetters = "Sphere".split("");

    const handleTrack = (e) => {
        e.preventDefault();
        if (trackingNumber) {
            navigate(`/track?id=${trackingNumber}`);
        }
    };

    return (
        <div className="space-y-12 md:space-y-20 pb-16 md:pb-20">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] lg:min-h-[80vh] flex items-center px-4 md:px-12 overflow-hidden rounded-3xl mt-4 md:mt-8 bg-gradient-to-br from-ai-bg via-ai-bg/95 to-primary/10 border border-white/5 shadow-2xl">
                {/* Futuristic Background Image, Gradients, and Moving Grid */}
                <div className="absolute inset-0 z-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat opacity-15 mix-blend-overlay" />
                <div className="absolute inset-0 z-0 bg-grid-travel opacity-40 pointer-events-none" />
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                
                <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 py-10 items-center">
                    {/* Left Column - Typography & Search Form inside a high-contrast panel */}
                    <div className="lg:col-span-6 p-6 md:p-10 rounded-3xl bg-[#0B1120]/80 border border-white/10 backdrop-blur-md space-y-6 md:space-y-8 text-left max-w-2xl shadow-2xl relative overflow-visible">
                        <div className="inline-block px-4 py-1.5 bg-primary/20 border border-primary/30 text-secondary rounded-full text-xs md:text-sm font-bold tracking-wide uppercase shadow-lg shadow-primary/5 animate-fade-in-up">
                            ✨ AI-Powered Logistics Flow
                        </div>
                        
                        {/* TrackSphere Brand Name Container with Roaming Truck/Track */}
                        <div className="relative inline-block w-full py-2 overflow-visible">
                            {/* Roaming Truck Track wrapping the name */}
                            <div className="absolute inset-0 -z-10 pointer-events-none overflow-visible">
                                <svg className="w-full h-full min-h-[140px]" viewBox="0 0 500 140" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                    {/* The Track Path */}
                                    <path 
                                        id="brandTrack" 
                                        d="M 10,95 Q 120,5 250,75 T 490,25" 
                                        stroke="rgba(34, 211, 238, 0.25)" 
                                        strokeWidth="2.5" 
                                        strokeDasharray="5,5" 
                                        className="animate-route-flow" 
                                    />
                                    <path 
                                        d="M 10,95 Q 120,5 250,75 T 490,25" 
                                        stroke="rgba(99, 102, 241, 0.1)" 
                                        strokeWidth="5" 
                                    />
                                    {/* Roaming Truck Icon */}
                                    <g>
                                        <circle r="6" fill="#22D3EE" opacity="0.6">
                                            <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                        <circle r="3.5" fill="#22D3EE" />
                                        {/* Micro Truck Shape */}
                                        <g transform="translate(-6, -4) scale(0.6)">
                                            <path d="M 0,2 L 12,2 L 16,6 L 16,10 L 0,10 Z" fill="#22D3EE" />
                                            <circle cx="3" cy="10" r="1.5" fill="#FFFFFF" />
                                            <circle cx="11" cy="10" r="1.5" fill="#FFFFFF" />
                                        </g>
                                        <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                                            <mpath href="#brandTrack" />
                                        </animateMotion>
                                    </g>
                                </svg>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-poppins leading-none tracking-tighter text-white drop-shadow-2xl">
                                {/* Animated Brand Name: Track */}
                                <span className="inline-block mr-2 text-white font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                    {trackLetters.map((char, idx) => (
                                        <span 
                                            key={idx} 
                                            className="inline-block animate-reveal-letter"
                                            style={{ animationDelay: `${idx * 0.08}s` }}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                                {/* Animated Brand Name: Sphere */}
                                <span className="inline-block text-cyan-400 font-black drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-brand-glow">
                                    {sphereLetters.map((char, idx) => (
                                        <span 
                                            key={idx} 
                                            className="inline-block animate-reveal-letter"
                                            style={{ animationDelay: `${(trackLetters.length + idx) * 0.08}s` }}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            </h1>
                        </div>

                        {/* Subtitle */}
                        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                            <span className="text-xl md:text-2xl lg:text-3xl font-orbitron font-medium tracking-widest text-secondary drop-shadow-lg block">
                                for the next generation
                            </span>
                        </div>
                        
                        <div className="space-y-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                            <p className="text-base md:text-lg font-normal font-roboto text-gray-300 leading-relaxed max-w-xl">
                                Optimize your shipment flow with AI-based delay prediction and real-time visualization. Track, route, and deliver with next-gen logistics intelligence.
                            </p>

                            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row p-1.5 md:p-2 glass max-w-lg rounded-2xl gap-2 border-white/10 bg-white/5 shadow-xl">
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter Tracking ID (e.g. TRK-...)"
                                    className="flex-grow bg-transparent px-4 py-3 focus:outline-none text-sm md:text-base text-white placeholder-gray-500"
                                />
                                <button type="submit" className="btn-primary py-3 px-8 text-sm md:text-base bg-primary hover:bg-primary-dark">
                                    Track Now
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Map & Truck SVG Animation */}
                    <div className="lg:col-span-6 relative w-full flex items-center justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        {/* The Animated SVG Map */}
                        <div className="w-full relative max-w-[550px] p-2 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm overflow-hidden shadow-2xl">
                            <svg viewBox="0 0 600 450" className="w-full h-auto drop-shadow-2xl">
                                <defs>
                                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                                        <stop offset="50%" stopColor="#0891B2" stopOpacity="0.9" />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>

                                {/* Background Grid */}
                                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#grid)" rx="20" />

                                {/* Decorative Background Rings */}
                                <circle cx="300" cy="225" r="180" fill="none" stroke="rgba(34, 211, 238, 0.06)" strokeWidth="1" strokeDasharray="5,15" className="animate-spin" style={{ animationDuration: '60s' }} />
                                <circle cx="300" cy="225" r="240" fill="none" stroke="rgba(8, 145, 178, 0.04)" strokeWidth="2" strokeDasharray="10,20" className="animate-spin" style={{ animationDuration: '90s', animationDirection: 'reverse' }} />

                                {/* Route Paths - Static Underlay */}
                                <path id="route1" d="M 80,150 Q 180,80 280,100" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
                                <path id="route2" d="M 280,100 Q 380,80 480,140" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
                                <path id="route3" d="M 80,150 Q 140,250 200,320" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
                                <path id="route4" d="M 200,320 Q 320,360 440,340" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
                                <path id="route5" d="M 440,340 Q 500,240 480,140" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
                                <path id="route6" d="M 200,320 Q 250,210 280,100" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />

                                {/* Route Paths - Flowing Overlay */}
                                <use href="#route1" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" className="animate-route-flow" />
                                <use href="#route2" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" className="animate-route-flow" />
                                <use href="#route3" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" className="animate-route-flow" />
                                <use href="#route4" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" className="animate-route-flow" />
                                <use href="#route5" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" className="animate-route-flow" />
                                <use href="#route6" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" className="animate-route-flow" />

                                {/* Moving Trucks */}
                                {/* Truck 1: Seattle to Chicago */}
                                <g>
                                    <circle r="7" fill="#22D3EE" opacity="0.6">
                                        <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                    <g transform="translate(-11, -9)">
                                        <rect width="22" height="15" rx="3.5" fill="#0B1120" stroke="#22D3EE" strokeWidth="1.2" />
                                        {/* Truck SVG Path */}
                                        <path d="M 4,4 L 13,4 L 17,8 L 17,11 L 4,11 Z" fill="#22D3EE" opacity="0.9" />
                                        <circle cx="7" cy="11" r="1.5" fill="#FFFFFF" />
                                        <circle cx="13" cy="11" r="1.5" fill="#FFFFFF" />
                                    </g>
                                    <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
                                        <mpath href="#route1" />
                                    </animateMotion>
                                </g>

                                {/* Truck 2: Chicago to New York */}
                                <g>
                                    <circle r="7" fill="#818CF8" opacity="0.6">
                                        <animate attributeName="r" values="4;8;4" dur="2.5s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
                                    </circle>
                                    <g transform="translate(-11, -9)">
                                        <rect width="22" height="15" rx="3.5" fill="#0B1120" stroke="#818CF8" strokeWidth="1.2" />
                                        <path d="M 4,4 L 13,4 L 17,8 L 17,11 L 4,11 Z" fill="#818CF8" opacity="0.9" />
                                        <circle cx="7" cy="11" r="1.5" fill="#FFFFFF" />
                                        <circle cx="13" cy="11" r="1.5" fill="#FFFFFF" />
                                    </g>
                                    <animateMotion dur="11s" repeatCount="indefinite" rotate="auto">
                                        <mpath href="#route2" />
                                    </animateMotion>
                                </g>

                                {/* Truck 3: Dallas to Miami */}
                                <g>
                                    <circle r="7" fill="#34D399" opacity="0.6">
                                        <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
                                    </circle>
                                    <g transform="translate(-11, -9)">
                                        <rect width="22" height="15" rx="3.5" fill="#0B1120" stroke="#34D399" strokeWidth="1.2" />
                                        <path d="M 4,4 L 13,4 L 17,8 L 17,11 L 4,11 Z" fill="#34D399" opacity="0.9" />
                                        <circle cx="7" cy="11" r="1.5" fill="#FFFFFF" />
                                        <circle cx="13" cy="11" r="1.5" fill="#FFFFFF" />
                                    </g>
                                    <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                                        <mpath href="#route4" />
                                    </animateMotion>
                                </g>

                                {/* Truck 4: Miami to New York */}
                                <g>
                                    <circle r="7" fill="#FB923C" opacity="0.6">
                                        <animate attributeName="r" values="4;8;4" dur="2.2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.2s" repeatCount="indefinite" />
                                    </circle>
                                    <g transform="translate(-11, -9)">
                                        <rect width="22" height="15" rx="3.5" fill="#0B1120" stroke="#FB923C" strokeWidth="1.2" />
                                        <path d="M 4,4 L 13,4 L 17,8 L 17,11 L 4,11 Z" fill="#FB923C" opacity="0.9" />
                                        <circle cx="7" cy="11" r="1.5" fill="#FFFFFF" />
                                        <circle cx="13" cy="11" r="1.5" fill="#FFFFFF" />
                                    </g>
                                    <animateMotion dur="13s" repeatCount="indefinite" rotate="auto">
                                        <mpath href="#route5" />
                                    </animateMotion>
                                </g>

                                {/* Hub Nodes (Pulsing Circles and Labels) */}
                                {/* Seattle */}
                                <g transform="translate(80, 150)">
                                    <circle r="14" fill="#22D3EE" className="animate-pulse-glow" />
                                    <circle r="6" fill="#22D3EE" />
                                    <circle r="2" fill="#FFFFFF" />
                                    <text x="12" y="4" fill="#9CA3AF" fontSize="10" fontWeight="bold" className="font-poppins select-none pointer-events-none">Seattle Hub</text>
                                </g>

                                {/* Chicago */}
                                <g transform="translate(280, 100)">
                                    <circle r="14" fill="#22D3EE" className="animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
                                    <circle r="6" fill="#22D3EE" />
                                    <circle r="2" fill="#FFFFFF" />
                                    <text x="-40" y="-12" fill="#9CA3AF" fontSize="10" fontWeight="bold" className="font-poppins select-none pointer-events-none">Chicago Hub</text>
                                </g>

                                {/* Dallas */}
                                <g transform="translate(200, 320)">
                                    <circle r="14" fill="#22D3EE" className="animate-pulse-glow" style={{ animationDelay: '0.8s' }} />
                                    <circle r="6" fill="#22D3EE" />
                                    <circle r="2" fill="#FFFFFF" />
                                    <text x="12" y="4" fill="#9CA3AF" fontSize="10" fontWeight="bold" className="font-poppins select-none pointer-events-none">Dallas Depot</text>
                                </g>

                                {/* NYC */}
                                <g transform="translate(480, 140)">
                                    <circle r="16" fill="#22D3EE" className="animate-pulse-glow" style={{ animationDelay: '1.2s' }} />
                                    <circle r="7" fill="#22D3EE" />
                                    <circle r="2.5" fill="#FFFFFF" />
                                    <text x="14" y="-4" fill="#E5E7EB" fontSize="11" fontWeight="black" className="font-poppins select-none pointer-events-none">NYC Terminal</text>
                                </g>

                                {/* Miami */}
                                <g transform="translate(440, 340)">
                                    <circle r="14" fill="#22D3EE" className="animate-pulse-glow" style={{ animationDelay: '1.6s' }} />
                                    <circle r="6" fill="#22D3EE" />
                                    <circle r="2" fill="#FFFFFF" />
                                    <text x="12" y="4" fill="#9CA3AF" fontSize="10" fontWeight="bold" className="font-poppins select-none pointer-events-none">Miami Sorting</text>
                                </g>
                            </svg>
                        </div>

                        {/* Floating Stats Overlay Card 1 */}
                        <div className="absolute top-6 left-6 md:top-8 md:left-8 glass px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2.5 shadow-xl animate-float">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                            </span>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Live Shipments</p>
                                <p className="text-sm font-black text-white">1,420 Active</p>
                            </div>
                        </div>

                        {/* Floating Stats Overlay Card 2 */}
                        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 glass px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2.5 shadow-xl animate-float" style={{ animationDelay: '2.5s' }}>
                            <div className="h-8 w-8 bg-secondary/20 text-secondary rounded-lg flex items-center justify-center shadow-inner">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">AI Accuracy</p>
                                <p className="text-sm font-black text-white">98.6% Optimal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[
                    { title: "Predictive ETA", desc: "Our regression model predicts delays based on real-time weather and traffic data.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path> },
                    { title: "Route Optimization", desc: "Dynamically calculate the shortest and most fuel-efficient paths for your fleet.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path> },
                    { title: "Secure OTP Delivery", desc: "Ensure secure drop-offs with role-based OTP verification for every shipment.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> }
                ].map((f, idx) => (
                    <div key={idx} className="glass-card hover:translate-y-[-4px] transition-all duration-300 bg-ai-card/40 border-white/5">
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{f.icon}</svg>
                        </div>
                        <h3 className="text-xl font-black mb-2 text-white">{f.title}</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </section>
            {/* Login Portals Section */}
            <section id="portals" className="pt-8 md:pt-10">
                <div className="text-center mb-10 md:mb-12">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white">
                        Direct User{' '}
                        <span style={{ color: '#22D3EE', textShadow: '0 0 30px rgba(34,211,238,0.4)' }}>Portals</span>
                    </h2>
                    <p className="text-gray-400 font-medium max-w-2xl mx-auto px-4">
                        Step through your dedicated gateway — track deliveries, drive the route, or command the entire fleet.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <PortalCard
                        title="Customer Portal"
                        desc="Track shipments in real-time, manage delivery addresses, and receive instant status notifications."
                        btn="Enter Customer Portal"
                        onNavigate={() => navigate('/login')}
                        color="blue"
                        graphic={SpinningCube}
                        badge="Live Tracking"
                    />
                    <PortalCard
                        title="Driver Terminal"
                        desc="Access your assigned routes, report delays on the fly, and verify OTP drop-offs securely."
                        btn="Enter Driver Terminal"
                        onNavigate={() => navigate('/login/driver')}
                        color="orange"
                        graphic={RoadGrid}
                        badge="On The Road"
                    />
                    <PortalCard
                        title="Admin Command"
                        desc="Full fleet overview, global shipment monitoring, AI-powered analytics, and system control."
                        btn="Enter Admin Command"
                        onNavigate={() => navigate('/login/admin')}
                        color="indigo"
                        graphic={Gyroscope}
                        badge="Command Center"
                    />
                </div>
            </section>
        </div>
    );
};
export default Home;