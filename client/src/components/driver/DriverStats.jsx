import React from 'react';

const DriverStats = ({ stats }) => {
    const { totalDeliveries, onTimeDeliveries, delayedDeliveries, rating } = stats || {
        totalDeliveries: 125,
        onTimeDeliveries: 118,
        delayedDeliveries: 7,
        rating: 4.8
    };

    const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 border-t-4 border-blue-500">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Deliveries</p>
                    <h4 className="text-3xl font-black">{totalDeliveries}</h4>
                </div>
                <div className="glass-card p-6 border-t-4 border-green-500">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">On-Time</p>
                    <h4 className="text-3xl font-black">{onTimeDeliveries}</h4>
                </div>
                <div className="glass-card p-6 border-t-4 border-orange-500">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Avg Rating</p>
                    <h4 className="text-3xl font-black">{rating} <span className="text-sm text-orange-400">★</span></h4>
                </div>
                <div className="glass-card p-6 border-t-4 border-purple-500">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Success Rate</p>
                    <h4 className="text-3xl font-black">{Math.round(onTimeRate)}%</h4>
                </div>
            </div>

            <div className="glass-card p-8">
                <h3 className="text-xl font-black mb-6">Performance Roadmap</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span>Delivery Efficiency</span>
                            <span className="text-blue-600">94%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span>Customer Satisfaction</span>
                            <span className="text-orange-500">96%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">🏆</div>
                    <div>
                        <h4 className="font-black text-blue-900">Top Performer Status</h4>
                        <p className="text-sm text-blue-700">You are in the top 5% of drivers this month. Keep it up!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverStats;
