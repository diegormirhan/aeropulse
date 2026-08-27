import { RotateCcw } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import { AppShell } from "./components/AppShell";
import { FleetCommand } from "./components/FleetCommand";
import { api } from "./lib/api";
import type { AppView, EngineDetail, FleetResponse, ModelReport, OpenApiDocument } from "./types";

const EngineProfile = lazy(() =>
  import("./components/EngineProfile").then((module) => ({ default: module.EngineProfile })),
);
const ModelLab = lazy(() =>
  import("./components/ModelLab").then((module) => ({ default: module.ModelLab })),
);
const ApiDocs = lazy(() =>
  import("./components/ApiDocs").then((module) => ({ default: module.ApiDocs })),
);

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("fleet");
  const [fleet, setFleet] = useState<FleetResponse | null>(null);
  const [model, setModel] = useState<ModelReport | null>(null);
  const [openApi, setOpenApi] = useState<OpenApiDocument | null>(null);
  const [engine, setEngine] = useState<EngineDetail | null>(null);
  const [selectedEngineId, setSelectedEngineId] = useState(81);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const [fleetData, modelData, openApiData] = await Promise.all([
        api.fleet(controller.signal),
        api.model(controller.signal),
        api.openApi(controller.signal),
      ]);
      setFleet(fleetData);
      setModel(modelData);
      setOpenApi(openApiData);
      setSelectedEngineId(fleetData.engines[0]?.engine_id ?? 81);
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === "AbortError")) {
        setError("The AeroPulse API did not return the fleet artifacts. Start the FastAPI service, then retry.");
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (activeView !== "engine") return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.engine(selectedEngineId, controller.signal)
      .then(setEngine)
      .catch((cause) => {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) {
          setError(`Engine ${selectedEngineId} could not be loaded. Return to the fleet and choose another engine.`);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [activeView, selectedEngineId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeView]);

  const inspectEngine = (engineId: number) => {
    setSelectedEngineId(engineId);
    setActiveView("engine");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let content: React.ReactNode;
  if (error) {
    content = (
      <section className="error-state" role="alert">
        <div><RotateCcw aria-hidden="true" size={24} /></div>
        <h1>Telemetry connection interrupted</h1>
        <p>{error}</p>
        <button className="primary-action" onClick={() => void loadWorkspace()} type="button">Retry connection</button>
      </section>
    );
  } else if (loading && (!fleet || (activeView === "engine" && !engine))) {
    content = <LoadingWorkspace />;
  } else if (activeView === "docs" && openApi) {
    content = <ApiDocs document={openApi} />;
  } else if (activeView === "model" && model) {
    content = <ModelLab report={model} />;
  } else if (activeView === "engine" && engine) {
    content = <EngineProfile detail={engine} onBack={() => setActiveView("fleet")} />;
  } else if (fleet) {
    content = <FleetCommand fleet={fleet} onInspect={inspectEngine} />;
  } else {
    content = <LoadingWorkspace />;
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      <Suspense fallback={<LoadingWorkspace />}>{content}</Suspense>
    </AppShell>
  );
}

function LoadingWorkspace() {
  return (
    <div aria-busy="true" aria-label="Loading AeroPulse telemetry" className="loading-workspace">
      <div className="skeleton skeleton--title" />
      <div className="skeleton-grid"><div className="skeleton skeleton--large" /><div className="skeleton skeleton--large" /></div>
      <div className="skeleton skeleton--table" />
    </div>
  );
}
