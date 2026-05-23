type ContestHeaderProps = {
  cupImageUrl: string;
  title?: string;
  subtitle?: string;
};

export function ContestHeader({
  cupImageUrl,
  title = 'MOCK4IELTS Contest',
  subtitle = 'Contest every week. Compete and see your ranking!',
}: ContestHeaderProps) {
  return (
    <div className="flex flex-col mt-12 items-center text-center">
      <img src={cupImageUrl} alt="mock4ielts contest cup" className="h-45 w-auto object-contain" />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-stone-500 sm:text-base dark:text-stone-400">
        {subtitle}
      </p>
    </div>
  );
}
