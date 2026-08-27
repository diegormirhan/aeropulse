import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { engineCode, formatNumber, riskLabel, sortEngines } from "../lib/risk";
import type { EngineSummary, RiskBand } from "../types";

type Filter = "all" | RiskBand;

interface FleetTableProps {
  engines: EngineSummary[];
  onInspect: (engineId: number) => void;
}

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All engines" },
  { value: "critical", label: "Service now" },
  { value: "watch", label: "Watch closely" },
  { value: "stable", label: "Within range" },
];

export function FleetTable({ engines, onInspect }: FleetTableProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const visibleEngines = useMemo(
    () => sortEngines(engines).filter((engine) => filter === "all" || engine.risk_band === filter),
    [engines, filter],
  );

  return (
    <section className="fleet-ledger" aria-labelledby="fleet-ledger-title">
      <div className="section-heading section-heading--inline">
        <div>
          <h2 id="fleet-ledger-title">Fleet condition ledger</h2>
          <p>{visibleEngines.length} engines ordered by predicted remaining life.</p>
        </div>
        <div className="filter-set" role="group" aria-label="Filter engines by risk">
          {filters.map((item) => (
            <button
              className="filter-button"
              data-active={filter === item.value}
              key={item.value}
              onClick={() => setFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fleet-table-wrap">
        <table className="fleet-table">
          <thead>
            <tr>
              <th scope="col">Engine</th>
              <th scope="col">Condition</th>
              <th scope="col">Observed</th>
              <th scope="col">Predicted RUL</th>
              <th scope="col">Interval</th>
              <th scope="col">Health</th>
              <th scope="col"><span className="sr-only">Inspect</span></th>
            </tr>
          </thead>
          <tbody>
            {visibleEngines.map((engine) => (
              <tr key={engine.engine_id}>
                <td data-label="Engine"><strong>{engineCode(engine.engine_id)}</strong></td>
                <td data-label="Condition">
                  <span className="risk-status" data-risk={engine.risk_band}>
                    <span aria-hidden="true" className="risk-status__mark" />
                    {riskLabel(engine.risk_band)}
                  </span>
                </td>
                <td data-label="Observed">{engine.observed_cycles} cycles</td>
                <td data-label="Predicted RUL"><strong>{formatNumber(engine.predicted_rul)} cycles</strong></td>
                <td data-label="Interval">{formatNumber(engine.lower_rul, 0)}–{formatNumber(engine.upper_rul, 0)}</td>
                <td data-label="Health">
                  <span className="health-readout"><span>{engine.health_score}</span><span className="health-track" aria-hidden="true"><span style={{ "--health": `${engine.health_score}%` } as React.CSSProperties} /></span></span>
                </td>
                <td className="fleet-table__action">
                  <button
                    aria-label={`Inspect engine ${engine.engine_id}`}
                    className="icon-button"
                    onClick={() => onInspect(engine.engine_id)}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
