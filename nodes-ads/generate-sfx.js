const { execSync } = require('child_process');
const path = require('path');

const ffmpeg = path.join(__dirname, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
const outDir = path.join(__dirname, 'public');

// Click — 0.5s sine, louder
try {
  execSync(`"${ffmpeg}" -y -f lavfi -i "sine=frequency=800:duration=0.5" -af "volume=0.8" -ar 48000 -ac 2 -b:a 192k "${path.join(outDir, 'click.mp3')}"`, { stdio: 'inherit' });
  console.log('OK click.mp3');
} catch(e) { console.log('FAIL click'); }

// Whoosh — 1s sine sweep, louder
try {
  execSync(`"${ffmpeg}" -y -f lavfi -i "sine=frequency=300:duration=1.0" -af "volume=0.7,atempo=1.2" -ar 48000 -ac 2 -b:a 192k "${path.join(outDir, 'whoosh.mp3')}"`, { stdio: 'inherit' });
  console.log('OK whoosh.mp3');
} catch(e) { console.log('FAIL whoosh'); }

// Pop — 0.5s higher sine, louder
try {
  execSync(`"${ffmpeg}" -y -f lavfi -i "sine=frequency=1100:duration=0.5" -af "volume=0.8" -ar 48000 -ac 2 -b:a 192k "${path.join(outDir, 'pop.mp3')}"`, { stdio: 'inherit' });
  console.log('OK pop.mp3');
} catch(e) { console.log('FAIL pop'); }

console.log('\nDone! Longer + louder SFX');
