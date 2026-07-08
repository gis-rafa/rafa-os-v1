export function getToday(timezone?: string): Date {
  if (timezone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formatted = formatter.format(new Date());
    const [year, month, day] = formatted.split("-").map(Number);

    const noonUtc = Date.UTC(year, month - 1, day, 12, 0, 0);
    const noonTz = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(new Date(noonUtc));
    const offsetHours = parseInt(noonTz, 10) - 12;

    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offsetHours * 3600000);
  }
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getTomorrow(timezone?: string): Date {
  return addDays(getToday(timezone), 1);
}

export function getDayOfWeek(timezone?: string): number {
  if (timezone) {
    const dayName = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      weekday: "long",
    }).format(new Date());
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(dayName);
  }
  return new Date().getDay();
}

export function now(): Date {
  return new Date();
}

export function nowMs(): number {
  return Date.now();
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(date), mondayOffset);
}
