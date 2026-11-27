import { useState } from 'react';
import {
  EyeOff,
  SlidersHorizontal,
  KeyRound,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { CATEGORY_META } from '../utils/piiDetector.js';
import { REDACTION_MODES } from '../utils/redactor.js';
import { CATEGORY_STYLES } from '../utils/categoryStyles.js';

const MODE_CARDS = [
  {
    id: REDACTION_MODES.FULL,
    title: 'Full Mask',
    example: '[REDACTED_CARD]',
    desc: 'Replaces entities with explicit category markers.',
    icon: EyeOff,
  },
  {
    id: REDACTION_MODES.PARTIAL,
    title: 'Partial Mask',
    example: 'XXXX-XXXX-XXXX-1234',
    desc: 'Preserves last digits or domain context for verification.',
    icon: SlidersHorizontal,
  },
  {
    id: REDACTION_MODES.PSEUDONYM,
    title: 'Consistent Pseudonym',
    example: 'EMAIL_01 · USER_01',
    desc: 'Maps identical values to stable tokens across the entire input.',
    icon: KeyRound,
  },
];

export function ControlsPanel({
  redactionMode,
  onChangeMode,
  enabledCategories,
  onToggleCategory,
  aadhaarFormatOnly,
  onToggleAadhaarFormatOnly,
  customRules,
  onAddCustomRule,
  onToggleCustomRule,
  onDeleteCustomRule,
  customRuleErrors,
  counts,
  pseudonymCount,
  onExportPseudonyms,
}) {
  const [ruleName, setRuleName] = useState('');
  const [rulePattern, setRulePattern] = useState('');
  const [ruleIsRegex, setRuleIsRegex] = useState(true);
  const [ruleCaseSensitive, setRuleCaseSensitive] = useState(false);

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!rulePattern.trim()) return;
    onAddCustomRule({
      name: ruleName.trim() || 'USER',
      pattern: rulePattern,
      isRegex: ruleIsRegex,
      caseSensitive: ruleCaseSensitive,
    });
    setRuleName('');
    setRulePattern('');
  };

  return (
    <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5 flex flex-col gap-5 shadow-xl shadow-slate-950/40">
      {/* Redaction Mode */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Redaction Mode
          </h2>
          {redactionMode === REDACTION_MODES.PSEUDONYM && (
            <button
              type="button"
              onClick={onExportPseudonyms}
              disabled={pseudonymCount === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Mapping JSON ({pseudonymCount})
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {MODE_CARDS.map((card) => {
            const Icon = card.icon;
            const active = redactionMode === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onChangeMode(card.id)}
                className={`text-left rounded-xl p-3 border transition cursor-pointer flex flex-col gap-1 ${
                  active
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {card.title}
                  </span>
                  {active && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{card.desc}</p>
                <code className="text-[11px] text-emerald-300/90 font-mono mt-0.5 truncate">
                  {card.example}
                </code>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Toggles & Checksum Options */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pt-1 border-t border-slate-800/80">
        <div className="xl:col-span-7 flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Detection Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(CATEGORY_META).map((meta) => {
              const enabled = Boolean(enabledCategories[meta.id]);
              const style = CATEGORY_STYLES[meta.id];
              const count = counts[meta.id] ?? 0;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => onToggleCategory(meta.id)}
                  title={meta.description}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    enabled
                      ? style.badge
                      : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      enabled ? style.dot : 'bg-slate-600'
                    }`}
                  />
                  <span>{meta.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono ${
                      enabled ? 'bg-slate-950/50 text-slate-100' : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aadhaarFormatOnly}
                onChange={(e) => onToggleAadhaarFormatOnly(e.target.checked)}
                className="accent-rose-500 rounded cursor-pointer"
              />
              <span>
                Allow Aadhaar format-only match{' '}
                <span className="text-slate-500">(bypass Verhoeff checksum for synthetic test data)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Custom Rules Builder */}
        <div className="xl:col-span-5 flex flex-col gap-2.5 xl:border-l xl:border-slate-800/80 xl:pl-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Custom Regex / Keyword Rules
            </h2>
            <span className="text-[11px] text-slate-500">{customRules.length} configured</span>
          </div>

          <form onSubmit={handleAddRule} className="flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="Label (e.g. USER)"
                className="sm:col-span-4 rounded-lg bg-slate-950 border border-slate-800 focus:border-fuchsia-500/60 outline-none px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500"
              />
              <input
                type="text"
                value={rulePattern}
                onChange={(e) => setRulePattern(e.target.value)}
                placeholder={ruleIsRegex ? 'Regex e.g. EMP-\\d{4}' : 'Exact keyword'}
                className="sm:col-span-6 rounded-lg bg-slate-950 border border-slate-800 focus:border-fuchsia-500/60 outline-none px-2.5 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!rulePattern.trim()}
                className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40 hover:bg-fuchsia-500/30 disabled:opacity-40 px-2.5 py-1.5 text-xs font-medium transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleIsRegex}
                  onChange={(e) => setRuleIsRegex(e.target.checked)}
                  className="accent-fuchsia-500 cursor-pointer"
                />
                Use Regex
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleCaseSensitive}
                  onChange={(e) => setRuleCaseSensitive(e.target.checked)}
                  className="accent-fuchsia-500 cursor-pointer"
                />
                Case Sensitive
              </label>
            </div>
          </form>

          {customRules.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
              {customRules.map((rule) => {
                const err = customRuleErrors.find((e) => e.id === rule.id);
                return (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${
                      err
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        : 'bg-slate-950/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => onToggleCustomRule(rule.id)}
                        className="accent-fuchsia-500 cursor-pointer"
                      />
                      <span className="font-semibold text-fuchsia-300 shrink-0">
                        {rule.name}
                      </span>
                      <code className="font-mono text-[11px] text-slate-400 truncate">
                        {rule.isRegex ? `/${rule.pattern}/` : `"${rule.pattern}"`}
                      </code>
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {err && (
                        <span title={err.error} className="text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteCustomRule(rule.id)}
                        className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {customRuleErrors.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-300">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Invalid regex in rule: {customRuleErrors[0].error}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
