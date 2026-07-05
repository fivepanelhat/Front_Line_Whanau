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
      <div className="bg-bg-secondary rounded-2xl border border-border max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Welcome to the Beta!</h2>

        <div className="space-y-4 text-text-secondary text-sm mb-6">
          <p>
            You are testing the <strong>Front Line Whanau Assistant</strong>. We&apos;re so glad you&apos;re here to help us shape this tool!
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-300">
            <strong>Important Medical Disclaimer</strong>
            <p className="mt-1">
              This AI is an experimental support tool and is <strong>NOT</strong> a doctor. It cannot diagnose or provide medical advice. Always call 111 in an emergency, or PlunketLine/Healthline for urgent medical questions.
            </p>
          </div>
          <p>
            By continuing, you agree that your feedback (Thumbs Up/Down) may be reviewed by practitioners to improve the system.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-3 bg-accent-primary text-accent-ink font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
