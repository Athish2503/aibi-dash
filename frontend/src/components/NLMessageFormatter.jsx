import React, { useState } from 'react';

/**
 * Pre-processes and normalizes markdown text.
 * Fixes collapsed tables, inline bullet chains, and flattened headings.
 */
function normalizeMarkdown(rawText) {
  if (!rawText) return '';

  let text = rawText;

  // 1. Expand collapsed tables where rows were flattened with `| |`
  // e.g. `| Col 1 | Col 2 | | :--- | :--- | | Val 1 | Val 2 |` -> separates with newlines
  text = text.replace(/\|\s*\|(?!\s*\|)/g, '|\n|');

  // 2. Separate headings that have inline bullets stuck to them
  // e.g. `### Summary: * Bullet 1 * Bullet 2` -> `### Summary:\n* Bullet 1\n* Bullet 2`
  text = text.replace(/(#{1,4}\s+[^\n*:]+:?)\s*\*\s+/g, '$1\n* ');

  // 3. Unpack multiple bullets chained on a single line
  // e.g. `* Bullet 1. * Bullet 2.` -> `* Bullet 1.\n* Bullet 2.`
  text = text.replace(/(\n\s*[*•\-]\s+[^\n]+?)\s+\*\s+([A-Za-z0-9])/g, '$1\n* $2');

  return text;
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and metric tags.
 */
function renderInline(text) {
  if (!text) return null;

  // Pattern matches:
  // 1. `code`
  // 2. **bold**
  // 3. *italic*
  // 4. [link](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Inline code `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-surface-container-high/90 text-primary font-mono text-[11px] font-semibold border border-outline-variant/30 select-all"
        >
          {code}
        </code>
      );
    }

    // Bold **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-on-surface">
          {boldText}
        </strong>
      );
    }

    // Italic *...*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicText = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-on-surface/90">
          {italicText}
        </em>
      );
    }

    // Link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Standard text chunk
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Modern GPT-Style Markdown Table Component with Copy and Responsive Scroll
 */
function MarkdownTable({ rawLines }) {
  const [copied, setCopied] = useState(false);

  // Filter valid table pipe lines
  const cleanLines = rawLines.map((l) => l.trim()).filter((l) => l.startsWith('|') && l.endsWith('|'));
  if (cleanLines.length < 2) return null;

  const parseCells = (line) => {
    const raw = line.slice(1, -1).split('|');
    return raw.map((c) => c.trim());
  };

  const headers = parseCells(cleanLines[0]);
  const isSeparator = (line) => /^\|(\s*:?-+:?\s*\|)+$/.test(line);

  let dataStartIndex = 1;
  let alignments = headers.map(() => 'left');

  if (cleanLines.length > 1 && isSeparator(cleanLines[1])) {
    dataStartIndex = 2;
    const sepCells = parseCells(cleanLines[1]);
    alignments = sepCells.map((cell) => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    });
  }

  const rows = cleanLines.slice(dataStartIndex).map(parseCells);

  const handleCopyTable = () => {
    const tsv = [
      headers.join('\t'),
      ...rows.map((r) => r.join('\t')),
    ].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/90 overflow-hidden shadow-sm">
      {/* Table Top Bar */}
      <div className="px-3 py-1.5 bg-surface-container/60 border-b border-outline-variant/20 flex items-center justify-between text-[11px] text-secondary">
        <span className="font-semibold flex items-center gap-1.5 text-on-surface">
          <span className="material-symbols-outlined text-sm text-primary">table_chart</span>
          Data Comparison Table
        </span>
        <button
          type="button"
          onClick={handleCopyTable}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-secondary hover:text-on-surface transition-colors"
          title="Copy table to clipboard (TSV format for Excel/Power BI)"
        >
          <span className="material-symbols-outlined text-xs">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy Table'}</span>
        </button>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low/70 border-b border-outline-variant/30">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-3.5 py-2.5 font-bold text-[11px] tracking-wide text-on-surface ${
                    alignments[i] === 'right'
                      ? 'text-right'
                      : alignments[i] === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-[11px]">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-primary/5 transition-colors even:bg-surface-container-lowest odd:bg-surface-container-low/20"
              >
                {row.map((cell, cIdx) => {
                  const align = alignments[cIdx] || 'left';
                  const isNumberLike = /^[\$€£]?\s*-?\d+([.,]\d+)?%?$/.test(cell.trim()) || cell.includes('%');
                  return (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2 text-on-surface/90 ${
                        align === 'right' || isNumberLike
                          ? 'text-right font-mono'
                          : align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {renderInline(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Modern Fenced Code Block with Syntax Bar and 1-Click Copy
 */
function FencedCodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = (language || 'code').toUpperCase();

  return (
    <div className="my-3 rounded-xl border border-outline-variant/30 bg-[#141824] text-slate-100 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1e2336] border-b border-slate-700/60 text-[10px] text-slate-400">
        <span className="font-mono font-bold tracking-wider text-primary-fixed">{displayLang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-600/40"
        >
          <span className="material-symbols-outlined text-xs">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Full GPT-Style Natural Language Formatter:
 * Seamlessly parses tables, headers, lists, code blocks, blockquotes, and callouts.
 */
export default function NLMessageFormatter({ content }) {
  if (!content) return null;

  const normalized = normalizeMarkdown(content);

  // Split into raw lines for line-by-line streaming & structured block parsing
  const lines = normalized.split('\n');
  const elements = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // 1. Skip Empty Lines
    if (!trimmed) {
      lineIdx++;
      continue;
    }

    // 2. Fenced Code Block: ```lang
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      lineIdx++;
      while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('```')) {
        codeLines.push(lines[lineIdx]);
        lineIdx++;
      }
      if (lineIdx < lines.length) lineIdx++; // Skip closing ```
      elements.push(
        <FencedCodeBlock key={`code_${lineIdx}`} language={lang} code={codeLines.join('\n')} />
      );
      continue;
    }

    // 3. Markdown Table: starts with `|` and ends with `|`
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (
        lineIdx < lines.length &&
        lines[lineIdx].trim().startsWith('|') &&
        lines[lineIdx].trim().endsWith('|')
      ) {
        tableLines.push(lines[lineIdx]);
        lineIdx++;
      }
      elements.push(<MarkdownTable key={`table_${lineIdx}`} rawLines={tableLines} />);
      continue;
    }

    // 4. Headings: `# H1`, `## H2`, `### H3`, `#### H4`
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      if (level === 1) {
        elements.push(
          <h1 key={`h1_${lineIdx}`} className="text-base font-extrabold text-on-surface mt-3 mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-primary inline-block"></span>
            {renderInline(text)}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2 key={`h2_${lineIdx}`} className="text-sm font-bold text-on-surface mt-3 mb-1 flex items-center gap-1.5">
            <span className="w-1 h-3.5 rounded-full bg-primary/80 inline-block"></span>
            {renderInline(text)}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3 key={`h3_${lineIdx}`} className="text-xs font-bold text-on-surface uppercase tracking-wide mt-2.5 mb-1 flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-sm">label_important</span>
            {renderInline(text)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={`h4_${lineIdx}`} className="text-xs font-semibold text-on-surface/90 mt-2 mb-0.5">
            {renderInline(text)}
          </h4>
        );
      }
      lineIdx++;
      continue;
    }

    // 5. Horizontal Divider: `---` or `***`
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      elements.push(
        <div
          key={`hr_${lineIdx}`}
          className="h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent my-2.5"
        />
      );
      lineIdx++;
      continue;
    }

    // 6. Blockquote or Callout: `> text`
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('>')) {
        quoteLines.push(lines[lineIdx].trim().replace(/^>\s*/, ''));
        lineIdx++;
      }
      elements.push(
        <div
          key={`quote_${lineIdx}`}
          className="p-3 my-1.5 rounded-xl bg-primary-fixed/20 border-l-4 border-primary text-xs leading-relaxed text-on-surface flex items-start gap-2.5"
        >
          <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
            format_quote
          </span>
          <div className="flex flex-col gap-1">{renderInline(quoteLines.join(' '))}</div>
        </div>
      );
      continue;
    }

    // 7. Executive Takeaway / Recommendation Cards
    if (
      trimmed.toLowerCase().startsWith('**key takeaway**:') ||
      trimmed.toLowerCase().startsWith('**takeaway**:') ||
      trimmed.toLowerCase().startsWith('**recommendation**:') ||
      trimmed.toLowerCase().startsWith('**summary**:')
    ) {
      const colonIdx = trimmed.indexOf(':');
      const title = colonIdx !== -1 ? trimmed.substring(0, colonIdx).replace(/\*\*/g, '') : 'Takeaway';
      const body = colonIdx !== -1 ? trimmed.substring(colonIdx + 1).trim() : trimmed;

      elements.push(
        <div
          key={`takeaway_${lineIdx}`}
          className="p-3.5 my-1.5 rounded-xl bg-primary-fixed/25 border border-primary/25 flex items-start gap-2.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
            tips_and_updates
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
              {title}
            </span>
            <div className="text-xs text-on-surface font-medium leading-relaxed">
              {renderInline(body)}
            </div>
          </div>
        </div>
      );
      lineIdx++;
      continue;
    }

    // 8. Bullet List Items: `* `, `- `, `• `
    if (/^[*•\-]\s+/.test(trimmed)) {
      const listItems = [];
      while (lineIdx < lines.length && /^[*•\-]\s+/.test(lines[lineIdx].trim())) {
        listItems.push(lines[lineIdx].trim().replace(/^[*•\-]\s+/, ''));
        lineIdx++;
      }
      elements.push(
        <ul key={`ul_${lineIdx}`} className="flex flex-col gap-1.5 my-1 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80 shrink-0 mt-1.5" />
              <div className="flex-1 text-xs text-on-surface/90 leading-relaxed">
                {renderInline(item)}
              </div>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 9. Numbered List Items: `1. `, `2. `
    if (/^\d+\.\s+/.test(trimmed)) {
      const numberedItems = [];
      while (lineIdx < lines.length && /^\d+\.\s+/.test(lines[lineIdx].trim())) {
        const match = lines[lineIdx].trim().match(/^(\d+)\.\s+(.+)$/);
        if (match) {
          numberedItems.push({ num: match[1], text: match[2] });
        } else {
          numberedItems.push({ num: String(numberedItems.length + 1), text: lines[lineIdx].trim() });
        }
        lineIdx++;
      }
      elements.push(
        <ol key={`ol_${lineIdx}`} className="flex flex-col gap-2 my-1 pl-1">
          {numberedItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {item.num}
              </span>
              <div className="flex-1 text-xs text-on-surface/90 leading-relaxed">
                {renderInline(item.text)}
              </div>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 10. Standard Paragraph (can span multiple non-empty lines until blank line or special token)
    const paraLines = [];
    while (
      lineIdx < lines.length &&
      lines[lineIdx].trim() &&
      !lines[lineIdx].trim().startsWith('#') &&
      !lines[lineIdx].trim().startsWith('|') &&
      !lines[lineIdx].trim().startsWith('```') &&
      !/^[*•\-]\s+/.test(lines[lineIdx].trim()) &&
      !/^\d+\.\s+/.test(lines[lineIdx].trim()) &&
      !lines[lineIdx].trim().startsWith('>') &&
      !/^(\-{3,}|\*{3,})$/.test(lines[lineIdx].trim())
    ) {
      paraLines.push(lines[lineIdx].trim());
      lineIdx++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p key={`p_${lineIdx}`} className="text-xs text-on-surface/90 leading-relaxed my-1">
          {renderInline(paraLines.join(' '))}
        </p>
      );
    }
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs text-on-surface leading-relaxed select-text">
      {elements}
    </div>
  );
}
