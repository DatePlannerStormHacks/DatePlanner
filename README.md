# DatePlanner
StormHacks 2025 Date planner app

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

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure
- `cleaned data/` - data analysis files output
- `src/app/` - Next.js App Router pages and components
- `lib/data-analysis/` - Original data analysis files
  - `vanEats.ipynb` - Jupyter notebook for restaurant analysis
  - `vanResturantsData.py` - Python script for data processing
  - `ActivityData.ipynb` - Jupyter notebook for activity analysis
  - `ActivityData.py` - Python script for data processing for activities
- `raw data/` - CSV and JSON data files
- `public/` - Static assets

## API Integration Pipeline

Your DatePlanner follows this complete pipeline:

1. **User Input** → Date, budget, preferences, food type, activities
2. **Data Processing** → Uses your existing restaurant/park data to generate options
3. **Option Generation** → Creates 3-5 curated date combinations within budget
4. **User Selection** → User picks their preferred option
5. **Gemini AI** → Creates detailed itinerary with timing, links, and recommendations
6. **Email Service** → Sends beautiful HTML email with full itinerary
7. **Google Calendar** → Provides direct link to add event to calendar

### Required API Keys

Copy `.env.local.example` to `.env.local` and add your API keys:

- **GEMINI_API_KEY** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **RESEND_API_KEY** - Get from [Resend.com](https://resend.com/api-keys)

### API Endpoints

- `POST /api/generate-options` - Generate date options from user parameters
- `POST /api/create-itinerary` - Create detailed itinerary using Gemini AI
- `POST /api/send-itinerary` - Send email and create calendar link

### Dependencies to Install

```bash
npm install @google/generative-ai resend
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
