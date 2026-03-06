'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { ReactNode } from 'react';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  // We can pass options to typical Lenis instance here
  // The 'root' true means this lenis instance handles the global window scroll
  return (
    <ReactLenis root options={{
      lerp: 0.1, // controls the "smoothness" (lower = smoother/longer, typical is 0.1)
      duration: 1.2, // duration of the scroll animation
      smoothWheel: true,
      wheelMultiplier: 1, // adjust for perceived speed
      touchMultiplier: 2, // makes touch scrolling feel more responsive
    }}>
      {children}
    </ReactLenis>
  );
}
