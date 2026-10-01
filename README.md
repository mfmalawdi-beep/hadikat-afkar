# حديقة أفكار | Garden of Ideas

Arabic-first bilingual blog, now prepared for Decap CMS on Netlify and Brevo double-opt-in newsletter signup.

**Deployment wiring is implemented, not connected to the owner's accounts.** Read [SETUP-AR.md](SETUP-AR.md) for the activation checklist. `/admin/setup.html` provides the same guidance on the deployed site.

## Run and build

```sh
npm install
npm run dev
npm run build
npm run test:integration
```

Node.js 22 is recommended. Development binds to 0.0.0.0. `npm run build` first builds the public content index from Markdown, then runs Vite. Deploy using Git-connected Netlify with the included `netlify.toml`. Static drag-and-drop deployment or the old standalone HTML preview cannot provide Git editing or Netlify Functions.

## Writing and publishing

- Canonical content: `content/posts/*.md`.
- Admin UI: `/admin/`, Decap CMS 3.16.3, locally hosted vendor bundle.
- Auth: Netlify Identity + Git Gateway; configure invite-only registration and invite trusted editors. No default admin password.
- Saving a draft commits Markdown with `draft: true`; the content builder excludes it from `public/content.json` and the production site. Drafts are still visible to repository readers, so use a private GitHub repository.
- Publish by setting `draft: false` and saving. Git-connected Netlify rebuilds the site.
- English translations live in each article's optional `translation` object. All three fields (`title`, `summary`, `body`) are required to use that translation. New content without a translation uses its Arabic original and displays a translation notice in English mode.
- Cover uploads: `public/uploads`, referenced as `/uploads/...`. Use local images rather than remote URLs.
- Public generated files: `public/content.json` and `public/english.json`. Do not edit them directly; the next build overwrites them.
- Changes made manually to Markdown are watched by Vite in development.

## Newsletter

Frontend posts to `/.netlify/functions/subscribe`. The Netlify function calls Brevo's DOI endpoint; it does not directly add unconfirmed contacts to the list. Brevo holds subscription data. No API keys or list of subscribers are exposed to the browser.

Configure `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`, `SITE_URL` privately in Netlify (Functions scope). Use an active DOI template with `{{ params.DOIurl }}` and a verified sender. Redeploy after configuration. Missing credentials return a clear unavailable state, not a fake signup success. Local Vite returns 503 intentionally; real end-to-end checks require a configured Netlify deployment.

Protection: explicit consent, fixed server-side list/template/redirect, origin checks, payload/email validation, honeypot, no contact enumeration, 12-second upstream timeout, and Netlify rate limiting (5 requests/minute per IP/domain). Rate limiting is enforced by Netlify, not by direct Node tests. Add CAPTCHA if abuse is observed. No code can guarantee email delivery; test it with the actual account.

`public/privacy.html` explains data handling but needs the owner's real contact channel and retention-policy review before launch. Campaign creation, sending, unsubscribe management, and data deletion requests are handled through Brevo. Monthly email campaigns are not automatically scheduled by this project.

## Content preservation

The original public source is https://hadikat-afkar.netlify.app/. The private admin dashboard was not accessed. All six original Arabic article bodies are retained in the new Markdown files. Original snapshots are in `archive/original-posts` and `archive/posts-source.json`, outside the published directory. Source assertions were preserved, not independently fact-checked. English versions are editorial translations added for this redesign.

The garden image is AI-generated; article photographs are illustrative Unsplash images. Fonts and images are locally hosted. Styling uses the available UI UX Pro Max and Taste Skill guidance: calm editorial design, forest green and warm paper, Tajawal/Amiri typography, logical RTL/LTR layout, reduced motion, focus states and responsive grids.

## Site features

Arabic/English switching, full-text search, category/section filters, sorting, article bookmarks, light/dark theme, reading table of contents/progress, text-size toggle, sharing, and mobile navigation. Personal preferences are stored only in localStorage. Markdown is sanitized with DOMPurify.

## Tests

- `npm run test:integration`: mocked Brevo request/errors, missing configuration, origin/consent/email validation, payload limits, draft exclusion, new-post translations after reordering, and unchanged source article bodies.
- `node tests/check.mjs`: browser interaction checks, requires running dev server on 5173 and Playwright browser installed.
- `node tests/accessibility.mjs`: automated homepage accessibility / overflow checks.

No actual Brevo messages were sent during integration tests, and successful local tests do not verify Identity permissions, Git Gateway, or production email delivery.
