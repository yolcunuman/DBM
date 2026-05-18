// ═══════════════════════════════════════════════
//  Report Controller — Yönetici Rapor & İstatistik
// ═══════════════════════════════════════════════

const { Workshop, Reservation, Comment, SupportTicket, Artwork, Order, Favorite } = require('../models');
const { fn, col } = require('sequelize');

const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Atölye Doluluk Oranları ve Rezervasyon İstatistikleri
    const workshops = await Workshop.findAll({
      attributes: ['id', 'title', 'capacity', 'enrolled', 'price']
    });

    let totalCapacity = 0;
    let totalEnrolled = 0;
    let totalRevenue = 0;

    const workshopStats = workshops.map(w => {
      totalCapacity += w.capacity;
      totalEnrolled += w.enrolled;
      totalRevenue += (w.enrolled * parseFloat(w.price));
      
      return {
        id: w.id,
        title: w.title,
        capacity: w.capacity,
        enrolled: w.enrolled,
        occupancy_rate: w.capacity > 0 ? Math.round((w.enrolled / w.capacity) * 100) : 0
      };
    });

    const averageOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    // 2. Destek Talepleri İstatistikleri
    const openTicketsCount = await SupportTicket.count({
      where: { status: 'open' }
    });

    // 3. Yorum İstatistikleri
    const totalComments = await Comment.count();

    // 4. Eser İstatistikleri
    const totalArtworks = await Artwork.count();
    const availableArtworks = await Artwork.count({ where: { is_available: true } });

    // 5. Sipariş İstatistikleri
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const confirmedOrders = await Order.count({ where: { status: 'confirmed' } });
    const shippedOrders = await Order.count({ where: { status: 'shipped' } });
    const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    // Toplam satış geliri
    const orders = await Order.findAll({ where: { status: ['confirmed', 'shipped', 'delivered'] } });
    const totalSalesRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    // 6. Favori İstatistikleri
    const totalFavorites = await Favorite.count();

    res.json({
      success: true,
      data: {
        kpi: {
          total_workshops: workshops.length,
          total_enrolled: totalEnrolled,
          average_occupancy: averageOccupancy,
          estimated_revenue: totalRevenue,
          open_tickets: openTicketsCount,
          total_comments: totalComments,
          // Yeni eklenen eser istatistikleri
          total_artworks: totalArtworks,
          available_artworks: availableArtworks,
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          confirmed_orders: confirmedOrders,
          shipped_orders: shippedOrders,
          delivered_orders: deliveredOrders,
          cancelled_orders: cancelledOrders,
          total_sales_revenue: totalSalesRevenue,
          total_favorites: totalFavorites
        },
        workshops: workshopStats
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboardStats
};
