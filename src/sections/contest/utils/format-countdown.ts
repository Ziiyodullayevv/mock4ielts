export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export function getCountdownParts(target: Date, now: Date = new Date()): CountdownParts {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalMs };
}

export function formatCountdown(parts: CountdownParts): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  if (parts.days > 0) {
    return `${parts.days}d ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
  }
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}

export function formatStartLabel(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMins = String(absOffset % 60).padStart(2, '0');
  return `${weekday}, ${month} ${day}, ${hours}:${minutes} GMT${sign}${offsetHours}:${offsetMins}`;
}
