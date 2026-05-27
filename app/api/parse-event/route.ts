import { aiParse } from "@/lib/cohesivity";

const EVENT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short event title" },
    description: { type: "string", description: "Optional details" },
    date: { type: "string", description: "ISO date YYYY-MM-DD" },
    start_time: { type: "string", description: "HH:MM in 24h format" },
    end_time: { type: "string", description: "HH:MM in 24h format, default 1h after start" },
    type: { type: "string", enum: ["event", "meeting", "reminder", "task"] },
    color: { type: "string", enum: ["blue", "violet", "emerald", "amber", "rose"] },
  },
  required: ["title", "date", "start_time", "end_time", "type", "color"],
  additionalProperties: false,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "text is required" }, { status: 400 });

  const today = new Date().toISOString().split("T")[0];
  const prompt = `Today is ${today}. Parse this into a calendar event. If no time given, use 09:00. If no date given, use today. Make the title concise. Input: "${text}"`;

  const parsed = await aiParse(prompt, EVENT_SCHEMA);
  return Response.json({ event: parsed });
}
