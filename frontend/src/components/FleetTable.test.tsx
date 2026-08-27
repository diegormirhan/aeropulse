import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FleetTable } from "./FleetTable";
import type { EngineSummary } from "../types";

const engines: EngineSummary[] = [
  {
    engine_id: 81,
    observed_cycles: 213,
    predicted_rul: 3,
    lower_rul: 0,
    upper_rul: 33,
    actual_rul: 8,
    absolute_error: 5,
    health_score: 2,
    risk_band: "critical",
  },
  {
    engine_id: 7,
    observed_cycles: 160,
    predicted_rul: 96.6,
    lower_rul: 66.7,
    upper_rul: 125,
    actual_rul: 91,
    absolute_error: 5.6,
    health_score: 77,
    risk_band: "stable",
  },
];

describe("FleetTable", () => {
  it("filters the fleet and opens an engine from its row", async () => {
    const onInspect = vi.fn();
    const user = userEvent.setup();
    render(<FleetTable engines={engines} onInspect={onInspect} />);

    await user.click(screen.getByRole("button", { name: "Service now" }));
    expect(screen.getByText("ENG-081")).toBeInTheDocument();
    expect(screen.queryByText("ENG-007")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Inspect engine 81" }));
    expect(onInspect).toHaveBeenCalledWith(81);
  });
});
