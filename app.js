'use strict';
/* =========================================================
   حديقة أفكار — app.js
   توجيه بالهاش، بحث، تصنيفات، عرض مقالات Markdown،
   وضع ليلي، وقراءة من posts/posts.json (يبنيها build.js)
   ========================================================= */

/* ===================== إعدادات الموقع ===================== */
const SITE = {
    name: 'حديقة أفكار',
    emoji: '🌿',
    tagline: 'حيث تنمو الأفكار بهدوء: قراءاتٌ في العلوم والتاريخ والفلسفة والفنون.',
    author: 'مصطفى الصيادي',
    bio: 'صانع محتوى وشغوف بالمعرفة والتأمل. أنشأت «حديقة أفكار» لتكون مساحة رقمية حرة تتقاطع فيها العلوم بالتاريخ والفلسفة بالفنون — لا خوارزميات هنا، ولا ضجيج؛ فقط أفكار تُكتب بهدوء وتُنشر حين تنضج.',
    email: 'hello@hadikat-afkar.example',
    mood: 'أقرأ حالياً تاريخ العلوم، وأقلّم مسودات الشهر في الحديقة.',
    socials: [
        { id: 'github', label: 'GitHub', url: 'https://github.com/USERNAME', icon: 'github' },
        { id: 'x', label: 'X', url: 'https://x.com/USERNAME', icon: 'x' },
        { id: 'mail', label: 'البريد', url: 'mailto:hello@hadikat-afkar.example', icon: 'mail' },
    ],
};

const PAGES = {
    home: { label: 'الرئيسية', title: 'الرئيسية', emoji: '🏡', desc: '' },
    passion: { label: 'شغف', title: 'شغف', emoji: '🌱', desc: 'مساحة أتتبع فيها ما أحبّه: قراءة، كتابة، وتجارب شخصية — بلا التزام بنمط واحد.' },
    ideas: { label: 'أفكار', title: 'أفكار', emoji: '💡', desc: 'تأملات ومقالات قصيرة تلتقط خيوطاً متقاطعة بين الفلسفة والعلوم والحياة.' },
    facts: { label: 'حقائق', title: 'حقائق', emoji: '🔭', desc: 'مقالات موثقة في التاريخ والجغرافيا والعلوم، مكتوبة بلغة بسيطة ومصادر واضحة.' },
    library: { label: 'مكتبة', title: 'المكتبة', emoji: '📚', desc: 'مراجعات الكتب والأعمال التي أنهيتها، مع وقفة عند الفكرة التي سكنتني منها.' },
    about: { label: 'عَنِّي', title: 'عَنِّي', emoji: '👤', desc: '' },
};

const CATEGORIES = {
    'تاريخ': { emoji: '🏛️', grad: 'from-amber-500 to-orange-700' },
    'فلسفة': { emoji: '🦉', grad: 'from-violet-500 to-purple-800' },
    'جغرافيا': { emoji: '🗺️', grad: 'from-sky-500 to-cyan-700' },
    'علوم': { emoji: '🔬', grad: 'from-teal-500 to-emerald-700' },
    'طب': { emoji: '🩺', grad: 'from-rose-500 to-pink-700' },
    'هندسة': { emoji: '⚙️', grad: 'from-slate-500 to-indigo-800' },
    'تكنولوجيا': { emoji: '🤖', grad: 'from-blue-500 to-indigo-700' },
    'فنون': { emoji: '🎨', grad: 'from-fuchsia-500 to-pink-700' },
};
const ALL_CATEGORIES = Object.keys(CATEGORIES);
const catMeta = (c) => CATEGORIES[c] || { emoji: '🌿', grad: 'from-stone-500 to-stone-700' };

const QUOTES = [
    'العلم يمنحك المعرفة، لكن الفلسفة تمنحك الحكمة.',
    'نكتب لنعرف ماذا نعتقد، لا لنعرض ما نعرفه.',
    'الحديقة لا تُقاس بمساحتها، بل بحيواتها.',
    'من يملك سبباً يحتمل أي «كيف» تقريباً. — نيتشه',
    'كل خريطة كذبة نافعة؛ السؤال: كذبةُ مَن، ولمصلحة مَن؟',
    'لا تنتظر الإذن؛ الجملة الرديئة الحية خيرٌ من الفكرة الكاملة الميتة.',
    'بين المثير والاستجابة توجد مسافة؛ فيها تسكن حريتنا.',
    'اقرأ كثيراً، تشكك أكثر، واكتب ما يصلح للبقاء.',
];

/* نسخة مصغّرة تُعرض إن تعذّر جلب posts.json (فتح الموقع بدون خادم مثلاً) */
const FALLBACK_POSTS = [
    { slug: '2026-09-21-welcome', file: '2026-09-21-welcome.md', title: 'أهلاً بكم في حديقة أفكار', date: '2026-09-21T09:00:00.000Z', pageGroup: 'ideas', category: 'فلسفة', featured: true, words: 206, minutes: 1, tags: ['تعريف', 'تدوين'], summary: 'أول مقال في حديقة أفكار: لماذا حديقة بالذات؟ وما الذي ستجده هنا إن قررت البقاء؟' },
    { slug: '2026-09-15-existentialism', file: '2026-09-15-existentialism.md', title: 'رحلة في أعماق الفلسفة الوجودية', date: '2026-09-15T18:30:00.000Z', pageGroup: 'ideas', category: 'فلسفة', featured: false, words: 248, minutes: 1, tags: ['فلسفة'], summary: 'تأملات حول المعنى والغاية، وكيف يبني الإنسان عالمه الخاص وسط تحديات الحياة اليومية.' },
    { slug: '2026-09-10-cartography', file: '2026-09-10-cartography.md', title: 'تاريخ علم الخرائط: كيف تشكّلت الجغرافيا الحديثة', date: '2026-09-10T14:00:00.000Z', pageGroup: 'facts', category: 'تاريخ', featured: false, words: 269, minutes: 2, tags: ['خرائط'], summary: 'من لوح الطين البابلي إلى تطبيقات الملاحة: قصة مختصرة لعلم الخرائط.' },
    { slug: '2026-09-01-meaning-book', file: '2026-09-01-meaning-book.md', title: 'قراءة في كتاب: الإنسان وبحثه عن المعنى', date: '2026-09-01T20:15:00.000Z', pageGroup: 'library', category: 'فلسفة', featured: false, words: 232, minutes: 1, tags: ['مراجعات'], summary: 'مراجعة لكتاب فيكتور فرانكل: كيف تتحول المعاناة المفهومة إلى سبب للمضي قدماً.' },
    { slug: '2026-08-24-why-i-write', file: '2026-08-24-why-i-write.md', title: 'لماذا أكتب؟ يوميات شغف مؤجل', date: '2026-08-24T10:00:00.000Z', pageGroup: 'passion', category: 'فنون', featured: false, words: 209, minutes: 1, tags: ['كتابة'], summary: 'عن الكتابة كهواية عنيدة، وعن طقسي في تحويل الملاحظات إلى مقالات.' },
    { slug: '2026-08-12-hill-cities', file: '2026-08-12-hill-cities.md', title: 'لماذا بنيت المدن القديمة على التلال؟', date: '2026-08-12T16:45:00.000Z', pageGroup: 'facts', category: 'جغرافيا', featured: false, words: 245, minutes: 1, tags: ['مدن'], summary: 'قراءة جغرافية في سبب اختيار الأسلاف قمم التلال قبل سفوحها.' },
];

/* ===================== أيقونات SVG ===================== */
const ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="m4 12.5 5 5 11-11"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    github: '<path d="M12 2A10 10 0 0 0 8.8 21.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.3-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5A3.9 3.9 0 0 1 6.9 8.7a3.6 3.6 0 0 1 1-2.7c-.3-.8.1-1.9.3-2 0 0 .8-.2 2.5 1a8.6 8.6 0 0 1 4.6 0c1.7-1.2 2.5-1 2.5-1 .2 1.1.6 2.2.3 3a3.6 3.6 0 0 1 1 2.5 3.9 3.9 0 0 1 .1 1.8c-.1 3.8-2.4 4.6-4.7 4.9.4.4.7 1 .7 2.1v2.6c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/>',
    x: '<path d="M18 2h3.3l-7.2 8.2L22.8 22h-6.6l-4.4-5.7L6.7 22H3.4l7.7-8.8L1.8 2h6.8l4 5.3L18 2Zm-1.2 18h1.8L7.3 3.9H5.4L16.8 20Z"/>',
    facebook: '<path d="M13.5 21.9v-8.1h2.7l.4-3.2h-3.1V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v2.2H7.6v3.2h2.3v8.1h3.6Z"/>',
    whatsapp: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22.4l5.4-1.4A10 10 0 1 0 12 2Zm5.9 14.3c-.2.7-1.4 1.3-2 1.4-.6.1-1.2.1-2-.2-.5-.2-1.4-.5-2.5-1.2-2.2-1.5-3.5-3.7-3.7-4-.1-.3-.9-1.3-.9-2.4 0-1.1.6-1.6.8-1.9.2-.2.4-.3.6-.3h.5c.2 0 .4-.1.6.4.2.6.8 1.9.9 2 .1.1.1.3 0 .4-.2.3-.4.5-.6.7-.1.1-.3.3-.1.6.1.3.7 1.2 1.6 1.9 1.1.9 1.9 1.2 2.2 1.3.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.4Z"/>',
    link: '<path d="M10 13.5a4.9 4.9 0 0 0 7.1.4l2.8-2.7a4.95 4.95 0 0 0-7-7l-1.6 1.6"/><path d="M14 10.5a4.9 4.9 0 0 0-7.1-.4L4.1 12.8a4.95 4.95 0 0 0 7 7l1.6-1.6"/>',
    print: '<path d="M6 9V3h12v6M6 18H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
};
function icon(name, cls) {
    const p = ICONS[name];
    if (!p) return '';
    const solid = ['github', 'x', 'facebook', 'whatsapp'].includes(name);
    return '<svg class="' + (cls || 'w-5 h-5') + '" viewBox="0 0 24 24" ' +
        (solid ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') +
        ' aria-hidden="true">' + p + '</svg>';
}

/* ===================== أدوات ===================== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = (s) => esc(s).replace(/"/g, '&quot;');

let toastTimer = null;
function toast(msg, kind) {
    const t = $('#toast');
    if (!t) return;
    t.innerHTML = (kind === 'err' ? '⚠️ ' : '✅ ') + '<span>' + esc(msg) + '</span>';
    t.classList.remove('hidden'); t.classList.add('flex');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.add('hidden'); t.classList.remove('flex'); }, 2600);
}

function fmtDate(iso) {
    try {
        const d = new Date(iso);
        if (isNaN(d)) return '';
        return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' }).format(d);
    } catch (e) { return String(iso || '').slice(0, 10); }
}
function readLabel(m) {
    m = Math.max(1, m || 1);
    if (m === 1) return 'دقيقة قراءة واحدة';
    if (m === 2) return 'دقيقتان';
    if (m <= 10) return m + ' دقائق';
    return m + ' دقيقة';
}
function postsCount(n) {
    if (n === 0) return 'لا مقالات بعد';
    if (n === 1) return 'مقالة واحدة';
    if (n === 2) return 'مقالتان';
    if (n <= 10) return n + ' مقالات';
    return n + ' مقالة';
}
const debounce = (fn, ms) => { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms); }; };
function dayOfYear() { const n = new Date(), s = new Date(n.getFullYear(), 0, 0); return Math.floor((n - s) / 864e5); }

/* ===================== الحالة ===================== */
const state = {
    route: { page: 'home' },
    category: 'all',
    search: '',
    posts: [],
    offline: false,
    loaded: false,
    currentPost: null,
};
const bodyCache = new Map();
let renderToken = 0;
let revealObserver = null;

/* ===================== تحميل البيانات ===================== */
async function loadPosts() {
    try {
        const res = await fetch('./posts/posts.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data || !Array.isArray(data.posts)) throw new Error('فهرس المقالات غير صالح');
        state.posts = data.posts;
        state.offline = false;
    } catch (e) {
        state.posts = FALLBACK_POSTS;
        state.offline = true;
        console.warn('تعذّر تحميل posts/posts.json — سيتم عرض نسخة مصغّرة.', e);
    }
    state.loaded = true;
}

function stripFM(raw) { const m = raw.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/); return m ? raw.slice(m[0].length) : raw; }

async function loadPostBody(slug) {
    if (bodyCache.has(slug)) return bodyCache.get(slug);
    const meta = state.posts.find(p => p.slug === slug);
    if (!meta || state.offline) return { error: true, meta: meta };
    try {
        const res = await fetch('./posts/' + encodeURI(meta.file), { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const md = stripFM(await res.text());
        bodyCache.set(slug, { body: md });
        return { body: md, meta: meta };
    } catch (e) {
        return { error: true, meta: meta };
    }
}

/* ===================== عرض Markdown ===================== */
function renderMarkdown(src) {
    let html;
    if (window.marked && window.marked.parse) {
        try { html = window.marked.parse(src, { gfm: true, breaks: false }); } catch (e) { html = miniMarkdown(src); }
    } else {
        html = miniMarkdown(src);
    }
    return html;
}

/** محوّل Markdown مصغّر للاعتماد عليه إذا تعذّر تحميل marked */
function miniMarkdown(src) {
    const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    const inline = (t) => esc(t)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?=[^\w*]|$)/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    let html = '', listType = null, inQuote = false, inCode = false, codeBuf = [], para = [];
    const flushP = () => { if (para.length) { html += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
    const closeList = () => { if (listType) { html += '</' + listType + '>'; listType = null; } };
    const closeQuote = () => { if (inQuote) { html += '</blockquote>'; inQuote = false; } };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^```/.test(line)) {
            if (inCode) { html += '<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>'; codeBuf = []; inCode = false; }
            else { flushP(); closeList(); closeQuote(); inCode = true; }
            continue;
        }
        if (inCode) { codeBuf.push(line); continue; }
        if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { flushP(); closeList(); closeQuote(); html += '<hr>'; continue; }
        const h = line.match(/^(#{1,4})\s+(.*)$/);
        if (h) { flushP(); closeList(); closeQuote(); html += '<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'; continue; }
        if (/^\s*\|.+\|\s*$/.test(line)) {
            flushP(); closeList(); closeQuote();
            const rows = [line];
            while (i + 1 < lines.length && /^\s*\|.+\|\s*$/.test(lines[i + 1])) rows.push(lines[++i]);
            const cells = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => inline(c.trim()));
            let body = rows.slice(1);
            if (body.length && /^[\s\-:|]+$/.test(body[0])) body = body.slice(1);
            html += '<table><thead><tr>' + cells(rows[0]).map((c) => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
                body.map((r) => '<tr>' + cells(r).map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
            continue;
        }
        const q = line.match(/^>\s?(.*)$/);
        if (q) { flushP(); closeList(); if (!inQuote) { html += '<blockquote>'; inQuote = true; } html += '<p>' + inline(q[1]) + '</p>'; continue; }
        const ul = line.match(/^\s*[-*]\s+(.*)$/), ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (ul || ol) {
            flushP(); closeQuote();
            const t = ul ? 'ul' : 'ol';
            if (listType !== t) { closeList(); html += '<' + t + '>'; listType = t; }
            html += '<li>' + inline((ul || ol)[1]) + '</li>';
            continue;
        }
        if (/^\s*$/.test(line)) { flushP(); closeList(); closeQuote(); continue; }
        para.push(line.trim());
    }
    if (inCode) html += '<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>';
    flushP(); closeList(); closeQuote();
    return html;
}

/* ===================== مكونات ===================== */
function pill(cat, cls) {
    return '<span class="inline-flex items-center gap-1 rounded-full text-[11px] font-extrabold px-2.5 py-0.5 ' + (cls || 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300') + '">' +
        esc(catMeta(cat).emoji) + ' ' + esc(cat) + '</span>';
}
function pagePill(group) {
    const p = PAGES[group] || PAGES.ideas;
    return '<span class="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2.5 py-0.5 bg-white/85 dark:bg-stone-900/85 text-stone-700 dark:text-stone-200 shadow-sm">' + p.emoji + ' ' + p.label + '</span>';
}

function postCard(p) {
    const meta = catMeta(p.category);
    return '<article role="link" tabindex="0" data-action="open:' + escA(p.slug) + '" aria-label="' + escA(p.title) + '"' +
        ' class="reveal card group cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">' +
        '<div class="relative h-28 bg-gradient-to-bl ' + meta.grad + ' flex items-center justify-center overflow-hidden hero-pattern">' +
            '<span class="text-5xl drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">' + meta.emoji + '</span>' +
            '<span class="absolute top-3 right-3">' + pagePill(p.pageGroup) + '</span>' +
        '</div>' +
        '<div class="p-5 flex flex-col flex-grow">' +
            '<div class="flex items-center flex-wrap gap-2 text-[11px] text-stone-500 dark:text-stone-400">' + pill(p.category) + '<span>📅 ' + fmtDate(p.date) + '</span></div>' +
            '<h3 class="mt-3 text-lg font-extrabold leading-snug text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">' + esc(p.title) + '</h3>' +
            '<p class="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300 line-clamp-3 flex-grow">' + esc(p.summary) + '</p>' +
            '<div class="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">' +
                '<span class="inline-flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-400">اقرأ المقال ' + icon('arrowL', 'w-3.5 h-3.5 transition-transform group-hover:-translate-x-1') + '</span>' +
                '<span class="text-stone-400">' + readLabel(p.minutes).replace(' قراءة', '') + '</span>' +
            '</div>' +
        '</div></article>';
}

function featuredCard(p) {
    const meta = catMeta(p.category);
    return '<div role="link" tabindex="0" data-action="open:' + escA(p.slug) + '" aria-label="' + escA(p.title) + '"' +
        ' class="reveal card group cursor-pointer grid gap-0 sm:grid-cols-5 overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">' +
        '<div class="sm:col-span-2 relative min-h-40 bg-gradient-to-bl ' + meta.grad + ' hero-pattern flex items-center justify-center">' +
            '<span class="text-7xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110">' + meta.emoji + '</span>' +
            '<span class="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-extrabold px-3 py-1 shadow">⭐ مختارة الحديقة</span>' +
        '</div>' +
        '<div class="sm:col-span-3 p-6 sm:p-8 flex flex-col">' +
            '<div class="flex items-center flex-wrap gap-2 text-xs text-stone-500">' + pill(p.category) + pagePill(p.pageGroup) + '<span class="text-stone-400">📅 ' + fmtDate(p.date) + '</span></div>' +
            '<h3 class="mt-3 text-xl sm:text-2xl font-extrabold leading-snug text-stone-900 dark:text-white">' + esc(p.title) + '</h3>' +
            '<p class="mt-2.5 text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 line-clamp-3 flex-grow">' + esc(p.summary) + '</p>' +
            '<div class="mt-5 flex items-center gap-3">' +
                '<span class="inline-flex items-center gap-2 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 transition">اقرأ الآن ' + icon('arrowL', 'w-4 h-4') + '</span>' +
                '<span class="text-xs text-stone-400">' + readLabel(p.minutes) + '</span>' +
            '</div>' +
        '</div></div>';
}

function chipsHtml(pool) {
    const cats = ALL_CATEGORIES.filter((c) => pool.some((p) => p.category === c));
    const mk = (label, val) =>
        '<button data-action="cat:' + escA(val) + '" class="rounded-xl text-xs sm:text-sm font-bold px-3.5 py-2 border transition-all ' +
        (state.category === val
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400') +
        '">' + label + '</button>';
    return mk('✳️ الكل', 'all') + cats.map((c) => mk(catMeta(c).emoji + ' ' + c, c)).join('');
}

function matchesFilter(p) {
    if (state.category !== 'all' && p.category !== state.category) return false;
    const q = state.search.trim().toLowerCase();
    if (!q) return true;
    return (p.title + ' ' + p.summary + ' ' + p.category + ' ' + (p.tags || []).join(' ')).toLowerCase().includes(q);
}

function currentPool() {
    const page = state.route.page;
    if (page === 'home' || PAGES[page] === undefined) return state.posts;
    return state.posts.filter((p) => p.pageGroup === page);
}

function visibleList() {
    const pool = currentPool();
    let list = pool.filter(matchesFilter);
    const featuredShown = state.route.page === 'home' && state.category === 'all' && !state.search.trim() && pool.some((p) => p.featured);
    if (featuredShown) list = list.filter((p) => !p.featured);
    return { pool: pool, list: list };
}

function gridHtml() {
    const list = visibleList().list;
    if (!list.length) {
        return '<div class="py-16 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white/60 dark:bg-stone-900/60">' +
            '<div class="text-5xl mb-3">🪴</div>' +
            '<h3 class="font-extrabold text-lg">لا شيء ينبت هنا (بعد)</h3>' +
            '<p class="text-sm text-stone-500 mt-1">جرّب قسماً آخر أو امسح كلمة البحث.</p>' +
            '<button data-action="clear" class="mt-4 rounded-full bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 px-4 py-2 text-xs font-bold transition">مسح المرشِّحات</button>' +
        '</div>';
    }
    return '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">' + list.map(postCard).join('') + '</div>';
}

function searchHtml() {
    return '<div class="relative flex-grow sm:max-w-xs">' +
        '<span class="absolute inset-y-0 right-3.5 flex items-center text-stone-400 pointer-events-none">' + icon('search', 'w-4 h-4') + '</span>' +
        '<input id="post-search" type="search" autocomplete="off" placeholder="ابحث في الحديقة… عنواناً أو وُسماً" value="' + escA(state.search) + '"' +
        ' class="w-full rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 ps-4 pe-10 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50">' +
        '</div>';
}

/* ===================== الصفحات ===================== */
function renderHome() {
    const pool = currentPool();
    const featured = pool.find((p) => p.featured);
    const totalWords = state.posts.reduce((s, p) => s + (p.words || 0), 0);
    const catsUsed = new Set(state.posts.map((p) => p.category)).size;
    const quote = QUOTES[dayOfYear() % QUOTES.length];
    const last = state.posts[0];

    return '' +
    '<!-- البطل -->' +
    '<section class="reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-700 hero-pattern text-white">' +
        '<div class="leaf-blob absolute -top-16 -left-10 w-72 h-72 rounded-full bg-amber-400"></div>' +
        '<div class="leaf-blob absolute bottom--10 right-1/3 w-64 h-64 rounded-full bg-emerald-400" style="bottom:-2.5rem"></div>' +
        '<div class="relative z-10 p-8 sm:p-12 lg:p-14 max-w-3xl">' +
            '<span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold px-3 py-1 backdrop-blur-sm">🌿 نسخة 2026 · محتواها يُدار من لوحة تحكم Decap CMS</span>' +
            '<h1 class="mt-4 text-3xl sm:text-5xl font-extrabold leading-[1.22]">حديقةُ أفكار<span class="text-amber-300">.</span></h1>' +
            '<p class="mt-4 text-emerald-50/95 leading-relaxed text-base sm:text-lg max-w-2xl">' + esc(SITE.tagline) + '</p>' +
            '<div class="mt-8 flex flex-wrap items-center gap-3">' +
                '<a href="#posts-anchor" class="inline-flex items-center gap-2 rounded-full bg-white text-emerald-800 font-extrabold px-5 py-2.5 text-sm shadow-lg hover:bg-emerald-50 transition">تصفّح المقالات <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a>' +
                '<button data-action="nav:about" class="rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold px-5 py-2.5 text-sm transition">اعرف صاحب الحديقة</button>' +
            '</div>' +
            '<div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-100/90">' +
                '<span>🌳 <b class="font-extrabold">' + postsCount(state.posts.length) + '</b></span>' +
                '<span>✍️ <b class="font-extrabold">' + totalWords.toLocaleString('ar-EG') + '</b> كلمة مزروعة</span>' +
                '<span>🗂️ <b class="font-extrabold">' + catsUsed + '</b> تصنيفات</span>' +
                (last ? '<span>🕊️ آخر غرس: <b class="font-extrabold">' + fmtDate(last.date) + '</b></span>' : '') +
            '</div>' +
        '</div>' +
        '<div class="hidden lg:flex absolute left-10 top-1/2 -translate-y-1/2 flex-col gap-4 opacity-90 text-6xl select-none" aria-hidden="true"><span style="transform:rotate(8deg)">🪴</span><span style="transform:rotate(-10deg)">💡</span><span style="transform:rotate(6deg)">📜</span></div>' +
    '</section>' +

    <!-- بطاقات علوية --> ...
    '<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">' +
        '<div class="reveal rounded-2xl bg-white dark:bg-stone-900 p-5 border border-stone-200 dark:border-stone-800 shadow-sm">' +
            '<h3 class="font-extrabold text-emerald-700 dark:text-emerald-400 mb-1.5">🌿 عن الحديقة</h3>' +
            '<p class="text-sm leading-relaxed text-stone-600 dark:text-stone-300">مساحة أشارك فيها حصيلة قراءاتي وتأملاتي وشغفي — بلا إعلانات ولا ضجيج.</p>' +
            '<button data-action="nav:about" class="mt-3 text-xs font-extrabold text-emerald-600 hover:underline">اقرأ عني ←</button>' +
        '</div>' +
        '<div class="reveal rounded-2xl bg-white dark:bg-stone-900 p-5 border border-stone-200 dark:border-stone-800 shadow-sm">' +
            '<h3 class="font-extrabold text-amber-600 dark:text-amber-400 mb-1.5">📍 حالتي اليوم</h3>' +
            '<p class="text-sm leading-relaxed text-stone-600 dark:text-stone-300">' + esc(SITE.mood) + '</p>' +
        '</div>' +
        '<div class="reveal rounded-2xl bg-gradient-to-bl from-stone-100 to-emerald-50 dark:from-stone-900 dark:to-emerald-950/40 p-5 border border-stone-200 dark:border-stone-800 shadow-sm">' +
            '<div class="flex items-center justify-between mb-1.5"><h3 class="font-extrabold text-emerald-700 dark:text-emerald-400">💭 مقولة اليوم</h3><button data-action="quote" class="text-stone-400 hover:text-emerald-600 transition" title="مقولة أخرى" aria-label="مقولة أخرى">' + icon('shuffle', 'w-4 h-4') + '</button></div>' +
            '<blockquote id="quote-text" class="text-sm italic leading-relaxed text-stone-700 dark:text-stone-200">« ' + esc(quote) + ' »</blockquote>' +
        '</div>' +
    '</div>' +

    (featured ? '<section class="mt-12"><h2 class="text-xl font-extrabold mb-4 text-stone-900 dark:text-white">⭐ المختارة</h2>' + featuredCard(featured) + '</section>' : '') +

    '<section id="posts-anchor" class="mt-12 scroll-mt-24">' +
        '<div class="flex flex-wrap items-end justify-between gap-3 mb-4">' +
            '<div><h2 class="text-xl font-extrabold text-stone-900 dark:text-white">🌱 أحدث ما نبت في الحديقة</h2><p class="text-xs text-stone-500 mt-1" id="result-count"></p></div>' +
            searchHtml() +
        '</div>' +
        '<div id="cat-chips" class="flex flex-wrap gap-2 mb-6">' + chipsHtml(pool) + '</div>' +
        '<div id="posts-grid">' + gridHtml() + '</div>' +
    '</section>' +

    '<section class="reveal mt-12 overflow-hidden rounded-3xl bg-gradient-to-l from-amber-400 to-orange-500 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-stone-900 shadow-md">' +
        '<div><h2 class="text-2xl font-extrabold">📬 رسالة الحديقة الشهرية</h2><p class="mt-1 text-sm font-medium text-stone-800/90">ملخّص بما نبت في الحديقة — رسالة واحدة شهرياً، بلا إزعاج، ويمكن الخروج متى شئت.</p></div>' +
        '<form data-nl class="flex w-full md:w-auto gap-2" novalidate>' +
            '<input type="email" required data-nl-email placeholder="بريدك الإلكتروني" class="w-full md:w-64 rounded-full border-2 border-white/60 bg-white/95 px-4 py-2.5 text-sm outline-none focus:border-stone-700" />' +
            '<button type="submit" class="shrink-0 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm px-5 py-2.5 transition shadow">اشترك</button>' +
        '</form>' +
    '</section>';
}

function renderSection(page) {
    const p = PAGES[page];
    const pool = currentPool();
    return '' +
    '<section class="reveal relative overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-gradient-to-l from-emerald-50 via-white to-teal-50 dark:from-stone-900 dark:via-stone-950 dark:to-emerald-950/30 p-7 sm:p-10 mb-8">' +
        '<div class="leaf-blob absolute -top-10 -right-10 w-52 h-52 rounded-full bg-emerald-300"></div>' +
        '<div class="relative flex items-start gap-4">' +
            '<span class="text-4xl sm:text-5xl select-none" aria-hidden="true">' + p.emoji + '</span>' +
            '<div><h1 class="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">' + p.title + '</h1>' +
            '<p class="mt-2 text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 max-w-2xl">' + esc(p.desc) + '</p></div>' +
        '</div>' +
    '</section>' +
    '<section id="posts-anchor" class="scroll-mt-24">' +
        '<div class="flex flex-wrap items-center justify-between gap-3 mb-4">' +
            '<p class="text-sm text-stone-500 font-bold" id="result-count"></p>' +
            searchHtml() +
        '</div>' +
        '<div id="cat-chips" class="flex flex-wrap gap-2 mb-6">' + chipsHtml(pool) + '</div>' +
        '<div id="posts-grid">' + gridHtml() + '</div>' +
    '</section>';
}

function renderPost(slug) {
    const p = state.posts.find((x) => x.slug === slug);
    state.currentPost = p || null;
    if (!p) {
        state.route = { page: '404' };
        return '<div class="text-center py-24"><div class="text-6xl mb-4">🍂</div><h1 class="text-2xl font-extrabold">ضاعت هذه الورقة</h1><p class="text-stone-500 mt-2 text-sm">لم أجد مقالة بهذا العنوان في الحديقة.</p><button data-action="nav:home" class="mt-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 transition">عودة إلى الحديقة</button></div>';
    }
    const meta = catMeta(p.category);
    const page = PAGES[p.pageGroup] || PAGES.ideas;
    const idx = state.posts.indexOf(p);
    const newer = idx > 0 ? state.posts[idx - 1] : null;
    const older = idx < state.posts.length - 1 ? state.posts[idx + 1] : null;
    const related = state.posts.filter((x) => x.slug !== p.slug && (x.pageGroup === p.pageGroup || x.category === p.category)).slice(0, 3);

    const shareBtn = (act, label, svg, cls) =>
        '<button data-action="' + act + '" title="' + label + '" aria-label="' + label + '" class="p-2.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 ' + cls + ' transition">' + svg + '</button>';

    const cover = '<div class="relative h-40 sm:h-56 bg-gradient-to-bl ' + meta.grad + ' hero-pattern flex items-center justify-center overflow-hidden">' +
        '<span class="text-8xl drop-shadow-xl" aria-hidden="true">' + meta.emoji + '</span>' +
        '<span class="absolute top-4 right-4 sm:right-6">' + pagePill(p.pageGroup) + '</span>' +
        '<span class="absolute top-4 left-4 sm:left-6">' + pill(p.category, 'bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-100') + '</span>' +
        '</div>';

    const nav = (post, label, dir) => !post ? '' :
        '<button data-action="open:' + escA(post.slug) + '" class="card group reveal rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 text-right transition hover:border-emerald-400">' +
            '<span class="text-[11px] font-bold text-stone-400">' + dir + ' ' + label + '</span>' +
            '<span class="block mt-1 font-extrabold text-sm leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">' + esc(post.title) + '</span>' +
        '</button>';

    return '' +
    '<div class="max-w-3xl mx-auto">' +
        '<div class="no-print flex items-center justify-between gap-3 mb-5">' +
            '<button data-action="nav:' + p.pageGroup + '" class="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-emerald-600 transition">' + icon('arrowR', 'w-4 h-4') + ' رجوع إلى ' + page.label + '</button>' +
            '<div class="flex items-center gap-1.5">' +
                shareBtn('share:wa', 'مشاركة على واتساب', icon('whatsapp', 'w-4 h-4'), 'hover:bg-emerald-50 hover:text-emerald-700') +
                shareBtn('share:x', 'مشاركة على X', icon('x', 'w-4 h-4'), 'hover:bg-stone-100 dark:hover:bg-stone-800') +
                shareBtn('share:fb', 'مشاركة على فيسبوك', icon('facebook', 'w-4 h-4'), 'hover:bg-blue-50 hover:text-blue-700') +
                shareBtn('share:copy', 'نسخ الرابط', icon('link', 'w-4 h-4'), 'hover:bg-amber-50 hover:text-amber-700') +
                shareBtn('print', 'طباعة', icon('print', 'w-4 h-4'), 'hover:bg-stone-100 dark:hover:bg-stone-800') +
            '</div>' +
        '</div>' +
        '<article class="reveal overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-md">' +
            cover +
            '<div class="p-6 sm:p-10">' +
                '<h1 class="text-2xl sm:text-4xl font-extrabold leading-[1.35] text-stone-900 dark:text-white">' + esc(p.title) + '</h1>' +
                '<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500 border-b border-stone-100 dark:border-stone-800 pb-5">' +
                    '<span>📅 ' + fmtDate(p.date) + '</span><span>⏱ ' + readLabel(p.minutes) + '</span><span>✍️ ' + (p.words || 0).toLocaleString('ar-EG') + ' كلمة</span><span class="cursor-pointer hover:text-emerald-600" data-action="print">🖨️ طباعة</span>' +
                '</div>' +
                '<div id="toc-slot"></div>' +
                '<div id="article-body" class="article mt-2">' +
                    '<div class="space-y-3 mt-6" aria-label="جارٍ التحميل"><div class="skel h-4 w-11/12"></div><div class="skel h-4 w-full"></div><div class="skel h-4 w-10/12"></div><div class="skel h-40 w-full"></div><div class="skel h-4 w-11/12"></div><div class="skel h-4 w-9/12"></div></div>' +
                '</div>' +
                ((p.tags && p.tags.length) ? '<div class="no-print mt-10 pt-5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-2">' + p.tags.map((t) => '<button data-action="tag:' + escA(t) + '" class="rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 px-3 py-1 text-[11px] font-bold text-stone-600 dark:text-stone-300 transition">#' + esc(t) + '</button>').join('') + '</div>' : '') +
            '</div>' +
        '</article>' +
        '<div class="no-print grid gap-4 sm:grid-cols-2 mt-7">' +
            nav(newer, 'المقال الأحدث', '⬅️') + nav(older, 'المقال الأقدم', '➡️') +
        '</div>' +
        (related.length ? '<section class="mt-12"><h2 class="text-lg font-extrabold mb-4 text-stone-900 dark:text-white">🌿 يانَعُ في الحديقة</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-5">' + related.map(postCard).join('') + '</div></section>' : '') +
    '</div>';
}

function renderAbout() {
    const totalWords = state.posts.reduce((s, p) => s + (p.words || 0), 0);
    const stats = [
        { n: postsCount(state.posts.length).replace('مقالات', 'مقالة'), l: 'منشورة هنا', e: '🌳' },
        { n: totalWords.toLocaleString('ar-EG'), l: 'كلمة مزروعة', e: '✍️' },
        { n: Object.keys(PAGES).length - 2, l: 'أقسام للحديقة', e: '🗂️' },
        { n: new Set(state.posts.map(p => p.category)).size, l: 'تصنيفات', e: '🏷️' },
    ];
    const socialBtn = (s) =>
        '<a href="' + escA(s.url) + '" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4 py-2 text-xs font-bold backdrop-blur-sm transition">' + icon(s.icon, 'w-4 h-4') + ' ' + esc(s.label) + '</a>';

    return '' +
    '<div class="max-w-4xl mx-auto space-y-8">' +
        '<div class="reveal overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-md">' +
            '<div class="relative hero-pattern bg-gradient-to-l from-emerald-800 to-teal-700 p-8 sm:p-10 text-white">' +
                '<div class="leaf-blob absolute -top-14 left-10 w-56 h-56 rounded-full bg-emerald-400"></div>' +
                '<div class="relative flex flex-col sm:flex-row items-center gap-6">' +
                    '<div class="w-24 h-24 rounded-3xl bg-gradient-to-bl from-amber-400 to-orange-500 shadow-xl flex items-center justify-center text-5xl rotate-3">' + SITE.emoji + '</div>' +
                    '<div class="text-center sm:text-start">' +
                        '<h1 class="text-3xl font-extrabold">أهلاً بك، أنا ' + esc(SITE.author) + ' 👋</h1>' +
                        '<p class="mt-2 text-emerald-50/95 text-sm max-w-xl leading-relaxed">' + esc(SITE.tagline) + '</p>' +
                        '<div class="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">' + SITE.socials.map(socialBtn).join('') + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="p-6 sm:p-10 space-y-5 text-[15px] leading-[2] text-stone-700 dark:text-stone-300">' +
                '<p>' + esc(SITE.bio) + '</p>' +
                '<p>أؤمن أن المدوّنات الصغيرة تشبه الحدائق المنزلية: لا تحتاج مساحةً كبيرة، تحتاج فقط يدًا تُقلم وقلبًا يواظب. هنا لن تجد «١٠ أسرار…» ولا عناوين مبالِغة، بل ما أصدقه وأستطيع الدفاع عنه.</p>' +
                '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">' +
                    stats.map((s) => '<div class="rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 p-4 text-center">' +
                        '<div class="text-xl">' + s.e + '</div><div class="mt-1 text-lg font-extrabold text-emerald-700 dark:text-emerald-400">' + s.n + '</div><div class="text-[11px] text-stone-500">' + s.l + '</div></div>').join('') +
                '</div>' +
                '<h2 class="text-xl font-extrabold text-stone-900 dark:text-white !mt-8 pt-2 border-t border-stone-100 dark:border-stone-800">أين تلتقي بي؟</h2>' +
                '<div class="grid sm:grid-cols-2 gap-4">' +
                    Object.keys(PAGES).filter(k => PAGES[k].desc).map((k) =>
                        '<button data-action="nav:' + k + '" class="card group text-right rounded-2xl border border-stone-200 dark:border-stone-800 p-4 hover:border-emerald-400 transition">' +
                            '<div class="font-extrabold text-stone-900 dark:text-white group-hover:text-emerald-600 transition-colors">' + PAGES[k].emoji + ' ' + PAGES[k].title + '</div>' +
                            '<div class="text-xs leading-relaxed text-stone-500 mt-1.5 line-clamp-2">' + esc(PAGES[k].desc) + '</div>' +
                        '</button>').join('') +
                '</div>' +
                '<div class="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">' +
                    '<p class="text-sm text-emerald-900 dark:text-emerald-200 font-semibold">💌 تحب أن تراسلني؟ باب الحديقة مفتوح دائماً.</p>' +
                    '<a href="mailto:' + escA(SITE.email) + '" class="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 inline-flex items-center gap-2 transition shadow">' + icon('mail', 'w-4 h-4') + ' راسلني</a>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function render404() {
    return '<div class="text-center py-24"><div class="text-6xl mb-4">🗺️</div><h1 class="text-2xl font-extrabold">هذه المنطقة غير مرسومة على الخريطة</h1><p class="text-stone-500 mt-2 text-sm">الرابط الذي فتحته غير موجود — ربما تقليمٌ خاطئ!</p><button data-action="nav:home" class="mt-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 transition">عودة إلى الحديقة</button></div>';
}

/* ===================== الرسم والتوجيه ===================== */
function render() {
    const main = $('#main-content');
    const page = state.route.page;
    let html = '';
    if (page === 'home') html = renderHome();
    else if (page === 'about') html = renderAbout();
    else if (page === '404') html = render404();
    else if (page === 'post') html = renderPost(state.route.param);
    else if (PAGES[page]) html = renderSection(page);
    else html = render404();

    main.innerHTML = state.offline ?
        '<div class="mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs font-bold">⚠️ عرض بدون فهرس المقالات (posts.json) — النصوص الكاملة تحتاج فتح الموقع عبر خادم محلي أو النشر.</div>' + html
        : html;

    main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
    document.title = (PAGES[page] ? PAGES[page].title + ' | ' : '') + SITE.name + ' · ' + SITE.author;
    setActiveNav(page === 'post' ? (state.currentPost ? state.currentPost.pageGroup : '') : page);
    updateCounts();
    afterRender(page);
    if (page === 'post') loadArticleContent(state.route.param);
}

async function loadArticleContent(slug) {
    const token = ++renderToken;
    const res = await loadPostBody(slug);
    if (token !== renderToken) return;
    const bodyEl = $('#article-body');
    if (!bodyEl) return;
    if (!res || res.error || !res.body) {
        bodyEl.innerHTML = '<p class="text-sm text-stone-500 bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-5 leading-relaxed">😔 تعذّر جلب النص الكامل للمقال من ملفه. إن كنت تفتح الصفحة مباشرة من القرص (file://) أو من دون بناء الفهرس فهذا متوقع — شغّل <code>npm run serve</code> محلياً أو انشر الموقع ليعمل بالكامل.</p>' +
            ((res && res.meta && res.meta.summary) ? '<p class="mt-4">' + esc(res.meta.summary) + '</p>' : '');
    } else {
        bodyEl.innerHTML = renderMarkdown(res.body);
    }
    enhanceArticle(bodyEl);
    buildToc(bodyEl);
    window.scrollTo({ top: 0 });
}

function enhanceArticle(el) {
    $$('a[href^="http"]', el).forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}

function buildToc(bodyEl) {
    const slot = $('#toc-slot');
    if (!slot || !bodyEl) return;
    const heads = $$('h2, h3', bodyEl);
    if (heads.length < 3) { slot.innerHTML = ''; return; }
    heads.forEach((h, i) => { h.id = 'sec-' + i; });
    slot.innerHTML = '<nav class="toc no-print mt-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/40 p-4" aria-label="محتويات المقال">' +
        '<div class="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-2">🧭 محتويات المقال</div>' +
        '<div class="grid sm:grid-cols-2 gap-x-6">' +
        heads.map((h, i) => '<a href="javascript:void(0)" data-action="toc:sec-' + i + '" class="' + (h.tagName === 'H3' ? 'toc-h3' : 'font-bold') + '">' + esc(h.textContent) + '</a>').join('') +
        '</div></nav>';
}

function setActiveNav(page) {
    $$('.nav-btn').forEach((b) => {
        b.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
        b.classList.add('text-stone-600', 'dark:text-stone-300', 'hover:bg-stone-200', 'dark:hover:bg-stone-800');
    });
    const active = $('#nav-' + page);
    if (active) {
        active.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
        active.classList.remove('text-stone-600', 'dark:text-stone-300');
        active.setAttribute('aria-current', 'page');
    }
    $$('.nav-btn').forEach((b) => { if (b !== active) b.removeAttribute('aria-current'); });
}

function updateCounts() {
    const el = $('#result-count');
    if (!el) return;
    const n = visibleList().list.length;
    const q = state.search.trim();
    el.textContent = (q ? '🔍 نتائج البحث عن «' + q + '»: ' : (state.route.page === 'home' ? 'أحدث المنشورات: ' : '')) + postsCount(n);
}

function refreshGrid() {
    const g = $('#posts-grid');
    if (!g) return;
    g.innerHTML = gridHtml();
    updateCounts();
    observeReveals();
}

function afterRender(page) {
    observeReveals();
    const menu = $('#mobile-menu');
    if (menu) menu.classList.add('hidden');
    const mt = $('#menu-toggle');
    if (mt) mt.setAttribute('aria-expanded', 'false');
}

function observeReveals() {
    if (revealObserver) revealObserver.disconnect();
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach((e) => e.classList.add('in')); return; }
    revealObserver = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); } });
    }, { threshold: 0.06 });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = Math.min(i, 8) * 40 + 'ms'; revealObserver.observe(el); });
}

/* ===================== تنقل ومشاركة ===================== */
function navigate(page, param) {
    const target = '#/' + page + (param ? '/' + encodeURIComponent(param) : '');
    if (location.hash === target) { state.route = { page: page, param: param }; render(); }
    else location.hash = target;
}

function doShare(kind) {
    const p = state.currentPost;
    if (!p) return;
    const url = location.origin + location.pathname + '#/post/' + encodeURIComponent(p.slug);
    const text = p.title + ' — ' + SITE.name;
    if (kind === 'copy') {
        const done = () => toast('تم نسخ رابط المقال 🌿');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
        else fallbackCopy(url, done);
        return;
    }
    const targets = {
        wa: 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text + ' ' + url),
        fb: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
        x: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
    };
    window.open(targets[kind], '_blank', 'noopener,width=640,height=560');
}
function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb && cb(); } catch (e) { toast('تعذّر النسخ — انسخ الرابط يدوياً', 'err'); }
    document.body.removeChild(ta);
}

/* ===================== الوضع الليلي ===================== */
function toggleTheme() {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('haf-theme', dark ? 'dark' : 'light'); } catch (e) { }
}

/* ===================== الأحداث ===================== */
function handleAction(action, arg, el) {
    if (action === 'nav') { state.category = 'all'; state.search = ''; navigate(arg); }
    else if (action === 'cat') { state.category = arg; if (state.route.page === 'post') { state.route = { page: 'home' }; location.hash = '#/home'; } render(); }
    else if (action === 'open') { navigate('post', arg); }
    else if (action === 'theme') toggleTheme();
    else if (action === 'menu') { const m = $('#mobile-menu'); const on = m.classList.toggle('hidden'); $('#menu-toggle').setAttribute('aria-expanded', String(!on)); }
    else if (action === 'clear') { state.category = 'all'; state.search = ''; render(); }
    else if (action === 'share') doShare(arg);
    else if (action === 'print') window.print();
    else if (action === 'quote') { const i = Math.floor(Math.random() * QUOTES.length); const q = $('#quote-text'); if (q) q.textContent = '« ' + QUOTES[i] + ' »'; }
    else if (action === 'toc') { const t = document.getElementById(arg); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (action === 'tag') { const inp = $('#post-search'); state.search = arg; if (inp) inp.value = arg; state.category = 'all'; render(); }
}

function initEvents() {
    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-action]');
        if (!t) return;
        const [action, ...rest] = t.getAttribute('data-action').split(':');
        handleAction(action, rest.join(':'), t);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const t = e.target.closest('[data-action]');
        if (t && !['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(t.tagName)) { e.preventDefault(); t.click(); }
    });
    document.addEventListener('input', debounce((e) => {
        if (e.target && e.target.id === 'post-search') {
            state.search = e.target.value;
            const chips = $('#cat-chips');
            if (chips) chips.innerHTML = chipsHtml(currentPool());
            refreshGrid();
        }
    }, 160));
    document.addEventListener('submit', (e) => {
        const f = e.target.closest('[data-nl]');
        if (!f) return;
        e.preventDefault();
        const input = $('input', f);
        const v = (input.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { toast('يبدو أن البريد غير صحيح — تحقق منه رجاءً', 'err'); input.focus(); return; }
        try {
            const list = JSON.parse(localStorage.getItem('haf-subscribers') || '[]');
            if (!list.includes(v)) list.push(v);
            localStorage.setItem('haf-subscribers', JSON.stringify(list));
        } catch (err) { }
        input.value = '';
        toast('أهلاً بك في قائمة الحديقة! 🌱 (تجربة محلية — اربطها بخدمة نشر لاحقاً)');
    });
    $('#theme-toggle').addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(); });
    $('#menu-toggle').addEventListener('click', (e) => { e.stopPropagation(); handleAction('menu'); });
    $('#to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', onScroll, { passive: true });
}

function onScroll() {
    const tt = $('#to-top');
    if (tt) tt.classList.toggle('hidden', window.scrollY < 480);
    const bar = $('#progress');
    if (!bar) return;
    const art = $('#article-body');
    if (state.route.page === 'post' && art) {
        const rect = art.getBoundingClientRect();
        const total = Math.max(rect.bottom - window.innerHeight, 1);
        const done = Math.min(Math.max(window.innerHeight - rect.top, 0), total);
        bar.style.transform = 'scaleX(' + (done / total).toFixed(4) + ')';
    } else {
        bar.style.transform = 'scaleX(0)';
    }
}

function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    const seg = parts[0] || 'home';
    if (seg === 'post' && parts[1]) state.route = { page: 'post', param: decodeURIComponent(parts[1]) };
    else if (PAGES[seg]) state.route = { page: seg };
    else state.route = { page: '404' };
    if (state.route.page !== 'post') { state.category = 'all'; state.search = ''; }
    render();
}

/* ===================== الإقلاع ===================== */
(async function init() {
    const fs = $('#footer-socials');
    if (fs) fs.innerHTML = SITE.socials.map((s) =>
        '<a href="' + escA(s.url) + '" target="_blank" rel="noopener" aria-label="' + escA(s.label) + '" title="' + escA(s.label) + '" class="p-2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-600 hover:text-white transition">' + icon(s.icon, 'w-4 h-4') + '</a>').join('');

    initEvents();
    await loadPosts();
    if (!location.hash) location.replace('#/home');
    route();
})();
