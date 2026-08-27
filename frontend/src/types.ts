export type RiskBand = "critical" | "watch" | "stable";
export type AppView = "fleet" | "engine" | "model" | "docs";

export interface EngineSummary {
  engine_id: number;
  observed_cycles: number;
  predicted_rul: number;
  lower_rul: number;
  upper_rul: number;
  actual_rul: number;
  absolute_error: number;
  health_score: number;
  risk_band: RiskBand;
}

export interface FleetSummary {
  total_engines: number;
  critical_engines: number;
  watch_engines: number;
  stable_engines: number;
  median_predicted_rul: number;
  test_mae: number;
  interval_coverage: number;
}

export interface FleetResponse {
  dataset: string;
  generated_at: string;
  summary: FleetSummary;
  engines: EngineSummary[];
}

export interface PredictionPoint {
  cycle: number;
  predicted_rul: number;
  lower_rul: number;
  upper_rul: number;
}

export interface SensorPoint {
  cycle: number;
  value: number;
  normalized: number;
}

export interface SensorSeries {
  key: string;
  label: string;
  unit: string;
  points: SensorPoint[];
}

export interface Contribution {
  feature: string;
  label: string;
  contribution: number;
  direction: "extends" | "reduces";
}

export interface EngineDetail {
  engine: EngineSummary;
  prediction_series: PredictionPoint[];
  sensors: SensorSeries[];
  contributions: Contribution[];
}

export interface MetricSet {
  rmse: number;
  mae: number;
  nasa_score: number;
}

export interface ModelComparison {
  name: string;
  role: string;
  validation: MetricSet;
  test: MetricSet | null;
}

export interface FeatureImportance {
  feature: string;
  label: string;
  importance: number;
}

export interface ModelReport {
  dataset: string;
  generated_at: string;
  selected_model: string;
  target: string;
  training_rows: number;
  validation_rows: number;
  test_engines: number;
  interval_radius: number;
  interval_coverage: number;
  comparisons: ModelComparison[];
  feature_importance: FeatureImportance[];
  limitations: string[];
}

export interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
    minimum?: number;
    maximum?: number;
  };
}

export interface OpenApiResponse {
  description: string;
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  responses?: Record<string, OpenApiResponse>;
}

export interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    summary?: string;
    description?: string;
  };
  paths: Record<string, Record<string, OpenApiOperation>>;
}

export interface ApiOperation extends OpenApiOperation {
  method: string;
  path: string;
}
