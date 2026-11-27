import { useState } from 'react';
import { Copy, Check, ShieldCheck } from 'lucide-react';
import { CATEGORY_STYLES } from '../utils/categoryStyles.js';
import { CATEGORY_META } from '../utils/piiDetector.js';

function RedactedChip({ seg }) {
  const style = CATEGORY_STYLES[seg.category] || CATEGORY_STYLES.CUSTOM;
  const label =
    seg.category === 'CUSTOM' && seg.ruleName
      ? seg.ruleName
      : CATEGORY_META[seg.category]?.shortLabel || seg.category;
  return (
    <span
      title={`${label} → was: ${seg.original}`}
      className={`inline rounded px-1 py-0.5 border text-[0.9em] font-semibold ${style.redactedChip}`}
    >
      {seg.replacement}
    </span>
  );
}

export function SanitizedOutput({ sanitizedText, isCsvMode, csvResult, selectedColumns }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!sanitizedText) return;
    try {
      await navigator.clipboard.writeText(sanitizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const selectedSet = new Set(selectedColumns);
  const hasContent = Boolean(sanitizedText);

  return (
    <section className="rounded-2xl bg-slate-900/70 border border-emerald-900/40 p-4 sm:p-5 flex flex-col gap-3 shadow-xl shadow-slate-950/40">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-emerald-300">
            Sanitized Output
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            ({sanitizedText.length.toLocaleString()} chars · safe to export)
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasContent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-300">Copied!</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
          )}
        </button>
      </div>

      {/* CSV Table view */}
      {isCsvMode && csvResult.headers?.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90 max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
              <tr>
                <th className="px-3 py-2.5 font-mono text-[11px] text-slate-500 w-10">#</th>
                {csvResult.headers.map((h, idx) => (
                  <th key={`${idx}-${h}`} className="px-3 py-2.5 font-semibold text-slate-200 whitespace-nowrap border-l border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono">{h}</span>
                      {selectedSet.has(idx) ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Sanitized</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Kept</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {csvResult.cellDiffs.map((rowCells, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40 align-top">
                  <td className="px-3 py-2 font-mono text-slate-500">{rIdx + 1}</td>
                  {rowCells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-l border-slate-800/70 font-mono text-[11px] max-w-[300px] break-words whitespace-pre-wrap">
                      {cell.matches?.length > 0 ? (
                        <span>
                          {cell.segments.map((seg, sIdx) =>
                            seg.type === 'text' ? (
                              <span key={sIdx} className="text-slate-300">{seg.text}</span>
                            ) : (
                              <RedactedChip key={sIdx} seg={seg} />
                            )
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">{cell.sanitized || <span className="text-slate-700">—</span>}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Plain text / .txt output */
        <pre className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 text-xs sm:text-sm font-mono text-slate-100 whitespace-pre-wrap break-words leading-relaxed min-h-[260px] max-h-[560px] overflow-y-auto">
          {hasContent
            ? sanitizedText
            : <span className="text-slate-600 italic">Nothing to display yet. Paste text or upload a file above.</span>
          }
        </pre>
      )}
    </section>
  );
}
