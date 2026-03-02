import Link from 'next/link';
import './landing.css';

export default function Home() {
  return (
    <div className="landing">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#4f46e5" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>OJT&nbsp;<strong>Tracker</strong></span>
          </div>
          <div className="landing-nav-actions">
            <Link href="/login" className="btn btn-secondary btn-sm">Log in</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-grid-bg" />
        <div className="landing-container hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Built for OJT programmes and supervisors
            </div>
            <h1 className="hero-heading">
              Track training.<br />
              <span className="hero-heading-accent">Drive progress.</span>
            </h1>
            <p className="hero-sub">
              OJT Tracker gives trainees, supervisors, and admins a single
              place to log attendance, manage tasks, and report on on-the-job
              training hours &mdash; with GPS verification, kanban boards, and
              real-time progress tracking.
            </p>
            <div className="hero-ctas">
              <Link href="/login" className="btn btn-primary" style={{ padding: '.75rem 1.75rem', fontSize: '1rem' }}>
                Sign in
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16, marginLeft: '.375rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/docs" className="btn btn-secondary" style={{ padding: '.75rem 1.75rem', fontSize: '1rem' }}>
                View documentation
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><span className="hero-stat-num">3</span><span className="hero-stat-label">Role levels</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="hero-stat-num">GPS</span><span className="hero-stat-label">Clock&#8209;in</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="hero-stat-num">Kanban</span><span className="hero-stat-label">Task board</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="hero-stat-num">&#8734;</span><span className="hero-stat-label">Data history</span></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-illustration">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={1.2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-label-pill">Features</div>
          <h2 className="section-heading">Everything you need to manage OJT</h2>
          <p className="section-sub">From daily clock-ins to final reports, OJT Tracker covers the full training workflow.</p>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Attendance Tracking</h3>
              <p>GPS-verified clock-in and clock-out lets every trainee log time from their work location accurately.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3>Role&#8209;based Access</h3>
              <p>Admins configure the system, supervisors oversee trainees, OJT students log hours &mdash; all with the right permissions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3>Kanban Task Board</h3>
              <p>Organise training tasks into customisable columns. Drag, drop, and track deliverables at a glance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>OJT Progress</h3>
              <p>Visualise hours rendered vs required hours. Know at a glance who is on track and who needs attention.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3>Reports &amp; Analytics</h3>
              <p>Generate detailed attendance and progress reports. Export data to share with schools and coordinators.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3>Supervisor Dashboard</h3>
              <p>Supervisors get a dedicated view to monitor all assigned trainees, review logs, and approve attendance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="section-label-pill section-label-pill-dark">How it works</div>
          <h2 className="section-heading">Up and running in minutes</h2>
          <div className="steps-row">
            <div className="step-card">
              <div className="step-num">1</div>
              <h4>Admin creates accounts</h4>
              <p>The admin sets up the system and provisions trainee and supervisor accounts.</p>
            </div>
            <div className="step-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h4>Trainees clock in &amp; out</h4>
              <p>OJT students clock in from their workplace location each day to log training hours.</p>
            </div>
            <div className="step-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h4>Supervisors review</h4>
              <p>Supervisors monitor attendance, approve logs, and track task completion via the kanban board.</p>
            </div>
            <div className="step-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h4>Generate reports</h4>
              <p>Admins and supervisors export comprehensive attendance and OJT progress reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="landing-cta-banner">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2 className="cta-heading">Ready to streamline your OJT programme?</h2>
          <p className="cta-sub">Sign in to get started &mdash; your admin will have set up your account.</p>
          <div style={{ display: 'flex', gap: '.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: '.75rem 2rem', fontSize: '1rem' }}>Sign in now</Link>
            <Link href="/docs" className="btn" style={{ padding: '.75rem 2rem', fontSize: '1rem', background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>View docs</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span>OJT&nbsp;<strong>Tracker</strong></span>
              </div>
              <p className="footer-tagline">Track training hours. Drive progress.<br />Built for OJT programmes.</p>
            </div>
            <div className="footer-nav-group">
              <p className="footer-nav-label">Product</p>
              <Link href="/login" className="footer-nav-link">Sign in</Link>
              <Link href="/docs" className="footer-nav-link">Documentation</Link>
            </div>
            <div className="footer-nav-group">
              <p className="footer-nav-label">Legal</p>
              <Link href="/terms" className="footer-nav-link">Terms of Service</Link>
              <Link href="/privacy" className="footer-nav-link">Privacy Policy</Link>
              <Link href="/contact" className="footer-nav-link">Contact Us</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">&copy; 2026 OJT Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

