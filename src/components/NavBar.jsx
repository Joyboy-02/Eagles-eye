import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, WifiOff } from 'lucide-react';

export function NavBar() {
  const linkClass = ({ isActive }) =>
    `relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-white bg-white/10 border border-white/20'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/15 shadow-lg shadow-black/40 group-hover:border-white/30 transition">
            <img
              src="/eagle-logo.png"
              alt="Eagles Eye logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            eagles<span className="text-emerald-400">-eye</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1.5">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/detector" className={linkClass}>Detector</NavLink>
        </div>

        {/* Privacy badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
          <WifiOff className="w-3.5 h-3.5" />
          Zero Network Calls
        </div>
      </div>
    </nav>
  );
}
