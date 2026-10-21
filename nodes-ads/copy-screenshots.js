// Copy screenshots script — run with: node copy-screenshots.js
const fs = require('fs');
const path = require('path');

const brainDir = path.join(
  process.env.LOCALAPPDATA || process.env.HOME,
  '..',
  'erlan',
  '.gemini',
  'antigravity-ide',
  'brain',
  '67debfea-1da3-418c-8154-20a6908efe39'
);

const dstDir = path.join(__dirname, 'public', 'screenshots');

// Find the latest screenshot for each page
const pageNames = ['dashboard', 'modules', 'canvas', 'collab', 'profile'];

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

const allFiles = fs.readdirSync(brainDir);

for (const page of pageNames) {
  // Find files matching pattern: pagename_*.png
  const matches = allFiles
    .filter(f => f.startsWith(page + '_') && f.endsWith('.png'))
    .sort()
    .reverse();
  
  if (matches.length > 0) {
    const srcPath = path.join(brainDir, matches[0]);
    const dstPath = path.join(dstDir, page + '.png');
    fs.copyFileSync(srcPath, dstPath);
    console.log(`✓ ${page}.png (from ${matches[0]})`);
  } else {
    console.log(`✗ ${page}: no screenshot found`);
  }
}

console.log('\nDone! Screenshots copied to public/screenshots/');
