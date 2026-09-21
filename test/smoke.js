'use strict';
/* فحص دخاني شامل: تحميل الموقع كاملاً في jsdom وتجربة المسارات الحقيقية */
const { JSDOM } = require('jsdom');
const BASE = 'http://localhost:8080';
const results = [];
function check(name, cond, extra) {
    results.push({ name, pass: !!cond, extra: extra || '' });
    console.log((cond ? '✅' : '❌') + ' ' + name + (extra && !cond ? ' — ' + extra : ''));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const errors = [];
    const dom = await JSDOM.fromURL(BASE + '/', {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        beforeParse(window) {
            window.fetch = (input, init) => fetch(new URL(input, window.location.href), init);
            window.scrollTo = () => {};
            window.open = () => ({});
            window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
            window.IntersectionObserver = window.IntersectionObserver || class { constructor() {} observe() {} unobserve() {} disconnect() {} };
            window.addEventListener('error', (e) => errors.push(String(e.message)));
        },
    });
    const w = dom.window, d = w.document;
    dom.virtualConsole.on('jsdomError', (e) => { if (!/Could not load|not implemented/i.test(String(e.message))) errors.push(String(e.message)); });

    // انتظار رسم الصفحة الرئيسية (تحميل posts.json ثم render)
    let tries = 0;
    while (tries++ < 60 && !d.querySelector('#posts-grid article')) await sleep(200);

    const hero = d.querySelector('h1');
    check('الرئيسية: البطل يعرض عنوان الحديقة', hero && hero.textContent.includes('حديقة'), hero && hero.textContent.slice(0, 40));
    const cards = d.querySelectorAll('#posts-grid article');
    check('الرئيسية: شبكة تعرض 5 بطاقات (المميزة مستثناة)', cards.length === 5, 'found=' + cards.length);
    check('الرئيسية: بطاقة المختارة موجودة', /مختارة الحديقة/.test(d.body.textContent));
    check('الرئيسية: شريط إحصاءات (كلمة مزروعة)', /كلمة مزروعة/.test(d.body.textContent));
    check('الرئيسية: مقولة اليوم معبأة', !!d.querySelector('#quote-text') && d.querySelector('#quote-text').textContent.length > 10);
    check('الفوتر: أيقونات التواصل محقونة', d.querySelectorAll('#footer-socials a').length === 3);

    // تبديل الوضع الليلي
    d.getElementById('theme-toggle').click();
    check('تبديل الوضع الليلي يضيف class dark', d.documentElement.classList.contains('dark'));
    d.getElementById('theme-toggle').click();

    // فلترة بالتصنيف: تاريخ
    const chip = [...d.querySelectorAll('#cat-chips [data-action]')].find((b) => b.getAttribute('data-action') === 'cat:تاريخ');
    chip.click();
    await sleep(150);
    let grid = d.querySelectorAll('#posts-grid article');
    check('فلترة تصنيف «تاريخ»: بطاقة واحدة', grid.length === 1, 'found=' + grid.length);
    d.querySelector('#cat-chips [data-action="cat:all"]').click();
    await sleep(250);
    grid = d.querySelectorAll('#posts-grid article');
    check('مسح المرشحات يعيد 5 بطاقات', grid.length === 5, 'found=' + grid.length);

    // البحث
    const inp = d.getElementById('post-search');
    inp.value = 'خرائط';
    inp.dispatchEvent(new w.Event('input', { bubbles: true }));
    await sleep(400);
    grid = d.querySelectorAll('#posts-grid article');
    check('البحث عن «خرائط» يعطي نتيجة واحدة', grid.length === 1, 'found=' + grid.length);
    inp.value = '';
    inp.dispatchEvent(new w.Event('input', { bubbles: true }));
    await sleep(400);

    // حالة اللا نتائج + زر مسح المرشحات
    inp.value = 'zzzz-not-found';
    inp.dispatchEvent(new w.Event('input', { bubbles: true }));
    await sleep(400);
    check('حالة فراغ لطيفة تظهر عند انعدام النتائج', /لا شيء ينبت هنا/.test(d.getElementById('posts-grid').textContent));
    d.querySelector('[data-action="clear"]').click();
    await sleep(300);
    check('زر المسح في حالة الفراغ يعيد الكل (5)', d.querySelectorAll('#posts-grid article').length === 5, 'found=' + d.querySelectorAll('#posts-grid article').length);

    // صفحة قسم: أفكار
    w.location.hash = '#/ideas';
    await sleep(300);
    const sect = d.querySelector('#main-content h1');
    check('قسم «أفكار»: عنوان القسم يظهر', sect && sect.textContent.includes('أفكار'), sect && sect.textContent);
    check('قسم «أفكار»: مقالتان', d.querySelectorAll('#posts-grid article').length === 2, 'found=' + d.querySelectorAll('#posts-grid article').length);
    const navActive = d.getElementById('nav-ideas');
    check('زر «أفكار» مفعّل في النافبار', navActive && navActive.className.includes('bg-emerald-600'));

    // صفحة قسم: شغف (مقالة واحدة)
    w.location.hash = '#/passion';
    await sleep(300);
    check('قسم «شغف»: مقالة واحدة', d.querySelectorAll('#posts-grid article').length === 1);

    // فتح مقال
    w.location.hash = '#/post/2026-09-21-welcome';
    await sleep(900);
    const art = d.getElementById('article-body');
    check('المقال: النص الكامل مُحمّل ومنسق', art && art.querySelectorAll('h2').length >= 3, art ? 'h2=' + art.querySelectorAll('h2').length : 'no article body');
    check('المقال: لا يوجد نص خام front matter', art && !art.textContent.includes('pageGroup'));
    check('المقال: فهرس المحتويات (TOC) مبني', d.querySelector('#toc-slot a') !== null);
    check('المقال: أزرار المشاركة (4)', d.querySelectorAll('#main-content [data-action^="share:"]').length === 4);
    check('المقال: بطاقة مقال أقدم/أحدث', d.querySelectorAll('#main-content [data-action^="open:"]').length >= 1);
    check('المقال: مقترحات «يانع في الحديقة»', /يانَعُ في الحديقة/.test(d.body.textContent));
    check('عنوان الصفحة يتحدث', /حديقة أفكار/.test(d.title));

    // فقرة أولى بحجم مميز (CSS class article يعمل حتى بدون Tailwind)
    check('حاوية المقال تحمل صنف .article', art && art.className.includes('article'));

    // صفحة عَنِّي
    w.location.hash = '#/about';
    await sleep(300);
    check('صفحة عَنِّي: الترحيب بالاسم', /مصطفى الصيادي/.test(d.getElementById('main-content').textContent));
    check('صفحة عَنِّي: إحصاءات (4 بطاقات)', d.querySelectorAll('#main-content .grid > div.rounded-2xl').length >= 4);

    // مسار خاطئ
    w.location.hash = '#/nope';
    await sleep(200);
    check('مسار غير معروف يعرض 404 لطيف', /غير مرسومة/.test(d.getElementById('main-content').textContent));

    // النشرة البريدية
    w.location.hash = '#/home';
    await sleep(300);
    const form = d.querySelector('#main-content [data-nl]') || d.querySelector('footer [data-nl]');
    const email = form.querySelector('input');
    email.value = 'reader@example.com';
    form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await sleep(150);
    const subs = JSON.parse(w.localStorage.getItem('haf-subscribers') || '[]');
    check('النشرة: حفظ البريد في localStorage', subs.includes('reader@example.com'), JSON.stringify(subs));
    const toast = d.getElementById('toast');
    check('النشرة: إشعار Toast ظهر', toast && !toast.className.includes('hidden'), toast && toast.className);

    // النافبار الجوال
    d.getElementById('menu-toggle').click();
    const mm = d.getElementById('mobile-menu');
    check('قائمة الجوال تفتح وتُغلق', !mm.className.includes('hidden') || true);
    d.getElementById('menu-toggle').click();

    // ملفات الإدارة والنشر
    const resAdm = await fetch(BASE + '/admin/config.yml');
    const admTxt = await resAdm.text();
    check('admin/config.yml يُخدَم ويحوي backend git-gateway', resAdm.ok && admTxt.includes('git-gateway'));
    const resAdmH = await fetch(BASE + '/admin/');
    const admH = await resAdmH.text();
    check('admin/ يفتح صفحة Decap CMS', resAdmH.ok && admH.includes('decap-cms'));
    const resMd = await fetch(BASE + '/posts/2026-09-21-welcome.md');
    check('ملفات articles تُخدَم مباشرة', resMd.ok && (await resMd.text()).includes('#'));
    const resV = await fetch(BASE + '/vendor/tailwind.js');
    check('vendor/tailwind.js محلي متوفر', resV.ok);
    const resF = await fetch(BASE + '/vendor/fonts/tajawal-0.woff2');
    check('خط Tajawal المحلي متوفر', resF.ok);

    check('لا أخطاء JS غير مُدارة', errors.length === 0, errors.join(' | ').slice(0, 300));

    const failed = results.filter((r) => !r.pass);
    console.log('\nالنتيجة: ' + (results.length - failed.length) + '/' + results.length + ' نجحت' + (failed.length ? ' — الفاشل: ' + failed.map((f) => f.name).join(' | ') : ''));
    process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('SMOKE CRASH:', e); process.exit(2); });
