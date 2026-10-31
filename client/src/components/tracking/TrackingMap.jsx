import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom 🚚 Animated Truck Marker with Expanding Pulse Radar Ring
const createTruckIcon = (speed = 62, plate = 'TN-01-AX-1234') => {
    return L.divIcon({
        className: 'custom-truck-leaflet-marker',
        html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="
                    position: absolute;
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    background: rgba(16, 185, 129, 0.45);
                    animation: truckPulse 1.6s infinite ease-out;
                    pointer-events: none;
                    top: -12px;
                "></div>
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10B981, #047857);
                    border: 3px solid #ffffff;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    z-index: 20;
                ">
                    🚚
                </div>
                <div style="
                    margin-top: 4px;
                    background: #090d16;
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    border: 1.5px solid rgba(52, 211, 153, 0.7);
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.7);
                    z-index: 20;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                ">
                    <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10B981; animation: blink 1s infinite;"></span>
                    LIVE • ${speed} km/h
                </div>
            </div>
        `,
        iconSize: [58, 68],
        iconAnchor: [29, 34],
        popupAnchor: [0, -30]
    });
};

// Custom 🏢 Warehouse Origin Marker
const createOriginIcon = () => {
    return L.divIcon({
        className: 'custom-origin-leaflet-marker',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2563EB, #1E40AF);
                    border: 2.5px solid #ffffff;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                ">
                    🏢
                </div>
                <div style="
                    margin-top: 2px;
                    background: #0f172a;
                    color: #93c5fd;
                    font-size: 9px;
                    font-weight: 800;
                    padding: 1.5px 6px;
                    border-radius: 9999px;
                    border: 1px solid rgba(147, 197, 253, 0.5);
                    white-space: nowrap;
                ">
                    ORIGIN
                </div>
            </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 24],
        popupAnchor: [0, -22]
    });
};

// Custom 🏁 Destination Marker
const createDestinationIcon = () => {
    return L.divIcon({
        className: 'custom-dest-leaflet-marker',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #DC2626, #991B1B);
                    border: 2.5px solid #ffffff;
                    box-shadow: 0 4px 16px rgba(220, 38, 38, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 17px;
                ">
                    🏁
                </div>
                <div style="
                    margin-top: 2px;
                    background: #0f172a;
                    color: #fca5a5;
                    font-size: 9px;
                    font-weight: 800;
                    padding: 1.5px 6px;
                    border-radius: 9999px;
                    border: 1px solid rgba(252, 165, 165, 0.5);
                    white-space: nowrap;
                ">
                    DESTINATION
                </div>
            </div>
        `,
        iconSize: [42, 50],
        iconAnchor: [21, 25],
        popupAnchor: [0, -24]
    });
};

// Small Waypoint Marker for highway checkpoints
const createWaypointIcon = (name) => {
    return L.divIcon({
        className: 'custom-waypoint-marker',
        html: `
            <div style="display:flex; align-items:center; justify-content:center; width:12px; height:12px; border-radius:50%; background:#38BDF8; border:2px solid #ffffff; box-shadow:0 0 6px rgba(56,189,248,0.8);">
            </div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

// Critical Component: MapAutoResizer
// Automatically fixes the notorious Leaflet "map not aligned / grey tiles" bug in React
const MapAutoResizer = () => {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        const triggerInvalidate = () => {
            try {
                map.invalidateSize();
            } catch (e) {
                // Ignore silent cleanup errors
            }
        };

        // Trigger size calculation multiple times after DOM paint
        triggerInvalidate();
        const t1 = setTimeout(triggerInvalidate, 80);
        const t2 = setTimeout(triggerInvalidate, 300);
        const t3 = setTimeout(triggerInvalidate, 800);
        const t4 = setTimeout(triggerInvalidate, 1500);

        window.addEventListener('resize', triggerInvalidate);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            window.removeEventListener('resize', triggerInvalidate);
        };
    }, [map]);
    return null;
};

// Controller component to smoothly center/fit bounds when requested
const MapViewController = ({ targetCoord, fullBounds, command }) => {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        if (command === 'CENTER_TRUCK' && targetCoord) {
            map.flyTo([targetCoord.lat, targetCoord.lng], 11, { duration: 1.2 });
        } else if (command === 'FIT_ROUTE' && fullBounds && fullBounds.length > 1) {
            const b = L.latLngBounds(fullBounds.map(p => [p.lat, p.lng]));
            map.fitBounds(b, { padding: [60, 60], maxZoom: 12, animate: true });
        }
    }, [command, targetCoord, fullBounds, map]);
    return null;
};

const TrackingMap = ({ shipments = [] }) => {
    const activeShipment = shipments[0] || null;

    // Detailed Default Indian Highway Path (Guindy, Chennai ➔ RS Puram, Coimbatore via NH 48 & NH 544)
    const defaultTraversedPath = [
        { lat: 13.0067, lng: 80.2206, name: 'Guindy Sorting Hub, Chennai (Origin)' },
        { lat: 12.9675, lng: 79.9405, name: 'Sriperumbudur Industrial Corridor (NH 48)' },
        { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram Toll Plaza' },
        { lat: 12.9165, lng: 79.1325, name: 'Vellore Bypass (NH 48)' },
        { lat: 12.5186, lng: 78.2137, name: 'Krishnagiri Junction (NH 44)' },
        { lat: 12.1211, lng: 78.1582, name: 'Dharmapuri Toll Plaza' },
        { lat: 11.6643, lng: 78.1460, name: 'Salem Express Bypass (NH 544)' },
        { lat: 11.4102, lng: 77.7334, name: 'Erode NH 544 Highway Sector (Current Location)' }
    ];

    const defaultRemainingPath = [
        { lat: 11.4102, lng: 77.7334, name: 'Erode NH 544 Highway Sector' },
        { lat: 11.2750, lng: 77.5850, name: 'Perundurai Toll Plaza' },
        { lat: 11.1925, lng: 77.2680, name: 'Avinashi Bypass NH 544' },
        { lat: 11.0550, lng: 77.0850, name: 'Neelambur Toll (Coimbatore Entry)' },
        { lat: 11.0168, lng: 76.9558, name: 'RS Puram Delivery Hub, Coimbatore (Destination)' }
    ];

    // Determine the route data from shipment or default
    const traversedPath = (activeShipment?.routePoints?.length > 1)
        ? activeShipment.routePoints
        : defaultTraversedPath;

    const remainingPath = (activeShipment?.plannedPoints?.length > 1)
        ? activeShipment.plannedPoints
        : defaultRemainingPath;

    // Full end-to-end highway track connecting origin to destination
    const fullRouteTrack = [...traversedPath, ...remainingPath.slice(1)];

    // Origin, Current Truck, and Destination Points
    const originPoint = traversedPath[0] || { lat: 13.0067, lng: 80.2206, name: 'Guindy Sorting Hub, Chennai' };
    const destinationPoint = activeShipment?.deliveryLocation?.lat
        ? { lat: activeShipment.deliveryLocation.lat, lng: activeShipment.deliveryLocation.lng, name: activeShipment.receiver?.address || 'RS Puram, Coimbatore' }
        : remainingPath[remainingPath.length - 1];

    // Realtime animated state
    const [liveTruckIndex, setLiveTruckIndex] = useState(traversedPath.length - 1);
    const [isDriving, setIsDriving] = useState(false);
    const [speedKmH, setSpeedKmH] = useState(64);
    const [mapCommand, setMapCommand] = useState('FIT_ROUTE');
    const driveIntervalRef = useRef(null);

    const currentTruckPoint = fullRouteTrack[liveTruckIndex] || traversedPath[traversedPath.length - 1];

    // Live Moving Truck Simulation along the Road Track
    const toggleLiveDrive = () => {
        if (isDriving) {
            clearInterval(driveIntervalRef.current);
            setIsDriving(false);
            return;
        }

        setIsDriving(true);
        setMapCommand('CENTER_TRUCK');

        driveIntervalRef.current = setInterval(() => {
            setLiveTruckIndex(prev => {
                const next = prev + 1 >= fullRouteTrack.length ? 0 : prev + 1;
                return next;
            });
            setSpeedKmH(Math.floor(58 + Math.random() * 12));
        }, 1500);
    };

    useEffect(() => {
        return () => {
            if (driveIntervalRef.current) clearInterval(driveIntervalRef.current);
        };
    }, []);

    // Recenter route on shipment change
    useEffect(() => {
        setLiveTruckIndex(traversedPath.length - 1);
        setMapCommand('FIT_ROUTE');
    }, [activeShipment?.trackingNumber]);

    const originName = activeShipment?.sender?.address || originPoint.name || 'Guindy, Chennai, Tamil Nadu';
    const destName = activeShipment?.receiver?.address || destinationPoint.name || 'RS Puram, Coimbatore, Tamil Nadu';
    const truckLocationName = currentTruckPoint.name || activeShipment?.lastLocation || 'Erode NH 544 Highway Sector';
    const driverName = activeShipment?.assignedDriver?.name || 'Raj Kumar (Master Driver)';
    const vehiclePlate = activeShipment?.assignedVehicle?.plateNumber || 'TN-01-AX-1234';

    // Highway progress calculation
    const progressPercent = Math.min(100, Math.round(((liveTruckIndex + 1) / fullRouteTrack.length) * 100));

    return (
        <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden glass shadow-2xl bg-slate-950 border border-white/10 font-sans">
            {/* ───── TOP REALTIME ROUTE INTELLIGENCE BAR ───── */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-white/10 p-3 md:p-4 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                            Realtime GPS Highway Route • India
                        </span>
                        <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-mono font-bold">
                            NH 48 / NH 544
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setMapCommand('CENTER_TRUCK');
                                setTimeout(() => setMapCommand(null), 500);
                            }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-bold text-gray-200 transition-all flex items-center gap-1"
                        >
                            <span>📍 Focus Truck</span>
                        </button>
                        <button
                            onClick={() => {
                                setMapCommand('FIT_ROUTE');
                                setTimeout(() => setMapCommand(null), 500);
                            }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-bold text-gray-200 transition-all flex items-center gap-1"
                        >
                            <span>🗺️ Full Route</span>
                        </button>
                        <button
                            onClick={toggleLiveDrive}
                            className={`px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                                isDriving
                                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse'
                                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                            }`}
                        >
                            <span>{isDriving ? '⏸️ Pause' : '▶ Drive Live Truck'}</span>
                        </button>
                    </div>
                </div>

                {/* Clear Location Path Readout: Origin ➔ Current Location ➔ Destination */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
                    {/* Origin */}
                    <div className="flex items-start gap-2 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 pr-2">
                        <span className="text-base shrink-0">🛫</span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">Departed From (Origin)</p>
                            <p className="font-bold text-gray-200 truncate">{originName}</p>
                        </div>
                    </div>

                    {/* Current Live Location */}
                    <div className="flex items-start gap-2 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 pr-2">
                        <span className="text-base shrink-0">🚚</span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                Current Realtime Location
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">LIVE</span>
                            </p>
                            <p className="font-bold text-emerald-300 truncate">{truckLocationName}</p>
                            <p className="text-[10px] font-mono text-gray-400">
                                {currentTruckPoint.lat.toFixed(4)}° N, {currentTruckPoint.lng.toFixed(4)}° E • {speedKmH} km/h
                            </p>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-2">
                        <span className="text-base shrink-0">🏁</span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-red-400">Delivering To (Destination)</p>
                            <p className="font-bold text-gray-200 truncate">{destName}</p>
                        </div>
                    </div>
                </div>

                {/* Route Progress Bar */}
                <div className="mt-2.5 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                        Highway Corridor: {progressPercent}%
                    </span>
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-mono text-gray-300 shrink-0">
                        Driver: {driverName.split(' ')[0]} ({vehiclePlate})
                    </span>
                </div>
            </div>

            {/* ───── LEAFLET MAP CONTAINER ───── */}
            <div className="relative flex-1 w-full min-h-[350px] md:min-h-[480px]">
                <MapContainer
                    center={[currentTruckPoint.lat, currentTruckPoint.lng]}
                    zoom={8}
                    minZoom={4}
                    style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                    scrollWheelZoom={true}
                >
                    {/* Leaflet Auto-Resizer: fixes alignment & grey tiles */}
                    <MapAutoResizer />

                    {/* View Controller for dynamic center & fit */}
                    <MapViewController
                        targetCoord={currentTruckPoint}
                        fullBounds={fullRouteTrack}
                        command={mapCommand}
                    />

                    {/* High-Contrast OpenStreetMap Carto Tiles */}
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* 1. Traversed Route (Solid Electric Blue Highway Track) */}
                    {fullRouteTrack.length > 1 && (
                        <Polyline
                            positions={fullRouteTrack.slice(0, liveTruckIndex + 1).map(p => [p.lat, p.lng])}
                            color="#2563EB"
                            weight={6}
                            opacity={0.85}
                        />
                    )}

                    {/* 2. Remaining Route Ahead (Dashed Emerald Green Highway Track) */}
                    {fullRouteTrack.length > 1 && liveTruckIndex < fullRouteTrack.length - 1 && (
                        <Polyline
                            positions={fullRouteTrack.slice(liveTruckIndex).map(p => [p.lat, p.lng])}
                            color="#10B981"
                            weight={5}
                            opacity={0.75}
                            dashArray="8, 10"
                        />
                    )}

                    {/* 3. Small Checkpoints along the Highway Track */}
                    {fullRouteTrack.map((pt, i) => {
                        if (i === 0 || i === fullRouteTrack.length - 1 || i === liveTruckIndex) return null;
                        return (
                            <Marker key={`wp-${i}`} position={[pt.lat, pt.lng]} icon={createWaypointIcon(pt.name)}>
                                <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                                    <span className="text-[10px] font-bold text-slate-900">{pt.name}</span>
                                </Tooltip>
                            </Marker>
                        );
                    })}

                    {/* 4. 🏢 Origin Warehouse Marker */}
                    {originPoint && (
                        <Marker position={[originPoint.lat, originPoint.lng]} icon={createOriginIcon()}>
                            <Popup>
                                <div className="p-1 font-sans text-slate-950">
                                    <p className="text-xs font-black text-blue-700 uppercase">🏢 Origin Dispatch Center</p>
                                    <p className="text-sm font-bold mt-1 text-slate-900">{originName}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Dispatched at 08:30 AM via NH 48</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* 5. 🏁 Destination Marker */}
                    {destinationPoint && (
                        <Marker position={[destinationPoint.lat, destinationPoint.lng]} icon={createDestinationIcon()}>
                            <Popup>
                                <div className="p-1 font-sans text-slate-950">
                                    <p className="text-xs font-black text-red-600 uppercase">🏁 Delivery Destination</p>
                                    <p className="text-sm font-bold mt-1 text-slate-900">{destName}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Recipient: {activeShipment?.receiver?.name || 'Customer'}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* 6. 🚚 LIVE TRUCK EMOJI MARKER */}
                    {currentTruckPoint && (
                        <Marker
                            position={[currentTruckPoint.lat, currentTruckPoint.lng]}
                            icon={createTruckIcon(speedKmH, vehiclePlate)}
                            zIndexOffset={1000}
                        >
                            <Popup autoPan={false}>
                                <div className="p-2 font-sans text-slate-950 min-w-[210px]">
                                    <div className="flex items-center justify-between border-b pb-1 mb-2">
                                        <span className="font-black text-emerald-700 text-xs flex items-center gap-1">
                                            🚚 REALTIME LIVE TRUCK
                                        </span>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
                                            ACTIVE
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900">
                                        Location: {truckLocationName}
                                    </p>
                                    <p className="text-[11px] text-slate-700 mt-1">
                                        Operator: <span className="font-bold">{driverName}</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 font-mono">
                                        Vehicle: <span className="font-bold">{vehiclePlate}</span>
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1 text-[10px]">
                                        <div>
                                            <span className="text-slate-500">Live Speed:</span>
                                            <p className="font-black text-slate-800">{speedKmH} km/h</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">GPS Status:</span>
                                            <p className="font-black text-emerald-600">Online ✅</p>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <style>{`
                @keyframes truckPulse {
                    0% { transform: scale(0.6); opacity: 0.9; }
                    50% { transform: scale(1.4); opacity: 0.35; }
                    100% { transform: scale(2.1); opacity: 0.0; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.2; }
                }
                .leaflet-container {
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 1;
                    background: #090d16 !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 16px !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
                }
            `}</style>
        </div>
    );
};

export default TrackingMap;


