# Signalist Stock Tracker App — Detailed Project Overview

## 1. Project Summary

This project is a full-stack stock market application built with Next.js and TypeScript. It is designed to feel like a modern fintech dashboard and trading platform. The app combines market widgets, user authentication, persistent storage, stock search, watchlists, AI-powered email workflows, and external financial data integrations.

At a high level, it aims to let a user:

- sign up and log in
- browse stock market widgets and dashboards
- search for stocks and companies
- view stock detail pages
- add stocks to a watchlist
- receive personalized market news and summaries
- interact with a polished finance-focused UI

The app combines several technologies to simulate a real SaaS-style product rather than a simple demo.

---

## 2. Tech Stack

The project uses the following core technologies:

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn-style UI components
- Lucide icons
- Sonner for toast notifications

### Backend / App Logic
- Next.js App Router server actions
- Better Auth for authentication
- MongoDB via Mongoose
- Inngest for background workflows

### External Services
- Finnhub API for stock data and market news
- TradingView embed widgets for charts and market dashboards
- Gemini API via Inngest AI tooling
- Nodemailer for email sending

### Supporting libraries
- react-hook-form
- clsx / tailwind-merge
- Radix UI primitives
- mongodb
- dotenv

The dependencies are defined in [package.json](package.json).

---

## 3. Project Structure

The project is organized around a typical full-stack Next.js app:

- app/ — route-level app pages and layouts
- components/ — reusable UI components
- database/ — MongoDB connection and schemas
- hooks/ — custom React hooks
- lib/ — business logic, API integrations, auth, Inngest, email setup
- middleware/ — route protection middleware
- public/ — static assets
- scripts/ — DB verification scripts
- types/ — global type declarations

### Important files

- [app/(root)/page.tsx](app/(root)/page.tsx) — main dashboard page
- [app/(root)/stocks/[symbol]/page.tsx](app/(root)/stocks/[symbol]/page.tsx) — stock detail page
- [app/(auth)/sign-in/page.tsx](app/(auth)/sign-in/page.tsx) — sign-in page
- [middleware/index.ts](middleware/index.ts) — auth/session gate for routes
- [database/mongoose.ts](database/mongoose.ts) — shared MongoDB connection logic
- [database/models/watchlist.model.ts](database/models/watchlist.model.ts) — watchlist schema
- [lib/actions/finnhub.actions.ts](lib/actions/finnhub.actions.ts) — stock search and market news logic
- [lib/better-auth/auth.ts](lib/better-auth/auth.ts) — auth setup with MongoDB adapter
- [lib/inngest/client.ts](lib/inngest/client.ts) — Inngest client configuration
- [lib/inngest/functions.ts](lib/inngest/functions.ts) — AI and scheduled workflows
- [lib/nodemailer/index.ts](lib/nodemailer/index.ts) — email sending code
- [lib/constants.ts](lib/constants.ts) — widget config and static app constants

---

## 4. Core Features

### 4.1 Dashboard Experience
The landing page, [app/(root)/page.tsx](app/(root)/page.tsx), displays a collection of TradingView widgets:

- Market Overview
- Stock Heatmap
- Top Stories
- Market Quotes

This provides a strong “financial dashboard” experience without requiring custom charting code from scratch.

### 4.2 Stock Search and Discovery
The project uses Finnhub search and profile APIs through [lib/actions/finnhub.actions.ts](lib/actions/finnhub.actions.ts).

This layer supports:

- symbol searches
- popular symbol suggestions
- company profile fetches
- market news retrieval
- deduplication and formatting

### 4.3 Watchlist Functionality
Watchlists are persisted in MongoDB using the schema in [database/models/watchlist.model.ts](database/models/watchlist.model.ts).

The app tracks:

- user ID
- stock symbol
- company name
- timestamp when the stock was added

This supports a per-user portfolio/watchlist workflow.

### 4.4 Authentication
Better Auth is used to support sign-up, sign-in, and session handling.

The auth config in [lib/better-auth/auth.ts](lib/better-auth/auth.ts) includes:

- MongoDB adapter
- session cookies
- email/password auth
- password validation settings
- auto sign-in after sign-up

Middleware in [middleware/index.ts](middleware/index.ts) blocks unauthenticated users from protected app routes.

### 4.5 AI-Generated Personalized Content
The app includes AI workflows using Gemini through Inngest.

In [lib/inngest/functions.ts](lib/inngest/functions.ts), the app:

- generates a welcome intro for a new user
- summarizes market news for each user
- uses the AI output to craft personalized email content

### 4.6 Automated Email Notifications
The email subsystem sends:

- welcome emails on signup
- daily market summary emails

This is implemented in [lib/nodemailer/index.ts](lib/nodemailer/index.ts) with Nodemailer and Gmail SMTP.

### 4.7 Stock Detail Views
Each stock has a page under [app/(root)/stocks/[symbol]/page.tsx](app/(root)/stocks/[symbol]/page.tsx).

The page includes:

- symbol info widget
- advanced chart
- baseline chart
- technical analysis widget
- company profile widget
- financials widget

This makes the stock page feel like a trading terminal or serious market analysis screen.

---

## 5. Authentication and Route Protection

The middleware file [middleware/index.ts](middleware/index.ts) is essential to the app’s behavior.

It does this:

- reads the Better Auth session cookie from the request
- if no valid session exists, redirects the user to the home page or sign-in flow
- allows access to public routes like sign-in and sign-up
- protects app routes that require login

This acts like a gatekeeper for the app and ensures that only authenticated users reach the dashboard and stock pages.

---

## 6. Database Design

### MongoDB Connection
[database/mongoose.ts](database/mongoose.ts) uses a cached global Mongo connection to avoid reinitializing the DB on every request. This is a standard best practice for Next.js server environments.

### Watchlist Model
[database/models/watchlist.model.ts](database/models/watchlist.model.ts) stores:

- userId
- symbol
- company
- addedAt

A unique index is created for the combination of userId and symbol so a user cannot add the same stock twice.

This is a simple but effective schema for a market watchlist.

---

## 7. Finnhub Integration

The main data integration layer is [lib/actions/finnhub.actions.ts](lib/actions/finnhub.actions.ts).

### Search behavior
The function searchStocks does the following:

- reads the FINNHUB_API_KEY or fallback NEXT_PUBLIC_FINNHUB_API_KEY
- if no token is configured, it logs an error and returns an empty result set
- if a query is provided, it calls the Finnhub search endpoint
- if no query is provided, it uses preselected popular stock symbols and fetches profiles for them
- maps each result into a shape used by the app

### News behavior
The function getNews does this:

- checks for a date range around the last 5 days
- fetches company-specific news for watchlisted symbols if available
- round-robins articles from multiple symbols to create a balanced feed
- if that fails or returns no data, falls back to general market news
- deduplicates and formats the results before returning

This makes the app resilient even when some data sources fail.

---

## 8. TradingView Widgets

The dashboard relies on TradingView’s embedded widgets. The reusable component is [components/TradingViewWidget.tsx](components/TradingViewWidget.tsx).

The support config is stored in [lib/constants.ts](lib/constants.ts). It defines:

- market overview widgets
- heatmap configuration
- top stories feed config
- market data config
- stock-specific symbol and chart configs

These widget configs determine the appearance and data source for each chart or market panel.

This approach is efficient because it avoids having to build all charting and market UI manually.

---

## 9. Inngest Workflow Design

Inngest is a background task framework. In this project, it powers event-driven automation.

### User-created event
When a user signs up, an event such as app/user.created is sent from [lib/actions/auth.actions.ts](lib/actions/auth.actions.ts).

The Inngest function then:

- extracts the user profile
- asks Gemini to write a customized personal welcome message
- sends the email

### Daily news job
The function sendDailyNewsSummary:

- fetches all users due for market email summaries
- gets their watchlist symbols
- pulls relevant articles
- uses AI to summarize the set of stories
- sends the formatted email to each user

This is a clear demonstration of a modern app using workflow automation to increase user engagement.

---

## 10. Email System Details

The app uses Nodemailer in [lib/nodemailer/index.ts](lib/nodemailer/index.ts) with a Gmail SMTP setup:

- user: process.env.NODEMAILER_EMAIL
- pass: process.env.NODEMAILER_PASSWORD

It sends two kinds of messages:

1. Welcome email
2. Market news summary email

This means the app is not only a dashboard; it also includes user communication features that are often part of product growth workflows.

---

## 11. The Role of Environment Variables

The app depends on environment variables stored in a root .env file. These include:

- NODE_ENV
- NEXT_PUBLIC_BASE_URL
- NEXT_PUBLIC_FINNHUB_API_KEY
- FINNHUB_API_KEY
- MONGODB_URI
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL
- GEMINI_API_KEY
- NODEMAILER_EMAIL
- NODEMAILER_PASSWORD

Without these values, the app cannot:

- connect to MongoDB
- authenticate users
- fetch stock data
- generate AI summaries
- send emails

This is a crucial part of the project setup and is required for runtime success.

---

## 12. User Flow and Real Application Behavior

A typical workflow for a user looks like this:

1. Open the app
2. Redirect to sign-in if not authenticated
3. Create an account with email/password
4. User is stored in Better Auth and MongoDB-backed data models
5. Dashboard loads with TradingView widgets
6. Header loads stock search suggestions from Finnhub
7. User navigates to a stock page
8. User adds relevant symbols to watchlist
9. Background job sends periodic personalized news updates

This flow shows that the project is not just a static UI—it is a real application with end-to-end behaviors.

---

## 13. Why This Project Is Valuable

This project is useful as a learning and product-building exercise because it combines several real-world features in the same codebase:

- user authentication
- database persistence
- external APIs
- market widgets
- AI integration
- automated emails
- server-side auth middleware
- dashboard UI

These are common in actual SaaS products and startup dashboards.

---

## 14. How the Project Feels Conceptually

Conceptually, this is a fintech app that resembles a modern investing platform. It is designed for:

- tracking stock market trends
- monitoring symbols in a watchlist
- exploring company metrics and news
- getting personalized financial summaries
- building investor engagement through email automation

It sits somewhere between a portfolio tracker and a market intelligence app.

---

## 15. Takeaway

This project is a modern full-stack stock market dashboard with a strong emphasis on data integration, user experience, and automation.

Its most important characteristics are:

- real external data from Finnhub
- dashboard widgets from TradingView
- MongoDB-backed watchlists and auth
- secure route protection with Better Auth middleware
- AI-based personalization using Gemini
- scheduled email workflows via Inngest and Nodemailer

In short, it is a realistic prototype of a fintech product aimed at helping users monitor the market, track stocks, and stay informed.

---

## 16. Recommended Reading Order

To understand the project in a practical way, the best reading sequence is:

1. [README.md](README.md)
2. [package.json](package.json)
3. [app/(root)/page.tsx](app/(root)/page.tsx)
4. [middleware/index.ts](middleware/index.ts)
5. [lib/better-auth/auth.ts](lib/better-auth/auth.ts)
6. [database/mongoose.ts](database/mongoose.ts)
7. [lib/actions/finnhub.actions.ts](lib/actions/finnhub.actions.ts)
8. [lib/inngest/functions.ts](lib/inngest/functions.ts)
9. [lib/nodemailer/index.ts](lib/nodemailer/index.ts)

This order lets you understand the app from UI down through the backend and automation layers.
