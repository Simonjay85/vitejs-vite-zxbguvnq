const fs = require('fs');
const babel = require('@babel/core');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    babel.transformSync(scriptMatch[1], { presets: ['@babel/preset-react'] });
    console.log("NO_SYNTAX_ERRORS");
  } catch (err) {
    console.log("SYNTAX_ERROR:: " + err.message);
  }
}
