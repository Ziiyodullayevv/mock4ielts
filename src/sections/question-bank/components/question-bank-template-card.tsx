import type { QuestionBankTemplateCard } from '../types';

type QuestionBankTemplateCardProps = {
  card: QuestionBankTemplateCard;
};

export function QuestionBankTemplateCard({ card }: QuestionBankTemplateCardProps) {
  return (
    <article className="group relative h-[156px] overflow-hidden rounded-xl  bg-[#0e1115] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <video
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={card.poster}
        aria-label={card.title}
      >
        <source src={card.video} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.42)_100%)]" />

      <div className="absolute inset-x-5 top-4 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 max-w-[80%] text-[19px] font-medium tracking-[-0.03em] text-white">
          {card.title}
        </h3>

        {card.badge ? (
          <span className="rounded-full bg-black/58 px-3 py-1 text-[12px] font-semibold tracking-[0.08em] text-white/92">
            {card.badge}
          </span>
        ) : null}
      </div>
    </article>
  );
}
