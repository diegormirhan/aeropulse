import type { EngineDetail, FleetResponse, ModelReport, OpenApiDocument } from "../types";

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal });
  if (!response.ok) {
    throw new Error(`AeroPulse API returned ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  fleet: (signal?: AbortSignal) => request<FleetResponse>("/api/fleet", signal),
  engine: (engineId: number, signal?: AbortSignal) =>
    request<EngineDetail>(`/api/engines/${engineId}`, signal),
  model: (signal?: AbortSignal) => request<ModelReport>("/api/model", signal),
  openApi: (signal?: AbortSignal) => request<OpenApiDocument>("/openapi.json", signal),
};
