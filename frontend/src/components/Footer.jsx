import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-white font-serif text-lg font-bold">G</span>
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-white block leading-none">Galerist</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">Gallery & Studio</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Sanatın dijital buluşma noktası. Eşsiz eserleri keşfedin, yaratıcı atölyelere katılın.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                IG
              </a>
              <a href="#" className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                TW
              </a>
              <a href="#" className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                FB
              </a>
            </div>
          </div>

          {/* Geliştirici 1 — Eserler & Satın Alma */}
          <div>
            <h4 className="font-sans font-semibold text-white text-sm tracking-wider uppercase mb-5">Eserler</h4>
            <ul className="space-y-3">
              <li><Link to="/artworks" className="text-sm text-white/60 hover:text-primary transition-colors">Tüm Eserler</Link></li>
              <li><Link to="/artists" className="text-sm text-white/60 hover:text-primary transition-colors">Sanatçılar</Link></li>
              <li><Link to="/favorites" className="text-sm text-white/60 hover:text-primary transition-colors">Favorilerim</Link></li>
              <li><Link to="/cart" className="text-sm text-white/60 hover:text-primary transition-colors">Sepetim</Link></li>
            </ul>
          </div>

          {/* Geliştirici 2 — Atölyeler & Destek */}
          <div>
            <h4 className="font-sans font-semibold text-white text-sm tracking-wider uppercase mb-5">Atölyeler</h4>
            <ul className="space-y-3">
              <li><Link to="/workshops" className="text-sm text-white/60 hover:text-primary transition-colors">Yaklaşan Etkinlikler</Link></li>
              <li><Link to="/workshops" className="text-sm text-white/60 hover:text-primary transition-colors">Rezervasyonlarım</Link></li>
              <li><Link to="/contact" className="text-sm text-white/60 hover:text-primary transition-colors">İletişim</Link></li>
              <li><Link to="/contact" className="text-sm text-white/60 hover:text-primary transition-colors">Destek</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="font-sans font-semibold text-white text-sm tracking-wider uppercase mb-5">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
                <span className="text-sm text-white/60">Bağdat Caddesi No:42, Kadıköy, İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <span className="text-sm text-white/60">+90 (216) 555 0123</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="text-sm text-white/60">info@galerist.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">© 2026 Galerist Gallery & Studio. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">Gizlilik Politikası</a>
            <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
