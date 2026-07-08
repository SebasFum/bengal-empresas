import { neon } from "@neondatabase/serverless";

let _client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!_client) _client = neon(process.env.DATABASE_URL!);
  return _client;
}

// Tagged-template proxy — Neon is only initialized on the first actual query
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) =>
  getClient()(strings, ...values) as Promise<Record<string, unknown>[]>;
