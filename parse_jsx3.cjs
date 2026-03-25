const fs = require('fs');
eval(fs.readFileSync('babel.min.js', 'utf8'));
const Babel = global.Babel;

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log("No babel script found!"); process.exit(0); }

try {
  Babel.transform(scriptMatch[1], { presets: ['react'] });
  console.log("NO_SYNTAX_ERRORS");
} catch (err) {
  console.log("SYNTAX_ERROR::\n" + err.message);
  
  // Also print a few lines around the error
  const lines = scriptMatch[1].split('\n');
  const locMatch = err.message.match(/\((\d+):(\d+)\)/);
  if (locMatch) {
    const line = parseInt(locMatch[1], 10);
    console.log("\nContext:");
    for (let i = Math.max(0, line - 5); i < Math.min(lines.length, line + 5); i++) {
        console.log(`${i+1}: ${lines[i]}`);
    }
  }
}
