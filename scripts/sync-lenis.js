const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '../node_modules/lenis');
const destination = path.resolve(__dirname, '../assets/vendor/lenis');
fs.mkdirSync(destination, { recursive: true });
for (const [input, output] of [
  ['dist/lenis.min.js', 'lenis.min.js'],
  ['dist/lenis.css', 'lenis.css'],
  ['LICENSE', 'LICENSE']
]) fs.copyFileSync(path.join(source, input), path.join(destination, output));
