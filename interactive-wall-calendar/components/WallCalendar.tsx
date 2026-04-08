"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Moon,
  NotebookPen,
  RotateCcw,
  Sparkles,
  SunMedium,
} from "lucide-react";

type RegionKey = "IN" | "US" | "GLOBAL";

type DayCell = {
  date: Date;
  currentMonth: boolean;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const heroImages = [
  {
    month: 0,
    url: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80",
    label: "Winter cabin",
    accent: "#60a5fa",
  },
  {
    month: 1,
    url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
    label: "Spring blossoms",
    accent: "#f472b6",
  },
  {
    month: 2,
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80",
    label: "Blooming season",
    accent: "#fb7185",
  },
  {
    month: 3,
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    label: "Mountain lake",
    accent: "#38bdf8",
  },
  {
    month: 4,
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80",
    label: "Green valley",
    accent: "#34d399",
  },
  {
    month: 5,
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    label: "Summer trail",
    accent: "#f59e0b",
  },
  {
    month: 6,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    label: "Coastal escape",
    accent: "#06b6d4",
  },
  {
    month: 7,
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    label: "Golden field",
    accent: "#f59e0b",
  },
  {
    month: 8,
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    label: "Misty woods",
    accent: "#22c55e",
  },
  {
    month: 9,
    url: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1600&q=80",
    label: "Autumn road",
    accent: "#f97316",
  },
  {
    month: 10,
    url: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=80",
    label: "Snowy peaks",
    accent: "#a78bfa",
  },
  {
    month: 11,
    url: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=80",
    label: "Holiday lights",
    accent: "#ef4444",
  },
];

const mockEvents: Record<string, { label: string; tone: string }[]> = {
  "2026-04-10": [{ label: "Sprint Review", tone: "blue" }],
  "2026-04-12": [{ label: "Trip", tone: "green" }],
  "2026-04-15": [{ label: "Deadline", tone: "rose" }],
  "2026-04-18": [{ label: "Workshop", tone: "amber" }],
  "2026-04-22": [{ label: "Meetup", tone: "violet" }],
  "2026-05-01": [{ label: "Launch", tone: "emerald" }],
};

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return formatDateKey(a) === formatDateKey(b);
}

function normalizeRange(start: Date, end: Date) {
  return start <= end ? { start, end } : { start: end, end: start };
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function countDaysInclusive(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  const { start: s, end: e } = normalizeRange(start, end);
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
}

function countWeekends(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  const { start: s, end: e } = normalizeRange(start, end);
  const current = new Date(s);
  let count = 0;

  while (current <= e) {
    const day = current.getDay();
    if (day === 0 || day === 6) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function getWeekendRange(baseDate: Date) {
  const day = baseDate.getDay();
  const saturdayOffset = day === 0 ? -1 : 6 - day;
  const saturday = addDays(baseDate, saturdayOffset);
  const sunday = addDays(saturday, 1);
  return { start: saturday, end: sunday };
}

function isWithinRange(day: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const { start: s, end: e } = normalizeRange(start, end);

  const current = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const startTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
  const endTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();

  return current > startTime && current < endTime;
}

function getDaysForMonth(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      currentMonth: true,
    });
  }

  while (cells.length < 42) {
    const day = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({
      date: new Date(year, month + 1, day),
      currentMonth: false,
    });
  }

  return cells;
}

function getHolidayMap(year: number, region: RegionKey) {
  const map: Record<string, string> = {};

  if (region === "GLOBAL") {
    map[`${year}-01-01`] = "New Year";
    map[`${year}-02-14`] = "Valentine's";
    map[`${year}-12-25`] = "Christmas";
    map[`${year}-12-31`] = "Year End";
  }

  if (region === "US") {
    map[`${year}-01-01`] = "New Year";
    map[`${year}-02-14`] = "Valentine's";
    map[`${year}-07-04`] = "Independence Day";
    map[`${year}-10-31`] = "Halloween";
    map[`${year}-11-27`] = "Thanksgiving";
    map[`${year}-12-25`] = "Christmas";
  }

  if (region === "IN") {
    map[`${year}-01-01`] = "New Year";
    map[`${year}-01-26`] = "Republic Day";
    map[`${year}-03-08`] = "Holi*";
    map[`${year}-08-15`] = "Independence Day";
    map[`${year}-10-02`] = "Gandhi Jayanti";
    map[`${year}-11-01`] = "Diwali*";
    map[`${year}-12-25`] = "Christmas";
  }

  return map;
}

function eventToneClass(tone: string) {
  const tones: Record<string, string> = {
    blue: "bg-sky-400",
    green: "bg-emerald-400",
    rose: "bg-rose-400",
    amber: "bg-amber-400",
    violet: "bg-violet-400",
    emerald: "bg-emerald-500",
  };
  return tones[tone] || "bg-stone-400";
}

function getVisibleHolidayCount(cells: DayCell[], holidays: Record<string, string>) {
  return cells.filter((cell) => holidays[formatDateKey(cell.date)]).length;
}

export default function WallCalendar() {
  const today = useMemo(() => new Date(), []);
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [region, setRegion] = useState<RegionKey>("IN");

  const [displayDate, setDisplayDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);
  const [monthNote, setMonthNote] = useState("");
  const [rangeNote, setRangeNote] = useState("");
  const [keyboardDate, setKeyboardDate] = useState(today);
  const [isDragging, setIsDragging] = useState(false);

  const hero = heroImages[displayDate.getMonth()] || heroImages[0];
  const visualEnd = rangeEnd ?? draftEnd;

  const cells = useMemo(() => {
    return getDaysForMonth(displayDate.getFullYear(), displayDate.getMonth());
  }, [displayDate]);

  const holidays = useMemo(() => {
    return getHolidayMap(displayDate.getFullYear(), region);
  }, [displayDate, region]);

  const visibleHolidayCount = useMemo(() => {
    return getVisibleHolidayCount(cells, holidays);
  }, [cells, holidays]);

  const totalSelectedDays = useMemo(() => {
    return countDaysInclusive(rangeStart, visualEnd);
  }, [rangeStart, visualEnd]);

  const weekendCount = useMemo(() => {
    return countWeekends(rangeStart, visualEnd);
  }, [rangeStart, visualEnd]);

  const weekdayCount = totalSelectedDays ? totalSelectedDays - weekendCount : 0;

  const monthStorageKey = useMemo(() => {
    return `calendar-month-note-${displayDate.getFullYear()}-${displayDate.getMonth()}`;
  }, [displayDate]);

  const rangeStorageKey = useMemo(() => {
    const startKey = rangeStart ? formatDateKey(rangeStart) : "none";
    const endKey = visualEnd ? formatDateKey(visualEnd) : "none";
    return `calendar-range-note-${startKey}-${endKey}`;
  }, [rangeStart, visualEnd]);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("calendar-dark-mode");
    const nextDark = savedTheme === "true";
    setDarkMode(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("calendar-dark-mode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode, mounted]);

  useEffect(() => {
    const saved = localStorage.getItem(monthStorageKey);
    setMonthNote(saved || "");
  }, [monthStorageKey]);

  useEffect(() => {
    localStorage.setItem(monthStorageKey, monthNote);
  }, [monthNote, monthStorageKey]);

  useEffect(() => {
    const saved = localStorage.getItem(rangeStorageKey);
    setRangeNote(saved || "");
  }, [rangeStorageKey]);

  useEffect(() => {
    localStorage.setItem(rangeStorageKey, rangeNote);
  }, [rangeNote, rangeStorageKey]);

  useEffect(() => {
    function stopDragging() {
      if (!isDragging) return;
      setIsDragging(false);

      if (rangeStart && draftEnd) {
        const normalized = normalizeRange(rangeStart, draftEnd);
        setRangeStart(normalized.start);
        setRangeEnd(normalized.end);
      }

      setDraftEnd(null);
    }

    window.addEventListener("pointerup", stopDragging);
    return () => window.removeEventListener("pointerup", stopDragging);
  }, [isDragging, rangeStart, draftEnd]);

  function toggleDarkMode() {
    setDarkMode((prev) => !prev);
  }

  function handleDateClick(date: Date) {
    setKeyboardDate(date);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
      setDraftEnd(null);
      return;
    }

    const normalized = normalizeRange(rangeStart, date);
    setRangeStart(normalized.start);
    setRangeEnd(normalized.end);
    setDraftEnd(null);
  }

  function handlePointerDown(date: Date) {
    setKeyboardDate(date);
    setIsDragging(true);
    setRangeStart(date);
    setRangeEnd(null);
    setDraftEnd(date);
  }

  function handlePointerEnter(date: Date) {
    if (!isDragging || !rangeStart) return;
    setDraftEnd(date);
  }

  function handleGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next = keyboardDate;

    if (event.key === "ArrowLeft") next = addDays(keyboardDate, -1);
    else if (event.key === "ArrowRight") next = addDays(keyboardDate, 1);
    else if (event.key === "ArrowUp") next = addDays(keyboardDate, -7);
    else if (event.key === "ArrowDown") next = addDays(keyboardDate, 7);
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleDateClick(keyboardDate);
      return;
    } else {
      return;
    }

    event.preventDefault();
    setKeyboardDate(next);
    setDisplayDate(new Date(next.getFullYear(), next.getMonth(), 1));
  }

  function resetSelection() {
    setRangeStart(null);
    setRangeEnd(null);
    setDraftEnd(null);
    setRangeNote("");
    setIsDragging(false);
  }

  function goToPrevMonth() {
    setDisplayDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setDisplayDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function selectNext7Days() {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = addDays(start, 6);
    setRangeStart(start);
    setRangeEnd(end);
    setDraftEnd(null);
    setDisplayDate(new Date(start.getFullYear(), start.getMonth(), 1));
  }

  function selectThisMonth() {
    const start = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const end = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    setRangeStart(start);
    setRangeEnd(end);
    setDraftEnd(null);
  }

  function selectWeekend() {
    const { start, end } = getWeekendRange(today);
    setRangeStart(start);
    setRangeEnd(end);
    setDraftEnd(null);
    setDisplayDate(new Date(start.getFullYear(), start.getMonth(), 1));
  }

  return (
    <div style={{ ["--accent" as string]: hero.accent }}>
      <div className="min-h-screen bg-stone-100 text-stone-900 transition-colors duration-300 dark:bg-[#09090b] dark:text-zinc-100">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
          <motion.div
            animate={{ boxShadow: `0 24px 80px -24px ${hero.accent}3b` }}
            className="overflow-hidden rounded-[30px] border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="grid lg:grid-cols-[0.95fr_1.2fr_0.95fr]">
              <section className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-[760px]">
                <img
                  src={hero.url}
                  alt={hero.label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

                <div className="absolute inset-x-0 top-0 flex justify-center pt-4">
                  <div className="flex gap-3">
                    <span className="h-3 w-3 rounded-full bg-white/85 shadow-sm" />
                    <span className="h-3 w-3 rounded-full bg-white/70 shadow-sm" />
                  </div>
                </div>

                <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] backdrop-blur-md">
                      {monthNames[displayDate.getMonth()]}
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-md"
                      style={{ backgroundColor: `${hero.accent}66` }}
                    >
                      Premium
                    </span>
                  </div>

                  <div>
                    <h2 className="max-w-sm text-3xl font-semibold leading-tight sm:text-4xl">
                      {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
                    </h2>
                    <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
                      Drag to select a range, switch holiday regions, and keep notes in a
                      clean premium layout.
                    </p>
                  </div>
                </div>
              </section>

              <section className="border-t border-stone-200 bg-[#fcfcfb] p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4 lg:border-l lg:border-t-0 lg:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevMonth}
                      type="button"
                      className="rounded-full border border-stone-200 bg-white p-2 transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      type="button"
                      className="rounded-full border border-stone-200 bg-white p-2 transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleDarkMode}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                    >
                      {darkMode ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {darkMode ? "Light" : "Dark"}
                    </button>

                    <button
                      onClick={resetSelection}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mb-3 rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-zinc-400">
                        Current Month
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {monthNames[displayDate.getMonth()]}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-zinc-400">
                        Year
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {displayDate.getFullYear()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["IN", "US", "GLOBAL"] as RegionKey[]).map((item) => {
                      const active = region === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRegion(item)}
                          className={[
                            "rounded-2xl px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                            active
                              ? "text-white shadow-md"
                              : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
                          ].join(" ")}
                          style={active ? { backgroundColor: hero.accent } : undefined}
                        >
                          {item === "IN" ? "India" : item === "US" ? "USA" : "Global"}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs text-stone-500 dark:text-zinc-400">
                    {visibleHolidayCount} visible holiday marker{visibleHolidayCount === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    onClick={selectNext7Days}
                    type="button"
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    Next 7 Days
                  </button>
                  <button
                    onClick={selectWeekend}
                    type="button"
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    Weekend
                  </button>
                  <button
                    onClick={selectThisMonth}
                    type="button"
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium transition hover:bg-stone-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    This Month
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-400 sm:text-xs"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div
                  tabIndex={0}
                  onKeyDown={handleGridKeyDown}
                  className="grid grid-cols-7 gap-1.5 rounded-[24px] outline-none focus:ring-2 focus:ring-[var(--accent)] sm:gap-2"
                  aria-label="Interactive calendar grid"
                >
                  {cells.map(({ date, currentMonth }) => {
                    const key = formatDateKey(date);
                    const isStart = sameDay(date, rangeStart);
                    const isEnd = sameDay(date, visualEnd);
                    const inRange = isWithinRange(date, rangeStart, visualEnd);
                    const isToday = sameDay(date, today);
                    const holiday = holidays[key];
                    const dayEvents = mockEvents[key] || [];
                    const isKeyboardFocused = sameDay(date, keyboardDate);

                    return (
                      <motion.button
                        key={key}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDateClick(date)}
                        onPointerDown={() => handlePointerDown(date)}
                        onPointerEnter={() => handlePointerEnter(date)}
                        type="button"
                        className={[
                          "relative min-h-[72px] rounded-[20px] border p-2 text-left transition sm:min-h-[92px]",
                          currentMonth
                            ? "border-stone-200 bg-white hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-zinc-800"
                            : "border-transparent bg-transparent text-stone-400 dark:text-zinc-600",
                          inRange ? "border-[var(--accent)] bg-[color:var(--accent)]/10" : "",
                          isStart || isEnd ? "text-white shadow-lg" : "",
                          isToday && !(isStart || isEnd) ? "ring-2 ring-[var(--accent)]" : "",
                          isKeyboardFocused ? "outline outline-2 outline-offset-2 outline-[var(--accent)]" : "",
                        ].join(" ")}
                        style={{
                          backgroundColor: isStart || isEnd ? hero.accent : undefined,
                          boxShadow:
                            isStart || isEnd
                              ? `0 14px 30px -16px ${hero.accent}`
                              : undefined,
                        }}
                        aria-pressed={isStart || isEnd || inRange}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-sm font-semibold sm:text-[15px]">
                            {date.getDate()}
                          </span>

                          <div className="flex items-center gap-1">
                            {holiday ? <span className="h-2 w-2 rounded-full bg-rose-400" /> : null}
                            {dayEvents.length > 0 ? (
                              <span className={`h-2 w-2 rounded-full ${eventToneClass(dayEvents[0].tone)}`} />
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-1 min-h-[12px] text-[9px] leading-4 opacity-85 sm:text-[10px]">
                          {holiday
                            ? holiday
                            : isStart
                            ? "Start"
                            : isEnd
                            ? "End"
                            : inRange
                            ? "Selected"
                            : ""}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {dayEvents.slice(0, 1).map((event) => (
                            <span
                              key={event.label}
                              className="rounded-full border border-black/5 bg-black/5 px-1.5 py-0.5 text-[8px] leading-none dark:border-white/10 dark:bg-white/10 sm:text-[9px]"
                            >
                              {event.label}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section className="border-t border-stone-200 bg-stone-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/70 sm:p-4 lg:border-l lg:border-t-0 lg:p-5">
                <div className="space-y-3">
                  <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div className="mb-3 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <h4 className="font-semibold">Selection Summary</h4>
                    </div>

                    {!rangeStart ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm italic text-stone-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                        No date range selected yet.
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-stone-600 dark:text-zinc-400">
                        <p>
                          <span className="font-medium text-stone-900 dark:text-zinc-100">Start:</span>{" "}
                          {rangeStart.toDateString()}
                        </p>
                        <p>
                          <span className="font-medium text-stone-900 dark:text-zinc-100">End:</span>{" "}
                          {visualEnd ? visualEnd.toDateString() : "Dragging..."}
                        </p>
                        <p>
                          <span className="font-medium text-stone-900 dark:text-zinc-100">Holiday set:</span>{" "}
                          {region}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-400">Total</p>
                      <p className="mt-2 text-2xl font-semibold">{totalSelectedDays}</p>
                    </div>

                    <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-400">Weekends</p>
                      <p className="mt-2 text-2xl font-semibold">{weekendCount}</p>
                    </div>

                    <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-400">Weekdays</p>
                      <p className="mt-2 text-2xl font-semibold">{weekdayCount}</p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div className="mb-3 flex items-center gap-2">
                      <NotebookPen className="h-4 w-4" />
                      <h4 className="font-semibold">Month Notes</h4>
                    </div>

                    <textarea
                      value={monthNote}
                      onChange={(e) => setMonthNote(e.target.value)}
                      placeholder="Add monthly notes, plans, reminders..."
                      className="min-h-[120px] w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[var(--accent)] dark:border-zinc-700 dark:bg-zinc-900"
                    />

                    <p className="mt-2 text-xs text-stone-500 dark:text-zinc-400">
                      Saved locally for this month
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div className="mb-3 flex items-center gap-2">
                      <NotebookPen className="h-4 w-4" />
                      <h4 className="font-semibold">Range Notes</h4>
                    </div>

                    <textarea
                      value={rangeNote}
                      onChange={(e) => setRangeNote(e.target.value)}
                      placeholder="Attach notes to selected range..."
                      disabled={!rangeStart}
                      className="min-h-[120px] w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                    />

                    <p className="mt-2 text-xs text-stone-500 dark:text-zinc-400">
                      Linked to your selected dates
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <p className="font-semibold text-stone-900 dark:text-zinc-100">
                        Accessibility & Notes
                      </p>
                    </div>

                    <p>
                      Drag across dates to select a range. Keyboard also works: arrow keys move focus, Enter or Space selects.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>

          <AnimatePresence>
            {rangeStart && visualEnd && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-zinc-950"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {totalSelectedDays} day{totalSelectedDays > 1 ? "s" : ""} selected
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}