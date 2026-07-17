# HapsayPrint

## Overview

HapsayPrint is a full-stack print job management system built for small print shops. Customers can submit print orders online — without creating an account — and receive a unique tracking code to monitor their order status in real time. Staff manage incoming jobs from a protected admin dashboard with status tracking, internal notes, analytics, dynamic pricing, shop business hours, and automated email notifications.

## Live Demo

[Live Demo](https://hapsay-print.vercel.app)

## Screenshots

![Main Page](./screenshots/main.png)
![Dashboard](./screenshots/dashboard.png)

> _(Add your screenshots to a `/screenshots` folder in the project root)_

---

## Features

### 🖨️ Customer-Facing (Public)

- **Job Submission Form** — Customers submit print orders with their name, contact number, email (optional), and instructions — no account required.
- **Multiple File Uploads** — Customers can attach up to 5 files per job (e.g., multiple PDFs), uploaded securely via UploadThing.
- **Print Specifications** — Selection of paper size (Short, Long, A4, Legal), print type (B&W or Colored), quantity, and finishing (None, Lamination, Comb Binding, Spiral Binding).
- **Rush Order Option** — Customers can mark their job as a "Rush Order" for an additional fee, which flags the job with a red badge in the admin dashboard.
- **Live Price Estimate (Dynamic)** — A price calculator updates in real time as the customer selects specs and rush options, displaying an estimated cost based on live pricing settings configured by the admin.
- **Shop Business Hours / Vacation Mode** — If the store is manually set to "Closed" or is outside automatic operating hours, the public form is hidden and replaced by a customizable "We're Closed" message with schedule details.
- **Tracking Code** — Each job submission generates a unique `HP-XXXXXX` tracking code shown to the customer on success.
- **Order Tracking Page** — Customers can visit `/track/[code]` to view the current status of their job (Pending, In Progress, Ready for Pickup, Delivered) along with order details and attached file info.

### 🔐 Admin Portal

- **Secure Login** — Staff log in via email and bcrypt-hashed password using NextAuth v5 with JWT sessions.
- **Admin Dashboard** — A full-width table listing all active jobs, showing customer name, contact, description, print specs, status, submission date, and attached files.
- **Quick Copy Details** — Staff can hover over a customer's phone number or email in the dashboard to reveal a 1-click "copy to clipboard" button.
- **Status Updates** — Inline status dropdown per job with optimistic UI updates. Changing status updates the database and revalidates the page instantly.
- **Email Notifications** — When a job is marked **Ready for Pickup** and the customer has an email on file, a transactional email is automatically sent via Resend.
- **Internal Notes** — Admins can open a notes dialog per job to leave and read internal staff comments (e.g. "Customer confirmed matte finish"). Notes show the author's name and a relative timestamp (e.g. "2 hours ago"). Notes are never exposed to customers.
- **Job Archiving** — Jobs can be archived at any time to remove them from the active dashboard. An optimistic UI ensures it feels instant.
- **Job Filtering & Search** — The dashboard supports filtering jobs by status and searching by customer name, description, or contact number.
- **System Settings** (`/admin/settings`):
  - **Dynamic Pricing:** Admins can adjust base prices, finishing add-ons, and the rush fee in real-time. Changes only apply to future jobs.
  - **Store Status:** A toggle to manually accept or pause orders, plus settings for an automatic schedule (open/close hours and operating days) and a custom closed message.
- **QR Code Generator** (`/admin/qr`) — Generates a scannable QR code pointing to the public submission form. Admins can download it as a PNG or print it directly to place at the shop counter.
- **Smooth Page Transitions** — The entire admin portal features a smooth "fade-in up" animation on every page load for a premium feel.
- **Sign Out** — Session-aware sign out button in the top navigation.

### 📊 Analytics Dashboard

- **Today's Job Count** — Total jobs submitted today.
- **Weekly Job Count** — Total jobs submitted in the last 7 days.
- **Estimated Weekly Revenue** — Sum of all `estimatedPrice` values from jobs in the last 7 days.
- **Vibrant UI Design** — Top metrics are displayed using premium, solid gradient cards to make critical data stand out.
- **Status Breakdown** — Cards showing the live count of jobs in each status (Pending, In Progress, Ready for Pickup, Delivered).
- **7-Day Volume Bar Chart** — A Recharts bar chart showing daily job volume for the past 7 days, with the busiest day highlighted.
- **Most Requested Specs** — Shows the most common print type and finishing option across all jobs, useful for inventory and staffing decisions.
- **Export to CSV** — Admins can select a month and year to download a complete `.csv` report of all jobs (including revenue, specs, and status) for accounting and bookkeeping.

---

## Tech Stack

| Category       | Technology                                        |
|----------------|---------------------------------------------------|
| Framework      | Next.js 16 (App Router)                           |
| Language       | TypeScript                                        |
| Database       | Neon PostgreSQL (serverless)                      |
| ORM            | Prisma 7                                          |
| Authentication | NextAuth v5 (Credentials + JWT, bcryptjs)         |
| Styling        | Tailwind CSS v4                                   |
| UI Components  | shadcn/ui (via `@base-ui/react`), Radix UI Select |
| File Uploads   | UploadThing                                       |
| Email          | Resend                                            |
| Charts         | Recharts                                          |
| QR Codes       | qrcode.react                                      |
| Toast Alerts   | Sonner                                            |
| Date Utilities | date-fns                                          |
| Icons          | lucide-react                                      |
| Deployment     | Vercel                                            |

---

## Project Structure

```
hapsayprint/
├── app/
│   ├── page.tsx              # Public home page: branding + job submission form / closed message
│   ├── layout.tsx            # Root layout with font and toast provider
│   ├── globals.css           # Global Tailwind styles and CSS tokens
│   ├── actions.ts            # All Next.js Server Actions (submit job, update status, settings, etc.)
│   ├── admin/
│   │   ├── layout.tsx        # Admin layout: auth guard + top nav header
│   │   ├── page.tsx          # Admin dashboard: analytics + active job table
│   │   ├── archive/          # Archived jobs table view
│   │   ├── settings/         # System settings (pricing + store hours)
│   │   └── qr/               # QR code generator page
│   ├── login/                # Admin login page
│   ├── track/                # Public order tracking page
│   └── api/
│       ├── auth/             # NextAuth API route handler
│       ├── export/           # CSV export generation route
│       └── uploadthing/      # UploadThing file upload endpoint
├── components/
│   ├── SubmitForm.tsx         # Customer job submission form (dynamic pricing calc)
│   ├── StoreClosedMessage.tsx # UI shown when store is closed
│   ├── PricingSettingsForm.tsx# Admin UI for updating prices
│   ├── StoreStatusForm.tsx    # Admin UI for updating store hours
│   ├── AdminDashboardClient.tsx # Client-side admin table with filtering and status updates
│   ├── AnalyticsCharts.tsx    # Recharts bar chart + popular specs panel (client)
│   ├── ExportReportButton.tsx # Client component for downloading CSVs
│   ├── JobNotesModal.tsx      # Per-job internal notes dialog (client)
│   └── ui/                   # shadcn/ui base components
├── lib/
│   ├── pricing.ts             # Pricing calc logic and DB fetcher
│   ├── settings.ts            # Store hours logic and DB fetcher
│   └── analytics.ts           # Server-side Prisma analytics queries
├── prisma/
│   └── schema.prisma          # Database schema
└── src/
    └── db.ts                  # Prisma client singleton
```

---

## Database Schema

### `Customer`
Stores details about the person placing the print order.

| Column      | Type       | Notes                              |
|-------------|------------|------------------------------------|
| `id`        | String     | CUID primary key                   |
| `name`      | String     | Customer's full name               |
| `contact`   | String     | Phone number (used as unique key)  |
| `email`     | String?    | Optional, used for email alerts    |
| `createdAt` | DateTime   | Timestamp                          |

**Relations:** One customer can have many `Job` records.

---

### `Job`
The core record for a single print order.

| Column          | Type      | Notes                                          |
|-----------------|-----------|------------------------------------------------|
| `id`            | String    | CUID primary key                               |
| `description`   | String    | Customer's print instructions                  |
| `status`        | JobStatus | Enum: PENDING, IN_PROGRESS, READY_FOR_PICKUP, DELIVERED |
| `trackingCode`  | String?   | Unique `HP-XXXXXX` code given to customer      |
| `paperSize`     | String?   | SHORT, LONG, A4, or LEGAL                      |
| `quantity`      | Int?      | Number of pages/copies                         |
| `printType`     | String?   | BW or COLORED                                  |
| `finishing`     | String?   | NONE, LAMINATION, BINDING_COMB, BINDING_SPIRAL |
| `isRush`        | Boolean   | True if the customer selected Rush Order       |
| `estimatedPrice`| Float?    | Calculated at submission time (₱)              |
| `archived`      | Boolean   | True if archived by admin                      |
| `createdAt`     | DateTime  | Submission timestamp                           |
| `updatedAt`     | DateTime  | Last update timestamp                          |

**Relations:** Belongs to one `Customer`. Has many `FileUpload` and `JobNote` records.

---

### `FileUpload`
A file attached to a print job.

| Column        | Type     | Notes                    |
|---------------|----------|--------------------------|
| `id`          | String   | CUID primary key         |
| `url`         | String   | UploadThing hosted URL   |
| `originalName`| String   | Original filename        |
| `fileType`    | String   | MIME type                |
| `uploadedAt`  | DateTime | Timestamp                |

**Relations:** Belongs to one `Job`.

---

### `JobNote`
An internal staff note on a specific job. Never exposed to customers.

| Column      | Type     | Notes                         |
|-------------|----------|-------------------------------|
| `id`        | String   | CUID primary key              |
| `content`   | String   | Note text                     |
| `createdAt` | DateTime | Timestamp                     |

**Relations:** Belongs to one `Job` (cascade delete). Belongs to one `User` (the admin who wrote it).

---

### `User`
An admin staff account. Managed manually in the database (no public registration).

| Column      | Type    | Notes                        |
|-------------|---------|------------------------------|
| `id`        | String  | CUID primary key             |
| `name`      | String? | Display name                 |
| `email`     | String  | Unique login email           |
| `password`  | String  | bcrypt-hashed password       |
| `role`      | String  | Defaults to `"ADMIN"`        |
| `createdAt` | DateTime| Timestamp                    |

---

### `PricingConfig`
A singleton table (id="default") storing dynamic base prices and add-on costs. Used to calculate estimated prices on the fly.

### `StoreSettings`
A singleton table (id="default") storing shop business hours, toggle state for accepting orders, and custom closed messages.

---

## Local Setup Instructions

### Prerequisites

- **Node.js** v20 or higher
- **npm** v10 or higher
- A **Neon** PostgreSQL database ([neon.tech](https://neon.tech))
- An **UploadThing** account ([uploadthing.com](https://uploadthing.com))
- A **Resend** account ([resend.com](https://resend.com)) _(for email notifications)_

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/devbalbuena/HapsayPrint.git
   cd HapsayPrint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   DATABASE_URL=           # Neon pooled connection string
   DIRECT_URL=             # Neon direct (non-pooled) connection string
   UPLOADTHING_TOKEN=      # UploadThing app token
   NEXTAUTH_URL=           # Full URL of your app (e.g. http://localhost:3000)
   AUTH_SECRET=            # Random secret for NextAuth (run: npx auth secret)
   NEXT_PUBLIC_APP_URL=    # Public URL of your app (used for QR code generation)
   RESEND_API_KEY=         # Resend API key for email notifications
   ```

4. **Sync the database schema**
   ```bash
   npx prisma db push
   ```

5. **Generate the Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Seed an admin user** _(manual step — no seed script exists)_

   Open a Prisma Studio or run a quick script to insert a `User` row with a bcrypt-hashed password:
   ```bash
   npx prisma studio
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

---

### Environment Variables Reference

| Variable              | Description                                                    |
|-----------------------|----------------------------------------------------------------|
| `DATABASE_URL`        | Neon **pooled** PostgreSQL connection string (for Prisma queries) |
| `DIRECT_URL`          | Neon **direct** connection string (for migrations/schema push) |
| `UPLOADTHING_TOKEN`   | UploadThing app token for file upload authentication           |
| `NEXTAUTH_URL`        | Full base URL of your deployment (e.g. `https://hapsay-print.vercel.app`) |
| `AUTH_SECRET`         | Secret key used to sign NextAuth JWT tokens                    |
| `NEXT_PUBLIC_APP_URL` | Publicly accessible URL used to generate the counter QR code   |
| `RESEND_API_KEY`      | API key from Resend for sending pickup notification emails     |

---

## Deployment

This project is deployed on **Vercel** and is configured for zero-config deployment.

1. Push the repository to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Add all environment variables listed above in **Vercel → Project Settings → Environment Variables**.
4. Deploy. Vercel automatically runs `npm run build` which includes `prisma generate` via the `postinstall` script.

> **Note:** After adding or changing environment variables in Vercel, you must **redeploy** for them to take effect.

---

## Author

**Dexter Balbuena**
3rd Year IT Student — FSUU University
Open to freelance: Full-Stack · UI/UX · AI Projects

---

## License

MIT License
