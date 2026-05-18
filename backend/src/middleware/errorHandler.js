// ═══════════════════════════════════════════════
//  Error Handler Middleware
// ═══════════════════════════════════════════════

const errorHandler = (err, req, res, next) => {
  console.error('─── HATA ───');
  console.error('Endpoint:', req.method, req.originalUrl);
  console.error('Mesaj:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({
      success: false,
      message: 'Doğrulama hatası.',
      errors,
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Bu kayıt zaten mevcut.',
    });
  }

  // Genel hata
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Sunucu hatası.',
  });
};

module.exports = errorHandler;
