import { useState } from 'react';
import { Columns2, Code2, Table2, ArrowRight } from 'lucide-react';
import { CATEGORY_META } from '../utils/piiDetector.js';
import { CATEGORY_STYLES } from '../utils/categoryStyles.js';

function HighlightedSegments({ segments, variant }) {
  if (!segments || segments.length === 0) {
    return <span className="text-slate-600 italic">Nothing to display yet.</span>;
  }

  return segments.map((seg, idx) => {
    if (seg.type === 'text') {
      return <span key={idx}>{seg.text}</span>;
    }

    const style = CATEGORY_STYLES[seg.category] || CATEGORY_STYLES.CUSTOM;
    const label =
      seg.category === 'CUSTOM' && seg.ruleName
        ? seg.ruleName
        : CATEGORY_META[seg.category]?.shortLabel || seg.category;

    if (variant === 'original') {
      return (
        <mark
          key={seg.id || idx}
          title={`${label} (${seg.validation})`}
          className={`inline rounded px-1 py-0.2 font-medium ${style.highlight}`}
        >
          {seg.original}
        </mark>
      );
    }

    return (
      <span
        key={seg.id || idx}
        title={`Original type: ${label} (${seg.validation})`}
        className={`inline rounded px-1 py-0.2 border text-[0.92em] font-semibold ${style.redactedChip}`}
      >
        {seg.replacement}
      </span>
    );
  });
}

export function SideBySideDiff({
  isCsvMode,
  rawText,
  textSegments,
  sanitizedText,
  csvResult,
  selectedColumns,
}) {
  const [csvViewMode, setCsvViewMode] = useState('table'); // 'table' | 'raw'
  const [plainOutputView, setPlainOutputView] = useState(false);

  const selectedSet = new Set(selectedColumns);

  return (
    <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5 flex flex-col gap-3 shadow-xl shadow-slate-950/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Columns2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Side-by-Side Verification Diff
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isCsvMode && (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setCsvViewMode('table')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition ${
                  csvViewMode === 'table'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                CSV Table Diff
              </button>
              <button
                type="button"
                onClick={() => setCsvViewMode('raw')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition ${
                  csvViewMode === 'raw'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Raw CSV Output
              </button>
            </div>
          )}

          {(!isCsvMode || csvViewMode === 'raw') && (
            <button
              type="button"
              onClick={() => setPlainOutputView((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                plainOutputView
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {plainOutputView ? 'Plain Text Mode' : 'Highlighted Chips'}
            </button>
          )}
        </div>
      </div>

      {isCsvMode && csvViewMode === 'table' ? (
        csvResult.headers.length === 0 ? (
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-8 text-center text-xs text-slate-500">
            Upload a .csv file or click &ldquo;Load Sample CSV&rdquo; to inspect cell-by-cell redaction.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90 max-h-[520px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
                <tr>
                  <th className="px-3 py-2.5 font-mono text-[11px] text-slate-500 w-10">#</th>
                  {csvResult.headers.map((h, idx) => (
                    <th
                      key={`${idx}-${h}`}
                      className="px-3 py-2.5 font-semibold text-slate-200 whitespace-nowrap border-l border-slate-800/80"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">{h}</span>
                        {selectedSet.has(idx) ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Sanitized
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Kept
                          </span>
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
                    {rowCells.map((cell, cIdx) => {
                      const hasChanges = cell.matches.length > 0;
                      return (
                        <td
                          key={cIdx}
                          className="px-3 py-2 border-l border-slate-800/70 font-mono text-[11px] max-w-[280px]"
                        >
                          {hasChanges ? (
                            <div className="flex flex-col gap-1">
                              <div className="text-slate-300 break-words whitespace-pre-wrap">
                                <HighlightedSegments segments={cell.segments} variant="original" />
                              </div>
                              <div className="flex items-start gap-1 text-emerald-300 break-words whitespace-pre-wrap">
                                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-slate-500" />
                                <div>
                                  <HighlightedSegments segments={cell.segments} variant="sanitized" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 break-words whitespace-pre-wrap">
                              {cell.original || <span className="text-slate-700">—</span>}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Original Pane */}
          <div className="flex flex-col rounded-xl bg-slate-950/90 border border-slate-800 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-800/90 bg-slate-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Original Input (Detected PII Highlighted)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {rawText.length.toLocaleString()} chars
              </span>
            </div>
            <pre className="p-3.5 text-xs sm:text-sm font-mono text-slate-200 whitespace-pre-wrap break-words leading-relaxed min-h-[260px] max-h-[520px] overflow-y-auto">
              {isCsvMode ? (
                rawText || <span className="text-slate-600 italic">No CSV loaded.</span>
              ) : (
                <HighlightedSegments segments={textSegments} variant="original" />
              )}
            </pre>
          </div>

          {/* Sanitized Pane */}
          <div className="flex flex-col rounded-xl bg-slate-950/90 border border-emerald-900/40 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-800/90 bg-emerald-950/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300">
                Sanitized Output (Safe to Share / Export)
              </span>
              <span className="text-[11px] text-emerald-400/80 font-mono">
                {sanitizedText.length.toLocaleString()} chars
              </span>
            </div>
            <pre className="p-3.5 text-xs sm:text-sm font-mono text-slate-100 whitespace-pre-wrap break-words leading-relaxed min-h-[260px] max-h-[520px] overflow-y-auto">
              {plainOutputView || isCsvMode ? (
                sanitizedText || <span className="text-slate-600 italic">Nothing to display yet.</span>
              ) : (
                <HighlightedSegments segments={textSegments} variant="sanitized" />
              )}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}
