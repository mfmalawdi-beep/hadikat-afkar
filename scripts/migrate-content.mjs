import fs from 'node:fs';
import matter from 'gray-matter';
const source=JSON.parse(fs.readFileSync('archive/posts-source.json','utf8')).posts;
const english=JSON.parse(fs.readFileSync('public/english.json','utf8'));
const images=['garden','philosophy','maps','books','writing','city'];
for(let i=0;i<source.length;i++){
 const file=source[i].file, target='content/posts/'+file;
 if(fs.existsSync(target))continue;
 const original=fs.readFileSync('archive/original-posts/'+file,'utf8');
 const {data,content}=matter(original);
 data.draft=false;data.image='/assets/'+images[i]+'.jpg';data.translation=english[i];
 fs.writeFileSync(target,matter.stringify(content,data));
}
console.log('Migrated original articles to content/posts with attached English translations.');
