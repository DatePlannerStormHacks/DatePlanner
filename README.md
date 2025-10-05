# DatePlanner

A date planning application that creates personalized, location-based date experiences

**DatePlanner** is an intelligent date planning application that uses Gemeni AI to generate custom itineraries based on your preferences, budget, and location. Built for StormHacks 2025, it combines real Vancouver data with Google's Gemini AI to create perfect date experiences.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.14-cyan?style=flat-square&logo=tailwindcss)

## Features

### **Smart Date Planning**
- **AI-Powered Recommendations**: Uses Google Gemini AI to generate personalized itineraries
- **Budget-Aware Planning**: Respects your budget constraints with 4-tier system ($, $$, $$$, $$$$)
- **Real Local Data**: Curated database of 626+ Vancouver restaurants and 709+ activities
- **Multi-Theme Options**: Generates 3 unique themes per request:
  - Romantic & Intimate
  - Fun & Active  
  - Cultural & Relaxed

### **Interactive Experience**
- **Step-by-Step Wizard**: Intuitive form with breadcrumb navigation
- **Real-time Validation**: Smart form validation with visual feedback
- **Smooth Animations**: Powered by Framer Motion for delightful UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### **Favorites & Persistence**
- **Save Favorites**: Bookmark your favorite itineraries with one click
- **Personal Dashboard**: View all saved dates with expandable details
- **Calendar Integration**: Export to Google Calendar or download ICS files
- **User Authentication**: Secure login with Clerk authentication

### **Secure & Scalable**
- **Firebase Backend**: Real-time database with security rules
- **User Privacy**: Data isolation with user-specific access controls  
- **Production Ready**: Built with Next.js 15 App Router and TypeScript

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google AI Studio API key
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BambooShampoo/DatePlanner.git
   cd DatePlanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your API keys:
   ```env
   # Google AI (Gemini)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **Styling**: Tailwind CSS 4.1.14, custom CSS modules
- **Animations**: Framer Motion 12.23.22
- **Authentication**: Clerk (secure, production-ready)
- **Database**: Firebase Firestore (NoSQL, real-time)
- **AI**: Google Gemini 2.5 Flash model
- **Deployment**: Vercel-ready with optimizations

### Project Structure
```
DatePlanner/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (protected)/       # Protected routes (requires login)
│   │   │   ├── dashboard/     # Favorites dashboard
│   │   │   └── form/          # Date planning wizard
│   │   ├── api/               # API routes
│   │   │   ├── favorites/     # CRUD for saved itineraries
│   │   │   └── generate-itinerary/ # AI itinerary generation
│   │   ├── globals.css        # Global styles
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── Breadcrumbs.tsx    # Step navigation
│   │   ├── Header.tsx         # Public header
│   │   └── ProtectedHeader.tsx # Authenticated header
│   ├── lib/                   # Utilities and configurations
│   │   ├── firebase.ts        # Firebase setup
│   │   └── firestore.ts       # Database operations
│   └── shared/                # Shared constants and types
├── public/                    # Static assets
├── cleaned/                   # Curated Vancouver data
│   ├── VancouverRestaurants.csv # 626 restaurant entries
│   └── VancouverActivities.csv  # 709 activity entries
├── data/                      # Raw datasets
└── lib/                       # Additional utilities
```

## User Experience Flow

### 1. **Landing Page**
- Beautiful gradient background with animated elements
- Clear value proposition and call-to-action
- Conditional header based on authentication status

### 2. **Date Planning Wizard**
- **Step 1**: Select your date
- **Step 2**: Choose time range (start/end times)
- **Step 3**: Set budget level with visual slider
- **Step 4**: Pick preferred activities (multi-select chips)
- **Step 5**: Choose cuisine preferences
- **Step 6**: Review and generate itineraries

### 3. **AI-Generated Results**
- 3 unique themed itineraries with detailed timelines
- Real venue names, addresses, and descriptions
- Cost estimates and activity types
- One-click favorite saving with visual feedback

### 4. **Personal Dashboard**
- Grid layout of saved favorites with consistent sizing
- Expandable cards showing full itinerary details
- Calendar export buttons (Google Calendar + ICS download)
- Delete functionality with confirmation

## AI Integration

### Data Processing Pipeline
1. **User Input** → Date, time, budget, activities, cuisines
2. **Data Filtering** → Filters 1,300+ entries based on preferences
3. **Smart Selection** → Picks relevant venues within budget/location
4. **AI Generation** → Gemini creates 3 themed itineraries with:
   - Logical time progression
   - Venue-specific details
   - Realistic cost estimates
   - Transportation considerations

### Gemini AI Prompt Engineering
```javascript
// Sophisticated prompt ensures quality output
const prompt = `You are an expert date planner for Vancouver, Canada...
Create 3 distinct itineraries with different themes:
1. Romantic & Intimate
2. Fun & Active  
3. Cultural & Relaxed

Each timeline entry should include:
- Specific activity name (not generic "Activity")
- Detailed description
- Exact timing
- Location/address
- Type classification

Use ONLY the provided venue data for accurate recommendations.`
```

## Advanced Features

### Calendar Integration
- **Google Calendar**: Direct links with pre-filled event details
- **ICS Export**: Universal calendar format for Apple/Outlook
- **Smart Parsing**: Extracts meaningful event titles from itinerary themes

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large tap targets and swipe gestures
- **Progressive Enhancement**: Works without JavaScript

### Performance Optimizations
- **Next.js 15**: Latest features including Turbopack
- **Image Optimization**: Automatic WebP conversion and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Intelligent caching strategies for API responses

## Security & Privacy

### Authentication
- **Clerk Integration**: Industry-standard authentication
- **Protected Routes**: Server-side route protection
- **Session Management**: Secure JWT handling

### Data Security
- **Firestore Rules**: User-specific data access controls
- **Server-Side API**: Sensitive operations handled server-side
- **Environment Variables**: Secure API key management

### Privacy
- **User Data Isolation**: Each user only sees their own data
- **Minimal Data Collection**: Only collects necessary planning information
- **Secure Deletion**: Complete data removal on account deletion


### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_FIREBASE_*` (all Firebase config variables)

## Data Sources

### Vancouver Restaurant Data (626 entries)
- Curated from business licenses and Yelp data
- Includes cuisine types, price ranges, locations
- Filtered for date-appropriate venues

### Vancouver Activities Data (709 entries)  
- Cultural spaces, parks, attractions
- Activity types, accessibility, pricing
- Seasonal availability considerations

## Future Enhancements

### Planned Features
- [ ] **Multi-City Support**: Expand beyond Vancouver
- [ ] **Weather Integration**: Weather-aware recommendations
- [ ] **Group Planning**: Support for group dates and events
- [ ] **Review System**: User ratings and feedback
- [ ] **Advanced Filters**: Dietary restrictions, transportation preferences
- [ ] **Analytics Dashboard**: Usage insights and popular venues

### Technical Improvements
- [ ] **PWA Support**: Offline functionality and app installation
- [ ] **Real-time Updates**: Live venue availability and pricing
- [ ] **Advanced Caching**: Redis integration for better performance
- [ ] **A/B Testing**: Optimize user experience with experiments
- [ ] **Monitoring**: Application performance monitoring
- [ ] **Internationalization**: Multi-language support

# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

