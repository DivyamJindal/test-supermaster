"use client";
import { useState, useEffect, useCallback } from "react";
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfWeek,
} from "date-fns";
import { CalendarEvent, CalendarView, ParsedEvent } from "@/lib/types";
import MonthView from "@/components/MonthView";
import TimeGridView from "@/components/TimeGridView";
import VoiceButton from "@/components/VoiceButton";
import ConfirmModal from "@/components/ConfirmModal";
import AddEventModal from "@/components/AddEventModal";
import EventDetailModal from "@/components/EventDetailModal";
import LoginScreen from "@/components/LoginScreen";

export default function CalendarPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [view, setView] = useState<CalendarView>("week");
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingEvent, setPendingEvent] = useState<ParsedEvent | null>(null);
  const [parsedFrom, setParsedFrom] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addDefaultDate, setAddDefaultDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // Check auth on mount by probing the events endpoint
  useEffect(() => {
    fetch("/api/events?month=1&year=2000")
      .then((r) => setAuthed(r.status !== 401))
      .catch(() => setAuthed(false));
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?month=${current.getMonth() + 1}&year=${current.getFullYear()}`);
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setEvents(data.events ?? []);
    } finally {
      setLoading(false);
    }
  }, [current]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function navigate(dir: 1 | -1) {
    if (view === "month") setCurrent(dir === 1 ? addMonths(current, 1) : subMonths(current, 1));
    else if (view === "week") setCurrent(dir === 1 ? addWeeks(current, 1) : subWeeks(current, 1));
    else if (view === "3day") setCurrent(dir === 1 ? addDays(current, 3) : subDays(current, 3));
    else setCurrent(dir === 1 ? addDays(current, 1) : subDays(current, 1));
  }

  function getViewDays(): Date[] {
    if (view === "week") {
      const start = startOfWeek(current, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    if (view === "3day") return [current, addDays(current, 1), addDays(current, 2)];
    if (view === "day") return [current];
    return [];
  }

  function viewLabel() {
    if (view === "month") return format(current, "MMMM yyyy");
    if (view === "day") return format(current, "EEEE, MMMM d");
    const days = getViewDays();
    if (!days.length) return "";
    const first = days[0], last = days[days.length - 1];
    if (format(first, "MMM") === format(last, "MMM")) {
      return `${format(first, "MMM d")} – ${format(last, "d, yyyy")}`;
    }
    return `${format(first, "MMM d")} – ${format(last, "MMM d, yyyy")}`;
  }

  async function handleTranscript(text: string) {
    setParsedFrom(text);
    setAiLoading(true);
    try {
      const res = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const { event } = await res.json();
      setPendingEvent(event);
    } catch {
      showToast("Couldn't parse that. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function confirmEvent(e: ParsedEvent) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e),
    });
    if (res.ok) {
      setPendingEvent(null);
      setParsedFrom("");
      setShowAdd(false);
      showToast("Event added!");
      loadEvents();
    }
  }

  async function deleteEvent(id: number) {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast("Event deleted.");
  }

  function handleDayClick(d: Date) {
    setAddDefaultDate(d);
    setShowAdd(true);
  }

  const VIEWS: { key: CalendarView; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
    { key: "3day", label: "3 Day" },
    { key: "day", label: "Day" },
  ];

  if (authed === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-blue-600/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-amber-600/6 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0">
        <div className="glass-card mx-4 mt-4 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all">‹</button>
                <button onClick={() => setCurrent(new Date())} className="px-3 h-8 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all">Today</button>
                <button onClick={() => navigate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-all">›</button>
              </div>
              <h1 className="text-lg font-semibold text-stone-100 tracking-tight">{viewLabel()}</h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
                {VIEWS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      view === key ? "bg-white/15 text-stone-100 shadow-sm" : "text-stone-400 hover:text-stone-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <VoiceButton onTranscript={handleTranscript} />

              <button
                onClick={() => { setAddDefaultDate(undefined); setShowAdd(true); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
              >
                <span className="text-base leading-none">+</span> New
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* AI parsing indicator */}
      {aiLoading && (
        <div className="relative z-10 mx-4 mt-3">
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm text-stone-300">
              AI parsing: <em className="text-stone-400 not-italic">&ldquo;{parsedFrom}&rdquo;</em>
            </span>
          </div>
        </div>
      )}

      {/* Calendar main */}
      <main className="relative z-10 flex-1 mx-4 my-3 glass-card rounded-2xl p-4 overflow-hidden min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : view === "month" ? (
          <MonthView
            current={current}
            events={events}
            onEventClick={setSelectedEvent}
            onDayClick={handleDayClick}
          />
        ) : (
          <TimeGridView
            days={getViewDays()}
            events={events}
            onEventClick={setSelectedEvent}
          />
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card rounded-xl px-5 py-3 text-sm text-stone-200 shadow-xl">
          {toast}
        </div>
      )}

      {/* Modals */}
      {pendingEvent && (
        <ConfirmModal
          event={pendingEvent}
          onConfirm={confirmEvent}
          onCancel={() => { setPendingEvent(null); setParsedFrom(""); }}
          onChange={setPendingEvent}
        />
      )}

      {showAdd && (
        <AddEventModal
          defaultDate={addDefaultDate}
          onConfirm={confirmEvent}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
