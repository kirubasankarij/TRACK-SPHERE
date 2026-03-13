import React from 'react';
import { format } from 'date-fns';

const ETAWidget = ({ eta }) => {
    if (!eta) return null;

    return (
        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md">
            <h3 className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2">Estimated Arrival</h3>
            <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold">{format(new Date(eta), 'MMM d')}</span>
                <span className="text-lg opacity-80">{format(new Date(eta), 'yyyy')}</span>
            </div>
            <p className="mt-2 text-sm opacity-90 italic">
                * Based on current carrier performance and weather conditions.
            </p>
        </div>
    );
};

export default ETAWidget;
