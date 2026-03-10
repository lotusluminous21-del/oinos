'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Disable Lenis smooth scroll in the admin and expert UI as it conflicts with 
  // nested scroll containers and interactive components.
  const isDisabledPath = pathname?.startsWith('/admin') || pathname?.startsWith('/expert');

  if (isDisabledPath) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{
      lerp: 0.1, 
      duration: 1.2, 
      smoothWheel: true,
      wheelMultiplier: 1, 
      touchMultiplier: 2, 
    }}>
      {children}
    </ReactLenis>
  );
}
