# Todo List (Next.js + idb)

This project is a minimal Next.js 13+ app that stores tasks in the browser's IndexedDB using `idb`.

Features implemented:
- Add task (title required, description optional)
- Delete task
- Toggle complete/incomplete
- View list, filter by category, sort by due/priority
- Data persisted in IndexedDB (`lib/db.ts`)
- Basic UI matching provided mockups

Local setup

1. Install dependencies

```powershell
cd todo-list
npm install
# or: pnpm install
```

2. Run dev server

```powershell
npm run dev
```

Notes
- The `config/feature-flags.json` contains a placeholder flag `claudeHaiku4_5` set to `true` per request.
- Browser Notifications/Service Worker reminders are not fully implemented; you can add Service Worker logic to trigger notifications for `task.reminder`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
