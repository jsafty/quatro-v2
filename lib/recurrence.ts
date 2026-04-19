/**
 * Given a task's current start date (ISO string) and recurrence rule,
 * returns the next ISO datetime string that is strictly in the future.
 *
 * Advances from the original start date in recurrence intervals so the
 * schedule rhythm is preserved (e.g. a Monday task always lands on Monday).
 */
export function computeNextOccurrence(startDate: string, recurrence: string): string {
  const now = new Date();
  const d = new Date(startDate);

  do {
    switch (recurrence) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekday":
        d.setDate(d.getDate() + 1);
        while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "biweekly":
        d.setDate(d.getDate() + 14);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      default:
        break;
    }
  } while (d <= now);

  return d.toISOString();
}
