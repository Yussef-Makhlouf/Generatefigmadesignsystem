# Khapeer Platform - Complete Workflow Guide

## 📋 Table of Contents
1. [Platform Overview](#platform-overview)
2. [User Registration & Authentication](#user-registration--authentication)
3. [Core Features](#core-features)
4. [User Workflows](#user-workflows)
5. [Reputation System](#reputation-system)
6. [Community Features](#community-features)
7. [Technical Architecture](#technical-architecture)

---

## 🌟 Platform Overview

**Khapeer (خبير)** is an Arabic Q&A platform designed for knowledge sharing in the Arabic-speaking community. Built with React, TypeScript, Tailwind CSS, and shadcn/ui components, it provides a modern, RTL-first, mobile-responsive experience.

### Key Features
- ✅ Question & Answer posting
- ✅ Voting system with reputation points
- ✅ User profiles with achievements
- ✅ Spaces (specialized communities)
- ✅ Leaderboards
- ✅ Daily challenges
- ✅ Streak tracking
- ✅ Expert verification
- ✅ Real-time notifications
- ✅ Full RTL support

---

## 🔐 User Registration & Authentication

### Registration Flow

1. **Navigate to Registration**
   - Path: `/auth/register`
   - User provides:
     - Full name (الاسم الكامل)
     - Email address
     - Password (min 8 characters)
   - Password strength indicator shows real-time feedback

2. **Onboarding Process**
   - After successful registration, user sees onboarding modal
   - User selects:
     - City/Location (optional)
     - Interests (3-5 topics)
   - Profile completion progress bar shown
   - Can skip onboarding and complete later in Settings

3. **Profile Setup**
   - Initial reputation: 0 points
   - Default avatar with first letter of name
   - No badges initially
   - Streak: 0 days

### Login Flow

1. **Navigate to Login**
   - Path: `/auth/login`
   - User provides:
     - Email address
     - Password
   - "Remember me" option available
   - "Forgot password?" link

2. **Post-Login**
   - Redirected to Home page (`/`)
   - Personalized feed based on interests
   - Access to all platform features

---

## 🎯 Core Features

### 1. Ask a Question

**Path:** `/questions/new`

**Workflow:**
```
1. User clicks "+" FAB or "اطرح سؤالاً" button
2. Fills out form:
   - Title (required, clear and specific)
   - Description (required, detailed explanation)
   - Tags (up to 5, helps categorization)
   - Optional: Bounty points
3. Preview shown before posting
4. Click "نشر السؤال"
5. Question appears in feed immediately
6. User receives notifications for new answers
```

**Best Practices:**
- Use clear, specific titles
- Provide context and examples
- Add relevant tags
- Include error messages/code if applicable
- Search first to avoid duplicates

### 2. Answer a Question

**Path:** `/questions/:id`

**Workflow:**
```
1. Browse questions on Home or Search
2. Click on question to view details
3. Read question and existing answers carefully
4. Compose comprehensive answer in editor
5. Optional: Add code snippets, images, links
6. Click "نشر الإجابة"
7. Answer appears under question
8. Receive notifications for votes/comments
```

**Answer Quality:**
- Provide detailed explanations
- Include examples and references
- Format code properly
- Cite sources when applicable
- Be respectful and constructive

### 3. Voting System

**How It Works:**
```
Upvote (مفيد):
- Click ↑ arrow
- +10 reputation to author
- +2 reputation to voter
- Highlights answer/question quality

Downvote (غير مفيد):
- Click ↓ arrow
- -2 reputation to author
- Use sparingly, for poor quality only
- Helps filter low-quality content

Change Vote:
- Click opposite arrow
- Adjusts by ±2 from current state
- Toast notification confirms action
```

**Minimum Reputation Required:**
- Vote on questions/answers: 15 points
- This ensures informed voting

### 4. Search & Discovery

**Path:** `/search`

**Features:**
```
Search by:
- Keywords in title/description
- Tags
- Author
- Date range
- Space/Community

Filters:
- Sort by: Recent, Popular, Unanswered
- Filter by: Tags, Spaces, Date
- Advanced search operators

Results:
- Paginated display
- Preview with vote count
- Quick view option
```

### 5. User Profile

**Path:** `/profile/:username`

**Components:**
```
Header Section:
- Avatar (customizable)
- Name & username
- Verification badge (if expert)
- Bio/About
- Location & join date
- Current streak

Stats Display:
- Reputation points
- Questions asked
- Answers provided
- Upvotes received
- Followers count

Badges & Achievements:
- متصدر (Top Contributor)
- مجيب سريع (Fast Responder)
- دقيق (Accurate)
- سلسلة ٧ (7-day Streak)
- خبير موثق (Verified Expert)

Activity Tabs:
1. أسئلتي (My Questions)
2. إجاباتي (My Answers)
3. المحفوظات (Saved)
4. النشاط (Activity Timeline)
```

**Profile Actions:**
- Follow/Unfollow users
- View activity history
- Edit profile (own profile only)
- Send message (if enabled)

---

## ⚡ User Workflows

### Workflow 1: New User Journey

```
Day 1:
1. Register account → Complete onboarding
2. Browse trending topics
3. Ask first question → Earn 5 points
4. Receive first answer notification
5. Upvote helpful answer → Earn 2 points

Day 2:
1. Check daily challenge
2. Answer challenge question → Earn 50 points
3. Continue 2-day streak
4. Explore Spaces
5. Join relevant communities

Week 1:
1. Build 7-day streak → Earn badge
2. Accumulate 100+ reputation
3. Unlock voting privileges
4. Start helping others
5. Build community presence
```

### Workflow 2: Expert User Journey

```
Regular Activity:
1. Check notifications daily
2. Answer questions in expertise areas
3. Maintain streak (answer/vote daily)
4. Collect badges and achievements
5. Climb leaderboard

Community Leadership:
1. Provide high-quality answers
2. Edit/improve community content
3. Moderate discussions
4. Mentor new users
5. Earn verified expert status
```

### Workflow 3: Content Discovery

```
Finding Questions:
1. Home feed shows personalized content
2. Filter by: Recent, Popular, For You
3. Use trending topics
4. Browse Spaces
5. Use search with filters

Engaging with Content:
1. Read question thoroughly
2. Check existing answers
3. Vote on quality content
4. Add your perspective
5. Follow interesting threads
```

---

## 🏆 Reputation System

### Earning Points

| Action | Points | Notes |
|--------|--------|-------|
| Question upvoted | +5 | Per upvote |
| Answer upvoted | +10 | Per upvote |
| Answer accepted | +15 | Best answer |
| Daily challenge | +50 | Once per day |
| Edit accepted | +2 | Community edit |
| Vote on content | +2 | Helpful contribution |
| Question downvoted | -2 | Per downvote |
| Answer downvoted | -2 | Per downvote |
| Spam/abuse | -50 | Moderation action |

### Reputation Levels

```
Beginner (0-99):
- Can ask questions
- Can answer questions
- Basic profile features

Member (100-499):
- Can vote
- Can comment
- Profile customization

Contributor (500-999):
- Can edit tags
- Flag content
- Access to analytics

Expert (1000-4999):
- Can edit questions/answers
- Review edits
- Close duplicates

Moderator (5000+):
- Full moderation tools
- Community leadership
- Special badge
```

### Badges & Achievements

**Activity Badges:**
- 🔥 Streak Master: 30-day streak
- ⚡ Fast Responder: Answer within 15 min
- 🎯 Sharpshooter: 10 accepted answers
- 💎 Expert: 1000+ reputation

**Quality Badges:**
- ⭐ Popular Question: 100+ views
- 🏆 Great Answer: 50+ upvotes
- 📚 Scholar: 100 helpful votes

**Community Badges:**
- 👥 Mentor: Help 10 new users
- 🌟 Contributor: 100+ actions
- 👑 Legend: Top 10 all-time

---

## 🌍 Community Features

### 1. Spaces (Communities)

**Available Spaces:**
- 💻 التقنية والبرمجة (Tech & Programming)
- 🤖 الذكاء الاصطناعي (AI)
- 🎨 التصميم والإبداع (Design)
- 📈 الأعمال والريادة (Business)
- 📚 التعليم والتطوير (Education)
- 🌿 الصحة والعافية (Health)
- 🔬 العلوم والبحث (Science)
- 🛡️ أمن المعلومات (Security)
- 🚀 العمل الحر (Freelancing)
- 🌍 المطورون العرب (Arab Developers)

**Space Features:**
- Join/Leave spaces
- Space-specific feed
- Dedicated moderators
- Community rules
- Member count & activity stats

### 2. Leaderboards

**Path:** `/leaderboard`

**Types:**
```
Weekly Leaderboard:
- Top 10 contributors this week
- Resets every Monday
- Prizes/recognition

Monthly Leaderboard:
- Top performers of the month
- Monthly achievements
- Featured experts

All-Time Leaderboard:
- Platform legends
- Lifetime achievements
- Hall of fame
```

**Ranking Criteria:**
- Reputation earned
- Answer quality
- Community engagement
- Helpful votes
- Active streak

### 3. Daily Challenges

**Features:**
```
Challenge Format:
- New question daily
- Specific topic/difficulty
- Time-limited (24 hours)
- Bonus points (+50)

Participation:
1. View challenge on home page
2. Submit answer
3. Best answer selected
4. Winner announced next day
```

### 4. Notifications

**Path:** `/notifications`

**Types:**
```
Activity Notifications:
- New answer to your question
- Comment on your post
- Mention in discussion
- Answer accepted

Social Notifications:
- New follower
- User you follow posted
- Invited to discussion

Achievement Notifications:
- Badge earned
- Level up
- Streak milestone
- Leaderboard position
```

**Settings:**
- Email notifications toggle
- In-app notifications
- Frequency settings
- Category preferences

---

## 🔧 Technical Architecture

### Tech Stack

```
Frontend:
- React 18.3.1
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Vite build tool

Routing:
- React Router v7
- Client-side routing
- Protected routes

State Management:
- React hooks (useState, useEffect)
- Context API (future)
- Local state per component

Styling:
- Tailwind utility classes
- Custom theme variables
- RTL support built-in
- Responsive design

Animations:
- Motion (Framer Motion)
- CSS transitions
- Skeleton loaders

Icons:
- Lucide React
- SVG icons
- Consistent design system
```

### Key Components

```
Layout Components:
- Layout (main wrapper)
- Header (navigation)
- DesktopSidebar (left sidebar)
- BottomNav (mobile navigation)
- FloatingActionButton (FAB)

Feature Components:
- QuestionCard
- VoteButtons
- ReputationBadge
- ExpertCard
- TrendingTopics
- DailyChallenge
- StatsBanner

UI Components (shadcn/ui):
- Card, Button, Input
- Dialog, Tabs, Badge
- Avatar, Separator
- Accordion, Select
- Toast notifications
```

### Responsive Design

```
Breakpoints:
- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

Mobile-First Approach:
- Base styles for mobile
- Progressive enhancement
- Touch-friendly targets
- Optimized for 360px viewport

RTL Support:
- dir="rtl" on html
- lang="ar"
- Flexbox with row-reverse
- Proper icon flipping
```

### Navigation Structure

```
Public Routes:
/auth/login          → Login page
/auth/register       → Registration page

Protected Routes:
/                    → Home feed
/search              → Search & filters
/questions/new       → Ask question
/questions/:id       → Question detail
/profile/:username   → User profile
/notifications       → Notifications
/leaderboard         → Leaderboards
/spaces              → Communities
/settings            → User settings
/help                → Help center
/admin               → Admin panel (admin only)

Error Routes:
/*                   → 404 Not Found
```

---

## 📱 Mobile Experience

### Mobile Optimizations

```
Bottom Navigation:
- Home
- Search
- Ask (center, highlighted)
- Notifications
- Profile

Floating Action Button:
- Quick access to "Ask Question"
- Fixed bottom-right position
- Animate on scroll

Touch Interactions:
- Large tap targets (44px min)
- Swipe gestures
- Pull-to-refresh
- Haptic feedback

Performance:
- Lazy loading images
- Virtual scrolling for lists
- Code splitting by route
- Optimized bundle size
```

### Mobile-Specific Features

```
- Responsive images
- Adaptive layouts
- Touch-optimized forms
- Mobile keyboard handling
- Native-like transitions
- Offline support (future)
```

---

## 🎨 Design System

### Colors

```css
Primary: #2563EB (Indigo)
Secondary: #0D9488 (Teal)
Accent: Purple/Amber gradients
Success: Green
Warning: Orange
Error: Red
Muted: Gray tones
```

### Typography

```css
Font Family:
- Primary: IBM Plex Sans Arabic
- Secondary: IBM Plex Sans
- Monospace: IBM Plex Mono (code)

Font Sizes:
- xs: 0.75rem
- sm: 0.875rem
- base: 1rem
- lg: 1.125rem
- xl: 1.25rem
- 2xl: 1.5rem
- 3xl: 1.875rem
```

### Spacing

```css
- Consistent 4px grid system
- Gap utilities: gap-1 to gap-12
- Padding: p-1 to p-24
- Margin: m-1 to m-24
- Rounded corners: rounded-lg, rounded-xl, rounded-2xl
```

---

## 🚀 Getting Started (For Developers)

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server (already running in Make environment)
# Preview is available through Figma Make
```

### Project Structure

```
src/
├── app/
│   ├── components/       # Reusable components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── question-card.tsx
│   │   ├── vote-buttons.tsx
│   │   └── ...
│   ├── pages/           # Route pages
│   │   ├── home.tsx
│   │   ├── question-detail.tsx
│   │   ├── profile.tsx
│   │   └── ...
│   ├── App.tsx          # Root component
│   └── routes.tsx       # Route configuration
├── styles/
│   ├── theme.css        # Theme variables
│   └── fonts.css        # Font imports
└── imports/             # Assets (images, SVGs)
```

### Development Guidelines

```
1. Component Structure:
   - Functional components with hooks
   - TypeScript interfaces for props
   - Export named components

2. Styling:
   - Use Tailwind utilities
   - Follow RTL best practices
   - Maintain consistent spacing

3. State Management:
   - Local state for UI
   - Props for data flow
   - Context for global state

4. Accessibility:
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation
   - Screen reader support
```

---

## 📊 Testing the MVP

### Test Scenarios

**User Registration & Login:**
- [ ] Create new account with valid data
- [ ] Complete onboarding with interests
- [ ] Login with credentials
- [ ] Password validation works

**Question & Answer:**
- [ ] Post a new question with tags
- [ ] View question detail page
- [ ] Post an answer
- [ ] Edit your question/answer

**Voting System:**
- [ ] Upvote a question
- [ ] Downvote an answer
- [ ] Change vote
- [ ] Toast notification appears

**Profile & Reputation:**
- [ ] View own profile
- [ ] View other user profiles
- [ ] Check reputation calculations
- [ ] Verify badges display

**Navigation:**
- [ ] All navigation links work
- [ ] Mobile bottom nav functional
- [ ] FAB button opens new question
- [ ] Breadcrumbs accurate

**Search & Discovery:**
- [ ] Search by keyword
- [ ] Filter by tags
- [ ] Browse spaces
- [ ] View leaderboard

**Settings:**
- [ ] Update profile information
- [ ] Change notification preferences
- [ ] Modify privacy settings
- [ ] Theme selection works

**Responsive Design:**
- [ ] Test on mobile (360px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1200px+)
- [ ] RTL layout correct

---

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] Real-time chat/messaging
- [ ] Video/audio content support
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Mobile apps (iOS/Android)
- [ ] Gamification system expansion
- [ ] AI-powered recommendations
- [ ] Multi-language support

### Backend Integration
- [ ] Supabase authentication
- [ ] PostgreSQL database
- [ ] Real-time subscriptions
- [ ] File storage for images
- [ ] Email service integration
- [ ] Search indexing (Algolia/Meilisearch)

---

## 📞 Support & Help

**For Users:**
- Visit `/help` for comprehensive FAQ
- Browse help center categories
- Contact support through platform
- Community guidelines in each Space

**For Developers:**
- Check `README.md` for setup instructions
- Review component documentation
- Follow contribution guidelines
- Join developer community

---

## 📝 License & Credits

**Khapeer Platform**
- Built with React + TypeScript + Tailwind CSS
- UI Components: shadcn/ui
- Icons: Lucide React
- Fonts: IBM Plex Sans Arabic, IBM Plex Sans
- Animations: Motion (Framer Motion)

**Design Principles:**
- RTL-first design
- Mobile-first responsive
- Accessibility-focused
- Performance-optimized
- User-centric experience

---

**Version:** 1.0.0 (MVP)
**Last Updated:** May 2026
**Status:** Ready for Testing ✅
