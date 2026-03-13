import React, { useState, useEffect } from 'react';
import { shipmentApi as api } from '../services/api';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || '/');

export const useTracking = (shipmentId) => {
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!shipmentId) return;

        const fetchShipment = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/tracking/${shipmentId}`);
                setShipment(response.data);
                setLoading(false);
                socket.emit('joinRoom', shipmentId);
            } catch (err) {
                console.error('Tracking fetch error:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchShipment();

        socket.on('statusUpdate', (update) => {
            setShipment(prev => ({
                ...prev,
                status: update.status,
                history: [...(prev?.history || []), update]
            }));
        });

        return () => {
            socket.off('statusUpdate');
        };
    }, [shipmentId]);

    return { shipment, loading, error };
};
