import 'ldrs/react/DotPulse.css';

import { DotPulse } from 'ldrs/react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/92">
      <div className="flex flex-col items-center gap-4">
        <DotPulse size="70" speed="1.2" color="white" />
      </div>
    </div>
  );
}
