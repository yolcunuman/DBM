// ═══════════════════════════════════════════════
//  Artisana Backend — Ana Server Dosyası
// ═══════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Route dosyaları
const workshopRoutes = require('./routes/workshopRoutes');
const commentRoutes = require('./routes/commentRoutes');
const supportRoutes = require('./routes/supportRoutes');
const reportRoutes = require('./routes/reportRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware'ler ─────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Route'ları ─────────────────────────────
app.use('/api', workshopRoutes);
app.use('/api', commentRoutes);
app.use('/api', supportRoutes);
app.use('/api', reportRoutes);
app.use('/api', artworkRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', orderRoutes);
app.use('/api/auth', authRoutes);

// ─── Sağlık Kontrolü ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Artisana API çalışıyor! 🎨',
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handler ──────────────────────────────
app.use(errorHandler);

// ─── Sunucuyu Başlat ────────────────────────────
const startServer = async () => {
  try {
    // Veritabanı bağlantısı
    await sequelize.authenticate();
    
    if (process.env.USE_LOCAL_SQLITE === 'true') {
      console.log('✅ SQLite bağlantısı başarılı (Supabase REST API Köprü Modu)!');
      // Tabloları güncel şemayla senkronize et (veri silinmesini engeller)
      await sequelize.sync();
      console.log('✅ SQLite tabloları başarıyla senkronize edildi!');
      const syncSupabaseToSQLite = require('./utils/supabaseSync');
      await syncSupabaseToSQLite();
    } else {
      console.log('✅ PostgreSQL doğrudan bağlantısı başarılı!');
      await sequelize.sync({ alter: true });
      console.log('✅ Veritabanı tabloları senkronize edildi!');
    }

    // Eserler boşsa otomatik seed (arkadaşın projeyi çektiğinde de çalışsın)
    const { Artwork } = require('./models');
    const artworkCount = await Artwork.count();
    if (artworkCount === 0) {
      const { seedArtworks } = require('./controllers/artworkController');
      // Fake req/res ile seed fonksiyonunu çağır
      await seedArtworks(
        {},
        { status: () => ({ json: (d) => console.log(`🎨 ${d.message}`) }), json: (d) => console.log(`🎨 ${d.message}`) }
      );
    }

    // Atölyeler eksikse veya boşsa otomatik seed
    const { Workshop } = require('./models');
    const workshopCount = await Workshop.count();
    if (workshopCount < 13) {
      const { seedWorkshops } = require('./controllers/workshopController');
      await seedWorkshops(
        {},
        { status: () => ({ json: (d) => console.log(`🎭 ${d.message}`) }), json: (d) => console.log(`🎭 ${d.message}`) }
      );
    }

    // Rezervasyon sayılarını ve kapasiteleri eşitle
    const syncEnrolled = require('./utils/syncEnrolled');
    await syncEnrolled();

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`
  ═══════════════════════════════════════════════
   🎨 Artisana API — Geliştirici 2
   📡 http://localhost:${PORT}
   🗃️  Veritabanı: ${process.env.USE_LOCAL_SQLITE === 'true' ? 'SQLite (Supabase REST API Köprü Modu)' : 'PostgreSQL (Canlı Supabase)'}
   🌐 CORS: ${process.env.CLIENT_URL}
  ═══════════════════════════════════════════════
      `);
    });
  } catch (error) {
    if (process.env.USE_LOCAL_SQLITE !== 'true') {
      console.log('⚠️ PostgreSQL doğrudan bağlantı kurulamadı (Connection Pooler kapalı veya IPv6 engeli).');
      console.log('🔄 Supabase REST API köprüsü devreye alınıyor... SQLite yedek sunucusu başlatılıyor!');
      
      const { fork } = require('child_process');
      const child = fork(__filename, process.argv.slice(2), {
        env: { ...process.env, USE_LOCAL_SQLITE: 'true' }
      });
      
      child.on('exit', (code) => {
        process.exit(code || 0);
      });
      return;
    }
    console.error('❌ Sunucu başlatılırken hata:', error.message);
    process.exit(1);
  }
};

startServer();
