'use client';

import React, { useState, useEffect } from 'react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenBetaWelcome');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hasSeenBetaWelcome', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-bg-secondary border-border w-full max-w-lg rounded-2xl border p-6">
        <h2 className="text-text-primary mb-4 text-2xl font-bold">Nau mai — welcome</h2>

        <div className="text-text-secondary mb-6 space-y-4 text-sm leading-relaxed">
          <p>
            You are using the <strong>Front Line Whānau</strong> assistant. This space is for the
            tough stretches of the preterm and frontline journey — and for the hope, humour, and
            milestones that belong here too.
          </p>
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">
            <strong>Important medical disclaimer</strong>
            <p className="mt-1">
              This AI is a support tool and is <strong>not</strong> a doctor. It cannot diagnose or
              provide medical advice. Always call <strong>111</strong> in an emergency, or
              Healthline / PlunketLine for urgent questions.
            </p>
          </div>
          <p>
            By continuing, you agree that feedback (thumbs up/down) may be reviewed by practitioners
            to improve the system — with care for cultural safety.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          className="bg-accent-primary text-accent-ink w-full rounded-xl py-3 font-semibold transition-opacity hover:opacity-90"
        >
          I understand — continue
        </button>
      </div>
    </div>
  );
}
