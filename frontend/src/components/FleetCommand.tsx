import { ArrowUpRight, CircleAlert } from "lucide-react";

import { engineCode, formatNumber, riskLabel, sortEngines } from "../lib/risk";
import type { FleetResponse } from "../types";
import { EngineSchematic } from "./EngineSchematic";
import { FleetTable } from "./FleetTable";

interface FleetCommandProps {
  fleet: FleetResponse;
  onInspect: (engineId: number) => void;
}

export function FleetCommand({ fleet, onInspect }: FleetCommandProps) {
  const urgent = sortEngines(fleet.engines)[0];
  const { summary } = fleet;

  return (
    <div className="view view--fleet">
      <section className="command-deck" aria-labelledby="fleet-command-title">
        <div className="command-deck__status">
          <div className="status-heading">
            <h1 id="fleet-command-title">Fleet command</h1>
            <p>{summary.critical_engines} of {summary.total_engines} engines require immediate inspection.</p>
          </div>
          <div className="condition-tally" aria-label="Fleet risk summary">
            <div><strong>{summary.critical_engines}</strong><span>service now</span></div>
            <div><strong>{summary.watch_engines}</strong><span>watch</span></div>
            <div><strong>{summary.stable_engines}</strong><span>within range</span></div>
          </div>
        </div>

        <div className="command-deck__visual">
          <EngineSchematic health={urgent.health_score} risk={urgent.risk_band} />
        </div>

        <article className="urgent-readout">
          <div className="urgent-readout__label">
            <CircleAlert aria-hidden="true" size={19} />
            <span>Shortest predicted life</span>
          </div>
          <div className="urgent-readout__engine">{engineCode(urgent.engine_id)}</div>
          <div className="urgent-readout__number" aria-label={`${formatNumber(urgent.predicted_rul)} remaining cycles`}>
            <strong>{formatNumber(urgent.predicted_rul)}</strong>
            <span>cycles<br />remaining</span>
          </div>
          <dl className="spec-list">
            <div><dt>90% interval</dt><dd>{formatNumber(urgent.lower_rul, 0)}–{formatNumber(urgent.upper_rul, 0)} cycles</dd></div>
            <div><dt>Observed history</dt><dd>{urgent.observed_cycles} cycles</dd></div>
            <div><dt>Condition</dt><dd>{riskLabel(urgent.risk_band)}</dd></div>
          </dl>
          <button className="primary-action" onClick={() => onInspect(urgent.engine_id)} type="button">
            Inspect {engineCode(urgent.engine_id)}
            <ArrowUpRight aria-hidden="true" size={18} />
          </button>
        </article>

        <aside className="model-proof">
          <div>
            <span>Test MAE</span>
            <strong>{formatNumber(summary.test_mae, 1)}</strong>
            <small>cycles</small>
          </div>
          <p>Measured on 100 unseen FD001 engines. Prediction intervals cover {formatNumber(summary.interval_coverage, 0)}% of test outcomes.</p>
        </aside>
      </section>

      <FleetTable engines={fleet.engines} onInspect={onInspect} />
    </div>
  );
}
