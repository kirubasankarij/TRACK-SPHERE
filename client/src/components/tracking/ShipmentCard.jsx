import React from 'react';

const ShipmentCard = ({ shipment }) => {
    if (!shipment) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tracking Number</h3>
                    <p className="text-2xl font-bold text-gray-900">{shipment.trackingNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${shipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {shipment.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase">From</h4>
                    <p className="text-sm font-semibold text-gray-700">{shipment.sender?.name || 'Unknown'}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase">To</h4>
                    <p className="text-sm font-semibold text-gray-700">{shipment.receiver?.name || 'Unknown'}</p>
                </div>
            </div>
        </div>
    );
};

export default ShipmentCard;
