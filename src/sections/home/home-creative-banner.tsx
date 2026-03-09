import Link from 'next/link';
import Image from 'next/image';

const BANNER_IMAGE = 'https://image01.cf.vidu.studio/vidu/media-asset/footerBanner-c97e6b56.webp';
const BANNER_VIDEO = 'https://image01.cf.vidu.studio/vidu/landing-page/banner.5a9fe413.mp4';

export function HomeCreativeBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div className="relative h-[420px] w-full overflow-hidden max-md:h-[320px]">
        <Image
          src={BANNER_IMAGE}
          alt="Video cover"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={BANNER_IMAGE}
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src={BANNER_VIDEO} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <h2 className="text-[48px] font-medium text-white max-md:text-[32px]">
            Real IELTS Exam Experience
          </h2>

          <div className="flex gap-4 max-md:flex-col-reverse">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-[#006aff] px-10 py-2 text-[16px] font-semibold text-white shadow-lg transition-all hover:shadow-xl max-md:text-[14px] max-md:leading-[28px]"
            >
              Try it now
            </Link>
          </div>
        </div>
      </div>

      <div className="-mt-[2px] relative flex w-full scale-y-[-1] items-center justify-center">
        <div className="relative aspect-video h-[155px] w-full max-md:h-[110px]">
          <Image
            src={BANNER_IMAGE}
            alt="Video reflection"
            fill
            sizes="100vw"
            className="hidden object-cover object-center"
          />

          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={BANNER_IMAGE}
            className="block h-full w-full object-cover object-bottom"
          >
            <source src={BANNER_VIDEO} type="video/mp4" />
          </video>
        </div>

        <div className="absolute h-[157px] w-full bg-gradient-to-b from-black to-black/60 backdrop-blur-[10px]" />
      </div>
    </section>
  );
}
