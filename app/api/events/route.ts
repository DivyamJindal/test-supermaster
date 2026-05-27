import { dbQuery } from "@/lib/cohesivity";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let data;
  if (month && year) {
    const pad = month.padStart(2, "0");
    data = await dbQuery(
      "SELECT * FROM events WHERE date LIKE ? ORDER BY start_time ASC",
      [`${year}-${pad}%`]
    );
  } else {
    data = await dbQuery("SELECT * FROM events ORDER BY date ASC, start_time ASC", []);
  }

  return Response.json({ events: data.rows });
}

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await req.json().catch(() => null) as {
    title?: unknown; description?: unknown; start_time?: unknown;
    end_time?: unknown; date?: unknown; type?: unknown; color?: unknown;
  } | null;

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const start_time = typeof body?.start_time === "string" ? body.start_time.trim() : "";
  const end_time = typeof body?.end_time === "string" ? body.end_time.trim() : "";
  const date = typeof body?.date === "string" ? body.date.trim() : "";
  const type = typeof body?.type === "string" ? body.type.trim() : "event";
  const color = typeof body?.color === "string" ? body.color.trim() : "blue";

  if (!title || !start_time || !end_time || !date) {
    return Response.json({ error: "title, date, start_time, end_time are required" }, { status: 400 });
  }

  const data = await dbQuery(
    "INSERT INTO events (title, description, start_time, end_time, date, type, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now')) RETURNING *",
    [title, description, start_time, end_time, date, type, color]
  );

  return Response.json({ event: data.rows?.[0] }, { status: 201 });
}

export async function DELETE(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || isNaN(Number(id))) return Response.json({ error: "Invalid id" }, { status: 400 });
  await dbQuery("DELETE FROM events WHERE id = ?", [Number(id)]);
  return Response.json({ success: true });
}

export async function PATCH(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await req.json().catch(() => null) as {
    id?: unknown; title?: unknown; description?: unknown; start_time?: unknown;
    end_time?: unknown; date?: unknown; type?: unknown; color?: unknown;
  } | null;

  const id = typeof body?.id === "number" ? body.id : null;
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const fields: string[] = [];
  const vals: unknown[] = [];

  if (typeof body?.title === "string") { fields.push("title = ?"); vals.push(body.title.trim()); }
  if (typeof body?.description === "string") { fields.push("description = ?"); vals.push(body.description.trim()); }
  if (typeof body?.start_time === "string") { fields.push("start_time = ?"); vals.push(body.start_time.trim()); }
  if (typeof body?.end_time === "string") { fields.push("end_time = ?"); vals.push(body.end_time.trim()); }
  if (typeof body?.date === "string") { fields.push("date = ?"); vals.push(body.date.trim()); }
  if (typeof body?.type === "string") { fields.push("type = ?"); vals.push(body.type.trim()); }
  if (typeof body?.color === "string") { fields.push("color = ?"); vals.push(body.color.trim()); }

  if (!fields.length) return Response.json({ error: "No fields to update" }, { status: 400 });
  vals.push(id);

  const data = await dbQuery(
    `UPDATE events SET ${fields.join(", ")} WHERE id = ? RETURNING *`,
    vals
  );

  return Response.json({ event: data.rows?.[0] });
}
