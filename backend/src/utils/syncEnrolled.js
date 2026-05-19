const { Workshop, Reservation } = require('../models');

const SEED_ENROLLED = {
  1: 12,
  2: 20,
  3: 2,
  4: 8,
  5: 10,
  6: 7,
  7: 13,
  8: 6,
  9: 5,
  10: 14,
  11: 9,
  12: 4,
  13: 7,
  14: 0,
  15: 0,
  16: 0
};

async function syncEnrolled() {
  console.log('🔄 Recalculating and synchronizing workshop enrolled counts...');
  try {
    const workshops = await Workshop.findAll();
    for (const workshop of workshops) {
      const seed = SEED_ENROLLED[workshop.id] || 0;
      
      // Sum participants of active (non-cancelled) reservations
      const activeReservations = await Reservation.findAll({
        where: {
          workshop_id: workshop.id,
          status: ['confirmed', 'pending']
        }
      });
      
      const activeCount = activeReservations.reduce((sum, r) => sum + r.num_participants, 0);
      const totalEnrolled = seed + activeCount;
      
      if (workshop.enrolled !== totalEnrolled) {
        console.log(`⚠️ Workshop "${workshop.title}" (ID: ${workshop.id}) enrolled count out of sync. Current: ${workshop.enrolled}, Correct: ${totalEnrolled}. Fixing...`);
        workshop.enrolled = totalEnrolled;
        await workshop.save();
      }
    }
    console.log('✅ Workshop enrolled counts are now perfectly in sync!');
  } catch (error) {
    console.error('Error synchronizing enrolled counts:', error);
  }
}

module.exports = syncEnrolled;
