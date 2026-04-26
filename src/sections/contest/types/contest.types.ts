export type ContestStatus = 'live' | 'upcoming';

export type ContestItem = {
  id: string;
  title: string;
  slug: string;
  /** ISO date string of when the contest starts */
  startsAt: string;
  /** ISO date string of when the contest ends (used to detect live state) */
  endsAt: string;
  /** Hero image shown on the tilted card face */
  imageUrl: string;
  /** Card width in pixels on large screens */
  width?: number;
  /** Card height in pixels on large screens */
  height?: number;
  /** Linear gradient CSS used as base layer behind the image */
  gradient: string;
};
