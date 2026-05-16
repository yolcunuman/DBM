const { Workshop, Reservation, Comment, SupportTicket } = require('../models');
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

    res.json({
      success: true,
      data: {
        kpi: {
          total_workshops: workshops.length,
          total_enrolled: totalEnrolled,
          average_occupancy: averageOccupancy,
          estimated_revenue: totalRevenue,
          open_tickets: openTicketsCount,
          total_comments: totalComments
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
