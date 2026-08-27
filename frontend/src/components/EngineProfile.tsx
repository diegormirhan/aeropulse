import { ArrowLeft, Info } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { engineCode, formatNumber, riskLabel } from "../lib/risk";
import type { EngineDetail } from "../types";
import { EngineSchematic } from "./EngineSchematic";

interface EngineProfileProps {
  detail: EngineDetail;
  onBack: () => void;
}

export function EngineProfile({ detail, onBack }: EngineProfileProps) {
  const { engine } = detail;
  const [cycle, setCycle] = useState(engine.observed_cycles);
  const [sensorKey, setSensorKey] = useState(detail.sensors[0]?.key ?? "");
  const prediction = detail.prediction_series[Math.max(0, cycle - 1)] ?? detail.prediction_series.at(-1);
  const sensor = detail.sensors.find((item) => item.key === sensorKey) ?? detail.sensors[0];
  const visibleSensorPoints = useMemo(
    () => sensor?.points.filter((point) => point.cycle <= cycle) ?? [],
    [cycle, sensor],
  );

  return (
    <div className="view view--engine">
      <div className="view-titlebar">
        <button className="back-button" onClick={onBack} type="button"><ArrowLeft aria-hidden="true" size={18} /> Fleet command</button>
        <div>
          <h1>{engineCode(engine.engine_id)}</h1>
          <span className="risk-status" data-risk={engine.risk_band}><span aria-hidden="true" className="risk-status__mark" />{riskLabel(engine.risk_band)}</span>
        </div>
      </div>

      <section className="engine-overview" aria-label="Engine condition overview">
        <EngineSchematic health={engine.health_score} risk={engine.risk_band} />
        <div className="cycle-readout">
          <span>Prediction at cycle {cycle}</span>
          <strong>{formatNumber(prediction?.predicted_rul ?? engine.predicted_rul)}</strong>
          <small>remaining cycles</small>
          <div className="interval-readout">Range {formatNumber(prediction?.lower_rul ?? engine.lower_rul, 0)}–{formatNumber(prediction?.upper_rul ?? engine.upper_rul, 0)}</div>
        </div>
        <dl className="spec-list spec-list--large">
          <div><dt>Observed history</dt><dd>{engine.observed_cycles} cycles</dd></div>
          <div><dt>Health index</dt><dd>{engine.health_score}%</dd></div>
          <div><dt>Reference RUL</dt><dd>{formatNumber(engine.actual_rul)} cycles</dd></div>
          <div><dt>Absolute error</dt><dd>{formatNumber(engine.absolute_error)} cycles</dd></div>
        </dl>
      </section>

      <section className="analysis-grid">
        <article className="chart-panel chart-panel--prediction">
          <div className="section-heading">
            <h2>Remaining-life trajectory</h2>
            <p>The calibrated range widens around each point estimate.</p>
          </div>
          <div className="chart-frame" aria-label="Predicted remaining useful life by observed cycle">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={detail.prediction_series} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                <XAxis dataKey="cycle" stroke="var(--color-neutral)" tickLine={false} />
                <YAxis domain={[0, 130]} stroke="var(--color-neutral)" tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-ink)", border: 0, borderRadius: 4, color: "var(--color-paper)" }} />
                <Area dataKey="upper_rul" fill="var(--color-cobalt-soft)" fillOpacity={0.5} name="Upper range" stroke="none" type="monotone" />
                <Area dataKey="lower_rul" fill="var(--color-paper)" fillOpacity={1} name="Lower range" stroke="none" type="monotone" />
                <Line dataKey="predicted_rul" dot={false} name="Predicted RUL" stroke="var(--color-accent)" strokeWidth={2} type="monotone" />
                <ReferenceLine stroke="var(--color-ink)" strokeDasharray="3 4" x={cycle} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <label className="cycle-control">
            <span>Replay operating history</span>
            <input aria-label="Operating cycle" max={engine.observed_cycles} min={1} onChange={(event) => setCycle(Number(event.target.value))} type="range" value={cycle} />
            <output>{cycle} / {engine.observed_cycles}</output>
          </label>
        </article>

        <article className="chart-panel chart-panel--sensor">
          <div className="section-heading">
            <h2>Sensor trace</h2>
            <p>{sensor?.label} · {sensor?.unit}</p>
          </div>
          <div className="sensor-tabs" role="tablist" aria-label="Select a sensor trace">
            {detail.sensors.map((item) => (
              <button aria-selected={item.key === sensor?.key} data-active={item.key === sensor?.key} key={item.key} onClick={() => setSensorKey(item.key)} role="tab" type="button">{item.key.replace("sensor_", "S")}</button>
            ))}
          </div>
          <div className="chart-frame chart-frame--sensor" aria-label={`${sensor?.label} measurements`}>
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={visibleSensorPoints} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                <XAxis dataKey="cycle" stroke="var(--color-neutral)" tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--color-neutral)" tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-ink)", border: 0, borderRadius: 4, color: "var(--color-paper)" }} formatter={(value) => [`${formatNumber(Number(value))}%`, "Normalized"]} />
                <Line dataKey="normalized" dot={false} name={sensor?.label} stroke="var(--color-ink)" strokeWidth={1.7} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="contribution-panel" aria-labelledby="contribution-title">
        <div className="section-heading">
          <h2 id="contribution-title">Why the model made this estimate</h2>
          <p>Local XGBoost contributions at the selected engine’s final observed cycle.</p>
        </div>
        <div className="contribution-list">
          {detail.contributions.map((item) => (
            <div className="contribution-row" key={item.feature}>
              <div><strong>{item.label}</strong><span>{item.direction === "reduces" ? "reduces predicted life" : "extends predicted life"}</span></div>
              <div className="contribution-bar" data-direction={item.direction}><span style={{ "--impact": `${Math.min(100, Math.abs(item.contribution) * 3.5)}%` } as React.CSSProperties} /></div>
              <output>{item.contribution > 0 ? "+" : ""}{formatNumber(item.contribution)} cycles</output>
            </div>
          ))}
        </div>
        <p className="method-note"><Info aria-hidden="true" size={16} /> Contributions describe this model’s behavior; they are not causal claims about the physical engine.</p>
      </section>
    </div>
  );
}
