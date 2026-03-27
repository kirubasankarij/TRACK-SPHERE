import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TrackShipment from './pages/TrackShipment'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import DriverPanel from './pages/DriverPanel'
import AdminLogin from './pages/AdminLogin'
import DriverLogin from './pages/DriverLogin'
import Support from './pages/Support'
import CreateShipment from './pages/CreateShipment'
import ShipmentHistory from './pages/ShipmentHistory'
import PublicDriverProfile from './pages/PublicDriverProfile'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import SupportChatbot from './components/common/SupportChatbot'
import { io as socketIO } from 'socket.io-client'
import { toast, Toaster } from 'react-hot-toast'

const SocketHandler = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const socket = socketIO(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        
        socket.on('connect', () => {
            console.log('Connected to socket network');
        });

        socket.on('newNotification', (notif) => {
            // Check if notification is for this user or if user is admin
            if (user.role === 'admin' && notif.role === 'admin') {
                toast.error(`🚨 ADMIN: ${notif.message}`, { duration: 6000, position: 'top-right' });
            } else if (user.id === notif.userId || user.email === notif.userId) {
                toast.error(`⚠️ ${notif.message}`, { duration: 6000, position: 'top-center' });
            }
        });

        return () => socket.disconnect();
    }, [user]);

    return null;
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SocketHandler />
                <Toaster />
                <Router>
                    <div className="min-h-screen bg-ai-bg flex flex-col font-sans text-text-main">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/login/admin" element={<AdminLogin />} />
                                <Route path="/login/driver" element={<DriverLogin />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/track" element={<TrackShipment />} />
                                <Route path="/admin" element={<AdminPanel />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/driver" element={<DriverPanel />} />
                                <Route path="/driver/public/:id" element={<PublicDriverProfile />} />
                                {/* Customer Modules */}
                                <Route path="/create-shipment" element={<CreateShipment />} />
                                <Route path="/history" element={<ShipmentHistory />} />
                                <Route path="/support" element={<Support />} />
                                {/* Admin & Driver Portals */}
                            </Routes>
                        </main>
                        <Footer />
                        <SupportChatbot />
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
