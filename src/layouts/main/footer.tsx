'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/src/components/logo';
import { usePathname } from 'next/navigation';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaThreads, FaXTwitter, FaInstagram } from 'react-icons/fa6';

export function MainFooter() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const isHomePage = pathname === '/';
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    console.log('Subscribed:', email);

    // keyin API ulaysiz
    // await fetch("/api/subscribe", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email }),
    // });

    setEmail('');
  };

  return (
    <section
      className={
        isHomePage
          ? 'relative bg-background py-10 text-foreground sm:py-12 md:py-16'
          : 'relative bg-background py-6 text-foreground sm:py-8'
      }
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {isHomePage ? (
          <>
            <div className="text-center">
              <h2 className="mb-2 text-4xl font-medium text-black sm:text-[42px] dark:text-white">Newsletter</h2>

              <h3 className="mb-6 text-base font-normal text-black/64 sm:mb-8 sm:text-lg dark:text-white/64">
                Get 20 Free Credits — Subscribe Now
              </h3>

              <form onSubmit={handleSubmit} className="relative mx-auto mb-4 max-w-lg">
                <div
                  className="relative flex items-center gap-2 rounded-[32px] border border-transparent bg-[#ededed] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[10px] sm:rounded-[50px] sm:p-0 dark:border-white/40 dark:bg-white/[0.24] dark:shadow-none"
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 min-w-0 flex-1 rounded-[28px] border-0 bg-transparent px-4 text-sm text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-14 sm:rounded-[50px] sm:px-6 sm:pr-32 dark:text-white dark:placeholder:text-white/40"
                  />

                  <button
                    type="submit"
                    className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-black/85 sm:absolute sm:right-2 sm:top-2 sm:h-10 sm:px-6 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    Subscribe
                  </button>
                </div>
              </form>

              <p className="mx-auto mb-10 max-w-xl text-sm font-normal text-black/52 sm:mb-14 sm:text-base dark:text-white/52">
                Join our newsletter for product updates, tips, and special offers.
              </p>
            </div>

            <div className="mb-8 text-center sm:mb-10">
              <Logo className="text-black dark:text-white" />

              <div className="mx-auto my-5 flex flex-wrap justify-center gap-3 sm:gap-0">
                {footerIcons.map(({ href, icon, id }) => (
                  <Link
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-white text-black shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-colors hover:bg-black hover:text-white sm:mx-2 sm:h-12 sm:w-12 dark:border-white/50 dark:bg-transparent dark:text-white dark:shadow-none dark:hover:bg-white dark:hover:text-black"
                  >
                    {icon}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-black/52 sm:text-base dark:text-white/52">What you imagine is what Vidu.</p>
            </div>
          </>
        ) : null}

        <div className="flex flex-col items-center gap-3 border-t border-t-black/8 pt-5 text-center text-sm text-black/48 dark:border-t-white/8 dark:text-white/48 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-8">
            <span className="text-black/48 dark:text-white/48">Copyright © {currentYear} mock4ielts</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-end">
            <Link
              href="/terms"
              className="text-black/48 transition-colors hover:cursor-pointer hover:text-black dark:text-white/48 dark:hover:text-white"
            >
              Terms of Use
            </Link>

            <Link
              href="/privacy"
              className="text-black/48 transition-colors hover:cursor-pointer hover:text-black dark:text-white/48 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const footerIcons = [
  { id: 'x', icon: <FaXTwitter className="size-5" />, href: '' },
  {
    id: 'threads',
    icon: <FaThreads className="size-5" />,
    href: 'https://www.youtube.com/@mock4ielts',
  },
  {
    id: 'instagram',
    icon: <FaInstagram className="size-5" />,
    href: 'https://discord.gg/mock4ielts',
  },
  {
    id: 'telegram',
    icon: <FaTelegramPlane className="size-5" />,
    href: 'https://discord.gg/mock4ielts',
  },
];
