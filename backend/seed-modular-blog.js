const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const blocks = [
    { id: 1, type: 'text', value: "America Needs Nurses is proud to announce our latest career guidance series for the year 2026. As the healthcare industry continues to evolve, nurses are finding new ways to balance patient care with their own career aspirations." },
    { id: 2, type: 'heading', value: "The Future of Healthcare Recruitment" },
    { id: 3, type: 'text', value: "We believe that every nurse deserves a platform that truly understands their unique journey. Our new blog system is designed to provide you with visual insights and expert advice, interspersed with high-quality media to keep you engaged." },
    { id: 4, type: 'image', value: "https://images.unsplash.com/photo-1576091160550-2173bc39978c?q=80&w=2070" },
    { id: 5, type: 'heading', value: "Smart Financial Decisions" },
    { id: 6, type: 'text', value: "Managing your finances as a travel nurse or a full-time staff member requires precision and plan. From tax-free stipends to high-yield savings accounts specifically for healthcare workers, we cover it all." },
    { id: 7, type: 'image', value: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070" },
    { id: 8, type: 'quote', value: "Your career is a marathon, not a sprint. Take the time to invest in your own growth and well-being." },
    { id: 9, type: 'text', value: "Keep an eye on this space for more updates, interviews with top nursing leaders, and deep dives into the best hospitals to work for across America." },
    { id: 10, type: 'image', value: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070" }
  ];

  const blog = await prisma.blog.upsert({
    where: { slug: "modular-blog-test-2026" },
    update: {
      content: JSON.stringify(blocks),
      status: "PUBLISHED"
    },
    create: {
      title: "How to Master Your Nursing Career Path in 2026 (Modular Edition)",
      slug: "modular-blog-test-2026",
      excerpt: "Explore our new flexible blog layout featuring interspersed images, quotes, and expert advice for the modern nurse.",
      content: JSON.stringify(blocks),
      imageUrl: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=2070",
      additionalImages: [],
      status: "PUBLISHED",
      category: "Career Guidance",
      author: "ANN Editorial",
      publishedAt: new Date()
    }
  });

  console.log("Modular blog created:", blog.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
