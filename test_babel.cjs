const fs = require('fs');
const babel = require('@babel/core');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (scriptMatch) {
  const code = scriptMatch[1];
  try {
    babel.transformSync(code, {
      presets: ['@babel/preset-react']
    });
    console.log("No syntax errors found by Babel!");
  } catch (err) {
    console.error("Syntax Error:");
    console.error(err.message);
  }
} else {
  console.log("No babel script found in index.html");
}
