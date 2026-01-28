const repoUrl = 'https://github.com/dhirajnikam/signalforge';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <header class="nav">
      <div class="brand">
        <div class="logo">SF</div>
        <div>
          <div class="brandName">SignalForge</div>
          <div class="brandTag">RSS + Twitter (via RSS) → SQLite → (optional) LLM brief</div>
        </div>
      </div>
      <div class="navLinks">
        <a class="link" href="#quickstart">Quickstart</a>
        <a class="link" href="#sources">Sources</a>
        <a class="link" href="#pages">GitHub Pages</a>
        <a class="btn" href="${repoUrl}" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </header>

    <section class="hero">
      <div class="heroText">
        <h1>Build a high‑signal intel stream.</h1>
        <p>
          SignalForge ingests <b>RSS</b>, <b>web pages</b>, and <b>Twitter/X without API keys</b> (via RSSHub/Nitter‑style feeds), stores everything
          in <b>SQLite</b>, and produces a structured brief. If your runtime already has OpenAI credentials, it will automatically generate richer
          summaries and scenario predictions. Otherwise, it runs in <b>no‑LLM mode</b>.
        </p>
        <div class="pillRow">
          <span class="pill">Next.js full‑stack</span>
          <span class="pill">No keys required</span>
          <span class="pill">SQLite</span>
          <span class="pill">RSSHub/Nitter ingestion</span>
        </div>
        <div class="ctaRow">
          <a class="btn primary" href="${repoUrl}" target="_blank" rel="noreferrer">View repo</a>
          <a class="btn" href="#quickstart">Run locally</a>
        </div>
      </div>
      <div class="heroCard">
        <div class="heroCardTitle">API endpoints</div>
        <div class="code small">GET  /api/health\nPOST /api/refresh\nGET  /api/items\nGET  /api/brief?companyOrEvent=Tesla</div>
        <div class="divider"></div>
        <div class="heroCardTitle">Source example</div>
        <div class="code small">[
  {"kind":"rss","name":"Techmeme","url":"https://www.techmeme.com/feed.xml"},
  {"kind":"twitter","name":"OpenAI","handle":"openai","provider":"auto"}
]</div>
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <div class="kicker">Ingest</div>
        <h3>RSS, web, and Twitter/X (no keys)</h3>
        <p>Twitter ingestion uses RSS‑style bridges (RSSHub by default; Nitter fallback). No official API keys are required.</p>
      </div>
      <div class="card">
        <div class="kicker">Normalize</div>
        <h3>One stream</h3>
        <p>Everything lands in a single SQLite timeline with per‑source metadata and deduped IDs.</p>
      </div>
      <div class="card">
        <div class="kicker">Analyze</div>
        <h3>Auto‑detect LLM</h3>
        <p>If <code>OPENAI_API_KEY</code> exists in the server environment, SignalForge generates structured summaries + predictions.</p>
      </div>
    </section>

    <section id="quickstart" class="section">
      <h2>Quickstart (local)</h2>
      <ol class="steps">
        <li>
          <b>Install</b>
          <div class="code">cd apps/web\nnpm install</div>
        </li>
        <li>
          <b>Set sources</b>
          <div class="hint">Provide sources via environment variable (no .env required).</div>
          <div class="code">export SOURCES_JSON='[{"kind":"rss","name":"Techmeme","url":"https://www.techmeme.com/feed.xml"}]'</div>
        </li>
        <li>
          <b>Run</b>
          <div class="code">npm run dev</div>
          <div class="hint">Open <code>http://localhost:3000</code> and click “Refresh now”.</div>
        </li>
      </ol>
      <div class="note">
        <b>Optional:</b> If your environment already exports <code>OPENAI_API_KEY</code>, SignalForge will use it automatically. If not, you still get a
        working pipeline (no‑LLM mode).
      </div>
    </section>

    <section id="sources" class="section">
      <h2>Twitter/X sources (no keys)</h2>
      <p>
        Add a <code>twitter</code> source and choose a provider. <code>auto</code> tries RSSHub first, then Nitter.
        You can override providers via <code>RSSHUB_BASE_URL</code> and <code>NITTER_BASE_URL</code>.
      </p>
      <div class="code">export SOURCES_JSON='[
  {"kind":"twitter","name":"Elon","handle":"elonmusk","provider":"auto"}
]'</div>
      <div class="hint">Default RSSHub: <code>https://rsshub.app/twitter/user/&lt;handle&gt;</code></div>
      <div class="hint">Default Nitter: <code>https://nitter.net/&lt;handle&gt;/rss</code> (availability varies by instance)</div>
    </section>

    <section id="pages" class="section">
      <h2>GitHub Pages walkthrough</h2>
      <p>
        This repository includes a GitHub Actions workflow that builds the marketing/walkthrough site in <code>apps/docs</code> and publishes it to
        GitHub Pages.
      </p>
      <ol class="steps">
        <li><b>Enable Pages</b> → Repo Settings → Pages → Source: <i>GitHub Actions</i></li>
        <li><b>Push to main</b> (or run the workflow manually)</li>
        <li><b>Wait for the deploy</b> → Actions → “Deploy to GitHub Pages”</li>
      </ol>
      <div class="note">
        The full‑stack app lives in <code>apps/web</code> (server runtime). GitHub Pages hosts only the static docs/walkthrough.
      </div>
    </section>

    <footer class="footer">
      <span class="muted">© ${new Date().getFullYear()} SignalForge</span>
      <span class="dot">·</span>
      <a class="link" href="${repoUrl}" target="_blank" rel="noreferrer">Source</a>
    </footer>
  </div>
`;
