import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, Ticket, Check } from 'lucide-react';

const LiveChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Merhaba! Galerist canlı desteğe hoş geldiniz. Size nasıl yardımcı olabilirim?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const messagesEndRef = useRef(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user ? user.id : 'guest';

  // Listen to external request to open assistant
  useEffect(() => {
    const handleOpenRequest = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-galerist-assistant', handleOpenRequest);
    return () => window.removeEventListener('open-galerist-assistant', handleOpenRequest);
  }, []);

  // Reset messages when user logs in, logs out, or switches accounts
  useEffect(() => {
    setMessages([
      { id: 1, text: "Merhaba! Galerist canlı desteğe hoş geldiniz. Size nasıl yardımcı olabilirim?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, [userId]);

  useEffect(() => {
    // Eserleri ve Atölyeleri çek
    fetch('http://localhost:5001/api/artworks')
      .then(res => res.json())
      .then(data => {
        if (data.success) setArtworks(data.data);
      })
      .catch(err => console.error('Chat error fetching artworks:', err));

    fetch('http://localhost:5001/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorkshops(data.data);
      })
      .catch(err => console.error('Chat error fetching workshops:', err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newUserMsg = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Botun vereceği cevabı analiz et
    setTimeout(() => {
      const response = getBotResponse(userText);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        type: response.type,
        actionLabel: response.actionLabel,
        actionType: response.actionType,
        originalMsg: response.originalMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();

    // 1. Destek talebi oluşturma isteği
    if (lowerText.includes('destek') || lowerText.includes('talep') || lowerText.includes('ticket') || lowerText.includes('şikayet') || lowerText.includes('sorun') || lowerText.includes('hata')) {
      return {
        type: 'action',
        text: 'Destek ekibimize bu konuda resmi bir destek talebi (ticket) iletmemi ister misiniz? Böylece talebinizin aşamalarını İletişim sayfasından takip edebilirsiniz.',
        actionLabel: 'Evet, Destek Talebi Oluştur',
        actionType: 'create_ticket',
        originalMsg: text
      };
    }

    // 2. Eser satıldı mı / stok sorgusu
    const matchedArtwork = artworks.find(art =>
      lowerText.includes(art.title.toLowerCase())
    );

    if (matchedArtwork) {
      if (matchedArtwork.is_available) {
        return {
          type: 'text',
          text: `🎨 "${matchedArtwork.title}" (${matchedArtwork.artist_name}) adlı eserimiz şu an satıştadır. Fiyatı: ${Number(matchedArtwork.price).toLocaleString('tr-TR')} ₺. Satın almak için "Eserler" sayfasından sepetinize ekleyebilirsiniz!`
        };
      } else {
        return {
          type: 'text',
          text: `❌ Maalesef, "${matchedArtwork.title}" (${matchedArtwork.artist_name}) adlı eserimiz satılmıştır (tükenmiştir). Yeni gelecek eserleri takip etmek için galerimizi ziyaret edebilirsiniz.`
        };
      }
    }

    // 3. Atölye durum sorgusu
    const matchedWorkshop = workshops.find(w =>
      lowerText.includes(w.title.toLowerCase())
    );

    if (matchedWorkshop) {
      const spotsLeft = matchedWorkshop.capacity - matchedWorkshop.enrolled;
      if (spotsLeft > 0) {
        return {
          type: 'text',
          text: `🗓️ "${matchedWorkshop.title}" atölyemizde şu an ${spotsLeft} kişilik boş yer mevcuttur. Ücret: ${Number(matchedWorkshop.price).toLocaleString('tr-TR')} ₺. Rezervasyon yapmak için "Atölyeler" sayfasını ziyaret edebilirsiniz!`
        };
      } else {
        return {
          type: 'text',
          text: `❌ "${matchedWorkshop.title}" atölyemizin kontenjanı tamamen dolmuştur. Yeni açılacak tarihleri takip edebilirsiniz.`
        };
      }
    }

    // 4. Genel eser/tablo sorgusu ve fiyat sıralaması
    if (lowerText.includes('eser') || lowerText.includes('tablo') || lowerText.includes('resim') || lowerText.includes('heykel')) {
      const availableArt = artworks.filter(a => a.is_available);

      if (availableArt.length > 0) {
        // En ucuz / En uygun sorgusu
        if (lowerText.includes('uygun') || lowerText.includes('ucuz') || lowerText.includes('düşük') || lowerText.includes('ekonomik')) {
          const sorted = [...availableArt].sort((x, y) => x.price - y.price).slice(0, 3);
          const listStr = sorted.map(a => `• "${a.title}" (${a.artist_name}) - ${Number(a.price).toLocaleString('tr-TR')} ₺`).join('\n');
          return {
            type: 'text',
            text: `Galerimizdeki en uygun fiyatlı (en ucuz) eserler şunlardır:\n\n${listStr}\n\nDetaylar için "Eserler" sayfamıza göz atabilirsiniz!`
          };
        }

        // En pahalı / En yüksek fiyat sorgusu
        if (lowerText.includes('pahalı') || lowerText.includes('yüksek') || lowerText.includes('değerli')) {
          const sorted = [...availableArt].sort((x, y) => y.price - x.price).slice(0, 3);
          const listStr = sorted.map(a => `• "${a.title}" (${a.artist_name}) - ${Number(a.price).toLocaleString('tr-TR')} ₺`).join('\n');
          return {
            type: 'text',
            text: `Galerimizdeki en yüksek fiyatlı (en değerli) eserler şunlardır:\n\n${listStr}\n\nDetaylar için "Eserler" sayfamıza göz atabilirsiniz!`
          };
        }

        // Varsayılan genel liste
        const defaultList = availableArt.slice(0, 3);
        const listStr = defaultList.map(a => `• "${a.title}" (${Number(a.price).toLocaleString('tr-TR')} ₺)`).join('\n');
        return {
          type: 'text',
          text: `Şu an galerimizde satışta olan harika eserlerimizden bazıları:\n\n${listStr}\n\nDetaylar için "Eserler" sayfamıza göz atabilirsiniz!`
        };
      }
    }

    // 5. Genel atölye sorgusu ve fiyat sıralaması
    if (lowerText.includes('atölye') || lowerText.includes('kurs') || lowerText.includes('etkinlik')) {
      const activeWorkshops = workshops.filter(w => (w.capacity - w.enrolled) > 0);

      if (activeWorkshops.length > 0) {
        // En ucuz / En uygun sorgusu
        if (lowerText.includes('uygun') || lowerText.includes('ucuz') || lowerText.includes('düşük') || lowerText.includes('ekonomik')) {
          const sorted = [...activeWorkshops].sort((x, y) => x.price - y.price).slice(0, 3);
          const listStr = sorted.map(w => `• "${w.title}" (Eğitmen: ${w.instructor}) - ${Number(w.price).toLocaleString('tr-TR')} ₺`).join('\n');
          return {
            type: 'text',
            text: `Yaklaşan en uygun fiyatlı atölyelerimiz şunlardır:\n\n${listStr}\n\nDetaylar için "Atölyeler" sayfamıza göz atabilirsiniz!`
          };
        }

        // En pahalı / En yüksek fiyat sorgusu
        if (lowerText.includes('pahalı') || lowerText.includes('yüksek') || lowerText.includes('değerli')) {
          const sorted = [...activeWorkshops].sort((x, y) => y.price - x.price).slice(0, 3);
          const listStr = sorted.map(w => `• "${w.title}" (Eğitmen: ${w.instructor}) - ${Number(w.price).toLocaleString('tr-TR')} ₺`).join('\n');
          return {
            type: 'text',
            text: `Yaklaşan en yüksek ücretli (kapsamlı) atölyelerimiz şunlardır:\n\n${listStr}\n\nDetaylar için "Atölyeler" sayfamıza göz atabilirsiniz!`
          };
        }

        // Varsayılan genel liste
        const defaultList = activeWorkshops.slice(0, 3);
        const listStr = defaultList.map(w => `• "${w.title}" (Eğitmen: ${w.instructor})`).join('\n');
        return {
          type: 'text',
          text: `Yaklaşan ve kontenjanı açık olan atölyelerimizden bazıları:\n\n${listStr}\n\nKayıt olmak için "Atölyeler" sayfamızı ziyaret edebilirsiniz!`
        };
      }
    }

    // Varsayılan cevap
    return {
      type: 'text',
      text: "Size nasıl yardımcı olabilirim? Eserlerimizin satış durumunu öğrenmek için eser ismini tam yazabilir veya teknik bir sorun için doğrudan 'destek talebi oluşturmak istiyorum' yazabilirsiniz."
    };
  };

  const handleActionClick = (msg) => {
    // Butonu pasif hale getir
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, completed: true } : m));

    if (msg.actionType === 'create_ticket') {
      if (!user) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "⚠️ Destek talebi oluşturabilmek için lütfen önce giriş yapın.",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        return;
      }

      // Talebi backend'e gönder
      fetch('http://localhost:5001/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subject: 'Canlı Destek Talebi',
          category: 'general',
          message: msg.originalMsg
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: `🎉 Destek talebiniz başarıyla oluşturuldu! (Talep ID: #${data.data.id})\n\nTalebinizin takibini İletişim sayfasından veya Hesabım panelinden yapabilirsiniz. En kısa sürede size dönüş sağlayacağız.`,
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          } else {
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: "❌ Destek talebi oluşturulurken bir sorun oluştu. Lütfen İletişim sayfasındaki formu kullanın.",
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }
        })
        .catch(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "❌ Sunucu bağlantı hatası oluştu. Lütfen İletişim sayfasındaki formu kullanın.",
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
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
        <div className="w-[320px] h-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-zinc-800 dark:text-zinc-100">
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
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm whitespace-pre-wrap ${msg.sender === 'user'
                    ? 'bg-primary text-white rounded-2xl rounded-br-none'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-bl-none'
                  }`}>
                  {msg.text}
                  {msg.type === 'action' && !msg.completed && (
                    <button
                      onClick={() => handleActionClick(msg)}
                      className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Ticket size={12} /> {msg.actionLabel}
                    </button>
                  )}
                  {msg.type === 'action' && msg.completed && (
                    <div className="mt-2 text-[11px] text-green-500 dark:text-green-400 font-bold flex items-center gap-1">
                      <Check size={12} /> Talep Oluşturuldu
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Bir mesaj yazın..."
              className="flex-1 px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:border-primary bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
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
