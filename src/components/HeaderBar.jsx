import { ShieldCheck, Lock, WifiOff, Cpu } from 'lucide-react';

export function HeaderBar() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-50">
                PII Data Sanitizer
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                100% Client-Side / Zero Data Leaves Browser
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Local regex detection, Luhn &amp; Verhoeff checksum verification, pseudonymization, and safe file export.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-300">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Network Calls</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>In-Memory Processing</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Luhn &amp; Verhoeff Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
}
