import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { OpenApiDocument } from "../types";
import { ApiDocs } from "./ApiDocs";

const document: OpenApiDocument = {
  openapi: "3.1.0",
  info: { title: "AeroPulse API", version: "0.1.0", summary: "Fleet prognostics API" },
  paths: {
    "/api/fleet": {
      get: { summary: "Read fleet condition", responses: { "200": { description: "OK" } } },
    },
    "/api/model": {
      get: { summary: "Read model report", responses: { "200": { description: "OK" } } },
    },
  },
};

describe("ApiDocs", () => {
  it("filters operations by path or summary", async () => {
    const user = userEvent.setup();
    render(<ApiDocs document={document} />);

    expect(screen.getAllByText("/api/fleet")).toHaveLength(2);
    await user.type(screen.getByRole("searchbox", { name: "Search API operations" }), "model");

    expect(screen.queryByText("/api/fleet")).not.toBeInTheDocument();
    expect(screen.getAllByText("/api/model")).toHaveLength(2);
  });
});
