/**
 * Practitioner affordance: cultural safety checklist before approving AI or directory content.
 * Does not block technically — visible guidance for HITL reviewers.
 */
export function CulturalReviewChecklist() {
  return (
    <aside
      className="border-accent-secondary/25 bg-accent-secondary/5 mb-6 rounded-xl border p-4 text-sm"
      aria-label="Cultural safety review checklist"
    >
      <p className="text-accent-secondary mb-2 font-semibold">Before you approve</p>
      <ul className="text-text-secondary list-inside list-disc space-y-1.5 text-xs leading-relaxed sm:text-sm">
        <li>Respectful of Māori, Pacific, and rural whānau contexts — no stereotypes or extraction</li>
        <li>Does not invent iwi, hapū, or organisational endorsement</li>
        <li>Plain language; trauma-informed; no false clinical certainty</li>
        <li>Sensitive data stays purpose-limited; escalate if cultural advice is required</li>
        <li>When unsure, reject or edit and seek cultural advisory rather than ship</li>
      </ul>
    </aside>
  );
}
