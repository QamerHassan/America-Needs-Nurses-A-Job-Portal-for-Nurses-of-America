const fs = require('fs');
const path = require('path');

const uniqueIds = [
  '1519494026892-80bbd2d6fd0d',
  '1587351021759-3e566b6af7cc',
  '1632833239869-a37e3a5806d2',
  '1579684385127-1ef15d508118',
  '1551076805-e1869033e561',
  '1516549655169-df83a0774514',
  '1626315869436-d6781ba69d6e',
  '1576671081837-49000212a370',
  '1567427017947-545c5f8d16ad',
  '1504439468489-c8920d796a29',
  '1612349317150-e413f6a5b16d',
  '1576091160399-112ba8d25d1d'
];

function replaceImagesInFile(filePath) {
  const fullPath = path.join(__dirname, '../../', filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let idIndex = 0;
  
  content = content.replace(/image:\s*["']https:\/\/images\.unsplash\.com\/photo-[^?]+\?q=80&w=\d+(?:&auto=format&fit=crop)?["']/g, () => {
    const id = uniqueIds[idIndex % uniqueIds.length];
    idIndex++;
    return `image: "https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop"`;
  });
  
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', filePath, 'Replaced', idIndex, 'images');
}

replaceImagesInFile('backend/prisma/seed-nurse-jobs.js');
replaceImagesInFile('frontend/app/jobs/page.tsx');
replaceImagesInFile('frontend/app/jobs/[id]/page.tsx');
