type CalendarContest = {
  description?: string;
  endsAt: string;
  slug: string;
  startsAt: string;
  title: string;
};

const GOOGLE_CALENDAR_EVENT_URL = 'https://calendar.google.com/calendar/render';

function formatGoogleCalendarDate(value: string) {
  const date = new Date(value);

  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function getContestUrl(slug: string) {
  if (typeof window === 'undefined') {
    return slug;
  }

  return new URL(slug, window.location.origin).toString();
}

export function buildContestGoogleCalendarUrl(contest: CalendarContest) {
  const contestUrl = getContestUrl(contest.slug);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    dates: `${formatGoogleCalendarDate(contest.startsAt)}/${formatGoogleCalendarDate(contest.endsAt)}`,
    details:
      contest.description ||
      `Join ${contest.title} on Mock4IELTS. Contest link: ${contestUrl}`,
    location: contestUrl,
    text: contest.title,
  });

  return `${GOOGLE_CALENDAR_EVENT_URL}?${params.toString()}`;
}

export function openContestGoogleCalendar(contest: CalendarContest) {
  if (typeof window === 'undefined') {
    return;
  }

  window.open(buildContestGoogleCalendarUrl(contest), '_blank', 'noopener,noreferrer');
}
