# Voice Calendar

A Next.js app for logging and reviewing daily events (voice or manual), organized by date, subject, and time.

Built with:
- Next.js (App Router)
- NextAuth v4 (Credentials auth)
- Drizzle ORM (Postgres)
- React Query
- Tailwind CSS

---

## Features

- Email/password (credentials) login
- Protected calendar UI
- Monthly / weekly / day views
- Add manual entries
- Delete entries
- Subject-based categorization
- API-protected routes
- Session-based authentication

---

## Auth

This app uses **NextAuth Credentials Provider**.

### Login

- Route: `/login`
- Default credentials are defined in `.env.local`:
