import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
const groups=new Set(['passion','ideas','facts','library']);
const categories=new Set(['فلسفة','تاريخ','جغرافيا','فنون']);
export function buildContent(input='content/posts',output='public'){
 const posts=[];
 for(const file of fs.readdirSync(input).filter(f=>f.endsWith('.md'))){
  const {data:d,content}=matter(fs.readFileSync(path.join(input,file),'utf8'));
  // Drafts never enter the public build, including their raw Markdown.
  if(d.draft===true)continue;
  if(!d.title||!d.summary||!groups.has(d.pageGroup)||!categories.has(d.category)||!content.trim())throw new Error(`Invalid required fields in ${file}`);
  const date=new Date(d.date);if(!Number.isFinite(date.getTime()))throw new Error(`Invalid date in ${file}`);
  if(d.image&&!/^\/(?!\/)/.test(d.image))throw new Error(`Use a locally uploaded image in ${file}`);
  const slug=file.replace(/\.md$/,'');const words=content.trim().split(/\s+/u).length;
  const tr=d.translation||{};const translated=!!(tr.title?.trim()&&tr.summary?.trim()&&tr.body?.trim());
  posts.push({slug,file,title:String(d.title),summary:String(d.summary),date:date.toISOString(),pageGroup:d.pageGroup,category:d.category,featured:d.featured===true,tags:Array.isArray(d.tags)?d.tags.map(String):[],image:d.image||'/assets/garden.jpg',words,minutes:Math.max(1,Math.ceil(words/275)),body:content,translated,translation:translated?tr:null});
 }
 posts.sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));
 const english=posts.map(p=>p.translation||{title:p.title,summary:p.summary,body:p.body});
 const clean=posts.map(({translation,...p})=>p);
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'content.json'),JSON.stringify(clean,null,2));fs.writeFileSync(path.join(output,'english.json'),JSON.stringify(english,null,2));
 return clean;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve('scripts/build-content.mjs'))console.log(`Built ${buildContent().length} published articles from Markdown.`);
