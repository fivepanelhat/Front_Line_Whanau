'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Values } from '@/components/Values';
import { Footer } from '@/components/Footer';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const [isHubOpen, setIsHubOpen] = useState(false);

  return (
    <>
      <Header onLaunchHub={() => setIsHubOpen(true)} />
      <main>
        <Hero onLaunchHub={() => setIsHubOpen(true)} />
        <Features />
        <Values />
      </main>
      <Footer />

      {isHubOpen && (
        <Dashboard onClose={() => setIsHubOpen(false)} />
      )}
    </>
  );
}

