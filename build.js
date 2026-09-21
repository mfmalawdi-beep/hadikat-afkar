'use strict';
/**
 * build.js — يبني فهرس المنشورات لموقع "حديقة أفكار".
 *
 * يقرأ كل ملفات posts/*.md، يستخرج الواجهة الأمامية (front matter)،
 * يحسب زمن القراءة، ثم يكتب النتيجة في posts/posts.json التي يقرأها الموقع.
 *
 * الاستخدام:  node build.js
 * يُنفَّذ تلقائياً عند النشر على Netlify (انظر netlify.toml).
 */
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');
const OUT_FILE = path.join(POSTS_DIR, 'posts.json');
const IMG_DIR = path.join(__dirname, 'images', 'uploads');

/** تحليل مبسّط لواجهة YAML الأمامية (يدعم النص والاقتباس والمصفوفات البسيطة والمنطقية). */
function parseFrontMatter(raw) {
  const m = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === '') { meta[key] = ''; continue; }
    if (val.startsWith('[') && val.endsWith(']')) {
      meta[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      meta[key] = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    } else if (val === 'true' || val === 'false') {
      meta[key] = val === 'true';
    } else if (val === 'null' || val === '~') {
      meta[key] = '';
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: raw.slice(m[0].length) };
}

/** إزالة وسوم Markdown تقريبية لحساب عدد الكلمات. */
function wordCount(text) {
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');
  const words = plain.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('لا يوجد مجلد posts/');
    process.exit(1);
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => /\.md$/i.test(f)).sort().reverse();
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontMatter(raw);
    if (!meta.title) {
      console.warn(`تخطيت ${file}: لا يوجد عنوان (title) في الواجهة الأمامية.`);
      continue;
    }
    const words = wordCount(body);
    const minutes = Math.max(1, Math.round(words / 180));
    const date = meta.date ? new Date(meta.date) : null;
    const image = typeof meta.image === 'string' && meta.image.trim() ? meta.image.trim() : '';
    posts.push({
      slug: file.replace(/\.md$/i, ''),
      file,
      title: String(meta.title),
      date: date && !isNaN(date) ? date.toISOString() : new Date(0).toISOString(),
      pageGroup: ['passion', 'ideas', 'facts', 'library'].includes(meta.pageGroup) ? meta.pageGroup : 'ideas',
      category: String(meta.category || 'فلسفة'),
      summary: String(meta.summary || body.replace(/^\s*---[\s\S]*?---/, '').replace(/[#>*_`]/g, ' ').trim().slice(0, 160)),
      tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [String(meta.tags)] : [],
      featured: meta.featured === true,
      image: image.startsWith('/') || image.startsWith('http') ? image : image ? '/images/uploads/' + image.replace(/^\/+/, '') : '',
      words,
      minutes,
    });
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // التحقق من وجود الصور المشار إليها
  let missingImages = 0;
  if (fs.existsSync(IMG_DIR)) {
    const available = new Set(fs.readdirSync(IMG_DIR));
    for (const p of posts) {
      if (p.image && p.image.startsWith('/images/uploads/')) {
        const name = p.image.replace('/images/uploads/', '');
        if (!available.has(name)) {
          missingImages++;
          console.warn(`تنبيه: صورة غير موجودة للمقال ${p.file} -> ${name}`);
        }
      }
    }
  } else if (posts.some((p) => p.image)) {
    console.warn('تنبيه: بعض المقالات تشير إلى صور لكن مجلد images/uploads غير موجود.');
  }

  const out = { site: 'حديقة أفكار', generatedAt: new Date().toISOString(), count: posts.length, posts };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✓ بنيت الفهرس: ${posts.length} مقالاً -> posts/posts.json` + (missingImages ? ` (صور مفقودة: ${missingImages})` : ''));
}

main();
