'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/src/components/logo';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaThreads, FaXTwitter, FaInstagram } from 'react-icons/fa6';

export function MainFooter() {
  const [email, setEmail] = useState('');

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
    <section className="relative bg-black pb-10 md:py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-4">
        <div className="text-center">
          <h2 className="mb-2 text-[42px] font-medium text-white md:text-3xl">Newsletter</h2>

          <h3 className="mb-8 text-lg font-normal text-system-text03 md:text-lg">
            Get 20 Free Credits — Subscribe Now
          </h3>

          <form onSubmit={handleSubmit} className="relative mx-auto mb-4 max-w-lg">
            <div
              className="relative rounded-[50px] border border-white/40 backdrop-blur-[10px]"
              style={{ background: 'rgba(255, 255, 255, 0.24)' }}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full rounded-[50px] border-0 bg-transparent px-6 pr-32 text-sm text-white placeholder:text-system-white40 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <button
                type="submit"
                className="absolute right-2 top-2 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Subscribe
              </button>
            </div>
          </form>

          <p className="mx-auto mb-14 text-base font-normal text-system-text03/60">
            Join our newsletter for product updates, tips, and special offers.
          </p>
        </div>

        <div className="text-center mb-10">
          <Logo variant="light" />

          <div className="mx-auto my-5 flex justify-center">
            {footerIcons.map(({ href, icon, id }) => (
              <Link
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white hover:text-black"
              >
                {icon}
              </Link>
            ))}
          </div>
          <p>What you imagine is what Vidu.</p>
        </div>

        <div className="flex justify-between border-t border-t-[#383838] pt-5 text-sm text-white48 sm:flex-col sm:gap-2 sm:text-center">
          <div className="flex gap-8 sm:flex-col sm:items-center sm:gap-2">
            <span className="text-white48">Copyright © 2025 Vidu®</span>
          </div>

          <div className="space-x-8">
            <Link
              href="/terms"
              className="text-white48 transition-colors hover:cursor-pointer hover:text-white"
            >
              Terms of Use
            </Link>

            <Link
              href="/privacy"
              className="text-white48 transition-colors hover:cursor-pointer hover:text-white"
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
  { id: 'threads', icon: <FaThreads className="size-5" />, href: 'https://www.youtube.com/@mock4ielts' },
  { id: 'instagram', icon: <FaInstagram className="size-5" />, href: 'https://discord.gg/mock4ielts' },
  { id: 'telegram', icon: <FaTelegramPlane className="size-5" />, href: 'https://discord.gg/mock4ielts' },
];
