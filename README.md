# 🌌 Nexus

> **Connecting Students, Supervisors, and Success.**

Nexus is a modern web-based **On-the-Job Training (OJT) Management System** designed to streamline internship administration through GPS-verified attendance, real-time time tracking, collaborative task management, and role-based dashboards.

Built with a modern full-stack architecture, Nexus centralizes attendance monitoring, internship progress, and project collaboration into a single intuitive platform for students, supervisors, and administrators.

---

## ✨ Overview

Managing OJT programs often involves multiple spreadsheets, paper attendance logs, and disconnected communication channels. Nexus eliminates these inefficiencies by providing a centralized platform where attendance, task management, reporting, and user administration work seamlessly together.

Whether you're a student logging your daily attendance, a supervisor monitoring trainee progress, or an administrator managing the entire internship program, Nexus provides the tools needed to simplify every stage of the OJT experience.

---

# 🚀 Key Features

## ⏱️ Smart Time Tracking

* One-click Clock In / Clock Out
* Automatic computation of rendered hours
* Daily attendance history
* Required OJT hours progress tracking

---

## 📍 GPS-Verified Attendance

Nexus ensures attendance authenticity through configurable location verification.

* GPS-based Clock In / Clock Out
* Configurable workplace coordinates
* Adjustable attendance radius
* Automatic distance validation
* Supervisors and administrators are exempt from GPS restrictions

---

## 📋 Kanban Task Management

A built-in collaborative Kanban board keeps internship tasks organized.

* Drag-and-drop task management
* Custom workflow columns
* Task assignment
* Priority levels
* Due dates
* Rich descriptions
* File attachments
* Image, video, PDF, and document support

---

## 👥 Role-Based Access Control

### 🎓 OJT

* Clock In / Clock Out
* View attendance history
* Track completed hours
* Access assigned Kanban tasks
* Upload task attachments

### 👨‍🏫 Supervisor

* Monitor all assigned OJTs
* Review attendance records
* Manage Kanban tasks
* Export attendance reports

### 👨‍💼 Administrator

* Complete user management
* Configure GPS attendance settings
* Manage departments
* Generate reports
* Manage Kanban workflows
* System-wide administration

---

## 📊 Reporting

Generate attendance reports with a single click.

* CSV Export
* Attendance summaries
* Hour tracking
* Historical attendance records

---

# 🛡 Security

Nexus leverages Supabase Authentication and Row-Level Security (RLS) to ensure secure access across all user roles.

Security features include:

* Authentication
* Role-based authorization
* Protected API routes
* GPS attendance validation
* Secure file storage
* Soft-delete user management

---

# 🛠 Technology Stack

| Category       | Technology       |
| -------------- | ---------------- |
| Frontend       | Next.js 16       |
| Language       | TypeScript       |
| Backend        | Supabase         |
| Database       | PostgreSQL       |
| Authentication | Supabase Auth    |
| Storage        | Supabase Storage |
| UI Framework   | Material UI v7   |
| Styling        | Tailwind CSS v4  |
| Drag & Drop    | @dnd-kit         |

---

# 📱 Core Modules

* Dashboard
* Attendance Management
* GPS Verification
* Hours Progress Tracking
* Kanban Workspace
* User Management
* Reports & Analytics
* Site Settings

---

# 📂 Project Structure

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── supervisor/
│   │   ├── ojt/
│   │   ├── attendance/
│   │   ├── kanban/
│   │   └── reports/
│   ├── api/
│   └── login/
│
├── components/
│   ├── attendance/
│   ├── kanban/
│   └── shared/
│
├── lib/
│   ├── context/
│   ├── hooks/
│   ├── supabase/
│   └── utils/
│
├── types/
└── proxy.ts
```

---

# 🎯 Design Principles

Nexus was built around four core principles:

* **Simplicity** — Clean, intuitive interfaces that minimize learning time.
* **Accountability** — GPS verification and automatic attendance tracking improve reliability.
* **Collaboration** — Integrated Kanban boards encourage organized teamwork.
* **Scalability** — Modern architecture built for future expansion and institutional deployment.

---

# 🌌 Why Nexus?

The name **Nexus** represents a central point of connection—bringing together students, supervisors, administrators, attendance tracking, task management, and reporting into one unified ecosystem.

Instead of juggling multiple tools, Nexus serves as the single hub where internship management happens efficiently, transparently, and securely.