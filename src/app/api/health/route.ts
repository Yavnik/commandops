/**
 * Handles GET requests for the health endpoint by returning a JSON health-check payload.
 *
 * @returns A Response whose JSON body is { ok: true }.
 */
export async function GET() {
  return Response.json({ ok: true });
}