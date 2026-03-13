import React from 'react';

const LocationDetails = ({ location }) => {
    if (!location) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Location</h3>
            <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{location}</p>
                    <p className="text-xs text-gray-500">Updated just now</p>
                </div>
            </div>
        </div>
    );
};

export default LocationDetails;
