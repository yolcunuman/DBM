// ═══════════════════════════════════════════════
//  Report Controller — Yönetici Rapor & İstatistik
// ═══════════════════════════════════════════════

const { Workshop, Reservation, Comment, SupportTicket, Artwork, Order, Favorite } = require('../models');
const { fn, col } = require('sequelize');

const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Atölye Doluluk Oranları ve Rezervasyon İstatistikleri
    const workshops = await Workshop.findAll({
      attributes: ['id', 'title', 'capacity', 'enrolled', 'price', 'description', 'instructor', 'category', 'date', 'start_time', 'end_time', 'location', 'image_url', 'status']
    });

    let totalCapacity = 0;
    let totalEnrolled = 0;
    let totalRevenue = 0;

    const workshopStats = await Promise.all(workshops.map(async w => {
      totalCapacity += w.capacity;
      totalEnrolled += w.enrolled;
      totalRevenue += (w.enrolled * parseFloat(w.price));

      // Calculate average rating
      const avgComment = await Comment.findOne({
        where: { target_type: 'workshop', target_id: w.id },
        attributes: [[fn('AVG', col('rating')), 'avg_rating']],
        raw: true
      });
      const avgRating = avgComment?.avg_rating ? parseFloat(avgComment.avg_rating).toFixed(1) : '0.0';

      // Count total reservations
      const totalReservations = await Reservation.count({ where: { workshop_id: w.id } });

      return {
        id: w.id,
        title: w.title,
        capacity: w.capacity,
        enrolled: w.enrolled,
        price: w.price,
        description: w.description,
        instructor: w.instructor,
        category: w.category,
        date: w.date,
        start_time: w.start_time,
        end_time: w.end_time,
        location: w.location,
        image_url: w.image_url,
        status: w.status,
        occupancy_rate: w.capacity > 0 ? Math.round((w.enrolled / w.capacity) * 100) : 0,
        average_rating: avgRating,
        total_reservations: totalReservations
      };
    }));

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

    const artworksList = await Artwork.findAll({
      attributes: ['id', 'title', 'artist_name', 'price', 'is_available', 'views']
    });

    const artworkStats = await Promise.all(artworksList.map(async a => {
      const totalLikes = await Favorite.count({ where: { artwork_id: a.id } });
      const totalCommentsCount = await Comment.count({ where: { target_type: 'artwork', target_id: a.id } });
      
      const orders = await Order.findAll({
        where: { artwork_id: a.id, status: ['confirmed', 'shipped', 'delivered'] }
      });
      const totalSold = orders.length;
      const totalRev = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);

      return {
        id: a.id,
        title: a.title,
        artist_name: a.artist_name,
        price: a.price,
        is_available: a.is_available,
        views: a.views || 0,
        total_likes: totalLikes,
        total_comments: totalCommentsCount,
        total_sold: totalSold,
        total_revenue: totalRev
      };
    }));

    // 5. Sipariş İstatistikleri
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const confirmedOrders = await Order.count({ where: { status: 'confirmed' } });
    const shippedOrders = await Order.count({ where: { status: 'shipped' } });
    const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    // Toplam satış geliri (Eser Satış Geliri)
    const orders = await Order.findAll({ where: { status: ['confirmed', 'shipped', 'delivered'] } });
    const totalSalesRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    // 6. Rezervasyon İstatistikleri & Geliri
    const totalReservations = await Reservation.count();
    const pendingReservations = await Reservation.count({ where: { status: 'pending' } });
    const confirmedReservations = await Reservation.count({ where: { status: 'confirmed' } });
    const cancelledReservations = await Reservation.count({ where: { status: 'cancelled' } });

    const allReservations = await Reservation.findAll();
    const totalReservationRevenue = allReservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + parseFloat(r.total_price), 0);

    const totalReservationParticipants = allReservations.reduce((sum, r) => sum + parseInt(r.num_participants || 0), 0);
    const confirmedReservationParticipants = allReservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + parseInt(r.num_participants || 0), 0);

    // 7. Favori İstatistikleri
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
          total_artworks: totalArtworks,
          available_artworks: availableArtworks,
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          confirmed_orders: confirmedOrders,
          shipped_orders: shippedOrders,
          delivered_orders: deliveredOrders,
          cancelled_orders: cancelledOrders,
          total_sales_revenue: totalSalesRevenue,
          total_reservation_revenue: totalReservationRevenue,
          total_reservations: totalReservations,
          pending_reservations: pendingReservations,
          confirmed_reservations: confirmedReservations,
          cancelled_reservations: cancelledReservations,
          total_reservation_participants: totalReservationParticipants,
          confirmed_reservation_participants: confirmedReservationParticipants,
          total_favorites: totalFavorites
        },
        workshops: workshopStats,
        artworks: artworkStats
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboardStats
};
