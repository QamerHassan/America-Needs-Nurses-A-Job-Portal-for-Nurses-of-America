const fs = require('fs');
const path = require('path');

const uniqueIds = [
  '1519494026892-80bbd2d6fd0d', '1587351021759-3e566b6af7cc', '1632833239869-a37e3a5806d2',
  '1579684385127-1ef15d508118', '1551076805-e1869033e561', '1516549655169-df83a0774514',
  '1626315869436-d6781ba69d6e', '1576671081837-49000212a370', '1567427017947-545c5f8d16ad',
  '1504439468489-c8920d796a29', '1581056771107-11a4e6c98124', '1605809798579-2af4f1837fb4',
  '1551601651-2a8555bf40ce', '1573491410145-c419cbae3f18', '1519494336068-1bc32e9871fc',
  '1612822453880-e8321da3b30f', '1579684453423-f22753ac0737', '1582716409641-f67018318288',
  '1584432810605-eb652e850b57', '1581093116819-dfc80529d47d', '1580281658428-fb4577881cba',
  '1582298956926-ab8c0cb68b8b', '1583323930438-eeb6ca2d4b55', '1519494444983-cf2d4c064e62',
  '1584813580436-e0e6c5ee7cfb', '1516549247192-35db20d189de', '1579684385150-b490714edbb6',
  '1632832800161-006ee7919865', '1584515933610-d0092c6edab6', '1584422998638-7bb7cb1c29e6',
  '1582736466336-b1fdadddfaee', '1584411603584-699ab9c57d76', '1582716401064-ab2d67da9175',
  '1584422477382-7aa9cc387eb4', '1580282136934-2e21b777a87e', '1512678080530-77a0be011296',
  '1612349317150-e413f6a5b16d', '1538108197022-de9db3163353', '1576091160399-112ba8d25d1d',
  '1586773860418-d3198b7bb55e'
];

function replaceImagesInFile(filePath) {
  const fullPath = path.join(__dirname, '../../', filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let idIndex = 0;
  
  // Note: we only replace images inside the HOSPITAL_ASSETS or the seed array
  // We'll match the precise pattern of the existing Unsplash URLs
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
