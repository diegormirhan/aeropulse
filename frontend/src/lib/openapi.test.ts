import { describe, expect, it } from "vitest";

import type { OpenApiDocument } from "../types";
import { listApiOperations } from "./openapi";

const document: OpenApiDocument = {
  openapi: "3.1.0",
  info: { title: "AeroPulse API", version: "0.1.0" },
  paths: {
    "/api/health": {
      get: {
        summary: "Read service health",
        responses: { "200": { description: "Successful response" } },
      },
    },
    "/api/engines/{engine_id}": {
      get: {
        summary: "Read engine detail",
        parameters: [{ name: "engine_id", in: "path", required: true }],
        responses: {
          "200": { description: "Successful response" },
          "404": { description: "Engine not found" },
        },
      },
      parameters: {} as never,
    },
  },
};

describe("listApiOperations", () => {
  it("flattens HTTP operations and ignores path metadata", () => {
    const operations = listApiOperations(document);

    expect(operations).toHaveLength(2);
    expect(operations[0]).toMatchObject({ method: "GET", path: "/api/engines/{engine_id}" });
    expect(operations[0].parameters?.[0].name).toBe("engine_id");
    expect(Object.keys(operations[0].responses ?? {})).toEqual(["200", "404"]);
  });
});
