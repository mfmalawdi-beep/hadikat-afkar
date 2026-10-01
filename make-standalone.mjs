import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
const assets='public/assets';
const dataURI=(p,m)=>`data:${m};base64,${fs.readFileSync(p).toString('base64')}`;
const images={};for(const f of fs.readdirSync(assets)){if(f.endsWith('.jpg'))images[f]=dataURI(path.join(assets,f),'image/jpeg')}
let src=fs.readFileSync('src.js','utf8').replace("import './style.css';",'');
src='const embeddedImages='+JSON.stringify(images)+';\n'+src;
src=src.replace("fetch('/content.json').then(r=>r.json())",'Promise.resolve('+fs.readFileSync('public/content.json','utf8')+')');
src=src.replace("fetch('/english.json').then(r=>r.json())",'Promise.resolve('+fs.readFileSync('public/english.json','utf8')+')');
src=src.replace("const cover=p=>esc(p.image||'/assets/garden.jpg');","const cover=p=>esc(embeddedImages[(p.image||'').split('/').pop()]||embeddedImages['garden.jpg']);");
src=src.replaceAll('/assets/garden.jpg',images['garden.jpg']);
src=src.replace("async function submitNewsletter(e){","async function submitNewsletter(e){ e.preventDefault(); toast(t('هذه معاينة مستقلة؛ الاشتراك يعمل فقط على موقع Netlify المربوط.','This is an offline preview. Newsletter signup requires the configured Netlify site.')); return;");
src += `\ndocument.addEventListener('click',e=>{if(e.target.closest('a[href="/admin/"],a[href="/privacy.html"]')){e.preventDefault();toast(t('هذه معاينة مستقلة. افتح الموقع المنشور لاستخدام هذه الصفحة.','This is an offline preview. Open the published site to use this page.'))}});`;
const result=await build({stdin:{contents:src,resolveDir:process.cwd(),sourcefile:'standalone.js',loader:'js'},bundle:true,write:false,format:'esm',target:'esnext',minify:true});
let fonts=fs.readFileSync(assets+'/fonts.css','utf8').replace(/url\(([^)]+)\)/g,(_,u)=>{u=u.replace(/["']/g,'');const file=u.startsWith('/assets/')?'public'+u:path.join(assets,u);return `url(${dataURI(file,u.endsWith('.woff2')?'font/woff2':'font/ttf')})`});
let css=fs.readFileSync('style.css','utf8');
let html=fs.readFileSync('index.html','utf8').replace('<link rel="stylesheet" href="/assets/fonts.css">',`<style>${fonts}\n${css}</style>`).replace('href="/assets/favicon.svg"',`href="${dataURI(assets+'/favicon.svg','image/svg+xml')}"`).replace('<script type="module" src="/src.js"></script>',`<script type="module">${result.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);
fs.writeFileSync('/home/user/hadikat-afkar-preview.html',html);console.log('Created offline preview:',Buffer.byteLength(html),'bytes');
