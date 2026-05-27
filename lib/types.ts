export type EventColor = "blue" | "violet" | "emerald" | "amber" | "rose";
export type EventType = "event" | "meeting" | "reminder" | "task";
export type CalendarView = "month" | "week" | "3day" | "day";

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  date: string;
  type: EventType;
  color: EventColor;
  created_at: string;
}

export interface ParsedEvent {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  type: EventType;
  color: EventColor;
}
