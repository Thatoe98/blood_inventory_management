# Blood Inventory Management System - Next.jsThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern, secure blood bank inventory management system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.## Getting Started



## 🎯 Project Status: Migration CompleteFirst, run the development server:



✅ **All components and pages created**  ```bash

✅ **Secure environment variable setup**  npm run dev

✅ **Modern UI with Tailwind CSS**  # or

⚠️ **Schema alignment needed** (see SETUP_GUIDE.md)yarn dev

# or

## 🚀 Quick Startpnpm dev

# or

```powershellbun dev

# Navigate to project```

cd "C:\Users\HP EliteBook\Desktop\blood-inventory-nextjs"

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Install dependencies (if not done)

npm installYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



# Start development serverThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

npm run dev

```## Learn More



Visit http://localhost:3000To learn more about Next.js, take a look at the following resources:



## 📋 Features- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Dashboard**: Real-time statistics and blood inventory summary

- **Donors Management**: CRUD operations, eligibility tracking, filtersYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Donations Management**: Record donations with test results

- **Inventory Management**: Blood stock monitoring with alerts## Deploy on Vercel

- **Hospitals Management**: Hospital database with filters

- **Campaigns Management**: Blood donation campaignsThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- **Patients Management**: Patient records with urgency levels

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔐 Security

- ✅ Supabase credentials stored in `.env.local` (not in code)
- ✅ Environment variables excluded from git
- ✅ Server-side ready architecture

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard
│   ├── donors/           # Donors page
│   ├── donations/        # Donations page
│   ├── inventory/        # Inventory page
│   ├── hospitals/        # Hospitals page
│   ├── campaigns/        # Campaigns page
│   └── patients/         # Patients page
├── components/            # Reusable React components
│   ├── Sidebar.tsx       # Navigation
│   ├── StatsCard.tsx     # Statistics cards
│   ├── Table.tsx         # Data tables
│   ├── Modal.tsx         # Modal dialogs
│   └── Toast.tsx         # Notifications
├── lib/                   # Core logic and utilities
│   ├── supabase.ts       # Database client
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Helper functions
│   └── api.ts            # API service layer
├── .env.local            # Environment variables (secure)
└── package.json          # Dependencies
```

## ⚙️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📖 Documentation

- **SETUP_GUIDE.md**: Complete setup and deployment instructions
- **MIGRATION_STATUS.md**: Migration progress and what's been completed

## ⚠️ Important Note

The code uses simplified field names for the UI (e.g., `id`, `name`, `blood_type`), but your Supabase database uses different names (e.g., `donor_id`, `first_name`, `abo_group`).

**You need to align the schema** - see SETUP_GUIDE.md for three options:
1. Transform data in `lib/api.ts`
2. Update all pages to use actual schema
3. Create database views (recommended)

## 🛠️ Development

```powershell
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚀 Deployment to Vercel

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Remember to add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📝 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🎨 Customization

### Colors
Update Tailwind classes in components:
- Primary: `red-600` (blood/medical theme)
- Success: `green-600`
- Warning: `yellow-600`
- Danger: `red-600`

### Branding
- Update `app/layout.tsx` metadata
- Modify `components/Sidebar.tsx` logo
- Change colors in `app/globals.css`

## 📚 Key Pages

- `/` - Dashboard with statistics
- `/donors` - Manage blood donors
- `/donations` - Record donations
- `/inventory` - View blood stock
- `/hospitals` - Manage hospitals
- `/campaigns` - Blood donation campaigns
- `/patients` - Patient records

## 🐛 Known Issues

- TypeScript errors due to schema mismatch (see SETUP_GUIDE.md)
- Field names need alignment with database
- Some database fields may not exist (e.g., `urgency`, `status`)

## 📞 Support

For issues or questions:
1. Check SETUP_GUIDE.md for detailed instructions
2. Review TypeScript errors: `npm run build`
3. Check Supabase connection and RLS policies

## 📄 License

MIT License - Feel free to use and modify

## 🎉 Credits

Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

---

**Ready to start?** Run `npm run dev` and visit http://localhost:3000

**Need help?** See SETUP_GUIDE.md for complete setup instructions including schema alignment.
