import { requireAuth } from "@/lib/auth";

const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const key = process.env.COH_APP_KEY;
  if (!key) return Response.json({ error: "Not configured" }, { status: 500 });

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_AUDIO_BYTES) {
    return Response.json({ error: "Audio too large" }, { status: 413 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as Blob | null;
  if (!audio) return Response.json({ error: "No audio provided" }, { status: 400 });
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "Audio too large" }, { status: 413 });
  }

  const mimeType = audio.type || "";
  if (!mimeType.startsWith("audio/")) {
    return Response.json({ error: "Invalid file type" }, { status: 400 });
  }

  const audioBuffer = Buffer.from(await audio.arrayBuffer());

  const res = await fetch(
    `https://cohesivity.ai/edge/deepgram-api/v1/listen?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "audio/webm", "User-Agent": "supermaster/1.0" },
      body: audioBuffer,
    }
  );

  if (!res.ok) {
    console.error("Deepgram error", res.status, await res.text());
    return Response.json({ error: "Transcription failed" }, { status: 500 });
  }

  const data = await res.json();
  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return Response.json({ transcript });
}
