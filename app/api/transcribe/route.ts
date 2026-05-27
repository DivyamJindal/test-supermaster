export async function POST(req: Request) {
  const key = process.env.COH_APP_KEY;
  if (!key) return Response.json({ error: "Not configured" }, { status: 500 });

  const formData = await req.formData();
  const audio = formData.get("audio") as Blob | null;
  if (!audio) return Response.json({ error: "No audio provided" }, { status: 400 });

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
    const err = await res.text();
    return Response.json({ error: `Transcription failed: ${err}` }, { status: 500 });
  }

  const data = await res.json();
  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return Response.json({ transcript });
}
