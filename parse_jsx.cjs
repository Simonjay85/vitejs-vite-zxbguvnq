const fs = require('fs');
const babelCode = fs.readFileSync('babel.min.js', 'utf8');
eval(babelCode);
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log("No babel script found!"); process.exit(0); }
const code = scriptMatch[1];
try {
  Babel.transform(code, { presets: ['react'] });
  console.log("NO_SYNTAX_ERRORS");
} catch (err) {
  console.log("SYNTAX_ERROR::\n" + err.message);
}
