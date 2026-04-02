const https = require('https');
const fs = require('fs');
const path = require('path');

const queries = ['hospital-building', 'medical-clinic', 'hospital-exterior'];
let allIds = new Set();
let completed = 0;

queries.forEach(query => {
  https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Unsplash SSR HTML includes image URLs like:
      // "https://images.unsplash.com/photo-XXXX?..."
      // and "https://plus.unsplash.com/premium_photo-YYYY?..."
      const regex = /\"https:\/\/(images|plus)\.unsplash\.com\/(premium_)?photo-([^?"]+)\?/g;
      let match;
      while ((match = regex.exec(data)) !== null) {
        allIds.add((match[2] || '') + 'photo-' + match[3]);
      }
      completed++;
      if (completed === queries.length) finish();
    });
  }).on('error', console.error);
});

function finish() {
  const ids = Array.from(allIds).slice(0, 40);
  console.log('Found', ids.length, 'IDs');
  
  if (ids.length > 0) {
    // Write out a new fix-images.js with these guaranteed fresh IDs
    let fixScript = fs.readFileSync(path.join(__dirname, 'fix-images.js'), 'utf8');
    const newArrayStr = '[\n  ' + ids.map(id => `'${id}'`).join(',\n  ') + '\n]';
    fixScript = fixScript.replace(/const uniqueIds = \[[\s\S]*?\];/, `const uniqueIds = ${newArrayStr};`);
    
    // Unsplash sometimes uses plus.unsplash.com for premium, so we should make sure the regex in fix-images also handles both domains.
    // Actually, to make it bulletproof, let's just make the replacement function use the full URL directly.
    fixScript = fixScript.replace(
      /return \`image: "https:\/\/images\.unsplash\.com\/photo-\$\{id\}\?q=80&w=800&auto=format&fit=crop"\`;/,
      'const domain = id.startsWith("premium_") ? "plus.unsplash.com" : "images.unsplash.com";\n    return `image: "https://${domain}/${id}?q=80&w=800&auto=format&fit=crop"`;'
    );
    
    fs.writeFileSync(path.join(__dirname, 'fix-images2.js'), fixScript);
    console.log('Created fix-images2.js with', ids.length, 'fresh IDs. Ready to run.');
  }
}
