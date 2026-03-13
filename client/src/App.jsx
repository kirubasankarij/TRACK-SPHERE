import { useState } from 'react'
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
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import SupportChatbot from './components/common/SupportChatbot'

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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
