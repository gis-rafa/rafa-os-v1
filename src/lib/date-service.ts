export function getToday(): Date {
  return startOfDay(new Date());
}

export function getTomorrow(): Date {
  return addDays(getToday(), 1);
}

export function getDayOfWeek(): number {
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
