// ═══════════════════════════════════════════════
//  Order Routes
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getUserOrders, updateOrderStatus, requestCancelOrder, approveCancelOrder } = require('../controllers/orderController');

// Sipariş oluştur
router.post('/orders', createOrder);

// Tüm siparişler (Admin)
router.get('/orders/all', getAllOrders);

// Kullanıcının siparişleri
router.get('/orders', getUserOrders);

// Sipariş durumunu güncelle (Admin)
router.put('/orders/:id/status', updateOrderStatus);

// Kullanıcı iptal talebi
router.put('/orders/:id/cancel-request', requestCancelOrder);

// Admin iptal onayla/reddet
router.put('/orders/:id/approve-cancel', approveCancelOrder);

module.exports = router;
