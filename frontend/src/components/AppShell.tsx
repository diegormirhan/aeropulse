import { Activity, BookOpen, ChartNoAxesCombined, Database, Gauge, Plane } from "lucide-react";

import type { AppView } from "../types";

interface AppShellProps {
  activeView: AppView;
  children: React.ReactNode;
  onNavigate: (view: AppView) => void;
}

const navItems = [
  { view: "fleet" as const, label: "Fleet", icon: Gauge },
  { view: "engine" as const, label: "Engine", icon: Activity },
  { view: "model" as const, label: "Model", icon: ChartNoAxesCombined },
  { view: "docs" as const, label: "Docs", icon: BookOpen },
];

export function AppShell({ activeView, children, onNavigate }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="side-rail">
        <button aria-label="Open fleet command" className="wordmark" onClick={() => onNavigate("fleet")} type="button">
          <Plane aria-hidden="true" size={21} />
          <span>AP</span>
        </button>
        <nav aria-label="Primary navigation" className="side-rail__nav">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              aria-current={activeView === view ? "page" : undefined}
              className="rail-link"
              data-active={activeView === view}
              key={view}
              onClick={() => onNavigate(view)}
              type="button"
            >
              <Icon aria-hidden="true" size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-dataset" title="NASA C-MAPSS FD001">
          <Database aria-hidden="true" size={17} />
          <span>FD001</span>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar__identity">
            <strong>AeroPulse</strong>
            <span>Fleet prognostics</span>
          </div>
          <div className="system-state"><span aria-hidden="true" /> Model ready · local inference</div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="footer-line">
          <span>AeroPulse / NASA C-MAPSS FD001</span>
          <span>Educational prognostics system · not safety-certified</span>
        </footer>
      </div>
    </div>
  );
}
