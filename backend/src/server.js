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
    console.log('✅ PostgreSQL bağlantısı başarılı!');

    // Tabloları oluştur (varsa dokunmaz)
    await sequelize.sync();
    console.log('✅ Veritabanı tabloları senkronize edildi!');

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`
  ═══════════════════════════════════════════════
   🎨 Artisana API — Geliştirici 2
   📡 http://localhost:${PORT}
   🗃️  Veritabanı: ${process.env.DB_NAME}
   🌐 CORS: ${process.env.CLIENT_URL}
  ═══════════════════════════════════════════════
      `);
    });
  } catch (error) {
    console.error('❌ Sunucu başlatılırken hata:', error.message);
    process.exit(1);
  }
};

startServer();
