const repoUrl = 'https://github.com/dhirajnikam/signalforge';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="container">
    <div class="hero">
      <div class="h1">SignalForge</div>
      <div class="sub">A unified intelligence engine that ingests <b>web</b>, <b>RSS</b>, and optional <b>X/Twitter</b> sources, then produces <b>analysis</b> and <b>scenario-style predictions</b> with confidence labels. Filter by <b>company</b> or <b>event</b>.</div>
      <div class="badges">
        <div class="badge">Ingest: RSS + Web</div>
        <div class="badge">Analyze: OpenAI (optional)</div>
        <div class="badge">Predict: scenarios + confidence</div>
        <div class="badge">API: Fastify + SQLite</div>
        <div class="badge">Deploy: GitHub Pages</div>
      </div>
      <a class="btn" href="${repoUrl}">View the repo</a>
    </div>

    <div class="grid">
      <div class="card">
        <h3>1) Configure sources</h3>
        <p>Edit <code>SOURCES_JSON</code> (RSS + web URLs). Add your company/event keywords at query time.</p>
      </div>
      <div class="card">
        <h3>2) Ingest + normalize</h3>
        <p>SignalForge stores items in SQLite and keeps a single stream of updates across all sources.</p>
      </div>
      <div class="card">
        <h3>3) Analyze</h3>
        <p>Summaries + entities + sentiment + impact notes.</p>
      </div>
      <div class="card">
        <h3>4) Predict</h3>
        <p>Produces 24–72h scenarios with probability + confidence (low/medium/high).</p>
      </div>
    </div>

    <div class="section">
      <h3>Quickstart</h3>
      <div class="code">cd apps/api\ncp .env.example .env\n# set OPENAI_API_KEY (optional)\nnpm install\nnpm run dev</div>
      <div class="footer">API: <code>GET /items</code>, <code>POST /refresh</code>, <code>GET /brief?companyOrEvent=Tesla</code></div>
    </div>

    <div class="section">
      <h3>Product story</h3>
      <p class="sub">The goal is to move from isolated feeds to a single "what matters" stream. Relationships between items (policy → markets → company impact) are captured in the analysis output, and the predictions provide scenario framing rather than pretending certainty.</p>
    </div>

    <div class="footer">© 2026 — SignalForge</div>
  </div>
`;
