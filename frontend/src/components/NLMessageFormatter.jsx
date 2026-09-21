import React from 'react';

/**
 * Parses inline markdown like **bold**, *italic*, and metrics into React elements.
 */
function renderInlineText(text) {
  if (!text) return null;

  // Split by bold **...**
  const boldParts = text.split(/\*\*([^*]+)\*\*/g);

  return boldParts.map((part, idx) => {
    if (idx % 2 === 1) {
      // Bold item
      return (
        <strong key={idx} className="font-bold text-on-surface">
          {part}
        </strong>
      );
    }

    // Normal text
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Full natural language block formatter:
 * Handles paragraphs, bullet lists, numbered lists, and takeaway callout cards.
 */
export default function NLMessageFormatter({ content }) {
  if (!content) return null;

  // Split by double newlines into logical blocks
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="flex flex-col gap-3 text-xs leading-relaxed text-on-surface selection:bg-primary-fixed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);

        // 1. Takeaway / Recommendation Callout Card
        if (
          trimmed.toLowerCase().startsWith('**key takeaway**:') ||
          trimmed.toLowerCase().startsWith('**takeaway**:') ||
          trimmed.toLowerCase().startsWith('**recommendation**:')
        ) {
          const colonIdx = trimmed.indexOf(':');
          const title = colonIdx !== -1 ? trimmed.substring(0, colonIdx).replace(/\*\*/g, '') : 'Takeaway';
          const body = colonIdx !== -1 ? trimmed.substring(colonIdx + 1).trim() : trimmed;

          return (
            <div
              key={bIdx}
              className="p-3.5 rounded-xl bg-primary-fixed/25 border border-primary/20 flex items-start gap-2.5 my-1"
            >
              <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {title}
                </span>
                <p className="text-xs text-on-surface font-medium leading-relaxed">
                  {renderInlineText(body)}
                </p>
              </div>
            </div>
          );
        }

        // 2. Bullet List (lines starting with • or - or *)
        const isBulletList = lines.every(
          (l) => l.startsWith('•') || l.startsWith('- ') || l.startsWith('* ')
        );
        if (isBulletList && lines.length > 0) {
          return (
            <ul key={bIdx} className="flex flex-col gap-1.5 pl-1 my-0.5">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[•\-*]\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0 mt-1.5"></span>
                    <span className="flex-1 text-on-surface/90 leading-relaxed">
                      {renderInlineText(cleanLine)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 3. Numbered List (lines starting with 1. , 2. , etc.)
        const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l));
        if (isNumberedList && lines.length > 0) {
          return (
            <ol key={bIdx} className="flex flex-col gap-2 pl-1 my-0.5">
              {lines.map((line, lIdx) => {
                const match = line.match(/^(\d+)\.\s*(.*)/);
                const num = match ? match[1] : String(lIdx + 1);
                const textAfter = match ? match[2] : line;
                return (
                  <li key={lIdx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="flex-1 text-on-surface/90 leading-relaxed">
                      {renderInlineText(textAfter)}
                    </span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 4. Standard Natural Language Paragraph
        return (
          <p key={bIdx} className="text-xs text-on-surface/90 leading-relaxed">
            {renderInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
