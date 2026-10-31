import React, { useState, useEffect } from 'react';
import { io as socketIO } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DirectMessagingModal = ({ isOpen, onClose, senderRole = 'admin', defaultRecipientRole = 'driver', trackingNumber = '' }) => {
    const [messages, setMessages] = useState([]);
    const [recipientRole, setRecipientRole] = useState(defaultRecipientRole);
    const [text, setText] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = socketIO(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        setSocket(s);

        axios.get('/messages')
            .then(res => setMessages(res.data.data || []))
            .catch(() => {});

        s.on('directMessage', (newMsg) => {
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.recipientRole === senderRole || senderRole === 'admin') {
                toast.success(`💬 New message from ${newMsg.sender}: ${newMsg.message}`, { duration: 5000 });
            }
        });

        return () => s.disconnect();
    }, [senderRole]);

    if (!isOpen) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const payload = {
            sender: senderRole === 'admin' ? 'Admin Command' : senderRole === 'driver' ? 'Driver' : 'Customer',
            recipientRole,
            recipient: recipientRole.toUpperCase(),
            message: text,
            trackingNumber: trackingNumber || 'GENERAL'
        };

        try {
            await axios.post('/messages', payload);
            setText('');
        } catch {
            if (socket) {
                socket.emit('sendMessage', { ...payload, timestamp: new Date().toISOString() });
                setText('');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[#0F172A] border border-white/10 text-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col h-[520px]">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10 shrink-0">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <span>💬</span> Real-Time Comm-Link
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">Role: {senderRole.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Recipient Role Selector if Admin */}
                {senderRole === 'admin' && (
                    <div className="flex gap-2 py-3 border-b border-white/5 shrink-0">
                        <span className="text-xs text-gray-400 font-bold self-center">Send to:</span>
                        <button
                            type="button"
                            onClick={() => setRecipientRole('driver')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${recipientRole === 'driver' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white/5 text-gray-400'}`}
                        >
                            🚛 Driver
                        </button>
                        <button
                            type="button"
                            onClick={() => setRecipientRole('customer')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${recipientRole === 'customer' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-white/5 text-gray-400'}`}
                        >
                            👤 Customer
                        </button>
                    </div>
                )}

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-xs font-medium italic">No comms logged yet. Send a message to initiate dispatch link.</div>
                    ) : (
                        messages.map((m, idx) => (
                            <div key={m.id || idx} className={`flex flex-col ${m.sender.toLowerCase().includes(senderRole) ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-medium ${m.sender.toLowerCase().includes(senderRole) ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/20' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                    <div className="flex justify-between items-center gap-3 text-[10px] font-black text-white/70 mb-1">
                                        <span>{m.sender}</span>
                                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="leading-relaxed">{m.message}</p>
                                    {m.trackingNumber && m.trackingNumber !== 'GENERAL' && (
                                        <p className="text-[9px] font-mono text-white/50 mt-1">Ref: {m.trackingNumber}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSend} className="pt-3 border-t border-white/10 flex gap-2 shrink-0">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type direct message…"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                    <button
                        type="submit"
                        className="px-5 py-3 bg-primary hover:bg-primary-dark text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-primary/30"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DirectMessagingModal;
