export type RankingTab = 'global' | 'llm';

export type Medal = 'gold' | 'silver' | 'bronze';

export type RankingUser = {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  rating: number;
  attended: number;
  countryFlag?: string;
  profileUrl: string;
  medal?: Medal;
};
