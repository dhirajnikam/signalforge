'use client';

import { useState } from 'react';

export default function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      const json = await res.json();
      setMsg(`Ingested ${json.ingested}, analyzed ${json.analyzed}`);
      // trigger a refresh
      window.location.reload();
    } catch (e: any) {
      setMsg(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button className="btn primary" onClick={run} disabled={loading}>
        {loading ? 'Refreshing…' : 'Refresh now'}
      </button>
      {msg ? <span className="small">{msg}</span> : null}
    </div>
  );
}
