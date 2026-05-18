const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_requested BOOLEAN DEFAULT false');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT');
    console.log('✅ cancel_requested ve cancel_reason sütunları eklendi');
    process.exit(0);
  } catch(e) {
    console.error('Hata:', e.message);
    process.exit(1);
  }
})();
