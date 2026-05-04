import { useEffect, useRef, useState } from 'react';
import { TopBar } from './sections/TopBar';
import { Hero } from './sections/Hero';
import { TwoPaths } from './sections/TwoPaths';
import { Hype } from './sections/Hype';
import { HowItWorks } from './sections/HowItWorks';
import { Waitlist, type WaitlistAPI } from './sections/Waitlist';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { initTelemetry } from './lib/telemetry';
import { useScrollDepth } from './hooks/useScrollDepth';
import type { Role } from './schema-types/waitlist';

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const apiRef = useRef<WaitlistAPI | null>(null);

  useEffect(() => {
    initTelemetry();
  }, []);
  useScrollDepth();

  const pickRole = (r: Role) => {
    setRole(r);
    apiRef.current?.setRole(r);
  };

  return (
    <>
      <TopBar />
      <main>
        <Hero onPickRole={pickRole} />
        <TwoPaths onPickRole={pickRole} />
        <Hype />
        <HowItWorks />
        <Waitlist preselectedRole={role} apiRef={apiRef} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
