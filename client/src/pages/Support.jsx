import React, { useState, useEffect, useRef } from 'react';

const Support = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hello! I am FlowBot, your automated logistics assistant. How can I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const scrollRef = useRef(null);

    const faqs = [
        { q: 'How do I track my shipment?', a: 'You can track your shipment by entering your Tracking ID on the Track Shipment page or from your Dashboard.' },
        { q: 'What if my package is delayed?', a: 'If your package is delayed due to weather or traffic, our AI system automatically updates the ETA and sends you a real-time notification.' },
        { q: 'How do I change my delivery address?', a: 'Please contact our live agents immediately. Address changes are only permitted if the shipment has not yet left the origin facility.' },
        { q: 'What is the delivery verification OTP?', a: 'To ensure secure delivery, our drivers require a One-Time Password (OTP) sent to your registered phone number when they arrive.' },
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: input.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI or Agent response
        setTimeout(() => {
            let botText = "I'm connecting you to a live agent. Please hold briefly...";
            const lowerInput = userMsg.text.toLowerCase();
            
            if (lowerInput.includes('delay') || lowerInput.includes('late')) {
                botText = "I understand you're asking about a delay. Have you checked your dashboard for recent AI routing updates? It often provides precise reasons for delays like traffic or weather.";
            } else if (lowerInput.includes('track') || lowerInput.includes('where')) {
                botText = "To track a package, please provide your Tracking ID (e.g., TRK-XXXXXXXX).";
            }

            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: botText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white">Help & <span className="text-primary">Support</span></h1>
                <p className="text-gray-400">24/7 assistance for all your logistics needs</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FAQ Section */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-2xl font-black mb-6 text-white">Frequently Asked</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="glass-card hover:border-primary/20 transition-all cursor-pointer p-0 overflow-hidden border-white/5" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                                <div className="p-4 flex justify-between items-center bg-ai-navbar/50">
                                    <p className="font-bold text-gray-200">{faq.q}</p>
                                    <span className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-primary' : 'text-gray-500'}`}>
                                        ▼
                                    </span>
                                </div>
                                <div className={`px-4 bg-primary/5 transition-all duration-300 ${activeFaq === i ? 'py-4 opacity-100 max-h-40' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    <p className="text-sm text-gray-400">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card mt-8 bg-ai-card/40 border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-3xl">📞</span>
                                <div>
                                    <p className="text-xs font-black uppercase text-primary tracking-widest">Emergency Line</p>
                                    <p className="font-black text-white">+1 (800) FLOW-TRK</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Available Mon-Fri, 9am - 8pm EST</p>
                        </div>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-0 flex flex-col h-[600px] overflow-hidden border-white/10 shadow-2xl shadow-black/40 bg-ai-card/30">
                        {/* Chat Header */}
                        <div className="bg-ai-navbar/80 backdrop-blur border-b border-white/5 p-4 flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl border border-primary/20">
                                    🤖
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-ai-navbar rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-white">FlowBot Assistant</h3>
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Online Now</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                                        <div className={`p-4 rounded-2xl shadow-sm ${
                                            msg.sender === 'user' 
                                                ? 'bg-primary text-white rounded-tr-sm' 
                                                : 'bg-ai-navbar border border-white/10 text-gray-200 rounded-tl-sm'
                                        }`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                        </div>
                                        <p className={`text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm mt-1 mx-2 flex-shrink-0
                                        ${msg.sender === 'user' ? 'bg-white/5 order-2' : 'bg-primary/20 order-1'}`}
                                    >
                                        {msg.sender === 'user' ? '👤' : '🤖'}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-ai-navbar border border-white/10 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="bg-ai-navbar/50 p-4 border-t border-white/5">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all text-white placeholder-gray-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-primary text-white p-3 rounded-xl disabled:opacity-50 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 font-bold"
                                >
                                    <svg className="w-5 h-5 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
