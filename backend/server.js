import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all artists
app.get('/api/artists', async (req, res) => {
  try {
    const artists = await prisma.artist.findMany();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Get all artworks with optional filtering
app.get('/api/artworks', async (req, res) => {
  try {
    const { categoryId, artistId, minPrice, maxPrice } = req.query;
    
    // Build the filter object dynamically
    const filter = {};
    
    if (categoryId) filter.categoryId = parseInt(categoryId);
    if (artistId) filter.artistId = parseInt(artistId);
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.gte = parseFloat(minPrice);
      if (maxPrice) filter.price.lte = parseFloat(maxPrice);
    }

    const artworks = await prisma.artwork.findMany({
      where: filter,
      include: {
        category: true,
        artist: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get single artwork by ID
app.get('/api/artworks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const artwork = await prisma.artwork.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        artist: true,
      },
    });
    
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artwork' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
