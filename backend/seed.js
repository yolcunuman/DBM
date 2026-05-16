import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const catOil = await prisma.category.create({ data: { name: 'Yağlı Boya' } });
  const catDigital = await prisma.category.create({ data: { name: 'Dijital Sanat' } });
  const catSculpture = await prisma.category.create({ data: { name: 'Heykel' } });
  const catAbstract = await prisma.category.create({ data: { name: 'Soyut' } });

  // Create Artists
  const artist1 = await prisma.artist.create({
    data: {
      name: 'Leonardo da Vinci',
      bio: 'Rönesans döneminin en önemli sanatçılarından biri.',
      imageUrl: 'https://images.unsplash.com/photo-1558500201-9871789c6292?w=400&q=80',
    },
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: 'Salvador Dalí',
      bio: 'Sürrealizmin en tanınan temsilcisi.',
      imageUrl: 'https://images.unsplash.com/photo-1558500130-1c9f4c3a6493?w=400&q=80',
    },
  });
  
  const artist3 = await prisma.artist.create({
    data: {
      name: 'Zehra Çelik',
      bio: 'Modern dijital sanat ve illüstrasyon uzmanı.',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    },
  });

  // Create Artworks
  await prisma.artwork.createMany({
    data: [
      {
        title: 'Gece Rüyası',
        description: 'Karanlığın içindeki gizli umudu temsil eden modern soyut çalışma.',
        price: 1500.0,
        imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
        categoryId: catAbstract.id,
        artistId: artist3.id,
      },
      {
        title: 'Zamanın Eriyişi',
        description: 'Sürrealist bir yaklaşımla zaman algısını sorgulayan kült bir eser.',
        price: 4500.0,
        imageUrl: 'https://images.unsplash.com/photo-1576769267415-9642010aa962?w=800&q=80',
        categoryId: catOil.id,
        artistId: artist2.id,
      },
      {
        title: 'Dijital Şehir',
        description: 'Geleceğin neon ışıklı şehir konseptini anlatan dijital çizim.',
        price: 850.0,
        imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
        categoryId: catDigital.id,
        artistId: artist3.id,
      },
      {
        title: 'Klasik Portre',
        description: 'Klasik dönemin tüm detaylarını barındıran enfes bir portre.',
        price: 12000.0,
        imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80',
        categoryId: catOil.id,
        artistId: artist1.id,
      },
      {
        title: 'Minimalist Düşünce',
        description: 'Az olanın çok olduğunu savunan minimalist soyut heykel tasarımı.',
        price: 3200.0,
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
        categoryId: catSculpture.id,
        artistId: artist2.id,
      },
      {
        title: 'Siberpunk Vizyon',
        description: 'Distopik bir geleceği resmeden detaylı dijital manipülasyon.',
        price: 1100.0,
        imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80',
        categoryId: catDigital.id,
        artistId: artist3.id,
      }
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
