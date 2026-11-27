import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  WifiOff,
  Lock,
  Cpu,
  ScanSearch,
  FileJson,
  ArrowRight,
  Eye,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ScanSearch,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/25',
    title: 'Smart PII Detection',
    desc: 'Emails, phones, PAN, Aadhaar, credit cards (Luhn), IPv4/IPv6 — all detected with live regex and checksum validation right in your browser.',
  },
  {
    icon: Lock,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    title: 'Three Redaction Modes',
    desc: 'Full mask, context-preserving partial mask, or consistent pseudonymization that maps repeated values to stable tokens across your entire dataset.',
  },
  {
    icon: Cpu,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/25',
    title: 'Luhn & Verhoeff Verified',
    desc: 'Credit cards are Luhn-validated; Aadhaar numbers verified with the Verhoeff checksum algorithm — false positives are audited and counted separately.',
  },
  {
    icon: FileJson,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    title: 'CSV Column Sanitization',
    desc: 'Upload .csv files with quoted fields, pick columns to sanitize, and download clean output — all via the browser FileReader API.',
  },
  {
    icon: WifiOff,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/25',
    title: '100% Client-Side',
    desc: 'Zero bytes leave your machine. Every regex, checksum, pseudonym map, and exported file is generated purely in browser memory.',
  },
  {
    icon: Eye,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/25',
    title: 'Side-by-Side Diff',
    desc: 'Live highlighted diff compares original vs. sanitized output. Download a clean audit JSON — counts only, never raw PII.',
  },
];

const CATEGORIES = [
  { label: 'Email', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { label: 'Phone (Indian / Intl)', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { label: 'IPv4 / IPv6', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { label: 'Indian PAN', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { label: 'Aadhaar (Verhoeff)', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { label: 'Credit Card (Luhn)', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { label: 'Custom Regex / Keyword', color: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-16">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-28 sm:py-36 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-sky-500/5 blur-[100px]" />
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative mb-8 flex flex-col items-center gap-4">
          <div className="h-28 w-28 rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/60 ring-1 ring-emerald-500/20">
            <img
              src="/eagle-logo.png"
              alt="Eagles Eye"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Privacy badge */}
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Client-Side · Zero Data Leaves Browser
          </span>
        </div>

        <h1 className="relative text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
          eagles<span className="text-emerald-400">-eye</span>
        </h1>

        <p className="relative max-w-2xl text-lg sm:text-xl text-slate-300 leading-relaxed mb-10">
          A privacy-first PII detection and sanitization tool that runs{' '}
          <span className="text-white font-semibold">entirely in your browser</span>.
          Detect, validate, and redact sensitive data from raw text and CSV files
          — no uploads, no servers, no leaks.
        </p>

        <div className="relative flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/detector"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-950/60"
          >
            Open Detector
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/Joyboy-02/Eagles-eye"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-slate-200 font-semibold text-sm hover:bg-white/10 hover:border-white/25 transition-all"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── Detected Categories ── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">
            Detects & Validates
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.label}
                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border ${cat.color}`}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Everything you need to sanitize PII
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built with Luhn and Verhoeff checksum verification so only real PII is flagged — not random numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl bg-slate-900/60 border border-white/8 p-6 flex flex-col gap-3 hover:border-white/15 hover:bg-slate-900/80 transition-all"
                >
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${f.bg}`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-50">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-sky-500/10 border border-white/10 p-10 sm:p-14 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-5" />
          <h2 className="text-3xl font-bold mb-3">Your data never leaves your browser.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Paste text or upload a file — it stays in memory only. No API calls, no telemetry, no cloud storage.
          </p>
          <Link
            to="/detector"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-950/60"
          >
            Start Detecting PII
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-900 py-5 px-4 text-center text-xs text-slate-600">
        eagles-eye · All detection, validation, and exports run 100% locally · Zero bytes transmitted
      </footer>
    </div>
  );
}
