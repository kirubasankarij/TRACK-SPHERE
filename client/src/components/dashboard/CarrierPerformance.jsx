import React from 'react';

const CarrierPerformance = () => {
    const carriers = [
        { name: 'FedEx', score: 98, deliveries: 1205 },
        { name: 'UPS', score: 95, deliveries: 1150 },
        { name: 'DHL', score: 92, deliveries: 890 },
        { name: 'MockCarrier', score: 100, deliveries: 45 }
    ];

    return (
        <div className="space-y-4">
            {carriers.map(carrier => (
                <div key={carrier.name} className="flex flex-col">
                    <div className="flex justify-between text-sm font-medium mb-1">
                        <span>{carrier.name}</span>
                        <span>{carrier.score}% Accuracy</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${carrier.score}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{carrier.deliveries} total shipments</span>
                </div>
            ))}
        </div>
    );
};

export default CarrierPerformance;
