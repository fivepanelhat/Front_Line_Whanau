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
        <h2 className="text-2xl font-heading font-extrabold text-text-primary">Care Timers</h2>
        <p className="text-sm text-text-secondary mt-1">
          Keep track of feeding, pumping, and sterilising. These timers continue running even if you close the app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feeding Timer */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl">🍼</div>
          <h3 className="font-bold text-lg text-text-primary">Feeding</h3>
          <div className="text-4xl font-mono text-accent-primary font-bold tabular-nums">
            {feeding.formatTime(feeding.elapsedMs)}
          </div>
          <div className="flex gap-2 w-full mt-4">
            {feeding.isRunning ? (
              <button 
                onClick={feeding.stop}
                className="flex-1 bg-accent-warm text-white rounded-lg py-2 font-semibold hover:bg-accent-warm/80 transition-colors"
              >
                Pause
              </button>
            ) : (
              <button 
                onClick={feeding.start}
                className="flex-1 bg-accent-success text-white rounded-lg py-2 font-semibold hover:bg-accent-success/80 transition-colors"
              >
                {feeding.elapsedMs > 0 ? 'Resume' : 'Start'}
              </button>
            )}
            <button 
              onClick={feeding.reset}
              disabled={feeding.elapsedMs === 0}
              className="px-4 border border-white/[0.08] text-text-secondary rounded-lg font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Pumping Timer */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl">🤱</div>
          <h3 className="font-bold text-lg text-text-primary">Pumping</h3>
          <div className="text-4xl font-mono text-accent-secondary font-bold tabular-nums">
            {pumping.formatTime(pumping.elapsedMs)}
          </div>
          <div className="flex gap-2 w-full mt-4">
            {pumping.isRunning ? (
              <button 
                onClick={pumping.stop}
                className="flex-1 bg-accent-warm text-white rounded-lg py-2 font-semibold hover:bg-accent-warm/80 transition-colors"
              >
                Pause
              </button>
            ) : (
              <button 
                onClick={pumping.start}
                className="flex-1 bg-accent-success text-white rounded-lg py-2 font-semibold hover:bg-accent-success/80 transition-colors"
              >
                {pumping.elapsedMs > 0 ? 'Resume' : 'Start'}
              </button>
            )}
            <button 
              onClick={pumping.reset}
              disabled={pumping.elapsedMs === 0}
              className="px-4 border border-white/[0.08] text-text-secondary rounded-lg font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sterilising Timer */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-4 border-t-4 border-t-indigo-400">
          <div className="text-4xl">✨</div>
          <h3 className="font-bold text-lg text-text-primary">Sterilising (5m)</h3>
          <div className={`text-4xl font-mono font-bold tabular-nums ${sterilizing.remainingMs === 0 ? 'text-accent-success' : 'text-indigo-400'}`}>
            {sterilizing.formatTime(sterilizing.remainingMs)}
          </div>
          <div className="flex gap-2 w-full mt-4">
            {sterilizing.remainingMs === 0 ? (
              <button 
                onClick={sterilizing.reset}
                className="flex-1 bg-accent-success text-white rounded-lg py-2 font-semibold hover:bg-accent-success/80 transition-colors"
              >
                Done - Reset
              </button>
            ) : sterilizing.isRunning ? (
              <button 
                onClick={sterilizing.stop}
                className="flex-1 bg-accent-warm text-white rounded-lg py-2 font-semibold hover:bg-accent-warm/80 transition-colors"
              >
                Pause
              </button>
            ) : (
              <button 
                onClick={sterilizing.start}
                className="flex-1 bg-indigo-500 text-white rounded-lg py-2 font-semibold hover:bg-indigo-600 transition-colors"
              >
                {sterilizing.remainingMs < 5 * 60 * 1000 ? 'Resume' : 'Start'}
              </button>
            )}
            {sterilizing.remainingMs > 0 && sterilizing.remainingMs < 5 * 60 * 1000 && (
              <button 
                onClick={sterilizing.reset}
                className="px-4 border border-white/[0.08] text-text-secondary rounded-lg font-semibold hover:bg-white/5 transition-colors"
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
