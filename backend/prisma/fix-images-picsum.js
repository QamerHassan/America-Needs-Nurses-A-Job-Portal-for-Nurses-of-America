const fs = require('fs');
const path = require('path');

function replaceImagesInFile(filePath) {
  const fullPath = path.join(__dirname, '../../', filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let idIndex = 1;
  
  // Replace Unsplash images globally with Picsum seeded images to ensure 40 unique and reliable pictures.
  content = content.replace(/image:\s*["']https:\/\/images\.unsplash\.com\/photo-[^?]+\?q=80&w=\d+(?:&auto=format&fit=crop)?["']/g, () => {
    const replacement = `image: "https://picsum.photos/seed/hospital-${idIndex}/800/600"`;
    idIndex++;
    return replacement;
  });
  
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', filePath, 'Replaced', idIndex - 1, 'images');
}

replaceImagesInFile('backend/prisma/seed-nurse-jobs.js');
replaceImagesInFile('frontend/app/jobs/page.tsx');
replaceImagesInFile('frontend/app/jobs/[id]/page.tsx');
