import React, { useState, useRef, useEffect } from 'react';

const BOT_RESPONSES = {
    'track': { answer: 'To track your shipment, go to the **Track Shipment** page and enter your Tracking ID (e.g. TF-TN-DEMO). You will see live GPS location and status updates.', links: [{ label: 'Track Now', href: '/track' }] },
    'tracking': { answer: 'To track your shipment, go to the **Track Shipment** page and enter your Tracking ID (e.g. TF-TN-DEMO). You will see live GPS location and status updates.', links: [{ label: 'Track Now', href: '/track' }] },
    'create': { answer: 'You can create a new shipment by clicking **"+ New Shipment"** on your dashboard or visiting the Create Shipment page. Fill in sender, receiver, and package details.', links: [{ label: 'Create Shipment', href: '/create-shipment' }] },
    'shipment': { answer: 'You can create a new shipment by clicking **"+ New Shipment"** on your dashboard or visiting the Create Shipment page. Fill in sender, receiver, and package details.', links: [{ label: 'Create Shipment', href: '/create-shipment' }] },
    'delay': { answer: 'If your shipment is delayed, our AI system will automatically send you a notification with an updated ETA. You can also check the delay probability on the tracking page.', links: [{ label: 'Track Shipment', href: '/track' }] },
    'delayed': { answer: 'If your shipment is delayed, our AI system will automatically send you a notification with an updated ETA. You can also check the delay probability on the tracking page.', links: [{ label: 'Track Shipment', href: '/track' }] },
    'otp': { answer: 'When your shipment arrives, the driver will ask for a 6-digit OTP sent to your registered phone. You can also enter it manually on your **Shipment History** page.', links: [{ label: 'Shipment History', href: '/history' }] },
    'delivery': { answer: 'Delivery confirmation requires an OTP. Once verified, the shipment is marked delivered and you can download your Proof of Delivery from the history page.', links: [{ label: 'History', href: '/history' }] },
    'proof': { answer: 'After delivery is confirmed, a **"Download Proof"** button appears on your Shipment History page. Click it to generate a digital proof of delivery document.', links: [{ label: 'Download Proof', href: '/history' }] },
    'history': { answer: 'Your full shipment history with filters (Pending, In-Transit, Delivered) is available on the History page.', links: [{ label: 'View History', href: '/history' }] },
    'eta': { answer: 'Our AI engine calculates your ETA in real-time using traffic and weather data. The estimated arrival time is always visible on the tracking page for active shipments.', links: [{ label: 'Track Now', href: '/track' }] },
    'notification': { answer: 'You will receive automatic notifications via Email and SMS when: your shipment is picked up, out for delivery, delayed, or delivered.', links: [] },
    'notify': { answer: 'You will receive automatic notifications via Email and SMS when: your shipment is picked up, out for delivery, delayed, or delivered.', links: [] },
    'login': { answer: 'You can log in as a **Customer**, **Admin**, or **Driver**. Each role has a dedicated login page. Use the "Login" button in the top navigation.', links: [{ label: 'Customer Login', href: '/login' }] },
    'register': { answer: 'You can register a new customer account using the Register page. Fill in your name, email, phone, and password.', links: [{ label: 'Register', href: '/register' }] },
    'contact': { answer: 'You can reach our support team at **support@tracksphere.com** or call **+91 98765 00000** (Mon–Sat, 9am–6pm IST). You can also visit the Support page.', links: [{ label: 'Support Page', href: '/support' }] },
    'support': { answer: 'Our support team is available Mon–Sat 9am–6pm. You can also submit a ticket via the Support page and an admin will respond within 2 hours.', links: [{ label: 'Submit Ticket', href: '/support' }] },
    'driver': { answer: 'Drivers have a separate portal at **/login/driver**. Drivers can view assigned shipments, update status, navigate to destination, and verify delivery OTPs.', links: [{ label: 'Driver Login', href: '/login/driver' }] },
    'admin': { answer: 'Admins access a full dashboard at **/login/admin**. Admin features include shipment management, driver assignment, fleet tracking, AI alerts, and support ticket management.', links: [{ label: 'Admin Login', href: '/login/admin' }] },
    'password': { answer: 'If you have forgotten your password, please contact our support team at **support@tracksphere.com** and we will help you reset it.', links: [{ label: 'Contact Support', href: '/support' }] },
};

const QUICK_QUESTIONS = [
    'How to track my shipment?',
    'How to create a shipment?',
    'What if my delivery is delayed?',
    'How does OTP delivery work?',
    'How do I download proof?',
    'How to contact support?',
];

const findResponse = (text) => {
    const lower = text.toLowerCase();
    for (const [keyword, response] of Object.entries(BOT_RESPONSES)) {
        if (lower.includes(keyword)) return response;
    }
    return {
        answer: "I'm not sure about that. Our human support team can help you! You can visit the Support page or email us at **support@tracksphere.com**.",
        links: [{ label: 'Contact Support', href: '/support' }]
    };
};

const formatText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const SupportChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            from: 'bot',
            text: "Hi! 👋 I'm **SphereBot**, your TrackSphere assistant. Ask me anything about your shipments, tracking, or deliveries!",
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [unread, setUnread] = useState(1);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setUnread(0);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [isOpen, messages]);

    const sendMessage = (text) => {
        const userMsg = text || input.trim();
        if (!userMsg) return;
        setInput('');
        setMessages(prev => [...prev, { from: 'user', text: userMsg, time: new Date() }]);
        setIsTyping(true);

        setTimeout(() => {
            const response = findResponse(userMsg);
            setMessages(prev => [...prev, { from: 'bot', text: response.answer, links: response.links, time: new Date() }]);
            setIsTyping(false);
        }, 900 + Math.random() * 500);
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-[9999]">
                <button
                    onClick={() => setIsOpen(o => !o)}
                    className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 relative"
                    title="Chat with SphereBot"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <span className="text-2xl">💬</span>
                    )}
                    {!isOpen && unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center">
                            {unread}
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-[9998] w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300" style={{ height: '520px' }}>
                    {/* Header */}
                    <div className="bg-blue-600 px-5 py-4 flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl shrink-0">🤖</div>
                        <div className="flex-1">
                            <p className="font-black text-white text-sm">SphereBot</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <p className="text-blue-200 text-[10px] font-bold">Online – TrackSphere Support</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white text-lg transition-colors">
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                                {msg.from === 'bot' && (
                                    <div className="w-8 h-8 bg-blue-100 rounded-2xl flex items-center justify-center text-sm shrink-0 mt-1">🤖</div>
                                )}
                                <div className={`max-w-[80%] ${msg.from === 'user' ? 'bg-blue-600 text-white rounded-3xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-3xl rounded-tl-sm shadow-sm border border-gray-100'} px-4 py-3 text-sm`}>
                                    <p dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} className="leading-relaxed" />
                                    {msg.links && msg.links.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {msg.links.map((link, li) => (
                                                <a key={li} href={link.href} className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-black hover:bg-blue-100 transition-colors border border-blue-100">
                                                    {link.label} →
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <p className={`text-[9px] mt-1 font-bold ${msg.from === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-2xl flex items-center justify-center text-sm shrink-0">🤖</div>
                                <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="px-4 pt-3 pb-1 bg-white border-t border-gray-50 shrink-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quick Questions</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} onClick={() => sendMessage(q)} className="whitespace-nowrap text-[10px] font-bold bg-gray-50 text-blue-600 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all shrink-0">
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask anything…"
                                className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim()}
                                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SupportChatbot;
