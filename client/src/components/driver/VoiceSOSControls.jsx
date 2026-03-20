import React, { useState, useEffect } from 'react';
import voiceService from '../../services/voiceService.js';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const VoiceSOSControls = ({ driverId }) => {
    const [status, setStatus] = useState('Off');
    const [isListening, setIsListening] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        // Auto-start on load
        const startVoice = () => {
            voiceService.start(
                (newStatus) => {
                    setStatus(newStatus);
                    setIsListening(newStatus !== 'Off');
                },
                (detectedPhrase) => handleEmergency(detectedPhrase)
            );
        };

        // Try to start immediately
        startVoice();

        return () => voiceService.stop();
    }, [driverId]);

    const handleEmergency = async (phrase) => {
        try {
            setIsCalling(true);
            setStatus('SOS TRIGGERED');
            
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sos/trigger`, {
                    driverId,
                    location: { lat: latitude, lng: longitude },
                    detectedPhrase: phrase
                });

                toast.error(`SOS TRIGGERED: ${phrase.toUpperCase()}`, {
                    duration: 10000,
                    position: 'top-center',
                    style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
                });
                
                // Keep calling status for 15 seconds to simulate ringing
                setTimeout(() => setIsCalling(false), 15000);
            });
        } catch (err) {
            console.error('SOS API Error:', err);
            setIsCalling(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-center">
            {/* Status Label */}
            <div className={`mb-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transition-all transform ${
                isCalling ? 'bg-orange-500 text-white translate-y-0 animate-pulse' :
                status === 'Activated' ? 'bg-red-500 text-white translate-y-0 opacity-100' : 
                status === 'SOS TRIGGERED' ? 'bg-red-600 text-white translate-y-0' :
                'bg-white/80 text-gray-400 translate-y-2 opacity-50'
            }`}>
                {isCalling ? '📞 Calling Admin...' : status === 'Activated' ? 'Command Mode On' : status === 'SOS TRIGGERED' ? 'SOS SENT!' : 'Hands-free Active'}
            </div>

            {/* Mic / Phone Widget */}
            <div 
                className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
                    isCalling ? 'bg-orange-500 scale-125 shadow-[0_0_40px_rgba(249,115,22,0.6)]' :
                    status === 'Activated' ? 'bg-red-500 scale-125 shadow-[0_0_30px_rgba(239,68,68,0.6)]' :
                    status === 'SOS TRIGGERED' ? 'bg-red-600 scale-150 animate-ping' :
                    'bg-white shadow-xl hover:scale-110'
                }`}
                onClick={() => {
                    if (isListening) voiceService.stop();
                    else voiceService.start(setStatus, handleEmergency);
                }}
            >
                {/* Glow Ring */}
                {(isListening || isCalling) && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isCalling ? 'bg-orange-400' : status === 'Activated' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                )}
                
                {isCalling ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white animate-shake" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-colors ${
                        status === 'Activated' || status === 'SOS TRIGGERED' ? 'text-white' : 'text-gray-400'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}

                {/* Wake word Hint (Animated) */}
                {status === 'Listening' && !isCalling && (
                    <div className="absolute -top-12 right-0 bg-white p-2 rounded-xl shadow-lg border border-gray-100 w-32 animate-fade-in pointer-events-none">
                        <p className="text-[10px] text-gray-500 font-bold leading-tight">
                            Say <span className="text-blue-500">"TrackSphere"</span> to activate
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default VoiceSOSControls;
