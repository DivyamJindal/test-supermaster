"use client";
import { format, isToday, eachDayOfInterval, addDays } from "date-fns";
import { CalendarEvent } from "@/lib/types";

const EVENT_BG: Record<string, string> = {
  blue: "bg-blue-500/30 border border-blue-400/40 text-blue-100",
  violet: "bg-violet-500/30 border border-violet-400/40 text-violet-100",
  emerald: "bg-emerald-500/30 border border-emerald-400/40 text-emerald-100",
  amber: "bg-amber-500/30 border border-amber-400/40 text-amber-100",
  rose: "bg-rose-500/30 border border-rose-400/40 text-rose-100",
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function timeToPercent(time: string) {
  const [h, m] = time.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * 100;
}

function durationPercent(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const dur = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max((dur / (24 * 60)) * 100, 2);
}

function fmtHour(h: number) {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

interface Props {
  days: Date[];
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}

export default function TimeGridView({ days, events, onEventClick }: Props) {
  function eventsOn(d: Date) {
    const key = format(d, "yyyy-MM-dd");
    return events.filter((e) => e.date === key);
  }

  const nowPercent = timeToPercent(
    new Date().toTimeString().slice(0, 5)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b border-white/10 pb-2 mb-0 flex-shrink-0">
        <div className="w-14 flex-shrink-0" />
        {days.map((d) => (
          <div key={d.toISOString()} className="flex-1 text-center px-1">
            <div className="text-xs text-stone-500 uppercase tracking-wider">{format(d, "EEE")}</div>
            <div className={`text-lg font-semibold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full mx-auto transition-colors
              ${isToday(d) ? "bg-amber-400 text-stone-900" : "text-stone-300"}`}>
              {format(d, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Hour labels */}
        <div className="w-14 flex-shrink-0 relative">
          {HOURS.map((h) => (
            <div key={h} style={{ height: "60px" }} className="relative">
              <span className="absolute -top-2.5 right-2 text-xs text-stone-600 select-none">{fmtHour(h)}</span>
            </div>
          ))}
        </div>

        {/* Grid columns */}
        <div className="flex flex-1 relative">
          {/* Hour lines */}
          <div className="absolute inset-0 pointer-events-none">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute w-full border-t border-white/5"
                style={{ top: `${(h / 24) * 100}%` }}
              />
            ))}
          </div>

          {/* Now line */}
          <div
            className="absolute w-full border-t-2 border-amber-400/60 z-10 pointer-events-none"
            style={{ top: `${nowPercent}%` }}
          >
            <div className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full bg-amber-400" />
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const evts = eventsOn(d);
            return (
              <div key={d.toISOString()} className="flex-1 relative border-l border-white/5" style={{ height: `${24 * 60}px` }}>
                {evts.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => onEventClick(e)}
                    className={`absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer hover:brightness-110 transition-all overflow-hidden ${EVENT_BG[e.color]}`}
                    style={{
                      top: `${timeToPercent(e.start_time)}%`,
                      height: `${durationPercent(e.start_time, e.end_time)}%`,
                      minHeight: "24px",
                    }}
                  >
                    <div className="text-xs font-medium truncate">{e.title}</div>
                    <div className="text-xs opacity-70 truncate">{e.start_time.slice(0,5)}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
