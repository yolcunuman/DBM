// ═══════════════════════════════════════════════
//  Model İlişkileri (Associations)
//  Tüm modelleri tek yerden export eder
// ═══════════════════════════════════════════════

const sequelize = require('../config/database');

// Modellerin içe aktarılması
const Workshop = require('./Workshop');
const Reservation = require('./Reservation');
const Comment = require('./Comment');
const SupportTicket = require('./SupportTicket');

// Geliştirici 1'in modelleri (İlişkiler için placeholder)
const User = require('./User');
const Artwork = require('./Artwork');
const Favorite = require('./Favorite');
const Order = require('./Order');

// ─── İlişkiler ──────────────────────────────────

// 1. User <-> Reservation (1:N)
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations', onDelete: 'CASCADE' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. Workshop <-> Reservation (1:N)
Workshop.hasMany(Reservation, { foreignKey: 'workshop_id', as: 'reservations', onDelete: 'CASCADE' });
Reservation.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// 3. User <-> SupportTicket (1:N)
User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'support_tickets', onDelete: 'CASCADE' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 4. User <-> Comment (1:N)
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 5. Polymorphic İlişki: Comment <-> Workshop & Artwork
// Workshop Yorumları
Workshop.hasMany(Comment, {
  foreignKey: 'target_id',
  constraints: false,
  scope: { target_type: 'workshop' },
  as: 'comments'
});
Comment.belongsTo(Workshop, { foreignKey: 'target_id', constraints: false, as: 'workshop' });

// Artwork Yorumları
Artwork.hasMany(Comment, {
  foreignKey: 'target_id',
  constraints: false,
  scope: { target_type: 'artwork' },
  as: 'comments'
});
Comment.belongsTo(Artwork, { foreignKey: 'target_id', constraints: false, as: 'artwork' });

// 6. User <-> Favorite (1:N)
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 7. Artwork <-> Favorite (1:N)
Artwork.hasMany(Favorite, { foreignKey: 'artwork_id', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(Artwork, { foreignKey: 'artwork_id', as: 'artwork' });

// 8. User <-> Order (1:N)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 9. Artwork <-> Order (1:N)
Artwork.hasMany(Order, { foreignKey: 'artwork_id', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(Artwork, { foreignKey: 'artwork_id', as: 'artwork' });

module.exports = {
  sequelize,
  Workshop,
  Reservation,
  Comment,
  SupportTicket,
  User,
  Artwork,
  Favorite,
  Order
};
