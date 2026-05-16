import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Merhaba! Artisana canlı desteğe hoş geldiniz. Size nasıl yardımcı olabilirim?", sender: 'bot', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newUserMsg = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Mesajınızı aldık. Müşteri temsilcimiz en kısa sürede size yanıt verecektir. Acil teknik sorunlar için lütfen bir destek talebi oluşturun.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark hover:scale-105 transition-all animate-bounce"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[320px] h-[450px] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Canlı Destek</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Çevrimiçi
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#fafafa] dark:bg-[#121212] space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-2xl rounded-br-none' : 'bg-white dark:bg-[#1e1e1e] border border-border text-foreground rounded-2xl rounded-bl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted mt-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface flex items-center gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Bir mesaj yazın..." 
              className="flex-1 px-4 py-2 text-sm border border-border rounded-full focus:outline-none focus:border-primary bg-background"
            />
            <button type="submit" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!inputValue.trim()}>
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
