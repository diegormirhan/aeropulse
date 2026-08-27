import { CheckCircle2, TriangleAlert } from "lucide-react";

import { formatNumber } from "../lib/risk";
import type { ModelReport } from "../types";

interface ModelLabProps {
  report: ModelReport;
}

export function ModelLab({ report }: ModelLabProps) {
  const selected = report.comparisons.find((item) => item.name === report.selected_model) ?? report.comparisons.at(-1);

  return (
    <div className="view view--model">
      <div className="view-titlebar view-titlebar--model">
        <div>
          <h1>Model lab</h1>
          <p>Measured evidence behind every fleet alert.</p>
        </div>
        <span className="selected-model"><CheckCircle2 aria-hidden="true" size={17} /> {report.selected_model}</span>
      </div>

      <section className="model-scoreboard" aria-label="Selected model test metrics">
        <div><span>Test RMSE</span><strong>{formatNumber(selected?.test?.rmse ?? 0, 2)}</strong><small>cycles</small></div>
        <div><span>Test MAE</span><strong>{formatNumber(selected?.test?.mae ?? 0, 2)}</strong><small>cycles</small></div>
        <div><span>NASA score</span><strong>{formatNumber(selected?.test?.nasa_score ?? 0, 1)}</strong><small>asymmetric penalty</small></div>
        <div><span>Interval coverage</span><strong>{formatNumber(report.interval_coverage, 0)}%</strong><small>of test engines</small></div>
      </section>

      <section className="model-workbench">
        <article className="comparison-panel">
          <div className="section-heading">
            <h2>Candidate comparison</h2>
            <p>Engine-level holdout prevents the same engine appearing in training and validation.</p>
          </div>
          <table className="comparison-table">
            <thead><tr><th>Candidate</th><th>Val. RMSE</th><th>Val. MAE</th><th>Val. NASA</th><th>Decision</th></tr></thead>
            <tbody>
              {report.comparisons.map((candidate) => (
                <tr data-selected={candidate.name === report.selected_model} key={candidate.name}>
                  <td><strong>{candidate.name}</strong><span>{candidate.role}</span></td>
                  <td>{formatNumber(candidate.validation.rmse, 2)}</td>
                  <td>{formatNumber(candidate.validation.mae, 2)}</td>
                  <td>{formatNumber(candidate.validation.nasa_score, 0)}</td>
                  <td>{candidate.name === report.selected_model ? "Selected" : "Reference"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="training-spec">
            <div><dt>Training rows</dt><dd>{report.training_rows.toLocaleString("en-US")}</dd></div>
            <div><dt>Validation rows</dt><dd>{report.validation_rows.toLocaleString("en-US")}</dd></div>
            <div><dt>Test engines</dt><dd>{report.test_engines}</dd></div>
            <div><dt>Target</dt><dd>{report.target}</dd></div>
          </dl>
        </article>

        <article className="importance-panel">
          <div className="section-heading">
            <h2>Global feature importance</h2>
            <p>Top split-gain signals in the selected window model.</p>
          </div>
          <div className="importance-list">
            {report.feature_importance.slice(0, 8).map((feature) => (
              <div key={feature.feature}>
                <span>{feature.label}</span>
                <div className="importance-track"><span style={{ "--importance": `${feature.importance}%` } as React.CSSProperties} /></div>
                <output>{formatNumber(feature.importance, 1)}%</output>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="limitations" aria-labelledby="limitations-title">
        <div><TriangleAlert aria-hidden="true" size={21} /><h2 id="limitations-title">Operational boundaries</h2></div>
        <ul>{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </div>
  );
}
