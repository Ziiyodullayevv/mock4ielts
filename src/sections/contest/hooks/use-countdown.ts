'use client';

import { useState, useEffect } from 'react';

import { getCountdownParts, type CountdownParts } from '../utils';

export function useCountdown(target: Date): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParts(getCountdownParts(target));
    const interval = window.setInterval(() => {
      setParts(getCountdownParts(target));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return parts;
}
