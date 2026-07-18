'use client';

import React from 'react';
import { useStopwatch, useCountdown } from '../hooks/useCareTimers';

export function CareTimers() {
  const feeding = useStopwatch('flw-timer-feeding');
  const pumping = useStopwatch('flw-timer-pumping');
  const sterilizing = useCountdown('flw-timer-sterilizing', 5); // 5 mins default

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-heading text-text-primary text-2xl font-extrabold">Care Timers</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Keep track of feeding, pumping, and sterilising. These timers continue running even if you
          close the app.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Feeding Timer */}
        <div className="glass-panel flex flex-col items-center justify-center space-y-4 p-6">
          <div className="text-4xl">🍼</div>
          <h3 className="text-text-primary text-lg font-bold">Feeding</h3>
          <div className="text-accent-primary font-mono text-4xl font-bold tabular-nums">
            {feeding.formatTime(feeding.elapsedMs)}
          </div>
          <div className="mt-4 flex w-full gap-2">
            {feeding.isRunning ? (
              <button
                onClick={feeding.stop}
                className="bg-accent-warm hover:bg-accent-warm/80 flex-1 rounded-lg py-2 font-semibold text-white transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={feeding.start}
                className="bg-accent-success hover:bg-accent-success/80 flex-1 rounded-lg py-2 font-semibold text-white transition-colors"
              >
                {feeding.elapsedMs > 0 ? 'Resume' : 'Start'}
              </button>
            )}
            <button
              onClick={feeding.reset}
              disabled={feeding.elapsedMs === 0}
              className="text-text-secondary rounded-lg border border-white/[0.08] px-4 font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Pumping Timer */}
        <div className="glass-panel flex flex-col items-center justify-center space-y-4 p-6">
          <div className="text-4xl">🤱</div>
          <h3 className="text-text-primary text-lg font-bold">Pumping</h3>
          <div className="text-accent-secondary font-mono text-4xl font-bold tabular-nums">
            {pumping.formatTime(pumping.elapsedMs)}
          </div>
          <div className="mt-4 flex w-full gap-2">
            {pumping.isRunning ? (
              <button
                onClick={pumping.stop}
                className="bg-accent-warm hover:bg-accent-warm/80 flex-1 rounded-lg py-2 font-semibold text-white transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={pumping.start}
                className="bg-accent-success hover:bg-accent-success/80 flex-1 rounded-lg py-2 font-semibold text-white transition-colors"
              >
                {pumping.elapsedMs > 0 ? 'Resume' : 'Start'}
              </button>
            )}
            <button
              onClick={pumping.reset}
              disabled={pumping.elapsedMs === 0}
              className="text-text-secondary rounded-lg border border-white/[0.08] px-4 font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sterilising Timer */}
        <div className="glass-panel flex flex-col items-center justify-center space-y-4 border-t-4 border-t-indigo-400 p-6">
          <div className="text-4xl">✨</div>
          <h3 className="text-text-primary text-lg font-bold">Sterilising (5m)</h3>
          <div
            className={`font-mono text-4xl font-bold tabular-nums ${sterilizing.remainingMs === 0 ? 'text-accent-success' : 'text-indigo-400'}`}
          >
            {sterilizing.formatTime(sterilizing.remainingMs)}
          </div>
          <div className="mt-4 flex w-full gap-2">
            {sterilizing.remainingMs === 0 ? (
              <button
                onClick={sterilizing.reset}
                className="bg-accent-success hover:bg-accent-success/80 flex-1 rounded-lg py-2 font-semibold text-white transition-colors"
              >
                Done - Reset
              </button>
            ) : sterilizing.isRunning ? (
              <button
                onClick={sterilizing.stop}
                className="bg-accent-warm hover:bg-accent-warm/80 flex-1 rounded-lg py-2 font-semibold text-white transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={sterilizing.start}
                className="flex-1 rounded-lg bg-indigo-500 py-2 font-semibold text-white transition-colors hover:bg-indigo-600"
              >
                {sterilizing.remainingMs < 5 * 60 * 1000 ? 'Resume' : 'Start'}
              </button>
            )}
            {sterilizing.remainingMs > 0 && sterilizing.remainingMs < 5 * 60 * 1000 && (
              <button
                onClick={sterilizing.reset}
                className="text-text-secondary rounded-lg border border-white/[0.08] px-4 font-semibold transition-colors hover:bg-white/5"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
