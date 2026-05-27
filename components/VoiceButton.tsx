"use client";
import { useState, useRef } from "react";

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggle() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mediaRef.current = mr;

    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setProcessing(true);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: fd });
        const { transcript } = await res.json();
        if (transcript) onTranscript(transcript);
      } finally {
        setProcessing(false);
      }
    };

    mr.start();
    setRecording(true);
  }

  return (
    <button
      onClick={toggle}
      disabled={processing}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
        ${recording
          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/20"
          : processing
          ? "bg-white/5 text-stone-400 border border-white/10 cursor-wait"
          : "bg-white/10 text-stone-200 border border-white/15 hover:bg-white/15 hover:border-white/25"
        }`}
    >
      {recording && (
        <span className="absolute inset-0 rounded-xl animate-pulse bg-rose-500/10 pointer-events-none" />
      )}
      <span className={`w-2 h-2 rounded-full ${recording ? "bg-rose-400 animate-pulse" : processing ? "bg-amber-400 animate-spin" : "bg-stone-400"}`} />
      {processing ? "Transcribing..." : recording ? "Stop recording" : "Speak an event"}
    </button>
  );
}
