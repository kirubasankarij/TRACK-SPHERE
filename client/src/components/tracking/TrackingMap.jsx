import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const TrackingMap = ({ shipments = [] }) => {
    const defaultCenter = [20.5937, 78.9629]; // Default to India center

    // Calculate center from shipments if available
    const center = shipments.length > 0 && shipments[0].routePoints?.length > 0
        ? [shipments[0].routePoints[0].lat, shipments[0].routePoints[0].lng]
        : (shipments.length > 0 && shipments[0].deliveryLocation
            ? [shipments[0].deliveryLocation.lat, shipments[0].deliveryLocation.lng]
            : defaultCenter);

    return (
        <div className="relative h-full w-full rounded-2xl overflow-hidden glass shadow-2xl">
            <MapContainer
                center={center}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <RecenterMap center={center} />

                {shipments.map((shipment, idx) => (
                    <React.Fragment key={shipment._id || idx}>
                        {/* Route Line */}
                        {shipment.routePoints?.length > 1 && (
                            <Polyline
                                positions={shipment.routePoints.map(p => [p.lat, p.lng])}
                                color="#2563eb"
                                weight={4}
                                opacity={0.6}
                                dashArray="10, 10"
                            />
                        )}
                        
                        {/* Current Location / Route Points */}
                        {shipment.routePoints?.map((point, pIdx) => (
                            <Marker key={`p-${pIdx}`} position={[point.lat, point.lng]}>
                                <Popup>
                                    <div className="font-bold">{shipment.trackingNumber}</div>
                                    <div className="text-xs">Location Point</div>
                                </Popup>
                            </Marker>
                        ))}
                        {/* Single Destination / Delivery Location */}
                        {shipment.deliveryLocation && (
                            <Marker position={[shipment.deliveryLocation.lat, shipment.deliveryLocation.lng]}>
                                <Popup>
                                    <div className="font-bold">Destination</div>
                                    <div className="text-xs">{shipment.receiver?.address}</div>
                                </Popup>
                            </Marker>
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default TrackingMap;
