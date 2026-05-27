import { aiParse } from "@/lib/cohesivity";
import { requireAuth } from "@/lib/auth";

const MAX_TEXT_LENGTH = 500;

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
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await req.json().catch(() => null) as { text?: unknown } | null;
  const raw = typeof body?.text === "string" ? body.text.trim() : "";
  if (!raw) return Response.json({ error: "text is required" }, { status: 400 });

  const text = raw.slice(0, MAX_TEXT_LENGTH);
  const today = new Date().toISOString().split("T")[0];

  // JSON.stringify the user text so embedded quotes/newlines can't escape the prompt
  const prompt = `Today is ${today}. Parse the user input below into a calendar event. If no time given, use 09:00. If no date given, use today. Make the title concise.\n\nUser input: ${JSON.stringify(text)}`;

  const parsed = await aiParse(prompt, EVENT_SCHEMA);
  return Response.json({ event: parsed });
}
