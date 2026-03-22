import { NavLink, Outlet } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { CalendarSidebar } from './CalendarSidebar';
import { LifeMapOverlay } from './LifeMapOverlay';
import { ReviewPanel } from './ReviewPanel';
import { useUIStore } from '../lib/store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className="relative px-4 py-2 text-sm font-semibold transition-colors"
      style={({ isActive }) => ({
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
      })}
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { signOut, user } = useAuth();
  const { toggleLifeMap } = useUIStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 h-14"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: 'var(--accent)' }}>
            &#9733;
          </span>
          <span className="font-display text-base font-bold" style={{ color: 'var(--text)' }}>
            Momentum
          </span>
        </div>

        {/* Center: Nav tabs */}
        <nav className="flex items-center gap-1">
          <NavTab to="/today">Today</NavTab>
          <NavTab to="/goals">Goals</NavTab>
        </nav>

        {/* Right: Actions + User menu */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={toggleLifeMap}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            style={{
              background: 'var(--accent-softer)',
              color: 'var(--accent-text)',
            }}
          >
            Life Map
          </button>

          <button
            onClick={() => setShowReview(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            style={{
              background: 'var(--bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            Review
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
            style={{
              background: 'var(--accent-softer)',
              color: 'var(--accent)',
            }}
          >
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 w-48 py-1 rounded-[var(--r-md)] animate-scale-in"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                className="px-3 py-2 text-xs truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {user?.email}
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full text-left px-3 py-2 text-sm cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Settings
              </button>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="w-full text-left px-3 py-2 text-sm cursor-pointer hover:opacity-80"
                style={{ color: 'var(--danger)' }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Life Map overlay */}
      <LifeMapOverlay />

      {/* Review panel */}
      {showReview && <ReviewPanel onClose={() => setShowReview(false)} />}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Calendar sidebar */}
        <aside
          className="hidden lg:block w-[280px] shrink-0 overflow-y-auto p-4"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          <CalendarSidebar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </aside>
      </div>
    </div>
  );
}
