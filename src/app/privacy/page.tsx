import Link from 'next/link';
import '../landing.css';

export const metadata = {
  title: 'Privacy Policy – OJT Tracker',
  description: 'How OJT Tracker collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="legal-nav">
        <div className="legal-nav-inner">
          <Link href="/" className="legal-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#4f46e5" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>OJT&nbsp;<strong>Tracker</strong></span>
          </Link>
          <Link href="/" className="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to home
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="legal-hero">
        <div className="legal-container">
          <div className="legal-label">Legal</div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: March 2, 2026</p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="legal-container legal-body">

        <section className="legal-section">
          <h2>1. Overview</h2>
          <p>OJT Tracker (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use the OJT Tracker platform. By using the Service, you consent to the practices described here.</p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul>
            <li><strong>Account data:</strong> Name, email address, and password (hashed) provided at account creation</li>
            <li><strong>Attendance data:</strong> Clock-in and clock-out timestamps, GPS coordinates, and calculated hours per session</li>
            <li><strong>Task data:</strong> Kanban board tasks, titles, descriptions, attachments, and status updates you create</li>
            <li><strong>Usage data:</strong> Login timestamps and feature interactions</li>
            <li><strong>Technical data:</strong> IP address, browser type, and device information collected automatically</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and operate the Service, including tracking attendance and OJT progress</li>
            <li>Authenticate users and enforce role-based access control</li>
            <li>Generate attendance reports and OJT progress summaries</li>
            <li>Allow supervisors and admins to monitor assigned trainees</li>
            <li>Improve the platform and diagnose technical issues</li>
            <li>Communicate important updates about the Service</li>
          </ul>
          <p>We do not sell, trade, or rent your personal information to third parties.</p>
        </section>

        <section className="legal-section">
          <h2>4. Data Storage and Security</h2>
          <p>Your data is stored securely. We implement industry-standard security measures including:</p>
          <ul>
            <li>Password hashing using industry-standard algorithms</li>
            <li>Secure session-based authentication</li>
            <li>HTTPS encryption for all data in transit</li>
            <li>Role-scoped data access &mdash; users can only access data appropriate to their role</li>
          </ul>
          <p>No method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
        </section>

        <section className="legal-section">
          <h2>5. GPS and Location Data</h2>
          <p>OJT Tracker requests access to your device&apos;s location solely for the purpose of verifying on-site presence at clock-in and clock-out. Location data is stored only at the time of each attendance event and is not tracked continuously. You can revoke location permissions in your browser settings, though this will prevent clock-in functionality from working.</p>
        </section>

        <section className="legal-section">
          <h2>6. Data Retention</h2>
          <p>We retain your data for as long as your account is active or as needed to provide the Service. If your account is deactivated or deleted by an administrator, your personal identifiers may be removed while attendance records may be retained for programme reporting purposes as required by your institution.</p>
        </section>

        <section className="legal-section">
          <h2>7. Cookies</h2>
          <p>We use minimal cookies and local storage to maintain your session and user preferences. We do not use third-party tracking cookies or advertising cookies.</p>
        </section>

        <section className="legal-section">
          <h2>8. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li>Export your attendance data in a machine-readable format</li>
          </ul>
          <p>To exercise any of these rights, please <Link href="/contact" className="legal-link">contact us</Link> or speak to your system administrator.</p>
        </section>

        <section className="legal-section">
          <h2>9. Third-party Services</h2>
          <p>OJT Tracker may use third-party services for hosting and infrastructure including Supabase for database and authentication services. These providers are bound by their own privacy policies and we ensure they meet adequate data protection standards.</p>
        </section>

        <section className="legal-section">
          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify users of significant changes by updating the date at the top of this page. Continued use of the Service constitutes acceptance of the updated policy.</p>
        </section>

        <section className="legal-section">
          <h2>11. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please <Link href="/contact" className="legal-link">contact us</Link>.</p>
        </section>

      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="legal-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
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
