# SignalForge

An early-stage **web + RSS + X/Twitter (via configurable sources)** intelligence engine.

- Ingest: RSS feeds, web pages, and (optionally) Twitter/X via external feeds (API or bridges)
- Normalize: single stream of items (time, source, entities)
- Analyze: summaries + relationship mapping + impact notes
- Predict: lightweight scenarios with confidence labels
- Filter: by company / ticker / keywords / event types

## What’s in this repo
- `apps/web` — **Next.js full‑stack app** (UI + API routes) + SQLite storage
- `apps/api` — legacy Node.js (Fastify) API + scheduler + SQLite storage (still supported)
- `apps/docs` — product walkthrough website (static) deployed to **GitHub Pages**

## Quickstart (local)

### 1) Requirements
- Node.js 22+

### 2) Install
```bash
cd apps/web
npm install
```

### 3) Configure (no keys required)
SignalForge reads configuration from environment variables.

Minimum setup:
```bash
export SOURCES_JSON='[{"kind":"rss","name":"Techmeme","url":"https://www.techmeme.com/feed.xml"}]'
```

Optional LLM (auto‑detected):
- If `OPENAI_API_KEY` exists in your environment (e.g. Clawdbot runtime), SignalForge will use it.
- If not present, the app runs in **no‑LLM mode**.

### 4) Run
```bash
npm run dev
```

Web UI: http://localhost:3000
API: http://localhost:3000/api/health

## Twitter/X ingestion (no keys)
Add a twitter source (uses RSSHub by default, Nitter as fallback):

```bash
export SOURCES_JSON='[
  {"kind":"rss","name":"Techmeme","url":"https://www.techmeme.com/feed.xml"},
  {"kind":"twitter","name":"OpenAI","handle":"openai","provider":"auto"}
]'
```

Optional overrides:
- `RSSHUB_BASE_URL` (default `https://rsshub.app`)
- `NITTER_BASE_URL` (default `https://nitter.net`)

## Deploy docs (GitHub Pages)
This repo includes a GitHub Actions workflow that builds `apps/docs` and publishes it to GitHub Pages.

> Note: GitHub Pages hosts only the static walkthrough site. The full-stack app (`apps/web`) needs a server runtime.

## License
MIT
