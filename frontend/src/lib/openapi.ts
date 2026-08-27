import type { ApiOperation, OpenApiDocument, OpenApiOperation } from "../types";

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);

export function listApiOperations(document: OpenApiDocument): ApiOperation[] {
  return Object.entries(document.paths)
    .flatMap(([path, pathItem]) =>
      Object.entries(pathItem)
        .filter(([method]) => HTTP_METHODS.has(method.toLowerCase()))
        .map(([method, operation]) => ({
          ...(operation as OpenApiOperation),
          method: method.toUpperCase(),
          path,
        })),
    )
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function operationMatches(operation: ApiOperation, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [operation.method, operation.path, operation.summary, operation.description]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
}
