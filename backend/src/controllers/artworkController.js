// ═══════════════════════════════════════════════
//  Artwork Controller — Eser İş Mantığı
//  CRUD + Listeleme + Filtreleme + Seed
// ═══════════════════════════════════════════════

const { Artwork, Comment } = require('../models');
const { Op } = require('sequelize');

// ─── 10 Adet Sanat Eseri Seed Verisi ───────────
const SEED_ARTWORKS = [
  {
    title: 'Yıldızlı Gece',
    description: 'Post-Empresyonist akımın en ikonik eserlerinden biri. Gece gökyüzünün çalkantılı spiralleri, kasaba manzarasıyla bütünleşerek izleyiciye derin bir duygusal deneyim sunar. Yoğun mavi ve sarı tonları, eserin dramatik atmosferini güçlendirir.',
    artist_name: 'Elif Yılmaz',
    artist_bio: 'İstanbul doğumlu Elif Yılmaz, Mimar Sinan Üniversitesi Güzel Sanatlar mezunudur. Doğadan ilham alan soyut peyzaj çalışmalarıyla tanınır. Eserleri birçok uluslararası sergide yer almıştır.',
    category: 'Yağlı Boya',
    technique: 'Tuval üzerine yağlıboya',
    dimensions: '73.7 × 92.1 cm',
    year: 2023,
    price: 15000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    stock: 1
  },
  {
    title: 'Mavi Huzur',
    description: 'Soyut ekspresyonizmin derinliklerini keşfeden bu eser, mavi tonların farklı katmanlarıyla izleyiciyi meditasyona davet eder. Sanatçının iç dünyasının yansıması olan bu çalışma, minimalist bir yaklaşımla maksimum duygu aktarımı sağlar.',
    artist_name: 'Ahmet Kara',
    artist_bio: 'Ankara doğumlu Ahmet Kara, Hacettepe Üniversitesi Resim bölümünden mezun olduktan sonra Londra Royal Academy\'de yüksek lisansını tamamlamıştır. Soyut ekspresyonizm üzerine çalışmalar yapmaktadır.',
    category: 'Soyut',
    technique: 'Karışık teknik, tuval üzerine akrilik',
    dimensions: '100 × 120 cm',
    year: 2024,
    price: 22000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/VanGogh-starry_night_ballance1.jpg/1280px-VanGogh-starry_night_ballance1.jpg',
    stock: 1
  },
  {
    title: 'Anadolu Motifi',
    description: 'Geleneksel Anadolu kilim motiflerinden ilham alınarak oluşturulan bu eser, modern sanatla geleneksel zanaat arasında köprü kurar. Sıcak toprak tonları ve geometrik desenler, Anadolu kültürünün zenginliğini yansıtır.',
    artist_name: 'Zeynep Demir',
    artist_bio: 'Konya doğumlu Zeynep Demir, geleneksel Türk sanatlarını modern yaklaşımlarla buluşturan çalışmalarıyla tanınır. UNESCO kültürel miras projelerinde danışman olarak görev almaktadır.',
    category: 'Dijital Sanat',
    technique: 'Dijital baskı, sınırlı üretim',
    dimensions: '80 × 60 cm',
    year: 2024,
    price: 8500,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    stock: 3
  },
  {
    title: 'Boğaz\'da Gün Batımı',
    description: 'İstanbul Boğazı\'nın eşsiz gün batımı manzarasını tuval üzerine aktaran bu eser, sanatçının doğa gözlemciliğinin en güzel örneklerinden biridir. Kırmızı ve turuncu tonlar, suyun yansımasıyla birleşerek büyüleyici bir atmosfer yaratır.',
    artist_name: 'Mehmet Aslan',
    artist_bio: 'İstanbullu ressam Mehmet Aslan, deniz manzaraları ve şehir peyzajlarıyla ünlüdür. Eserleri Dolmabahçe Sanat Galerisi\'nde sürekli sergilenmektedir.',
    category: 'Yağlı Boya',
    technique: 'Tuval üzerine yağlıboya',
    dimensions: '90 × 150 cm',
    year: 2023,
    price: 35000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    stock: 1
  },
  {
    title: 'Sessiz Orman',
    description: 'Doğanın sessizliğini ve huzurunu yansıtan bu peyzaj çalışması, izleyiciyi ormanın derinliklerine davet eder. Yeşilin onlarca tonu ve ışık-gölge oyunları, fotogerçekçi bir atmosfer oluşturur.',
    artist_name: 'Ayşe Korkmaz',
    artist_bio: 'Bursa doğumlu Ayşe Korkmaz, doğa ressamı olarak 15 yılı aşkın süredir çalışmalarını sürdürmektedir. Eserleri doğa koruma dernekleri tarafından sıklıkla kullanılmaktadır.',
    category: 'Suluboya',
    technique: 'Kağıt üzerine suluboya',
    dimensions: '50 × 70 cm',
    year: 2024,
    price: 6500,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg',
    stock: 5
  },
  {
    title: 'Metropol Ritmi',
    description: 'Modern şehir yaşamının kaotik enerjisini yakalayan bu çağdaş eser, geometrik formlar ve canlı renklerle büyükşehrin nabzını yansıtır. Neon ışıkları ve beton gri tonları arasındaki kontrast, urban estetiği vurgular.',
    artist_name: 'Can Öztürk',
    artist_bio: 'İzmir doğumlu genç sanatçı Can Öztürk, sokak sanatı ve çağdaş sanat arasında köprü kuran çalışmalarıyla bilinir. Berlin ve New York\'ta birçok sokak sanatı projesine katılmıştır.',
    category: 'Akrilik',
    technique: 'Tuval üzerine akrilik ve sprey boya',
    dimensions: '120 × 120 cm',
    year: 2024,
    price: 18000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/1024px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
    stock: 1
  },
  {
    title: 'Kırmızı Hayal',
    description: 'Sürrealist yaklaşımla oluşturulan bu eser, bilinçaltının rüya gibi dünyasını kırmızı tonların hâkimiyetinde sunar. Gerçeküstü figürler ve akışkan formlar, izleyiciyi farklı bir boyuta taşır.',
    artist_name: 'Elif Yılmaz',
    artist_bio: 'İstanbul doğumlu Elif Yılmaz, Mimar Sinan Üniversitesi Güzel Sanatlar mezunudur. Doğadan ilham alan soyut peyzaj çalışmalarıyla tanınır.',
    category: 'Yağlı Boya',
    technique: 'Tuval üzerine yağlıboya',
    dimensions: '80 × 100 cm',
    year: 2023,
    price: 12000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/800px-The_Scream.jpg',
    stock: 2
  },
  {
    title: 'Zaman\'ın İzleri',
    description: 'Antik uygarlıklardan modern çağa uzanan bir zaman yolculuğunu sembolize eden bu heykel, bronz ve mermer karışımından oluşturulmuştur. Zaman kavramını somutlaştıran bu eser, mekânda güçlü bir varlık sergiler.',
    artist_name: 'Baran Yıldız',
    artist_bio: 'Eskişehir doğumlu heykeltıraş Baran Yıldız, metalürji ve güzel sanatları birleştiren çalışmalarıyla bilinir. Eserleri birçok kamusal alanda sergilenmektedir.',
    category: 'Heykel',
    technique: 'Bronz ve mermer döküm',
    dimensions: '45 × 30 × 60 cm',
    year: 2022,
    price: 45000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Moai_Rano_rarridge.jpg/800px-Moai_Rano_rarridge.jpg',
    stock: 1
  },
  {
    title: 'Deniz Kabuğu Senfoni',
    description: 'Ege kıyılarından toplanan deniz kabuklarından ilham alınarak oluşturulan bu seramik eser, doğanın mükemmel geometrisini sanatla buluşturur. Pastel renkler ve organik formlar huzur verici bir etki yaratır.',
    artist_name: 'Selin Aydın',
    artist_bio: 'Muğla doğumlu Selin Aydın, seramik sanatçısı olarak Ege Bölgesi\'nin doğal dokularından ilham almaktadır. İtalya\'daki Faenza Seramik Müzesi\'nde eserleri sergilenmiştir.',
    category: 'Seramik',
    technique: 'El yapımı seramik, sır tekniği',
    dimensions: '35 × 35 × 25 cm',
    year: 2024,
    price: 9800,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Felis_silvestris_catus_lying_on_rice_straw.jpg/1280px-Felis_silvestris_catus_lying_on_rice_straw.jpg',
    stock: 2
  },
  {
    title: 'Işığın Dansı',
    description: 'Cam üzerine ışık oyunlarıyla oluşturulan bu enstalasyon çalışması, mekânı renklerin dansıyla dönüştürür. Güneş ışığı ile etkileşime giren renkli cam paneller, duvarları canlı bir palete çevirir.',
    artist_name: 'Deniz Şahin',
    artist_bio: 'Antalya doğumlu Deniz Şahin, cam sanatı üzerine uzmanlaşmış bir enstalasyon sanatçısıdır. Venedik Cam Müzesi\'nde staj yapmış ve uluslararası sergilerde ödüller almıştır.',
    category: 'Cam Sanatı',
    technique: 'Füzyon cam, ışık enstalasyonu',
    dimensions: '60 × 90 cm (panel)',
    year: 2024,
    price: 28000,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/1280px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
    stock: 1
  }
];

// ─── Seed: Veritabanına 10 eser ekle ──────────
const seedArtworks = async (req, res) => {
  try {
    const count = await Artwork.count();
    if (count >= 10) {
      return res.json({ success: true, message: 'Eserler zaten mevcut.', data: await Artwork.findAll() });
    }

    const artworks = await Artwork.bulkCreate(SEED_ARTWORKS);
    res.status(201).json({ success: true, message: `${artworks.length} eser başarıyla oluşturuldu.`, data: artworks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tüm eserleri listele (filtreleme destekli) ──
const getAllArtworks = async (req, res) => {
  try {
    const { category, artist, min_price, max_price, search, sort } = req.query;
    const where = {};

    const isSqlite = Artwork.sequelize.options.dialect === 'sqlite';
    const likeOp = isSqlite ? Op.like : Op.iLike;

    if (category) where.category = category;
    if (artist) where.artist_name = { [likeOp]: `%${artist}%` };
    if (min_price) where.price = { ...where.price, [Op.gte]: parseFloat(min_price) };
    if (max_price) where.price = { ...where.price, [Op.lte]: parseFloat(max_price) };
    if (search) {
      where[Op.or] = [
        { title: { [likeOp]: `%${search}%` } },
        { artist_name: { [likeOp]: `%${search}%` } },
        { description: { [likeOp]: `%${search}%` } }
      ];
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'newest') order = [['created_at', 'DESC']];
    if (sort === 'oldest') order = [['year', 'ASC']];

    const artworks = await Artwork.findAll({ where, order });
    res.json({ success: true, data: artworks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tek eser detayı ────────────────────────────
const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Eser bulunamadı.' });

    await artwork.increment('views', { by: 1 });
    await artwork.reload();

    res.json({ success: true, data: artwork });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Kategorileri getir ─────────────────────────
const getCategories = async (req, res) => {
  try {
    const artworks = await Artwork.findAll({ attributes: ['category'], group: ['category'] });
    const categories = artworks.map(a => a.category);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Eser Ekle (Sanatçı veya Admin) ──────────────
const createArtwork = async (req, res) => {
  try {
    const { title, description, artist_name, artist_bio, category, technique, dimensions, year, price, image_url, stock } = req.body;
    const { User: UserModel } = require('../models');
    const user = await UserModel.findByPk(req.user.id);

    const finalArtistName = artist_name || user?.name || 'Sanatçı';
    const finalArtistBio = artist_bio || user?.bio || 'Bağımsız Sanatçı';

    const artwork = await Artwork.create({
      title,
      description,
      artist_name: finalArtistName,
      artist_bio: finalArtistBio,
      category: category || 'Diğer',
      technique,
      dimensions,
      year: parseInt(year) || new Date().getFullYear(),
      price: parseFloat(price) || 0,
      image_url: image_url || 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500',
      is_available: true,
      stock: parseInt(stock) || 1,
      views: 0
    });

    res.status(201).json({ success: true, data: artwork, message: 'Eser başarıyla eklendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUniqueArtists = async (req, res) => {
  try {
    const artworks = await Artwork.findAll({
      attributes: ['artist_name', 'artist_bio', 'image_url']
    });
    
    const uniqueMap = {};
    artworks.forEach(art => {
      if (art.artist_name && !uniqueMap[art.artist_name]) {
        uniqueMap[art.artist_name] = {
          artist_name: art.artist_name,
          artist_bio: art.artist_bio || 'Bağımsız Sanatçı',
          image_url: art.image_url
        };
      }
    });
    
    res.json({ success: true, data: Object.values(uniqueMap) });
  } catch (error) {
    console.error('getUniqueArtists error:', error);
    res.status(500).json({ success: false, message: 'Sanatçılar listelenirken hata oluştu.' });
  }
};

module.exports = {
  seedArtworks,
  getAllArtworks,
  getArtworkById,
  getCategories,
  createArtwork,
  getUniqueArtists
};
