'use client';

import { useEffect, useState } from 'react';

import { getCountdownParts, type CountdownParts } from '../utils';

export function useCountdown(target: Date): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));

  useEffect(() => {
    setParts(getCountdownParts(target));
    const interval = window.setInterval(() => {
      setParts(getCountdownParts(target));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return parts;
}
