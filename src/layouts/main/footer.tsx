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
    <section className={isHomePage ? 'relative bg-black py-10 sm:py-12 md:py-16' : 'relative bg-black py-6 sm:py-8'}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {isHomePage ? (
          <>
            <div className="text-center">
              <h2 className="mb-2 text-4xl font-medium text-white sm:text-[42px]">Newsletter</h2>

              <h3 className="mb-6 text-base font-normal text-system-text03 sm:mb-8 sm:text-lg">
                Get 20 Free Credits — Subscribe Now
              </h3>

              <form onSubmit={handleSubmit} className="relative mx-auto mb-4 max-w-lg">
                <div
                  className="relative flex items-center gap-2 rounded-[32px] border border-white/40 p-2 backdrop-blur-[10px] sm:rounded-[50px] sm:p-0"
                  style={{ background: 'rgba(255, 255, 255, 0.24)' }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 min-w-0 flex-1 rounded-[28px] border-0 bg-transparent px-4 text-sm text-white placeholder:text-system-white40 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-14 sm:rounded-[50px] sm:px-6 sm:pr-32"
                  />

                  <button
                    type="submit"
                    className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:absolute sm:right-2 sm:top-2 sm:h-10 sm:px-6"
                  >
                    Subscribe
                  </button>
                </div>
              </form>

              <p className="mx-auto mb-10 max-w-xl text-sm font-normal text-system-text03/60 sm:mb-14 sm:text-base">
                Join our newsletter for product updates, tips, and special offers.
              </p>
            </div>

            <div className="mb-8 text-center sm:mb-10">
              <Logo variant="light" />

              <div className="mx-auto my-5 flex flex-wrap justify-center gap-3 sm:gap-0">
                {footerIcons.map(({ href, icon, id }) => (
                  <Link
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white hover:text-black sm:mx-2 sm:h-12 sm:w-12"
                  >
                    {icon}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-white/52 sm:text-base">What you imagine is what Vidu.</p>
            </div>
          </>
        ) : null}

        <div className="flex flex-col items-center gap-3 border-t border-t-white/8 pt-5 text-center text-sm text-white48 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-8">
            <span className="text-white/48">Copyright © {currentYear} mock4ielts</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-end">
            <Link
              href="/terms"
              className="text-white/48 transition-colors hover:cursor-pointer hover:text-white"
            >
              Terms of Use
            </Link>

            <Link
              href="/privacy"
              className="text-white/48 transition-colors hover:cursor-pointer hover:text-white"
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
