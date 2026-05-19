// ═══════════════════════════════════════════════
//  Order Controller — Sipariş İş Mantığı
// ═══════════════════════════════════════════════

const { Order, Artwork, User } = require('../models');

// ─── Sipariş oluştur ───────────────────────────
const VALID_COUPONS = {
  'SANAT10': { discount: 10, label: '%10 İndirim' },
  'YAZ10': { discount: 10, label: '%10 Yaz Fırsatı İndirimi' },
  'ARTISANA20': { discount: 20, label: '%20 İndirim' },
  'HOSGELDIN': { discount: 15, label: '%15 Hoş Geldin İndirimi' },
};

const createOrder = async (req, res) => {
  try {
    const { user_id, artwork_id, quantity = 1, payment_method, shipping_address, notes, coupon_code } = req.body;

    // Kullanıcıyı kontrol et
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'Sipariş oluşturmak için giriş yapmalısınız.' });
    }
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Oturumunuz geçerli değil veya kullanıcı silinmiş. Lütfen çıkış yapıp tekrar giriş yapın.' 
      });
    }

    // Eseri kontrol et
    const artwork = await Artwork.findByPk(artwork_id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Eser bulunamadı.' });
    if (!artwork.is_available) return res.status(400).json({ success: false, message: 'Bu eser şu an satışta değil.' });
    if (artwork.stock < quantity) return res.status(400).json({ success: false, message: `Yetersiz stok. Kalan: ${artwork.stock}` });

    const basePrice = parseFloat(artwork.price) * quantity;
    let finalNotes = notes || '';
    let total_price = basePrice;

    if (coupon_code) {
      const codeUpper = coupon_code.trim().toUpperCase();
      const found = VALID_COUPONS[codeUpper];
      if (found) {
        const discountAmount = (basePrice * found.discount) / 100;
        total_price = basePrice - discountAmount;
        finalNotes = `[Kupon: ${codeUpper} (${found.label})] ${finalNotes}`.trim();
      }
    }

    const order = await Order.create({
      user_id,
      artwork_id,
      quantity,
      total_price,
      payment_method: payment_method || 'credit_card',
      shipping_address,
      notes: finalNotes || null,
      status: 'pending'
    });


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

    const oldStatus = order.status;
    const newStatus = status;

    const isApprovedState = (s) => ['confirmed', 'shipped', 'delivered'].includes(s);
    const wasApproved = isApprovedState(oldStatus);
    const isNowApproved = isApprovedState(newStatus);

    if (wasApproved !== isNowApproved) {
      const artwork = await Artwork.findByPk(order.artwork_id);
      if (artwork) {
        if (!wasApproved && isNowApproved) {
          // Bu eser için önceden onaylanmış başka bir sipariş var mı kontrol et
          const { Op } = require('sequelize');
          const approvedOrderExists = await Order.findOne({
            where: {
              artwork_id: order.artwork_id,
              status: { [Op.in]: ['confirmed', 'shipped', 'delivered'] },
              id: { [Op.ne]: order.id }
            }
          });

          if (approvedOrderExists) {
            return res.status(400).json({ 
              success: false, 
              message: 'Bu eser başka bir sipariş için onaylanmış.' 
            });
          }

          // Eğer stok ve kullanılabilirlik eski hatalı kayıt yüzünden sıfırsa/false ise bile bu siparişi onaylayabiliriz.
          if (artwork.stock >= order.quantity) {
            artwork.stock -= order.quantity;
            if (artwork.stock <= 0) {
              artwork.is_available = false;
            }
            await artwork.save();
          } else {
            artwork.is_available = false;
            await artwork.save();
          }
        } else if (wasApproved && !isNowApproved) {
          // Daha önce onaylanmış sipariş iptal edildiğinde veya beklemeye alındığında stoku geri yüklüyoruz.
          artwork.stock += order.quantity;
          artwork.is_available = true;
          await artwork.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: 'Sipariş durumu güncellendi.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Kullanıcı iptal talebi ────────────────
const requestCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancel_reason } = req.body;
    if (!cancel_reason || cancel_reason.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Lütfen en az 5 karakterlik bir iptal sebebi girin.' });
    }
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı.' });
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Bu sipariş iptal edilemez.' });
    }
    order.cancel_requested = true;
    order.cancel_reason = cancel_reason.trim();
    await order.save();
    res.json({ success: true, message: 'İptal talebiniz alındı. Yönetici onayı bekleniyor.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: iptal talebini onayla/reddet ───────────
const approveCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // true = onayla, false = reddet
    const order = await Order.findByPk(id, {
      include: [{ model: Artwork, as: 'artwork' }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı.' });
    if (!order.cancel_requested) return res.status(400).json({ success: false, message: 'İptal talebi bulunamadı.' });

    if (approve) {
      // İptal onaylandı: Sadece daha önce onaylanmış siparişlerde stoku geri yüklüyoruz
      const isApprovedState = (s) => ['confirmed', 'shipped', 'delivered'].includes(s);
      if (isApprovedState(order.status) && order.artwork) {
        order.artwork.stock = (order.artwork.stock || 0) + order.quantity;
        order.artwork.is_available = true;
        await order.artwork.save();
      }
      order.status = 'cancelled';
    }
    order.cancel_requested = false;
    await order.save();

    const msg = approve ? 'Sipariş iptal edildi, stok geri yüklendi.' : 'İptal talebi reddedildi.';
    res.json({ success: true, message: msg, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  requestCancelOrder,
  approveCancelOrder,
};
