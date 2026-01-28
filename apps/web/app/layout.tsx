import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SignalForge',
  description: 'High-signal RSS + Twitter (via RSS) intelligence engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg" />
        <div className="container">
          {children}
          <footer className="footer">
            <span>SignalForge</span>
            <span className="muted">·</span>
            <a className="link" href="https://github.com/dhirajnikam/signalforge" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
