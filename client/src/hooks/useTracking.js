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
                const response = await api.get(`/tracking/${shipmentId}`).catch(() => null);
                if (response?.data) {
                    setShipment(response.data);
                } else {
                    // Check local storage / mock fallback
                    const saved = JSON.parse(localStorage.getItem('tracksphere_shipments') || '[]');
                    const found = saved.find(s => s.trackingNumber === shipmentId || s._id === shipmentId);
                    if (found) setShipment(found);
                }
                setLoading(false);
                socket.emit('joinRoom', shipmentId);
            } catch (err) {
                console.error('Tracking fetch error:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchShipment();

        const handleStatusUpdate = (update) => {
            if (update.trackingNumber === shipmentId || update.shipmentId === shipmentId || !update.trackingNumber) {
                setShipment(prev => {
                    if (!prev) return prev;
                    const newHistory = [...(prev.history || [])];
                    if (update.status && (!newHistory.length || newHistory[newHistory.length - 1].status !== update.status)) {
                        newHistory.push({
                            status: update.status,
                            location: update.location || prev.lastLocation || 'In Transit',
                            timestamp: new Date(),
                            details: `Status updated to ${update.status}`
                        });
                    }
                    return {
                        ...prev,
                        ...update.shipment,
                        status: update.status || prev.status,
                        assignedDriver: update.assignedDriver || prev.assignedDriver,
                        predictedDelay: update.predictedDelay !== undefined ? update.predictedDelay : prev.predictedDelay,
                        history: newHistory
                    };
                });
            }
        };

        const handleLocationUpdate = (locData) => {
            if (locData.trackingNumber === shipmentId || locData.shipmentId === shipmentId) {
                setShipment(prev => {
                    if (!prev) return prev;
                    const points = prev.routePoints || [];
                    const newPoint = { lat: locData.lat, lng: locData.lng, timestamp: new Date() };
                    return {
                        ...prev,
                        lastLocation: `${locData.lat.toFixed(4)}, ${locData.lng.toFixed(4)}`,
                        routePoints: [...points, newPoint]
                    };
                });
            }
        };

        socket.on('statusUpdate', handleStatusUpdate);
        socket.on('shipmentUpdated', handleStatusUpdate);
        socket.on('driverLocationUpdate', handleLocationUpdate);

        return () => {
            socket.off('statusUpdate', handleStatusUpdate);
            socket.off('shipmentUpdated', handleStatusUpdate);
            socket.off('driverLocationUpdate', handleLocationUpdate);
        };
    }, [shipmentId]);

    return { shipment, loading, error };
};
