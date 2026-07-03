import Link from 'next/link';
import '../landing.css';
import './docs.css';

export const metadata = {
  title: 'Documentation – Nexus',
  description: 'Everything you need to know about using Nexus to manage internship and OJT workflows.',
};

export default function DocsPage() {
  return (
    <div className="docs-page">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="docs-nav">
        <div className="docs-nav-inner">
          <Link href="/" className="docs-nav-logo">
            <span className="nexus-wordmark">Nexus</span>
          </Link>
          <div className="docs-nav-actions">
            <Link href="/" className="btn-back">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
            <Link href="/login" className="btn-login-link">Log in</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="docs-hero">
        <span className="docs-hero-label">Documentation</span>
        <h1 className="docs-hero-title">Nexus Docs</h1>
        <p className="docs-hero-sub">Everything you need to know about using Nexus to log, manage, and report on internship and OJT training.</p>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="docs-body">

        {/* Sidebar */}
        <aside className="docs-sidebar">
          <p className="docs-sidebar-label">On this page</p>
          <ul className="docs-nav-list">
            <li><a href="#overview">Overview</a></li>
            <li><a href="#getting-started">Getting Started</a></li>
            <li><a href="#user-roles">User Roles</a></li>
            <li className="section-group"><span className="section-group-label">Features</span></li>
            <li><a href="#attendance">Attendance</a></li>
            <li><a href="#kanban">Kanban Board</a></li>
            <li><a href="#ojt-progress">OJT Progress</a></li>
            <li><a href="#reports">Reports</a></li>
            <li><a href="#supervisor-dashboard">Supervisor Dashboard</a></li>
            <li><a href="#admin-dashboard">Admin Dashboard</a></li>
            <li><a href="#admin-settings">Admin Settings</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="docs-content">

          {/* Overview */}
          <section className="docs-section" id="overview">
            <h2>Overview</h2>
            <p>Nexus is an internship and on-the-job training management platform that helps organisations track trainee attendance, manage tasks, and report on training progress. The system supports three roles&mdash;Admin, Supervisor, and OJT trainee&mdash;each with tailored dashboards and permissions.</p>
            <p>With Nexus you can verify daily clock-ins via GPS, organise assignments on a kanban board, monitor hours rendered versus required, and export reports for schools and coordinators.</p>
            <div className="feature-pills">
              <span className="feature-pill">GPS Clock-in</span>
              <span className="feature-pill">Kanban Tasks</span>
              <span className="feature-pill">Progress Tracking</span>
              <span className="feature-pill">Role-based Access</span>
              <span className="feature-pill">Reports</span>
              <span className="feature-pill">Secure Auth</span>
            </div>
          </section>

          {/* Getting Started */}
          <section className="docs-section" id="getting-started">
            <h2>Getting Started</h2>
            <p>Accounts in Nexus are provisioned by the system administrator, or created directly by signing up and starting a new organization. There is no public self-registration into an existing organization without an invite code.</p>

            <h3>Logging In</h3>
            <ol className="steps-list">
              <li className="step-item"><span className="step-num">1</span><span className="step-text">Navigate to the <Link href="/login">Login</Link> page.</span></li>
              <li className="step-item"><span className="step-num">2</span><span className="step-text">Enter the email address and password provided by your administrator.</span></li>
              <li className="step-item"><span className="step-num">3</span><span className="step-text">Click <strong>Sign In</strong> &mdash; you will be taken to the dashboard appropriate for your role.</span></li>
            </ol>
            <div className="callout callout-tip">
              <strong>Tip:</strong> If you have forgotten your password, use the <strong>Forgot password</strong> link on the login page, or contact your administrator.
            </div>

            <h3>First-time Admin Setup</h3>
            <p>When an admin logs in for the first time they are taken to the <strong>Admin Dashboard</strong>. From there they can:</p>
            <ul>
              <li>Create trainee and supervisor accounts via the <strong>Users</strong> panel, or share an invite code for self-registration.</li>
              <li>Configure the required OJT hours in <strong>Settings</strong>.</li>
              <li>Set up the kanban columns used by trainees.</li>
            </ul>
          </section>

          {/* User Roles */}
          <section className="docs-section" id="user-roles">
            <h2>User Roles</h2>
            <p>Nexus uses three roles to control access. Administrators assign roles when creating accounts; roles can be changed at any time from the Admin Users panel.</p>
            <div className="role-table-wrap">
              <table className="role-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="role-badge badge-admin">Admin</span></td>
                    <td>Full access &mdash; manage users and roles, configure settings, view all dashboards, manage attendance, access reports.</td>
                  </tr>
                  <tr>
                    <td><span className="role-badge badge-supervisor">Supervisor</span></td>
                    <td>View and manage assigned trainees, review attendance logs, monitor kanban tasks, and generate reports.</td>
                  </tr>
                  <tr>
                    <td><span className="role-badge badge-ojt">OJT</span></td>
                    <td>Clock in and out, view own attendance history, manage personal kanban tasks, view own OJT progress.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="callout">
              <strong>Note:</strong> Only one role is assigned per user. Role changes take effect immediately upon save.
            </div>
          </section>

          {/* Attendance */}
          <section className="docs-section" id="attendance">
            <h2>Attendance</h2>
            <p>The Attendance module records daily clock-in and clock-out events for OJT trainees. GPS location is captured at each event to verify the trainee is on-site.</p>

            <h3>Clocking In</h3>
            <ol className="steps-list">
              <li className="step-item"><span className="step-num">1</span><span className="step-text">Navigate to <strong>Attendance</strong> in the sidebar.</span></li>
              <li className="step-item"><span className="step-num">2</span><span className="step-text">Allow the browser to access your location when prompted.</span></li>
              <li className="step-item"><span className="step-num">3</span><span className="step-text">Click <strong>Clock In</strong> &mdash; your start time and location are recorded.</span></li>
            </ol>

            <h3>Clocking Out</h3>
            <p>At the end of the day, return to <strong>Attendance</strong> and click <strong>Clock Out</strong>. The system will calculate hours worked for that session.</p>

            <h3>Attendance Table</h3>
            <p>The attendance table shows a history of all your clock-in/out events, including date, start time, end time, total hours, and location. Admins and supervisors can view attendance records for all trainees assigned to them.</p>

            <div className="callout callout-warn">
              <strong>Warning:</strong> If you forget to clock out, your session will remain open. Contact your supervisor or admin to correct the record.
            </div>
          </section>

          {/* Kanban */}
          <section className="docs-section" id="kanban">
            <h2>Kanban Board</h2>
            <p>The Kanban Board lets trainees and supervisors organise OJT tasks into customisable columns such as <em>To Do</em>, <em>In Progress</em>, and <em>Done</em>.</p>

            <h3>Creating a Task</h3>
            <ol className="steps-list">
              <li className="step-item"><span className="step-num">1</span><span className="step-text">Navigate to <strong>Kanban</strong> in the sidebar.</span></li>
              <li className="step-item"><span className="step-num">2</span><span className="step-text">Click the <strong>+</strong> button on the column where you want to add the task.</span></li>
              <li className="step-item"><span className="step-num">3</span><span className="step-text">Enter a title, description, due date, and any attachments.</span></li>
              <li className="step-item"><span className="step-num">4</span><span className="step-text">Click <strong>Save</strong> &mdash; the task appears in the column immediately.</span></li>
            </ol>

            <h3>Moving Tasks</h3>
            <p>Drag a task card into a different column to update its status. You can also open the task and change the column from the detail view.</p>

            <h3>Managing Columns</h3>
            <p>Admins can add, rename, and reorder columns from the column settings dialog. Changes apply to all trainees in the system.</p>

            <h3>Archiving Tasks</h3>
            <p>Completed tasks can be archived to keep the board tidy. Archived tasks are still visible in the Archive view for reference.</p>
          </section>

          {/* OJT Progress */}
          <section className="docs-section" id="ojt-progress">
            <h2>OJT Progress</h2>
            <p>The OJT Progress page shows each trainee how many hours they have rendered compared to the total hours required by their programme.</p>
            <ul>
              <li>A progress bar visualises rendered vs required hours at a glance.</li>
              <li>The system aggregates hours automatically from approved attendance records.</li>
              <li>Supervisors can view the OJT progress of all trainees they oversee.</li>
            </ul>
            <div className="callout callout-tip">
              <strong>Tip:</strong> Required hours are configured by the admin in the <strong>Settings</strong> panel.
            </div>
          </section>

          {/* Reports */}
          <section className="docs-section" id="reports">
            <h2>Reports</h2>
            <p>The Reports page lets admins and supervisors generate and export attendance and progress summaries.</p>

            <h3>Generating a Report</h3>
            <ol className="steps-list">
              <li className="step-item"><span className="step-num">1</span><span className="step-text">Navigate to <strong>Reports</strong> in the sidebar.</span></li>
              <li className="step-item"><span className="step-num">2</span><span className="step-text">Select the date range and the trainee(s) you want to include.</span></li>
              <li className="step-item"><span className="step-num">3</span><span className="step-text">Click <strong>Generate</strong> to preview the report.</span></li>
              <li className="step-item"><span className="step-num">4</span><span className="step-text">Click <strong>Export</strong> to download the report as a PDF or CSV.</span></li>
            </ol>

            <h3>What a Report Includes</h3>
            <ul>
              <li>Trainee name, department, and programme details.</li>
              <li>Date-by-date attendance log with clock-in/out times and hours.</li>
              <li>Total rendered hours and completion percentage.</li>
            </ul>
          </section>

          {/* Supervisor Dashboard */}
          <section className="docs-section" id="supervisor-dashboard">
            <h2>Supervisor Dashboard</h2>
            <p>The Supervisor Dashboard is exclusively available to users with the <span className="role-badge badge-supervisor">Supervisor</span> role. It provides a consolidated view of all trainees assigned to the supervisor.</p>
            <ul>
              <li>Overview of each trainee&apos;s rendered hours and progress percentage.</li>
              <li>Quick access to attendance records and kanban tasks for each trainee.</li>
              <li>Notifications for trainees who are behind on required hours.</li>
            </ul>
          </section>

          {/* Admin Dashboard */}
          <section className="docs-section" id="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <p>The Admin Dashboard is available to users with the <span className="role-badge badge-admin">Admin</span> role. It provides a high-level summary of the entire OJT programme.</p>
            <ul>
              <li>Total active trainees, supervisors, and recent activity.</li>
              <li>Organisation-wide progress statistics.</li>
              <li>Quick links to User Management, Settings, and Reports.</li>
            </ul>
          </section>

          {/* Admin Settings */}
          <section className="docs-section" id="admin-settings">
            <h2>Admin Settings</h2>
            <p>Available to <span className="role-badge badge-admin">Admin</span> only. Configure system-level options that apply to all users.</p>

            <h3>Required OJT Hours</h3>
            <p>Set the total number of hours trainees must render to complete the programme. This value is used throughout the system to calculate progress percentages.</p>

            <h3>User Management</h3>
            <p>Create, edit, and deactivate user accounts. Assign or change roles at any time. New accounts are created with a temporary password that trainees should change after first login.</p>

            <div className="callout callout-warn">
              <strong>Warning:</strong> Deactivating a user prevents them from logging in but preserves all their attendance and task data.
            </div>
          </section>

        </main>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
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