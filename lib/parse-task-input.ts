const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function at8am(d: Date): Date {
  const out = new Date(d);
  out.setHours(8, 0, 0, 0);
  return out;
}

function nextWeekday(dayIndex: number): Date {
  const now = new Date();
  const diff = (dayIndex - now.getDay() + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return at8am(d);
}

// Returns { cleanTitle, detectedDate } where cleanTitle has the matched phrase stripped.
export function parseDateFromTitle(title: string): { cleanTitle: string; detectedDate: Date | null } {
  const lower = title.toLowerCase();

  // "tomorrow"
  const tomorrowMatch = lower.match(/\btomorrow\b/);
  if (tomorrowMatch) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return {
      cleanTitle: title.slice(0, tomorrowMatch.index).trimEnd() +
        title.slice(tomorrowMatch.index! + tomorrowMatch[0].length).trimStart(),
      detectedDate: at8am(d),
    };
  }

  // "on monday", "on friday", etc.
  const weekdayMatch = lower.match(/\bon\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (weekdayMatch) {
    const dayIndex = WEEKDAYS.indexOf(weekdayMatch[1]);
    return {
      cleanTitle: title.slice(0, weekdayMatch.index).trimEnd() +
        title.slice(weekdayMatch.index! + weekdayMatch[0].length).trimStart(),
      detectedDate: nextWeekday(dayIndex),
    };
  }

  // "on jan 5", "on january 15", etc.
  const monthDayMatch = lower.match(/\bon\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b/);
  if (monthDayMatch) {
    const month = MONTHS[monthDayMatch[1].slice(0, 3)];
    const day = parseInt(monthDayMatch[2], 10);
    const now = new Date();
    const d = new Date(now.getFullYear(), month, day);
    if (d < now) d.setFullYear(now.getFullYear() + 1);
    return {
      cleanTitle: title.slice(0, monthDayMatch.index).trimEnd() +
        title.slice(monthDayMatch.index! + monthDayMatch[0].length).trimStart(),
      detectedDate: at8am(d),
    };
  }

  // "on 5/15" or "on 5/15/26"
  const mdMatch = lower.match(/\bon\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (mdMatch) {
    const month = parseInt(mdMatch[1], 10) - 1;
    const day = parseInt(mdMatch[2], 10);
    let year = mdMatch[3] ? parseInt(mdMatch[3], 10) : new Date().getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    return {
      cleanTitle: title.slice(0, mdMatch.index).trimEnd() +
        title.slice(mdMatch.index! + mdMatch[0].length).trimStart(),
      detectedDate: at8am(d),
    };
  }

  return { cleanTitle: title, detectedDate: null };
}

export function formatDetectedDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
