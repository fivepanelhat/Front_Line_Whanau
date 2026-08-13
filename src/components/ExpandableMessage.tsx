'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const PREVIEW_CHARS = 420;

/**
 * Progressive disclosure for long AI replies — short first, expand for full text.
 * Reduces cognitive load in high-stress journeys.
 */
export function ExpandableMessage({
  content,
  markdown = false,
}: {
  content: string;
  markdown?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsClamp = content.trim().length > PREVIEW_CHARS;
  const shown =
    !needsClamp || expanded ? content : `${content.trim().slice(0, PREVIEW_CHARS).trimEnd()}…`;

  return (
    <div>
      {markdown ? (
        <div className="prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 max-w-none break-words">
          <ReactMarkdown>{shown}</ReactMarkdown>
        </div>
      ) : (
        <div className="break-words whitespace-pre-wrap">{shown}</div>
      )}
      {needsClamp && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-accent-secondary mt-2 text-xs font-semibold underline-offset-2 hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Show more detail'}
        </button>
      )}
    </div>
  );
}
