import { describe, expect, it } from "vitest";

import { riskLabel, sortEngines } from "./risk";
import type { EngineSummary } from "../types";

const engine = (id: number, rul: number): EngineSummary => ({
  engine_id: id,
  observed_cycles: 120,
  predicted_rul: rul,
  lower_rul: Math.max(0, rul - 10),
  upper_rul: rul + 10,
  actual_rul: rul,
  absolute_error: 0,
  health_score: Math.round((rul / 125) * 100),
  risk_band: rul <= 15 ? "critical" : rul <= 40 ? "watch" : "stable",
});

describe("risk helpers", () => {
  it("uses operational language for each band", () => {
    expect(riskLabel("critical")).toBe("Service now");
    expect(riskLabel("watch")).toBe("Watch closely");
    expect(riskLabel("stable")).toBe("Within range");
  });

  it("orders the shortest predicted life first without mutating input", () => {
    const fleet = [engine(2, 80), engine(1, 4), engine(3, 22)];
    expect(sortEngines(fleet).map((item) => item.engine_id)).toEqual([1, 3, 2]);
    expect(fleet[0].engine_id).toBe(2);
  });
});
