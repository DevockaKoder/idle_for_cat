/**
 * Formatting and Date calculation utilities for the Love Story Idle Game
 * Base birthdate: April 28, 1996 (День рождения любимого)
 * Meeting Day 10,359: September 7, 2024 (День нашего знакомства - 28 лет, 4 месяца, 10 дней)
 * Milestone Day 11,089: September 7, 2026 (2 года со дня знакомства - 30 лет, 4 месяца, 10 дней)
 */

export const BIRTH_TIMESTAMP = new Date('1996-04-28T00:00:00').getTime();
export const MEETING_DAY = 10359; // 7 September 2024
export const PAUSE_DAY = 11089; // 7 September 2026 (2 years together)

export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num < 1000) return Math.floor(num).toLocaleString('ru-RU');
  // For 1,000 - 9,999: show like 2.58 тыс. or 1.25 тыс. so small gains are visible in real-time
  if (num < 10_000) {
    const formatted = (num / 1000).toFixed(2);
    return (formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted) + ' тыс.';
  }
  // For 10,000 - 999,999: show 12.5 тыс.
  if (num < 1_000_000) {
    const formatted = (num / 1000).toFixed(1);
    return (formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted) + ' тыс.';
  }
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(2).replace('.00', '') + ' млн';
  if (num < 1_000_000_000_000) return (num / 1_000_000_000).toFixed(2).replace('.00', '') + ' млрд';
  return (num / 1_000_000_000_000).toFixed(2).replace('.00', '') + ' трлн';
}

export function formatAgeFromDays(days: number): { years: number; months: number; days: number; text: string } {
  const diffDays = days - MEETING_DAY;
  
  if (diffDays === 0) {
    return { years: 28, months: 4, days: 10, text: '28 лет, 4 месяца, 10 дней' };
  }
  if (days >= PAUSE_DAY) {
    return { years: 30, months: 4, days: 10, text: '30 лет, 4 месяца, 10 дней' };
  }

  // Calculate proportional date
  const targetDate = new Date(BIRTH_TIMESTAMP + days * 24 * 60 * 60 * 1000);
  const birthDate = new Date(BIRTH_TIMESTAMP);

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let d = targetDate.getDate() - birthDate.getDate();

  if (d < 0) {
    months--;
    const prevMonthDays = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    d += prevMonthDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const yText = pluralizeRu(years, ['год', 'года', 'лет']);
  const mText = pluralizeRu(months, ['месяц', 'месяца', 'месяцев']);
  const dText = pluralizeRu(d, ['день', 'дня', 'дней']);

  return {
    years,
    months,
    days: d,
    text: `${years} ${yText}, ${months} ${mText}, ${d} ${dText}`,
  };
}

export function getCalendarDate(days: number): { dateStr: string; isBirthday: boolean; isAnniversary: boolean; month: number; day: number; year: number } {
  const date = new Date(BIRTH_TIMESTAMP + days * 24 * 60 * 60 * 1000);
  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dateStr = `${day} ${monthsRu[month]} ${year} г.`;
  
  const isBirthday = day === 28 && month === 3; // 28 April (month index 3)
  const isAnniversary = day === 7 && month === 8 && year >= 2024; // 7 September (month index 8)

  return { dateStr, isBirthday, isAnniversary, month, day, year };
}

export function getCalendarDateFromDays(days: number): string {
  return getCalendarDate(days).dateStr;
}

export function getDaysTogether(days: number): number {
  if (days < MEETING_DAY) return 0;
  return Math.floor(days - MEETING_DAY);
}

export function pluralizeRu(n: number, forms: [string, string, string]): string {
  const absN = Math.abs(n) % 100;
  const n1 = absN % 10;
  if (absN > 10 && absN < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

export function getStageTitle(days: number): { title: string; subtitle: string; era: string; color: string } {
  if (days < 365 * 18) {
    return {
      title: 'Детство и школьные годы',
      subtitle: 'Школа, первые мечты, книги и познание мира',
      era: 'Школьные годы',
      color: 'from-slate-600 to-slate-800'
    };
  }
  if (days < 365 * 23) {
    return {
      title: 'Студенчество & Старт карьеры',
      subtitle: 'Университет, самостоятельность, новые друзья и первая работа',
      era: 'Студенчество',
      color: 'from-blue-600 to-indigo-800'
    };
  }
  if (days < MEETING_DAY) {
    return {
      title: 'Уверенность & Одинокий путь',
      subtitle: 'Развитие, спорт, ремонт, в ожидании главной встречи в жизни...',
      era: 'Взрослая жизнь',
      color: 'from-cyan-700 to-blue-900'
    };
  }
  if (days < MEETING_DAY + 100) {
    return {
      title: 'Встреча, изменившая мир ✨',
      subtitle: '7 сентября 2024: Первые искры, ночные созвоны, бабочки в животе',
      era: 'Начало нашей истории',
      color: 'from-pink-500 to-rose-600'
    };
  }
  if (days < MEETING_DAY + 365) {
    return {
      title: 'Первый год нашей любви ❤️',
      subtitle: 'Киновечера, бесконечные звонки из разных городов, поездки друг к другу',
      era: 'Счастливый 1-й год',
      color: 'from-rose-500 to-amber-600'
    };
  }
  if (days < PAUSE_DAY) {
    return {
      title: '2 года вместе & Путешествия мечты ✈️',
      subtitle: 'Укрепляем любовь, копим воспоминания, считаем дни до совместной жизни',
      era: 'Любовь без границ',
      color: 'from-rose-600 to-purple-600'
    };
  }
  return {
    title: '2 года со дня знакомства! 💍',
    subtitle: '7 сентября 2026: Ровно 2 года (730 дней) нашей любви. Время для реальных свершений!',
    era: 'Новый этап в реальности',
    color: 'from-amber-500 to-rose-600'
  };
}
