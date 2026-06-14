/**
 * 赛季日历：把"第 N 天"换算成真实日期（6/5 开播 → 7/4 收官）。
 */
function addDays(iso: string, days: number): Date {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d;
}

/** 第 day 天（1 起）对应的日期标签，如 "6/13"。 */
export function dateLabel(startIso: string, day: number): string {
  const d = addDays(startIso, day - 1);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
