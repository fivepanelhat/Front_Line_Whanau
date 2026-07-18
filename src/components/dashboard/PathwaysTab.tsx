'use client';

import { useEffect, useState } from 'react';
import { PATHWAY_DATA, type PathwayKey } from './pathway-data';

export function PathwaysTab() {
  const [selectedPathway, setSelectedPathway] = useState<PathwayKey>('financial');
  const [pathwayProgress, setPathwayProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('flw-pathway-progress');
    if (saved) {
      try {
        setPathwayProgress(JSON.parse(saved));
      } catch {
        /* ignore parser error */
      }
    }
  }, []);

  const toggleStep = (stepId: string) => {
    const updated = { ...pathwayProgress, [stepId]: !pathwayProgress[stepId] };
    setPathwayProgress(updated);
    localStorage.setItem('flw-pathway-progress', JSON.stringify(updated));
  };

  const pathwayButtons: Array<{ key: PathwayKey; label: string }> = [
    { key: 'financial', label: '💰 Financial Entitlements' },
    { key: 'housing', label: '🏠 Rental & Tenancy' },
    { key: 'mental', label: '💚 Perinatal Wellbeing' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-heading text-text-primary text-2xl font-extrabold">
          Personalised Pathways
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          Select and track your support journey checklists. All checklist updates are saved directly
          to your local browser storage.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
        {pathwayButtons.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedPathway(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              selectedPathway === key
                ? 'bg-accent-secondary text-accent-ink'
                : 'text-text-secondary bg-white/5 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass-panel space-y-6 p-6">
        <h3 className="text-text-primary text-lg font-bold">
          {PATHWAY_DATA[selectedPathway].title}
        </h3>
        <div className="space-y-4">
          {PATHWAY_DATA[selectedPathway].steps.map((step, idx) => {
            const checked = !!pathwayProgress[step.id];
            return (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleStep(step.id);
                  }
                }}
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-all ${
                  checked
                    ? 'border-accent-success/20 bg-accent-success/[0.03]'
                    : 'bg-bg-secondary/40 border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="accent-accent-success pointer-events-none h-5 w-5 cursor-pointer rounded"
                    aria-label={`Mark step ${idx + 1} as completed`}
                    tabIndex={-1}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-semibold ${checked ? 'text-text-secondary line-through' : 'text-text-primary'}`}
                  >
                    Step {idx + 1}: {step.title}
                  </h4>
                  <p className="text-text-secondary mt-1 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
