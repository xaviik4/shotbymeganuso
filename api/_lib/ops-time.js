const TIME_ZONE = "America/Los_Angeles";

function localDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
}

function localMidnightToUtc(year, month, day) {
  const targetLocalAsUtc = Date.UTC(year, month - 1, day);
  let guess = targetLocalAsUtc;
  for (let i = 0; i < 3; i += 1) {
    const parts = localDateParts(new Date(guess));
    const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day,
      Number(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "2-digit", hourCycle: "h23" }).format(new Date(guess))));
    const minutes = Number(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, minute: "2-digit" }).format(new Date(guess)));
    const seconds = Number(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, second: "2-digit" }).format(new Date(guess)));
    guess += targetLocalAsUtc - (localAsUtc + minutes * 60000 + seconds * 1000);
  }
  return new Date(guess);
}

export function currentPacificWeek(now = new Date()) {
  const today = localDateParts(now);
  const date = new Date(Date.UTC(today.year, today.month - 1, today.day));
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  const monday = { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  const nextMondayDate = new Date(Date.UTC(monday.year, monday.month - 1, monday.day + 7));
  return {
    start: localMidnightToUtc(monday.year, monday.month, monday.day).toISOString(),
    end: localMidnightToUtc(nextMondayDate.getUTCFullYear(), nextMondayDate.getUTCMonth() + 1, nextMondayDate.getUTCDate()).toISOString(),
    monday: `${monday.year}-${String(monday.month).padStart(2, "0")}-${String(monday.day).padStart(2, "0")}`,
  };
}
