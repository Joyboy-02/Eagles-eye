import { Link } from 'react-router-dom';
import {
  ShieldCheck, WifiOff, Lock, Cpu, ScanSearch,
  FileJson, ArrowRight, Eye,
} from 'lucide-react';

const FEATURES = [
  { icon: ScanSearch, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', title: 'Smart PII Detection', desc: 'Emails, phones, PAN, Aadhaar, credit cards (Luhn), IPv4/IPv6 — detected with live regex and checksum validation right in your browser.' },
  { icon: Lock, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', title: 'Three Redaction Modes', desc: 'Full mask, partial mask preserving context, or consistent pseudonymization that maps repeated values to stable tokens across your dataset.' },
  { icon: Cpu, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 border-fuchsia-200', title: 'Luhn & Verhoeff Verified', desc: 'Credit cards are Luhn-validated; Aadhaar numbers verified with the Verhoeff checksum algorithm — false positives audited separately.' },
  { icon: FileJson, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', title: 'CSV Column Sanitization', desc: 'Upload .csv files with quoted fields, pick columns to sanitize, download clean output — all via the browser FileReader API.' },
  { icon: WifiOff, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', title: '100% Client-Side', desc: 'Zero bytes leave your machine. Every regex, checksum, pseudonym map, and exported file is generated purely in browser memory.' },
  { icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', title: 'Sanitized Output Panel', desc: 'View clean redacted output with coloured chips. Download a clean audit JSON — counts only, never raw PII.' },
];

const CATEGORIES = [
  { label: 'Email', color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { label: 'Phone (Indian / Intl)', color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { label: 'IPv4 / IPv6', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { label: 'Indian PAN', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { label: 'Aadhaar (Verhoeff)', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { label: 'Credit Card (Luhn)', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { label: 'Custom Regex / Keyword', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
];

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28">
        {/* White card */}
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-black/20 px-8 py-12 sm:px-14 sm:py-16 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="h-24 w-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg shadow-violet-400/30">
            <img src="/eagle-logo.png" alt="Eagles Eye" className="h-full w-full object-cover" />
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-100 border border-violet-300 text-violet-700 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            100% Client-Side · Zero Data Leaves Browser
          </span>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-slate-800">
            eagles<span className="text-violet-600">-eye</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            A privacy-first PII detection and sanitization tool that runs{' '}
            <span className="text-slate-800 font-semibold">entirely in your browser</span>.
            Detect, validate, and redact sensitive data from raw text and CSV files — no uploads, no servers, no leaks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              to="/detector"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30"
            >
              Open Detector
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Joyboy-02/Eagles-eye"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-all shadow-md"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Detected Categories ── */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-4xl mx-auto bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-6 text-center">
          <p className="text-xs uppercase tracking-widest text-white/70 mb-4 font-semibold">Detects & Validates</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <span key={cat.label} className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border ${cat.color}`}>
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Everything you need to sanitize PII</h2>
            <p className="text-white/70 max-w-xl mx-auto text-sm">Built with Luhn and Verhoeff checksum verification so only real PII is flagged — not random numbers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 p-6 flex flex-col gap-3 hover:bg-white transition-all shadow-md hover:shadow-xl shadow-black/10">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${f.bg}`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white/90 backdrop-blur-md border border-white/60 p-10 sm:p-14 text-center shadow-xl shadow-black/15">
          <ShieldCheck className="w-12 h-12 text-violet-600 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Your data never leaves your browser.</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto text-sm">
            Paste text or upload a file — it stays in memory only. No API calls, no telemetry, no cloud storage.
          </p>
          <Link
            to="/detector"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition shadow-lg shadow-violet-500/30"
          >
            Start Detecting PII <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-5 px-4 text-center text-xs text-white/50">
        eagles-eye · All detection, validation, and exports run 100% locally · Zero bytes transmitted
      </footer>
    </div>
  );
}
