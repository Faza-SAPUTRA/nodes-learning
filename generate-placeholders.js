// Generate placeholder screenshot PNGs for Remotion
// Run from the Mockup directory: node generate-placeholders.js
const fs = require('fs');
const path = require('path');

const dstDir = path.join(__dirname, 'nodes-ads', 'public', 'screenshots');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

// Try to copy from brain dir first
const brainDir = 'C:\\Users\\erlan\\.gemini\\antigravity-ide\\brain\\67debfea-1da3-418c-8154-20a6908efe39';
const pageNames = ['dashboard', 'modules', 'canvas', 'collab', 'profile'];

let copied = 0;
const allFiles = fs.readdirSync(brainDir);

for (const page of pageNames) {
  const matches = allFiles
    .filter(f => f.toLowerCase().includes(page) && f.endsWith('.png'))
    .sort()
    .reverse();
  
  if (matches.length > 0) {
    const srcPath = path.join(brainDir, matches[0]);
    const dstPath = path.join(dstDir, page + '.png');
    try {
      fs.copyFileSync(srcPath, dstPath);
      console.log('✓ ' + page + '.png (from ' + matches[0] + ')');
      copied++;
    } catch (e) {
      console.log('✗ ' + page + ': copy failed - ' + e.message);
    }
  } else {
    console.log('✗ ' + page + ': no screenshot found');
  }
}

console.log('\nCopied ' + copied + '/' + pageNames.length + ' screenshots');
