# Spider Identifier

A world-class, AI-powered spider identification website. Upload a photo and identify spider species in seconds — with venom-risk indicators, look-alike alerts, a species library, expert blog guides, and a full content-management dashboard.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase**, and **sharp** (automatic WebP image optimization).

---

## ✨ Features

- **Instant identifier tool** — drag-and-drop photo upload with an animated analysis flow and confidence-scored results.
- **World-class design** — warm-obsidian theme, Gold→Crimson brand gradient, parallax gradient "globs" that drift on scroll, glassmorphism, curvy section dividers, shimmer + typewriter hero, animated counters.
- **Top scroll-progress bar** + a circular **back-to-top control that shows the exact scroll %**.
- **Custom gradient scrollbar** matching the brand colors.
- **Species library** — filterable by venom risk, each with a full profile page.
- **Spider anatomy guide** — interactive, annotated illustration.
- **Blog** — searchable, category-filtered, Markdown-powered, with eight publish-ready articles seeded by default.
- **Admin dashboard** — create/edit/delete posts, a Markdown editor with live preview, image uploads that are **auto-converted to optimized WebP**, plus a contact + subscriber inbox.
- **WebP-only image policy** — the app ships zero raster JPG/PNG assets (all art is vector SVG/CSS), and any image uploaded through the admin is converted to WebP before it touches the database.
- **Fully responsive** — pixel-polished on mobile, tablet and desktop.
- **SEO-ready** — per-page metadata, Open Graph, JSON-LD structured data, dynamic sitemap and robots.

> **Works before any setup.** The site is fully functional out of the box using bundled content. Add Supabase keys later to power the database, contact form and admin dashboard.

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file (a template is already provided)
#    Edit .env.local and follow the step-by-step guide inside it.

# 3. Run the dev server
npm run dev
```

Open **http://localhost:3000**.

You can browse the entire site immediately — Supabase is optional until you want the database, contact form and admin.

---

## 🔑 Environment variables

All keys live in **`.env.local`** (git-ignored, never pushed). That file contains a **numbered, step-by-step guide** for finding every value. Summary:

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your domain (use `http://localhost:3000` for local). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (secret). |
| `ADMIN_EMAILS` | Comma-separated emails allowed into `/admin`. |
| `RESEND_API_KEY` *(optional)* | resend.com → API Keys (for contact-form email alerts). |
| `CONTACT_NOTIFY_EMAIL` *(optional)* | The address to notify on new messages. |

---

## 🗄️ Supabase setup (one time)

1. Create a free project at **[supabase.com](https://supabase.com)**.
2. Open **Project Settings → API** and copy the three keys into `.env.local`.
3. Open the **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates all tables, row-level-security policies and the public `media` storage bucket.
4. Seed the starter species + blog posts:
   ```bash
   npm run seed
   ```
   *(or paste the data manually — the schema works either way.)*
5. Create your admin user: **Authentication → Users → Add user**, enter the same email you put in `ADMIN_EMAILS`, tick **Auto Confirm**.
6. Visit **`/admin`** and sign in.

---

## 🖼️ Image policy — WebP everywhere

This project never ships JPG/PNG. The design uses crisp vector SVG/CSS art, and:

- **Admin uploads** are converted to optimized WebP by `sharp` before upload (`src/app/api/upload/route.ts`).
- **Bulk-convert** any images you drop into a folder:
  ```bash
  npm run convert:webp            # converts everything in /public
  node scripts/convert-to-webp.mjs ./my/folder --delete
  ```

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Lint the project. |
| `npm run seed` | Seed Supabase with the bundled species + blog content. |
| `npm run convert:webp` | Convert raster images in `/public` to WebP. |

---

## 🧱 Project structure

```
src/
  app/                 # App Router pages, API routes, admin
    (panel)/           # auth-guarded admin route group
    api/               # upload (WebP), contact, subscribe, admin posts
  components/
    brand/             # logo / spider mark
    fx/                # Reveal, Typewriter, Counter, Marquee, BackdropGlobs…
    layout/            # Navbar, Footer, ScrollProgress, ScrollToTop, PageHero
    sections/          # homepage sections
    identify/          # the identifier tool + anatomy illustration
    ui/                # buttons, cards, badges
    admin/             # dashboard shell + post editor
  content/             # bundled species, blog, anatomy, legal content
  lib/                 # supabase clients, data layer, auth, webp, utils
supabase/              # schema.sql + notes
scripts/               # seed + convert-to-webp
```

---

## ☁️ Deployment

Deploy to any Node host (Vercel recommended):

1. Push to your Git provider.
2. Import the repo into your host.
3. Add the same environment variables from `.env.local` in the host's dashboard.
4. Deploy.

---

## 🛡️ Safety

Spider Identifier returns the closest AI match, not a guaranteed identification or medical diagnosis. The UI surfaces this clearly. For any suspected venomous bite, users are directed to seek professional medical advice.

---

© Spider Identifier. All rights reserved.
