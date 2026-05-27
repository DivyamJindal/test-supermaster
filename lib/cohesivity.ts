const BASE = "https://cohesivity.ai/edge";
const UA = "supermaster/1.0";

function key() {
  const k = process.env.COH_APP_KEY;
  if (!k) throw new Error("COH_APP_KEY not set");
  return k;
}

export async function dbQuery(query: string, params: unknown[] = []) {
  const res = await fetch(`${BASE}/database?key=${key()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": UA },
    body: JSON.stringify({ query, params }),
  });
  if (!res.ok) throw new Error(`DB error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ rows: Record<string, unknown>[]; rowCount: number }>;
}

export async function aiParse(input: string, schema: Record<string, unknown>) {
  const res = await fetch(`${BASE}/openai-api/v1/responses?key=${key()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": UA },
    body: JSON.stringify({
      model: "gpt-5-nano",
      input,
      text: { format: { type: "json_schema", name: "parse_result", schema } },
    }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.output?.[0]?.content?.[0]?.text ?? data.output_text ?? "";
  return JSON.parse(text);
}
