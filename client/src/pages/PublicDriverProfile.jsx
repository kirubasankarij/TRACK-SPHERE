import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicDriverProfile = () => {
    const { id } = useParams();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                // In demo mode, the ID might be 'demo' or anything
                const res = await axios.get(`/driver/public/${id}`);
                setDriver(res.data.data);
            } catch (err) {
                setError('Driver information not available.');
            } finally {
                setLoading(false);
            }
        };
        fetchPublicProfile();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );

    if (error || !driver) return (
        <div className="max-w-md mx-auto mt-10 p-8 glass-card text-center">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-4 text-gray-400">{error || 'Data could not be fetched.'}</p>
        </div>
    );

    return (
        <div className="max-w-md mx-auto mt-6 p-4">
            <div className="glass-card relative overflow-hidden border-2 border-orange-500/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                {/* Emergency Header */}
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
                
                <div className="pt-4 flex flex-col items-center text-center">
                    <div className="h-32 w-32 rounded-full border-4 border-orange-500/30 overflow-hidden mb-4 bg-gray-800 flex items-center justify-center">
                        {driver.avatar ? (
                            <img src={driver.avatar} alt={driver.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-4xl text-gray-500">👤</span>
                        )}
                    </div>
                    
                    <h1 className="text-3xl font-black text-white tracking-tight">{driver.name}</h1>
                    <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mt-1">Verified Logistics Partner</p>
                </div>

                <div className="mt-8 space-y-6">
                    {/* Vehicle Info */}
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center text-xl">🚚</div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Vehicle</p>
                            <p className="font-bold text-white text-lg">
                                {driver.vehicle ? `${driver.vehicle.plateNumber} (${driver.vehicle.model})` : driver.licenseNumber || 'Verified License'}
                            </p>
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🏢</div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operating Unit</p>
                            <p className="font-bold text-white text-lg">{driver.company?.name || 'TrackSphere'}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{driver.company?.contact}</p>
                        </div>
                    </div>

                    {/* Emergency Contact - HIGHLIGHTED */}
                    <div className="bg-red-600/10 p-5 rounded-2xl border-2 border-red-600/30">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xl">🚨</span>
                            <h3 className="text-red-500 font-black uppercase tracking-widest text-sm">Emergency Contact</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white font-black text-xl">{driver.emergencyContact?.name || 'Emergency Unit'}</p>
                            <a 
                                href={`tel:${driver.emergencyContact?.phone}`} 
                                className="inline-block mt-2 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-center w-full shadow-lg shadow-red-600/30 active:scale-95 transition-all"
                            >
                                📞 CALL NOW: {driver.emergencyContact?.phone || '108'}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-[10px] text-gray-500 font-medium italic">
                        🛡️ Sensitive data is protected and only limited information is shown publicly.
                    </p>
                    <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase tracking-tighter">
                        Powered by TrackSphere Safety Engine
                    </p>
                </div>
            </div>
            
            <div className="mt-4 text-center">
                <button 
                    onClick={() => window.print()}
                    className="text-gray-500 hover:text-white transition-colors text-xs font-bold"
                >
                    🖨️ Print Digital ID
                </button>
            </div>
        </div>
    );
};

export default PublicDriverProfile;
