const RW_TIMEZONE = "Africa/Kigali";

function toValidDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatDate(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return value ? String(value) : "";

  // Example: "30 Dec 2025"
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RW_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTime(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return value ? String(value) : "";

  // 24-hour time in Rwanda
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RW_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatDateTime(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return value ? String(value) : "";
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function formatWeekday(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return value ? String(value) : "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RW_TIMEZONE,
    weekday: "long",
  }).format(d);
}

export function formatLongDate(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return value ? String(value) : "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RW_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatMonthShort(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return value ? String(value) : "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: RW_TIMEZONE,
    month: "short",
  }).format(d);
}

type RelativeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

function pickRelativeUnit(diffSecondsAbs: number): { unit: RelativeUnit; value: number } {
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffSecondsAbs < minute) return { unit: "second", value: 1 };
  if (diffSecondsAbs < hour) return { unit: "minute", value: Math.round(diffSecondsAbs / minute) };
  if (diffSecondsAbs < day) return { unit: "hour", value: Math.round(diffSecondsAbs / hour) };
  if (diffSecondsAbs < week) return { unit: "day", value: Math.round(diffSecondsAbs / day) };
  if (diffSecondsAbs < month) return { unit: "week", value: Math.round(diffSecondsAbs / week) };
  if (diffSecondsAbs < year) return { unit: "month", value: Math.round(diffSecondsAbs / month) };
  return { unit: "year", value: Math.round(diffSecondsAbs / year) };
}

export function formatRelativeTime(value: unknown): string {
  const d = toValidDate(value);
  if (!d) return "";

  const diffMs = d.getTime() - Date.now();
  const diffSeconds = diffMs / 1000;
  const abs = Math.abs(diffSeconds);

  const { unit, value: unitValueAbs } = pickRelativeUnit(abs);
  const signedValue = diffSeconds < 0 ? -unitValueAbs : unitValueAbs;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(signedValue, unit);
}
