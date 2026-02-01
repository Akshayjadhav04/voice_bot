import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your interactive voice bot. Ask me anything about my life, superpowers, or goals!" }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Scroll to bottom on new message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSend(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    const speak = (text) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Select a nice voice if available
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft David')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        synthRef.current.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const handleStop = () => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;

        // Add user message
        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsProcessing(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            const botMsg = { role: 'assistant', content: data.reply };

            setMessages(prev => [...prev, botMsg]);
            speak(data.reply);

        } catch (error) {
            console.error("Error fetching chat response:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">

            {/* Header */}
            <header className="p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="font-bold text-white text-lg">V</span>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            Voice Bot
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{isSpeaking ? "Speaking..." : "Ready"}</span>
                        {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse text-green-400" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-6">
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                  ${msg.role === 'assistant'
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20'
                                        : 'bg-slate-700'}`}
                                >
                                    {msg.role === 'assistant' ? '🤖' : '👤'}
                                </div>

                                <div className={`p-4 rounded-2xl max-w-[80%] leading-relaxed shadow-md
                  ${msg.role === 'assistant'
                                        ? 'bg-slate-800 border border-white/5 text-slate-200 rounded-tl-none'
                                        : 'bg-purple-600 text-white rounded-tr-none'}`}
                                >
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}

                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150 mx-1"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl sticky bottom-0">
                <div className="max-w-3xl mx-auto relative flex gap-3 items-center">

                    <button
                        onClick={toggleListening}
                        className={`p-4 rounded-full transition-all duration-200 shadow-lg transform active:scale-95
              ${isListening
                                ? 'bg-red-500 shadow-red-500/30 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 border border-white/10'}`}
                        title="Toggle Voice Input"
                    >
                        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-purple-400" />}
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type or speak a message..."
                            className="w-full bg-slate-800/50 border border-white/10 rounded-full pl-6 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-slate-500 transition-all"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!inputText.trim() || isProcessing}
                            className="absolute right-2 top-2 p-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stop Button */}
                    <button
                        onClick={handleStop}
                        disabled={!isSpeaking}
                        className={`p-4 rounded-full transition-all duration-200 shadow-lg transform active:scale-95
              ${isSpeaking
                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                                : 'bg-slate-800 border border-white/10 opacity-50 cursor-not-allowed'}`}
                        title="Stop Speaking"
                    >
                        <Square className="w-6 h-6 text-white fill-current" />
                    </button>

                </div>
                <div className="text-center mt-2 text-xs text-slate-600">
                    Powered by Groq API
                </div>
            </div>

        </div>
    );
}

export default App;
