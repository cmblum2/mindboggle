<h1 align="center">🧠 MindBoggle</h1>

<p align="center">
  <b>AI-powered brain training.</b> Personalized cognitive exercises with LLM-generated
  feedback to help you build and keep mental sharpness.
</p>

---

## What it does
- 🎯 **Personalized exercises** — sessions adapt to how you're performing.
- 🤖 **AI feedback** — an LLM explains your results and coaches your next round, so practice
  is guided instead of just scored.
- 📈 **Progress tracking** — your cognitive trends over time, backed by Supabase auth + Postgres.
- 📱 **Cross-platform** — runs on the web and packages to mobile via Capacitor.

## Tech stack
| Layer | Tools |
|-------|-------|
| Frontend | **React** · **TypeScript** · **Vite** · **Tailwind CSS** · **shadcn/ui** |
| Backend / data | **Supabase** (auth + Postgres) |
| Mobile | **Capacitor** |

## Run locally
```bash
npm install
cp .env.example .env          # add your own Supabase project URL, id, and anon key
npm run dev                   # http://localhost:5173
```

Create a free project at [supabase.com](https://supabase.com), then fill in `.env`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...      # the public anon key (keep Row-Level Security ON)
```

## Notes
A personal project exploring **AI-assisted UX** — turning a plain quiz app into something that
coaches the user. Secrets are kept out of the repo (`.env` is gitignored; use `.env.example`).
