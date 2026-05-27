"use client";
import { useState } from "react";
import { format } from "date-fns";
import { ParsedEvent } from "@/lib/types";

const COLORS = ["blue", "violet", "emerald", "amber", "rose"] as const;
const COLOR_BTN: Record<string, string> = {
  blue: "bg-blue-500/30 border-blue-400/50",
  violet: "bg-violet-500/30 border-violet-400/50",
  emerald: "bg-emerald-500/30 border-emerald-400/50",
  amber: "bg-amber-500/30 border-amber-400/50",
  rose: "bg-rose-500/30 border-rose-400/50",
};

interface Props {
  defaultDate?: Date;
  onConfirm: (e: ParsedEvent) => void;
  onCancel: () => void;
}

export default function AddEventModal({ defaultDate, onConfirm, onCancel }: Props) {
  const [event, setEvent] = useState<ParsedEvent>({
    title: "",
    description: "",
    date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "10:00",
    type: "event",
    color: "blue",
  });

  function field(key: keyof ParsedEvent, value: string) {
    setEvent((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-stone-100">New event</h2>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-200 transition-colors text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Title</label>
            <input
              className="glass-input w-full"
              placeholder="What's happening?"
              value={event.title}
              onChange={(e) => field("title", e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Date</label>
              <input type="date" className="glass-input w-full" value={event.date} onChange={(e) => field("date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Type</label>
              <select className="glass-input w-full" value={event.type} onChange={(e) => field("type", e.target.value)}>
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
                <option value="task">Task</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Start</label>
              <input type="time" className="glass-input w-full" value={event.start_time} onChange={(e) => field("start_time", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">End</label>
              <input type="time" className="glass-input w-full" value={event.end_time} onChange={(e) => field("end_time", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => field("color", c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${COLOR_BTN[c]}
                    ${event.color === c ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              className="glass-input w-full h-20 resize-none"
              placeholder="Optional details..."
              value={event.description}
              onChange={(e) => field("description", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-400 border border-white/10 hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button
            onClick={() => { if (event.title.trim()) onConfirm(event); }}
            disabled={!event.title.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to calendar
          </button>
        </div>
      </div>
    </div>
  );
}
