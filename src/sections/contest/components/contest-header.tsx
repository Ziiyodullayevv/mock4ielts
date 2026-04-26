type ContestHeaderProps = {
  cupImageUrl: string;
  title?: string;
  subtitle?: string;
};

export function ContestHeader({
  cupImageUrl,
  title = 'Mock4IELTS Contest',
  subtitle = 'Contest every week. Compete and see your ranking!',
}: ContestHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={cupImageUrl}
        alt=""
        className="h-45 w-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
      />
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-white">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-stone-500 sm:text-base dark:text-stone-400">
        {subtitle}
      </p>
    </div>
  );
}
