const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const blog = await prisma.blog.create({
    data: {
      title: "10 Essential Tips for Travel Nurses in 2026 (That Save You Money)",
      slug: "10-essential-tips-for-travel-nurses-2026",
      excerpt: "This guide explains how smart travel nursing decisions help professionals avoid unnecessary costs and burnout in the modern healthcare landscape.",
      content: `
        <p>Being a travel nurse is one of the most rewarding yet challenging career paths in healthcare today. As we move into 2026, the landscape is shifting with new technologies and changing hospital demands. This guide is designed to help you navigate these changes while maximizing your earnings and minimizing stress.</p>
        
        <h2>1. Master Your Housing Strategy</h2>
        <p>One of the biggest expenses for travel nurses is housing. Instead of just taking the company stipend, look into platforms like Furnished Finder or even high-end short-term rentals that offer nurse discounts. Pro tip: Always check the 'Plumbing and HVAC' reviews of your rental to avoid unexpected move-in disasters.</p>
        
        <div style="background: #f8fafc; padding: 2.5rem; border-radius: 2rem; border-left: 8px solid #C8102E; margin: 3rem 0;">
          <p style="font-size: 1.5rem; font-style: italic; font-weight: 700; color: #002868; margin: 0;">
            "The secret to a successful contract isn't just the hourly rate, it's the quality of life you build around it."
          </p>
        </div>

        <h2>2. Financial Transparency</h2>
        <p>Always ask for a detailed breakdown of your pay package. Understand what is taxable and what is a tax-free stipend. This transparency leads to long-term savings and better control over your property's maintenance and expenses if you are a homeowner back at your tax home.</p>

        <p>Choosing the right agency leads to fewer headaches, better benefits, and more control over your assignments. Always compare at least three different offers before signing a contract.</p>
      `,
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173bc39978c?q=80&w=2070",
      additionalImages: [
        "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=2070",
        "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070"
      ],
      status: "PUBLISHED",
      category: "Career Advice",
      author: "ANN Editorial Team",
      publishedAt: new Date()
    }
  });

  console.log("Sample blog created:", blog.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
