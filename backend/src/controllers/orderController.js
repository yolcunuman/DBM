// ═══════════════════════════════════════════════
//  Order Controller — Sipariş İş Mantığı
// ═══════════════════════════════════════════════

const { Order, Artwork } = require('../models');

// ─── Sipariş oluştur ───────────────────────────
const createOrder = async (req, res) => {
  try {
    const { user_id, artwork_id, quantity = 1, payment_method, shipping_address, notes } = req.body;

    // Eseri kontrol et
    const artwork = await Artwork.findByPk(artwork_id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Eser bulunamadı.' });
    if (!artwork.is_available) return res.status(400).json({ success: false, message: 'Bu eser şu an satışta değil.' });
    if (artwork.stock < quantity) return res.status(400).json({ success: false, message: `Yetersiz stok. Kalan: ${artwork.stock}` });

    const total_price = parseFloat(artwork.price) * quantity;

    const order = await Order.create({
      user_id,
      artwork_id,
      quantity,
      total_price,
      payment_method: payment_method || 'credit_card',
      shipping_address,
      notes
    });

    // Stoku güncelle
    artwork.stock -= quantity;
    if (artwork.stock <= 0) artwork.is_available = false;
    await artwork.save();

    res.status(201).json({ success: true, message: 'Sipariş başarıyla oluşturuldu.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tüm siparişleri getir (Admin) ─────────────
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await Order.findAll({
      where,
      include: [{ model: Artwork, as: 'artwork', attributes: ['id', 'title', 'image_url', 'artist_name', 'price'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Kullanıcının siparişleri ──────────────────
const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.query;
    const orders = await Order.findAll({
      where: { user_id: user_id || 1 },
      include: [{ model: Artwork, as: 'artwork', attributes: ['id', 'title', 'image_url', 'artist_name', 'price'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Sipariş durumunu güncelle (Admin) ─────────
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı.' });

    // İptal durumunda stoku geri ekle
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const artwork = await Artwork.findByPk(order.artwork_id);
      if (artwork) {
        artwork.stock += order.quantity;
        artwork.is_available = true;
        await artwork.save();
      }
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: 'Sipariş durumu güncellendi.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus
};
