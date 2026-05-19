// ═══════════════════════════════════════════════
//  Supabase REST API <-> SQLite Senkronizasyon Köprüsü
//  Alaattin Pooler'ı açana kadar canlı verileri SQLite'a aktarır
// ═══════════════════════════════════════════════

const { sequelize, Workshop, Artwork, User, Comment, SupportTicket, Order, Favorite, Reservation } = require('../models');

const fetchSupabaseTable = async (tableName) => {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${tableName}?select=*`;
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
      }
    });
    if (!response.ok) {
      console.error(`❌ Supabase REST API hatası (${tableName}):`, response.statusText);
      return [];
    }
    return await response.json();
  } catch (err) {
    console.error(`❌ Supabase REST API bağlantı hatası (${tableName}):`, err.message);
    return [];
  }
};

const syncSupabaseToSQLite = async () => {
  console.log('🔄 Supabase REST API üzerinden canlı veriler çekiliyor...');

  try {
    // 1. Verileri Supabase'den çek
    const usersData = await fetchSupabaseTable('users');
    const workshopsData = await fetchSupabaseTable('workshops');
    const artworksData = await fetchSupabaseTable('artworks');
    const reservationsData = await fetchSupabaseTable('reservations');
    const commentsData = await fetchSupabaseTable('comments');
    const ticketsData = await fetchSupabaseTable('support_tickets');
    const ordersData = await fetchSupabaseTable('orders');
    const favoritesData = await fetchSupabaseTable('favorites');

    console.log(`📦 Çekilen veriler: ${usersData.length} Kullanıcı, ${workshopsData.length} Atölye, ${artworksData.length} Eser, ${commentsData.length} Yorum.`);

    // Foreign key kontrollerini geçici olarak kapat
    await sequelize.query('PRAGMA foreign_keys = OFF;');

    // 3. Verileri SQLite'a yaz (Hata yakalama ile)
    const safeBulkCreate = async (Model, data, name) => {
      if (!data || data.length === 0) return;
      try {
        await Model.bulkCreate(data, { ignoreDuplicates: true, validate: false });
        console.log(`✅ ${name} tablosuna ${data.length} kayıt eklendi.`);
      } catch (err) {
        console.error(`❌ ${name} tablosu ekleme hatası:`, err.message);
      }
    };

    await safeBulkCreate(User, usersData, 'Kullanıcılar');
    await safeBulkCreate(Workshop, workshopsData, 'Atölyeler');
    await safeBulkCreate(Artwork, artworksData, 'Eserler');
    await safeBulkCreate(Reservation, reservationsData, 'Rezervasyonlar');
    await safeBulkCreate(Comment, commentsData, 'Yorumlar');
    await safeBulkCreate(SupportTicket, ticketsData, 'Destek Talepleri');
    await safeBulkCreate(Order, ordersData, 'Siparişler');
    await safeBulkCreate(Favorite, favoritesData, 'Favoriler');

    // Foreign key kontrollerini tekrar aç
    await sequelize.query('PRAGMA foreign_keys = ON;');

    console.log('✅ Supabase canlı verileri SQLite üzerine başarıyla senkronize edildi!');
  } catch (error) {
    console.error('❌ Senkronizasyon sırasında hata:', error.message);
  }
};

module.exports = syncSupabaseToSQLite;
