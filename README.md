# HapsayPrint

## Overview

HapsayPrint is a full-stack print job management system built for small print shops. Customers can submit print orders online — without creating an account — and receive a unique tracking code to monitor their order status in real time. Staff manage incoming jobs from a protected admin dashboard with status tracking, internal notes, analytics, and automated email notifications.

## Live Demo

[Live Demo](https://hapsay-print.vercel.app)

## Screenshots

![Main Page](./screenshots/main.png)
![Dashboard](./screenshots/dashboard.png)

> _(Add your screenshots to a `/screenshots` folder in the project root)_

---

## Features

### 🖨️ Customer-Facing (Public)

- **Job Submission Form** — Customers submit print jobs with their name, contact number, email (optional), and a job description — no account required.
- **File Upload** — Optional file attachment per job, uploaded via UploadThing and stored securely.
- **Print Specifications** — Customers can select paper size (Short, Long, A4, Legal), print type (B&W or Colored), quantity, and finishing (None, Lamination, Comb Binding, Spiral Binding).
- **Live Price Estimate** — A price calculator updates in real time as the customer selects specs, displaying an estimated cost before submission.
- **Tracking Code** — Each job submission generates a unique `HP-XXXXXX` tracking code shown to the customer on success.
- **Order Tracking Page** — Customers can visit `/track/[code]` to view the current status of their job (Pending, In Progress, Ready for Pickup, Delivered) along with order details and attached file info.

### 🔐 Admin Portal

- **Secure Login** — Staff log in via email and bcrypt-hashed password using NextAuth v5 with JWT sessions.
- **Admin Dashboard** — A full-width table listing all jobs, showing customer name, contact, description, print specs, status, submission date, and attached files.
- **Status Updates** — Inline status dropdown per job with optimistic UI updates. Changing status updates the database and revalidates the page without a full refresh.
- **Email Notifications** — When a job is marked **Ready for Pickup** and the customer has an email on file, a transactional email is automatically sent via Resend. If sending fails, the status update still succeeds.
- **Internal Notes** — Admins can open a notes dialog per job to leave and read internal staff comments (e.g. "Customer confirmed matte finish"). Notes show the author's name and a relative timestamp (e.g. "2 hours ago"). Notes are never exposed to customers.
- **Job Filtering & Search** — The dashboard supports filtering jobs by status and searching by customer name, description, or contact number.
- **QR Code Generator** (`/admin/qr`) — Generates a scannable QR code pointing to the public submission form. Admins can download it as a PNG or print it directly to place at the shop counter.
- **Sign Out** — Session-aware sign out button in the top navigation.

### 📊 Analytics Dashboard

- **Today's Job Count** — Total jobs submitted today.
- **Weekly Job Count** — Total jobs submitted in the last 7 days.
- **Estimated Weekly Revenue** — Sum of all `estimatedPrice` values from jobs in the last 7 days.
- **Status Breakdown** — Cards showing the live count of jobs in each status (Pending, In Progress, Ready for Pickup, Delivered).
- **7-Day Volume Bar Chart** — A Recharts bar chart showing daily job volume for the past 7 days, with the busiest day highlighted.
- **Most Requested Specs** — Shows the most common print type and finishing option across all jobs, useful for inventory and staffing decisions.

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
│   ├── page.tsx              # Public home page: branding + job submission form
│   ├── layout.tsx            # Root layout with font and toast provider
│   ├── globals.css           # Global Tailwind styles and CSS tokens
│   ├── actions.ts            # All Next.js Server Actions (submit job, update status, add note)
│   ├── admin/
│   │   ├── layout.tsx        # Admin layout: auth guard + top nav header
│   │   ├── page.tsx          # Admin dashboard: analytics + job table
│   │   └── qr/
│   │       └── page.tsx      # QR code generator page
│   ├── login/
│   │   └── page.tsx          # Admin login page
│   ├── track/
│   │   └── [code]/
│   │       └── page.tsx      # Public order tracking page
│   └── api/
│       ├── auth/[...nextauth] # NextAuth API route handler
│       └── uploadthing/      # UploadThing file upload endpoint
├── components/
│   ├── SubmitForm.tsx         # Customer job submission form (with pricing calc)
│   ├── SubmitSuccess.tsx      # Post-submission success screen with tracking code
│   ├── AdminDashboardClient.tsx # Client-side admin table with filtering and status updates
│   ├── AnalyticsCharts.tsx    # Recharts bar chart + popular specs panel (client)
│   ├── JobNotesModal.tsx      # Per-job internal notes dialog (client)
│   ├── TrackOrderForm.tsx     # Tracking code lookup form on the home page
│   ├── SignOutButton.tsx      # Admin sign-out button
│   └── ui/                   # shadcn/ui base components (button, input, select, etc.)
├── lib/
│   ├── pricing.ts             # Pricing config: paper sizes, print types, finishing, calc function
│   ├── analytics.ts           # Server-side Prisma analytics queries
│   ├── uploadthing.ts         # UploadThing client helper
│   └── utils.ts               # Tailwind class merge utility (cn)
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── db.ts                  # Prisma client singleton
│   └── generated/prisma/      # Auto-generated Prisma client
├── auth.ts                    # NextAuth configuration (credentials provider, JWT callbacks)
└── next.config.ts             # Next.js config (UploadThing image domains)
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
| `estimatedPrice`| Float?    | Calculated at submission time (₱)              |
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
