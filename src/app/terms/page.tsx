import Link from 'next/link';
import '../landing.css';
import '../legal.css';

export const metadata = {
  title: 'Terms of Service – Nexus',
  description: 'Terms and conditions for using the Nexus platform.',
};

export default function TermsPage() {
  return (
    <div className="legal-page">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="legal-nav">
        <div className="legal-nav-inner">
          <Link href="/" className="legal-logo">
            <span className="nexus-wordmark">Nexus</span>
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
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last updated: March 2, 2026</p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="legal-container legal-body">

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Nexus (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all users, including administrators, supervisors, and OJT trainees.</p>
        </section>

        <section className="legal-section">
          <h2>2. Description of Service</h2>
          <p>Nexus is an internship and on-the-job training management platform that allows organisations to track trainee attendance, manage tasks via a kanban board, monitor OJT progress, and generate reports. The Service includes GPS-verified attendance logging, role-based dashboards, and reporting tools.</p>
        </section>

        <section className="legal-section">
          <h2>3. Account Registration</h2>
          <p>Accounts on Nexus are created either by a system administrator or by signing up directly to create a new organization or join an existing one via invite code. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify your administrator immediately of any unauthorised use.</p>
          <p>Organisations using the Service are responsible for managing their users and ensuring all members comply with these terms.</p>
        </section>

        <section className="legal-section">
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Attempt to gain unauthorised access to any part of the Service or another user&apos;s data</li>
            <li>Falsify attendance records, GPS coordinates, or any other data in the system</li>
            <li>Use automated means to scrape or extract data from the Service</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Data and Privacy</h2>
          <p>Your use of the Service is also governed by our <Link href="/privacy" className="legal-link">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your data as described in the Privacy Policy. This includes the collection of GPS location data at clock-in and clock-out events.</p>
        </section>

        <section className="legal-section">
          <h2>6. Attendance and Accuracy</h2>
          <p>You agree to use the attendance features honestly and accurately. Falsifying clock-in or clock-out records, manipulating GPS data, or otherwise misrepresenting your attendance may result in immediate account deactivation and may be reported to your educational institution or employer.</p>
        </section>

        <section className="legal-section">
          <h2>7. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Nexus. You may not reproduce, distribute, modify, or create derivative works without express written consent.</p>
          <p>You retain ownership of all data and content you upload to the Service. By uploading data, you grant Nexus a limited licence to process that data solely to provide the Service.</p>
        </section>

        <section className="legal-section">
          <h2>8. Disclaimers and Limitation of Liability</h2>
          <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. Nexus does not warrant that the Service will be uninterrupted, error-free, or free of harmful components.</p>
          <p>To the fullest extent permitted by law, Nexus shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to inaccuracies in attendance records due to GPS errors or connectivity issues.</p>
        </section>

        <section className="legal-section">
          <h2>9. Termination</h2>
          <p>Administrators may suspend or deactivate user accounts at any time. We reserve the right to terminate access to the Service for conduct that violates these Terms or is harmful to other users or the platform.</p>
        </section>

        <section className="legal-section">
          <h2>10. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify users of material changes by updating the date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
        </section>

        <section className="legal-section">
          <h2>11. Contact</h2>
          <p>If you have questions about these Terms, please <Link href="/contact" className="legal-link">contact us</Link>.</p>
        </section>

      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="legal-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <span className="nexus-wordmark">Nexus</span>
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
            <p className="footer-copy">&copy; 2026 Nexus. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}