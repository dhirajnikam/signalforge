# SignalForge

An early-stage **web + RSS + X/Twitter (via configurable sources)** intelligence engine.

- Ingest: RSS feeds, web pages, and (optionally) Twitter/X via external feeds (API or bridges)
- Normalize: single stream of items (time, source, entities)
- Analyze: summaries + relationship mapping + impact notes
- Predict: lightweight scenarios with confidence labels
- Filter: by company / ticker / keywords / event types

## What’s in this repo
- `apps/api` — Node.js (Fastify) API + scheduler + SQLite storage
- `apps/docs` — product walkthrough website (static) deployed to **GitHub Pages**

## Quickstart (local)

### 1) Requirements
- Node.js 22+

### 2) Install
```bash
cd apps/api
npm install
```

### 3) Configure
Copy example config:
```bash
cp .env.example .env
```

Set at least:
- `OPENAI_API_KEY` (optional but recommended)

### 4) Run
```bash
npm run dev
```

API: http://localhost:8787

## Deploy docs (GitHub Pages)
This repo includes a GitHub Actions workflow that publishes `apps/docs/dist/` to GitHub Pages.

## License
MIT
