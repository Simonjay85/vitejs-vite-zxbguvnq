const https = require('https');
https.get('https://unpkg.com/@babel/standalone/babel.min.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    eval(data);
    const fs = require('fs');
    const html = fs.readFileSync('index.html', 'utf8');
    const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      console.log("No babel script found!");
      return;
    }
    const code = scriptMatch[1];
    try {
      Babel.transform(code, { presets: ['react'] });
      console.log("NO_SYNTAX_ERRORS");
    } catch (err) {
      console.log("SYNTAX_ERROR::" + err.message);
    }
  });
});
