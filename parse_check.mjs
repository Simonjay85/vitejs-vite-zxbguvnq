import {parse} from 'https://esm.sh/@babel/parser@7.26.9?bundle-deps';
import {readFileSync} from 'fs';
const code = readFileSync('/Users/aaronnguyen/Pickleballapp/vitejs-vite-zxbguvnq/babel_extract.txt','utf-8');
try { parse(code, {sourceType:'script', plugins:['jsx']}); console.log('OK'); } catch(e) { console.log('ERR:', e.loc?.line, e.loc?.column, e.message.split('\n')[0]); }
