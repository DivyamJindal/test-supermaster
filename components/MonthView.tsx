"use client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, format } from "date-fns";
import { CalendarEvent } from "@/lib/types";

const EVENT_BG: Record<string, string> = {
  blue: "bg-blue-500/25 text-blue-200 border-l-2 border-blue-400",
  violet: "bg-violet-500/25 text-violet-200 border-l-2 border-violet-400",
  emerald: "bg-emerald-500/25 text-emerald-200 border-l-2 border-emerald-400",
  amber: "bg-amber-500/25 text-amber-200 border-l-2 border-amber-400",
  rose: "bg-rose-500/25 text-rose-200 border-l-2 border-rose-400",
};

interface Props {
  current: Date;
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
  onDayClick: (d: Date) => void;
}

export default function MonthView({ current, events, onEventClick, onDayClick }: Props) {
  const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  function eventsOn(d: Date) {
    const key = format(d, "yyyy-MM-dd");
    return events.filter((e) => e.date === key);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 mb-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-stone-500 py-2 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 gap-px">
        {days.map((day) => {
          const evts = eventsOn(day);
          const outside = !isSameMonth(day, current);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-[88px] p-1.5 rounded-lg cursor-pointer transition-all duration-150
                ${outside ? "opacity-30" : "hover:bg-white/5"}
                ${today ? "ring-1 ring-amber-400/50 bg-amber-500/5" : ""}
              `}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 transition-colors
                ${today ? "bg-amber-400 text-stone-900" : "text-stone-300 hover:bg-white/10"}`}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {evts.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                    className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:brightness-110 transition-all ${EVENT_BG[e.color]}`}
                  >
                    {e.start_time.slice(0,5)} {e.title}
                  </div>
                ))}
                {evts.length > 3 && (
                  <div className="text-xs text-stone-500 px-1">+{evts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
