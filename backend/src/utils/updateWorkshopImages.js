// One-time script to update workshop images to reliable Unsplash URLs
const { Workshop } = require('../models');

const CATEGORY_IMAGES = {
  'Suluboya':      'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600',
  'Heykel':        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600',
  'Yağlı Boya':    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
  'Fotoğrafçılık': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
  'Seramik':       'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
  'Baskı Sanatı':  'https://images.unsplash.com/photo-1563089145-599997674d42?w=600',
  'Dijital Sanat': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
  'El Sanatları':  'https://images.unsplash.com/photo-1452860606245-08f5c4e85638?w=600',
  'Soyut':         'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
  'Cam Sanatı':    'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600',
  'Özel Ders':     'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600';

async function run() {
  try {
    const workshops = await Workshop.findAll();
    for (const w of workshops) {
      const newUrl = CATEGORY_IMAGES[w.category] || DEFAULT_IMAGE;
      await w.update({ image_url: newUrl });
    }
    console.log(`✅ ${workshops.length} atölye görseli güncellendi.`);
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err.message);
    process.exit(1);
  }
}

run();
