const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' }); // Adjust path to root .env

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Inserting "Social Trends" blog...');

  const content = [
    { type: 'text', value: 'In 2025, the nursing profession is undergoing a massive transformation driven by social trends and digital connectivity. From the rise of nurse influencers to the integration of community-driven health initiatives, the way we perceive healthcare is changing.' },
    { type: 'image', value: '/blog/social_trends_hero.png' },
    { type: 'heading', value: 'The Rise of the Digital Nurse' },
    { type: 'text', value: 'Nurses are no longer just clinical providers; they are community leaders and digital advocates. Social media platforms have become vital tools for sharing knowledge and building support networks.' },
    { type: 'image', value: '/blog/community_health.png' },
    { type: 'heading', value: 'Community-First Healthcare' },
    { type: 'text', value: 'The trend towards decentralized healthcare means nurses are more involved in local community health hubs than ever before.' }
  ];

  const blog = await prisma.blog.upsert({
    where: { slug: 'social-trends-healthcare-2025' },
    update: {
      status: 'PUBLISHED',
      imageUrl: '/blog/social_trends_hero.png',
      content: JSON.stringify(content),
      excerpt: 'Explore how social media, digital health, and community outreach are reshaping the nursing profession in 2025.',
      category: 'Nursing Trends',
      publishedAt: new Date(),
    },
    create: {
      title: 'Social Trends in Healthcare 2025',
      slug: 'social-trends-healthcare-2025',
      content: JSON.stringify(content),
      excerpt: 'Explore how social media, digital health, and community outreach are reshaping the nursing profession in 2025.',
      imageUrl: '/blog/social_trends_hero.png',
      status: 'PUBLISHED',
      category: 'Nursing Trends',
      author: 'ANN Editorial Team',
      tags: ['Social Trends', 'Healthcare', 'Nursing'],
      publishedAt: new Date(),
    },
  });

  console.log('Blog created/updated:', blog.title);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
