import type { EngineSummary, RiskBand } from "../types";

const labels: Record<RiskBand, string> = {
  critical: "Service now",
  watch: "Watch closely",
  stable: "Within range",
};

export function riskLabel(risk: RiskBand): string {
  return labels[risk];
}

export function sortEngines(engines: EngineSummary[]): EngineSummary[] {
  return [...engines].sort((a, b) => a.predicted_rul - b.predicted_rul);
}

export function engineCode(engineId: number): string {
  return `ENG-${engineId.toString().padStart(3, "0")}`;
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
