import { BookOpen, Braces, ExternalLink, Search, Server } from "lucide-react";
import { useMemo, useState } from "react";

import { listApiOperations, operationMatches } from "../lib/openapi";
import type { ApiOperation, OpenApiDocument } from "../types";

interface ApiDocsProps {
  document: OpenApiDocument;
}

export function ApiDocs({ document }: ApiDocsProps) {
  const [query, setQuery] = useState("");
  const operations = useMemo(() => listApiOperations(document), [document]);
  const visibleOperations = useMemo(
    () => operations.filter((operation) => operationMatches(operation, query)),
    [operations, query],
  );

  return (
    <div className="view view--docs">
      <header className="docs-titlebar">
        <div>
          <h1>API documentation</h1>
          <p>{document.info.summary ?? document.info.description ?? "The local contract behind AeroPulse."}</p>
        </div>
        <div className="docs-actions" aria-label="Open generated API documentation">
          <a className="secondary-action" href="/docs" rel="noreferrer" target="_blank">
            Swagger UI <ExternalLink aria-hidden="true" size={16} />
          </a>
          <a className="secondary-action" href="/redoc" rel="noreferrer" target="_blank">
            ReDoc <ExternalLink aria-hidden="true" size={16} />
          </a>
        </div>
      </header>

      <section className="api-contract" aria-label="OpenAPI contract summary">
        <div><Server aria-hidden="true" size={19} /><span>Local server</span><strong>{window.location.origin}</strong></div>
        <div><Braces aria-hidden="true" size={19} /><span>Specification</span><strong>OpenAPI {document.openapi}</strong></div>
        <div><BookOpen aria-hidden="true" size={19} /><span>Version</span><strong>{document.info.version}</strong></div>
        <div><span className="operation-count" aria-hidden="true">{operations.length}</span><span>Operations</span><strong>Live from /openapi.json</strong></div>
      </section>

      <label className="docs-search">
        <span>Search operations</span>
        <span className="docs-search__field">
          <Search aria-hidden="true" size={18} />
          <input
            aria-label="Search API operations"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Path, method, or summary"
            type="search"
            value={query}
          />
        </span>
      </label>

      {visibleOperations.length > 0 ? (
        <div className="docs-workbench">
          <nav aria-label="API operation index" className="operation-index">
            <h2>Operation index</h2>
            <p>{visibleOperations.length} of {operations.length} shown</p>
            <div>
              {visibleOperations.map((operation) => (
                <a href={`#${operationId(operation)}`} key={`${operation.method}-${operation.path}`}>
                  <span className="method-label" data-method={operation.method}>{operation.method}</span>
                  <span>{operation.path}</span>
                </a>
              ))}
            </div>
          </nav>

          <section aria-label="API operations" className="operation-list">
            {visibleOperations.map((operation) => (
              <OperationReference key={`${operation.method}-${operation.path}`} operation={operation} />
            ))}
          </section>
        </div>
      ) : (
        <section className="docs-empty" role="status">
          <Search aria-hidden="true" size={22} />
          <h2>No operation matches “{query}”</h2>
          <p>Search by route, HTTP method, or endpoint summary.</p>
          <button className="secondary-action" onClick={() => setQuery("")} type="button">Clear search</button>
        </section>
      )}
    </div>
  );
}

function OperationReference({ operation }: { operation: ApiOperation }) {
  const parameters = operation.parameters ?? [];
  const responses = Object.entries(operation.responses ?? {});

  return (
    <article className="operation-reference" id={operationId(operation)}>
      <header>
        <span className="method-label" data-method={operation.method}>{operation.method}</span>
        <code>{operation.path}</code>
      </header>
      <div className="operation-reference__copy">
        <h2>{operation.summary ?? operation.operationId ?? "API operation"}</h2>
        {operation.description && <p>{operation.description}</p>}
      </div>

      {parameters.length > 0 && (
        <section className="operation-section" aria-labelledby={`${operationId(operation)}-parameters`}>
          <h3 id={`${operationId(operation)}-parameters`}>Parameters</h3>
          <div className="parameter-table-wrap">
            <table className="parameter-table">
              <thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
              <tbody>
                {parameters.map((parameter) => (
                  <tr key={`${parameter.in}-${parameter.name}`}>
                    <td><code>{parameter.name}</code></td>
                    <td>{parameter.in}</td>
                    <td>{parameter.schema?.type ?? "—"}</td>
                    <td>{parameter.required ? "Yes" : "No"}</td>
                    <td>{parameter.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="operation-section" aria-labelledby={`${operationId(operation)}-responses`}>
        <h3 id={`${operationId(operation)}-responses`}>Responses</h3>
        <dl className="response-list">
          {responses.map(([status, response]) => (
            <div key={status}><dt>{status}</dt><dd>{response.description}</dd></div>
          ))}
        </dl>
      </section>
    </article>
  );
}

function operationId(operation: ApiOperation): string {
  return `${operation.method}-${operation.path}`.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}
