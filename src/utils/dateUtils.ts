export function calculateDaysSince(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  birth.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - birth.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : 0; // Korean custom: day 1 on birth day
}

export function calculateAgeDetails(birthDateStr: string): {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  formatted: string;
} {
  const birth = new Date(birthDateStr);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);

  let formatted = '';
  if (years > 0) {
    formatted = `${years}세 ${months}개월 (${totalMonths}개월)`;
  } else if (months > 0) {
    formatted = `${months}개월 ${days}일`;
  } else {
    formatted = `${days}일`;
  }

  return { years, months, days, totalMonths, formatted };
}

export interface CelebrationDDay {
  title: string;
  targetDate: string;
  dDayText: string;
  isPast: boolean;
}

export function getUpcomingCelebrations(birthDateStr: string): CelebrationDDay[] {
  const birth = new Date(birthDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = [
    { title: '100일', daysOffset: 99 },
    { title: '200일', daysOffset: 199 },
    { title: '300일', daysOffset: 299 },
    { title: '첫 돌 (1세 생일)', monthOffset: 12 },
    { title: '두 돌 (2세 생일)', monthOffset: 24 },
    { title: '세 돌 (3세 생일)', monthOffset: 36 },
  ];

  return events.map((ev) => {
    const target = new Date(birth);
    if (ev.daysOffset !== undefined) {
      target.setDate(target.getDate() + ev.daysOffset);
    } else if (ev.monthOffset !== undefined) {
      target.setFullYear(birth.getFullYear() + Math.floor(ev.monthOffset / 12));
    }
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let dDayText = '';
    if (diffDays === 0) {
      dDayText = 'D-DAY 오늘!';
    } else if (diffDays > 0) {
      dDayText = `D-${diffDays}`;
    } else {
      dDayText = `D+${Math.abs(diffDays)} (지남)`;
    }

    return {
      title: ev.title,
      targetDate: target.toISOString().split('T')[0],
      dDayText,
      isPast: diffDays < 0,
    };
  });
}

export function formatDateKR(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function calculateAgeAtDate(
  birthDateStr: string,
  targetDateStr: string
): {
  days: number;
  months: number;
  years: number;
  label: string;
} {
  const birth = new Date(birthDateStr);
  const target = new Date(targetDateStr);
  birth.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - birth.getTime();
  const days = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  if (target.getDate() < birth.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalMonths = Math.max(0, years * 12 + months);

  let label = `생후 ${days}일`;
  if (totalMonths > 0) {
    label += ` · ${totalMonths}개월`;
  }

  return { days, months: totalMonths, years, label };
}

