import React, { useEffect } from 'react';

const SOSAlertPanel = ({ alert, onDismiss, onShowOnMap }) => {
    useEffect(() => {
        if (!alert) return;

        // Play loud siren alert using Web Audio API on Admin side
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const now = ctx.currentTime;

                const osc1 = ctx.createOscillator();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(880, now);
                osc1.frequency.linearRampToValueAtTime(1400, now + 0.3);
                osc1.frequency.linearRampToValueAtTime(880, now + 0.6);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

                osc1.connect(gain);
                gain.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.8);
            }
        } catch (e) {
            console.warn('Audio alert play failed:', e);
        }
    }, [alert]);

    if (!alert) return null;

    const phrase = alert.detectedPhrase || alert.details || '';
    const isDrowsy = alert.alertType === 'drowsy' || alert.type === 'drowsy' || 
                     phrase.toLowerCase().includes('closed') || phrase.toLowerCase().includes('drowsy');
    const isSeatAbsent = alert.alertType === 'seat-absent' || alert.type === 'seat-absent' ||
                         phrase.toLowerCase().includes('away from seat');

    const titleText = isDrowsy 
        ? '🚨 DRIVER DROWSINESS ALERT!' 
        : isSeatAbsent 
        ? '🚪 UNATTENDED VEHICLE ALERT!' 
        : 'EMERGENCY SOS!';

    const subText = isDrowsy 
        ? 'AI Eye Tracking Model: Driver Eyes Closed (>3s)' 
        : isSeatAbsent 
        ? 'AI Safety Camera: Driver Left Seat (>5 min)' 
        : 'Emergency Triggered';

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9999] bg-black/70 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-gradient-to-b from-red-600 to-red-800 text-white w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl border-4 border-white/90 animate-alert-bounce relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col items-center text-center space-y-5">
                    <div className="bg-white p-4 rounded-full shadow-2xl animate-pulse">
                        <span className="text-4xl">{isDrowsy ? '😴' : isSeatAbsent ? '🚪' : '🚨'}</span>
                    </div>

                    <div>
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                            CRITICAL SAFETY DISPATCH
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-2 text-white">
                            {titleText}
                        </h2>
                        <div className="bg-black/30 p-4 rounded-2xl mt-3 border border-white/20 backdrop-blur-sm">
                            <p className="text-yellow-300 text-lg md:text-xl font-black tracking-wide">
                                "{phrase}"
                            </p>
                            <p className="text-red-200 text-xs font-bold uppercase mt-1.5 tracking-wider">
                                {subText}
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/40 backdrop-blur-md w-full p-5 rounded-2xl border border-white/20 text-left grid grid-cols-2 gap-4 text-xs md:text-sm">
                        <div>
                            <p className="text-red-200 text-[10px] font-black uppercase tracking-wider">Driver Name</p>
                            <p className="text-base font-bold text-white">{alert.driverName || 'Master Driver'}</p>
                        </div>
                        <div>
                            <p className="text-red-200 text-[10px] font-black uppercase tracking-wider">Vehicle Number</p>
                            <p className="text-base font-bold text-white font-mono">{alert.vehiclePlate || 'TN-01-AX-1234'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-red-200 text-[10px] font-black uppercase tracking-wider">GPS Coordinates</p>
                            <p className="text-sm font-semibold text-white font-mono">
                                {alert.location?.lat ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}` : '13.0827, 80.2707'}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full gap-3 pt-2">
                        <button 
                            onClick={() => onShowOnMap(alert.location)}
                            className="flex-1 bg-white text-red-700 font-black py-3.5 px-4 rounded-2xl shadow-xl hover:bg-gray-100 transition-all active:scale-95 text-xs md:text-sm uppercase tracking-wider"
                        >
                            📍 Locate On Live Map
                        </button>
                        <button 
                            onClick={onDismiss}
                            className="bg-black/40 border-2 border-white/40 text-white font-black py-3.5 px-6 rounded-2xl hover:bg-black/60 transition-all active:scale-95 text-xs md:text-sm uppercase tracking-wider"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes alert-bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                .animate-alert-bounce {
                    animation: alert-bounce 1s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SOSAlertPanel;
