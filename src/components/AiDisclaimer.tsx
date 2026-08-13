/**
 * Persistent non-clinical / non-advisory disclaimer for AI surfaces.
 * Always visible; agents inform and draft only — humans decide.
 */
export function AiDisclaimer({
  variant = 'strip',
}: {
  variant?: 'strip' | 'footer';
}) {
  const body = (
    <>
      <span className="text-accent-warm font-semibold">Important:</span> This AI assists with
      information and drafts only. It is{' '}
      <strong>not a registered medical, financial, legal, or cultural advisor</strong>. Always
      consult a registered practitioner or trusted advisor for decisions about your whānau. In an
      emergency call <strong>111</strong>. Healthline <strong>0800 611 116</strong>.
    </>
  );

  if (variant === 'footer') {
    return <p className="text-text-muted/90 mt-3 text-center text-[11px] leading-relaxed">{body}</p>;
  }

  return (
    <div
      role="note"
      aria-label="AI support disclaimer"
      className="border-accent-warm/25 bg-accent-warm/10 text-text-secondary mb-3 rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
    >
      {body}
    </div>
  );
}
