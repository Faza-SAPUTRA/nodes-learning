const fs = require('fs');
const buf = fs.readFileSync('_raw/RPS_UI_UX__Design.doc');
const text = buf.toString('latin1');
const matches = text.match(/[\x20-\x7e]{12,}/g) || [];
matches.slice(0, 250).forEach(m => console.log(m));
