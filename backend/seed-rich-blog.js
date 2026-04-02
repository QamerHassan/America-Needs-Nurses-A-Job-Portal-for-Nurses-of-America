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
    { id: 1, type: 'text', value: "Choosing a nursing career path can be one of the most rewarding—and one of the most complex—decisions you will make. With thousands of specialties, shift types, and employer options across the country, knowing where to begin is half the battle. This guide breaks down the key considerations so you can move forward with confidence." },
    { id: 2, type: 'text', value: "Many nurses begin their careers in general med-surg roles before discovering their true specialty. Whether it's pediatrics, oncology, travel nursing, or intensive care, every path has its own demands and rewards. The important thing is to stay curious, continue learning, and never stop advocating for your own professional development." },
    { id: 3, type: 'image', value: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=2070" },
    { id: 4, type: 'heading', value: "Understanding the Job Market in 2026" },
    { id: 5, type: 'text', value: "The demand for registered nurses continues to grow year over year. According to industry reports, the U.S. healthcare system will need over 200,000 new nurses annually for the next decade. Understanding this landscape helps you negotiate better pay, choose high-demand specialties, and plan your moves strategically." },
    { id: 6, type: 'text', value: "Travel nursing remains one of the most lucrative options for experienced RNs. With tax-free stipends, paid housing, and 13-week contracts, it offers flexibility that traditional staff roles cannot match. However, it requires strong adaptability and the ability to hit the ground running in unfamiliar environments." },
    { id: 7, type: 'image', value: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=2070" },
    { id: 8, type: 'heading', value: "Financial Planning for Nurses" },
    { id: 9, type: 'text', value: "Smart financial decisions can have a massive impact on your long-term stability. Nurses often overlook benefits like tuition reimbursement, pension plans, and loan forgiveness programs. Public Service Loan Forgiveness (PSLF) alone can eliminate tens of thousands of dollars in student debt if you work for a qualifying nonprofit or government hospital." },
    { id: 10, type: 'text', value: "Building an emergency fund is especially important for nurses who work per diem or travel contracts where income can fluctuate. Financial advisors recommend saving at least three to six months of expenses before making a major career transition." },
    { id: 11, type: 'image', value: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070" },
    { id: 12, type: 'heading', value: "Choosing the Right Employer" },
    { id: 13, type: 'text', value: "Not all hospitals are created equal. Magnet-designated hospitals, for example, are recognized for nursing excellence and tend to offer better staffing ratios, professional development opportunities, and nurse autonomy. Researching employer reputation before accepting an offer is just as important as negotiating salary." },
    { id: 14, type: 'text', value: "Checking platforms like America Needs Nurses gives you direct access to verified employer listings, open positions, and company reviews—all in one place. It's one of the fastest-growing resources for healthcare job seekers in the U.S., and it's completely free to use for nurses." },
    { id: 15, type: 'quote', value: "The right employer doesn't just offer a paycheck—they invest in your career, protect your license, and treat you like a professional." }
  ];

  const blog = await prisma.blog.upsert({
    where: { slug: "nursing-career-guide-2026" },
    update: {
      content: JSON.stringify(blocks),
      status: "PUBLISHED"
    },
    create: {
      title: "The Complete Nursing Career Guide for 2026: What Every RN Needs to Know",
      slug: "nursing-career-guide-2026",
      excerpt: "From choosing the right specialty to negotiating your salary and planning your finances, this guide covers everything modern nurses need to build a rewarding career in 2026.",
      content: JSON.stringify(blocks),
      imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=2070",
      additionalImages: [],
      status: "PUBLISHED",
      category: "Career Guidance",
      author: "ANN Editorial Team",
      publishedAt: new Date()
    }
  });

  console.log("Rich blog created:", blog.title);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
