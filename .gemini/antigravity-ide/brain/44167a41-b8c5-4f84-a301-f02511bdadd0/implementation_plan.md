# Job Archiving & Cleanup

This feature will allow staff to archive completed (delivered) jobs, removing them from the main dashboard to keep it fast and clean, while still keeping the data accessible if needed.

## User Review Required
None of these changes are breaking, but they involve a database schema update (`npx prisma db push`). 

## Open Questions
> [!NOTE]
> 1. To keep the main dashboard fast, I plan to move archived jobs to a completely separate page (e.g., `/admin/archive`) rather than just hiding them in a client-side filter. Does a separate "Archived Jobs" page sound good to you?
> 2. Should we only allow archiving for jobs that are marked as `DELIVERED`, or do you want the ability to archive any job regardless of status (e.g., if a customer cancels)?

## Proposed Changes

### Database Schema
#### [MODIFY] [schema.prisma](file:///c:/hapsayprint/prisma/schema.prisma)
- Add `archived Boolean @default(false)` to the `Job` model.

### Server Actions
#### [MODIFY] [actions.ts](file:///c:/hapsayprint/app/actions.ts)
- Add a new server action `toggleArchiveJob(jobId: string, archive: boolean)` that updates the `archived` status of a job and revalidates the admin paths.

### UI & Pages
#### [MODIFY] [app/admin/page.tsx](file:///c:/hapsayprint/app/admin/page.tsx)
- Update the main Prisma query to only fetch jobs where `archived: false`.
- Add a link/button in the header area pointing to the new Archive page.

#### [NEW] [app/admin/archive/page.tsx](file:///c:/hapsayprint/app/admin/archive/page.tsx)
- Create a new page that fetches jobs where `archived: true`.
- Reuse the `AdminDashboardClient` to display these jobs.

#### [MODIFY] [components/AdminDashboardClient.tsx](file:///c:/hapsayprint/components/AdminDashboardClient.tsx)
- Add a new `isArchiveView?: boolean` prop to adapt the UI slightly.
- In the actions area (next to Notes), add a quick "Archive" button (or "Unarchive" if `isArchiveView` is true).

## Verification Plan
### Automated Tests
- Run `npm run build` to ensure type safety after modifying the `Job` type.
### Manual Verification
- Test archiving a job and verify it disappears from the main dashboard.
- Navigate to the Archive page and verify the job appears there.
- Test unarchiving the job and verify it returns to the main dashboard.
