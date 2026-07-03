'use client';

import Link from 'next/link';
import { useState } from 'react';
import '../landing.css';
import '../legal.css';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

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
          <div className="legal-label">Get in touch</div>
          <h1 className="legal-title">Contact Us</h1>
          <p className="legal-meta">We typically respond within one business day.</p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="legal-container legal-body">
        <div className="contact-layout">

          {/* Form */}
          <div className="contact-form-wrap">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-field">
                  <label htmlFor="name" className="form-label">Full name</label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    className="form-input"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    className="form-input contact-textarea"
                    placeholder="Tell us more..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
                <button type="submit" className="contact-submit">Send message</button>
              </form>
            ) : (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2>Message sent!</h2>
                <p>
                  Thanks for reaching out, <strong>{name}</strong>. We&apos;ll get back to you at{' '}
                  <strong>{email}</strong> within one business day.
                </p>
                <Link href="/" className="contact-home-link">Back to home</Link>
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="contact-info">
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Email us</h3>
              <p>support&#64;usenexus.app</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3>Response time</h3>
              <p>Available weekdays 9am&ndash;5pm PHT</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3>Documentation</h3>
              <p><Link href="/docs" className="legal-link">Browse our guides and how-to articles</Link></p>
            </div>
          </div>

        </div>
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