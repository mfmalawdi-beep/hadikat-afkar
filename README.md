# 🌿 حديقة أفكار — Mustafa Al-Sayyadi Digital Blog

Complete personal blog with a management panel — no framework or Node.js build:
Static HTML + CSS + JS, with content in Markdown files and a panel for publishing from the browser.

## Project Structure

```
├── index.html            Main site page (single-page app)
├── app.js                Site logic: routing, search, articles, dark mode
├── styles.css            Styles for article appearance and animations
├── build.js              Script to generate article index from posts/*.md files
├── posts/                Articles (Markdown + front matter)
│   └── posts.json        Generated index — do not edit manually
├── admin/
│   ├── index.html        Decap CMS panel
│   └── config.yml        CMS configuration (field definitions)
├── images/uploads/       Images uploaded from panel
├── vendor/               Local copy of libraries (Tailwind, marked, Tajawal font)
└── netlify.toml          Netlify deployment configuration
```

## How It Works

1. You write or edit articles from the panel (`/admin/`) or directly from the `posts/` folder.
2. Running `node build.js` generates the `posts/posts.json` index (it runs automatically when deploying to Netlify).
3. The site reads the index then loads the article text when opening, and displays it with marked.js.

## Running Locally

```bash
python3 -m http.server 8080      # or npm run serve to build index and start server
# Open http://localhost:8080
```

> ⚠️ Do not open the site by double-clicking index.html (file:// protocol):
> the browser will not be able to load posts/posts.json and article files.

## Editing Content Without the Panel

Add a file inside `posts/` named `YYYY-MM-DD-slug.md` in this format:

```markdown
---
title: "New article"
date: 2026-10-01T12:00:00.000Z
pageGroup: "ideas"     # passion | ideas | facts | library
category: "علوم"       # تاريخ | فلسفة | جغرافيا | علوم | طب | هندسة | تكنولوجيا | فنون
featured: false
tags: ["وسم-1", "وسم-2"]
summary: "Short description shown on the card"
---

Write here using Markdown, and use `##` for subheadings to automatically generate the article table of contents.
```

Then run `node build.js`.

## Decap CMS Panel

- **On Netlify (recommended):**
  1. Upload this folder to a GitHub repository.
  2. On Netlify: Add new site ← connect the repository. The build command and publish folder are already set in `netlify.toml`.
  3. From Site settings → Identity: Enable identity service and invite yourself.
  4. From Site settings → Identity → Services: Enable **Git Gateway**.
  5. Open `https://your-site.netlify.app/admin/` and log in — any saving or publishing creates a commit in the repository, and the site is automatically redeployed.
  6. Uncomment the `site_url` and `display_url` lines in `admin/config.yml`.
- **During development:** Run `npm run cms` (starts a local proxy) then open `/admin/` via the local server — you can edit and save to files without a Git account.

## Customization

- **Author data and social media links:** At the beginning of `app.js` (`SITE` variable). Replace `USERNAME` in social media links and email address.
- **Sections, categories, and their colors and emojis:** `PAGES` and `CATEGORIES` variables in `app.js` (and don't forget to match `admin/config.yml` if you change a field).
- **Quotes in the quote-of-the-day widget:** `QUOTES` array.
- **Monthly email newsletter:** Currently stores emails in localStorage only for testing — connect it to Buttondown/EmailOctopus/Formspree by replacing the submit event in `initEvents` in `app.js`.
- **Fonts:** Tajawal is stored locally in `vendor/` so the site works without internet. You can remove the folder and it will fall back to a system font.

## Notes

- If the site is offline (no internet/CDN), the site will fall back to the locally stored copy of the libraries, and if they are also lost, the site displays a simplified version of the articles from built-in data.
- Article content comes from your own files, and Markdown is converted using `marked` — if you open the panel to others for publishing, sanitize the input (e.g., add DOMPurify).
- The panel cannot save without Git Gateway or the local proxy — this is expected for fully static sites.

## فحص سريع

يوجد اختبار دخاني آلي في `test/smoke.js` يحمّل الموقع في بيئة jsdom ويتحقق من الصفحات والبحث والفلاتر وعرض المقالات:

```bash
npm i -D jsdom        # مرة واحدة فقط
python3 -m http.server 8080 &   # شغّل الخادم أولاً
node test/smoke.js    # المتوقع: 36/36
```

## License

Content and code © 2026 Mustafa Al-Sayyadi — all rights reserved (unless you change it).
