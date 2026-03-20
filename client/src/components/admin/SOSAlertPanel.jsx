import React from 'react';

const SOSAlertPanel = ({ alert, onDismiss, onShowOnMap }) => {
    if (!alert) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9999] bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-red-600 text-white w-full max-w-lg p-8 rounded-2xl shadow-2xl border-4 border-white animate-alert-bounce relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Emergency SOS!</h2>
                        <div className="bg-white/20 p-4 rounded-xl mt-4 border border-white/30 backdrop-blur-sm">
                            <p className="text-white text-2xl font-black uppercase tracking-widest italic animate-pulse">
                                "{alert.detectedPhrase}"
                            </p>
                            <p className="text-red-100 text-xs font-bold uppercase mt-2">Voice Command Detected</p>
                        </div>
                    </div>

                    <div className="bg-red-700/50 backdrop-blur-md w-full p-6 rounded-xl border border-red-500/30 text-left grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-red-200 text-xs font-bold uppercase">Driver</p>
                            <p className="text-xl font-bold">{alert.driverName}</p>
                        </div>
                        <div>
                            <p className="text-red-200 text-xs font-bold uppercase">Vehicle</p>
                            <p className="text-xl font-bold">{alert.vehiclePlate}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-red-200 text-xs font-bold uppercase">Location</p>
                            <p className="text-lg font-semibold">{alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</p>
                        </div>
                    </div>

                    <div className="flex w-full gap-4">
                        <button 
                            onClick={() => onShowOnMap(alert.location)}
                            className="flex-1 bg-white text-red-600 font-black py-4 rounded-xl shadow-lg hover:bg-gray-100 transition-all active:scale-95 text-lg"
                        >
                            LOCATE ON MAP
                        </button>
                        <button 
                            onClick={onDismiss}
                            className="bg-transparent border-2 border-white/50 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/10 transition-all active:scale-95"
                        >
                            CLOSE
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
