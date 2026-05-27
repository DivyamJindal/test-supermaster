"use client";
import { CalendarEvent } from "@/lib/types";

const DOT: Record<string, string> = {
  blue: "bg-blue-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

const BADGE: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-300",
  violet: "bg-violet-500/20 text-violet-300",
  emerald: "bg-emerald-500/20 text-emerald-300",
  amber: "bg-amber-500/20 text-amber-300",
  rose: "bg-rose-500/20 text-rose-300",
};

interface Props {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: number) => void;
}

function fmt(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${ap}`;
}

export default function EventDetailModal({ event, onClose, onDelete }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${DOT[event.color]} flex-shrink-0 mt-0.5`} />
            <h2 className="text-lg font-semibold text-stone-100 leading-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200 transition-colors text-xl leading-none ml-3">&times;</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="text-stone-500">📅</span>
            <span>{new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <span className="text-stone-500">🕐</span>
            <span>{fmt(event.start_time)} – {fmt(event.end_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-500">🏷</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${BADGE[event.color]}`}>{event.type}</span>
          </div>
          {event.description && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-stone-400 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-400 border border-white/10 hover:bg-white/5 transition-all">
            Close
          </button>
          <button
            onClick={() => { onDelete(event.id); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
