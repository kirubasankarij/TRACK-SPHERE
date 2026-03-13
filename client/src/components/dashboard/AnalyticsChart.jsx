import React from 'react';

const AnalyticsChart = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Shipment Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-600 font-semibold">Total</p>
                    <p className="text-2xl font-bold">{data.total || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-600 font-semibold">Delivered</p>
                    <p className="text-2xl font-bold">{data.delivered || 0}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-sm text-yellow-600 font-semibold">In Transit</p>
                    <p className="text-2xl font-bold">{data.inTransit || 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-sm text-red-600 font-semibold">Pending</p>
                    <p className="text-2xl font-bold">{data.pending || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsChart;
