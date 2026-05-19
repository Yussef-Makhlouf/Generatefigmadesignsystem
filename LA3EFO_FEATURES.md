# لاعّفو (La3efo) - Arabic Q&A Platform

## 🎯 Platform Overview

La3efo is a comprehensive, RTL-first Arabic Q&A community platform designed for mobile-first experiences with full desktop support. The name "لاعّفو" means "Engage/Activate" in Arabic, reflecting the platform's mission to activate community knowledge sharing.

## 🎨 Design System

### Visual Identity
- **Primary Color**: #2563EB (Indigo 600) - Buttons, Links, Active States
- **Secondary Color**: #0D9488 (Teal 600) - Verification Badges, Success States
- **Typography**: Tajawal font family (Google Fonts) with fallbacks
- **Direction**: Full RTL (Right-to-Left) support
- **Breakpoints**: 
  - Mobile: 360px (standard)
  - Tablet: 768px
  - Desktop: 1200px

### Design Tokens
- Background: #F9FAFB (Page), #FFFFFF (Cards)
- Text: #111827 (Primary), #6B7280 (Secondary), #9CA3AF (Placeholder)
- Semantic Colors:
  - Success: #10B981
  - Warning: #F59E0B
  - Error: #EF4444
  - Info: #3B82F6

## 📱 Screen Flows & Pages

### 1. Home Feed (`/`)
- **Features**:
  - Question cards with voting, answers count, tags, and location
  - Filter tabs: Recent, Popular, Unanswered
  - Right sidebar (desktop): Top questions today, active contributors
  - Left sidebar (desktop): Quick links, categories, user stats
  - Mobile: Bottom navigation + floating action button

### 2. Authentication (`/auth/login`, `/auth/register`)
- **Login Features**:
  - Email/Password authentication
  - Forgot password link
  - Social login placeholders (Google/Apple - Phase 2)
  
- **Register Features**:
  - One-step onboarding modal
  - City selection dropdown
  - Interest chips selection (3-5 required)
  - Progress indicator
  - Skip option available

### 3. New Question Wizard (`/questions/new`)
- **4-Step Creation Process**:
  1. **Step 1**: Title (15-150 chars) + Description (20-3000 chars)
  2. **Step 2**: Category selection, Tags (2-5), Location (optional)
  3. **Step 3**: Image upload (drag & drop, ≤5MB, JPG/PNG/WebP)
  4. **Step 4**: Preview with edit/publish options
- Auto-save draft indicator
- Character counters
- Navigation breadcrumbs

### 4. Question Detail (`/questions/:id`)
- **Features**:
  - Full question display with voting
  - Answer section with sorting options
  - Verification badges (Photo/Location verified)
  - Comment threads (flat structure, 10-500 chars)
  - Sticky bottom bar (mobile): "Write Answer" CTA
  - Desktop: Two-column layout
  - Related questions sidebar

### 5. Search (`/search`)
- **Features**:
  - Autocomplete dropdown (Questions, Tags, Users)
  - Advanced filters:
    - Category
    - Location
    - Verified answers only
    - Unanswered questions
    - Sort by: Newest, Most Votes, Unanswered
  - Mobile: Full-screen overlay + horizontal filter chips
  - Desktop: Left panel filters
  - Empty state with suggestions

### 6. Profile (`/profile/:username`)
- **Features**:
  - Avatar, name, reputation badge, bio
  - Stats row: Questions, Answers, Upvotes, Followers
  - Tabs: My Questions, My Answers, Saved, Activity
  - Edit profile button (owner only)
  - Follow button (for other users)
  - Recent activity timeline

### 7. Notifications (`/notifications`)
- **Features**:
  - Grouped by: Today, This Week, Earlier
  - Notification types: Answers, Votes, Comments, Follows
  - Unread indicators (blue dot)
  - Mark as read on click
  - Mark all as read action
  - Swipe actions (mobile)
  - Empty state illustration

### 8. Admin Dashboard (`/admin`)
- **Role-Guarded Features**:
  - Stats cards: Users, Questions, Answers, Reports
  - Trend indicators with arrows
  - Users management table:
    - Search and filter by role/status
    - Activate/Deactivate actions
  - Content moderation queue:
    - Approve/Reject/Flag actions
    - Report reasons and timestamps
  - Settings panel:
    - Manage categories
    - Reputation point rules
    - System toggles

### 9. 404 Not Found (`/*`)
- Gradient "404" text
- Helpful navigation suggestions
- Quick links section
- Return home and search buttons

## 🧩 Component Library

### Core Components

1. **QuestionCard**
   - Vote buttons with animation
   - Title, description, tags
   - Author info with avatar and reputation
   - Actions: Answer count, Bookmark, Share
   - Location indicator
   - Hover lift effect

2. **VoteButtons**
   - Up/Down vote with animated count
   - Color pulse on vote
   - Active state indicators
   - Click/tap animations

3. **ReputationBadge**
   - Dynamic tier colors:
     - Beginner (< 100): Gray
     - Active (100-499): Blue
     - Distinguished (500-999): Purple
     - Expert (1000-4999): Teal
     - Legend (5000+): Amber
   - Tooltip with tier name

4. **SearchBar**
   - Real-time autocomplete
   - Keyboard navigation
   - Results grouped by type
   - Click outside to close

5. **BottomNav** (Mobile)
   - 4 items: Home, Search, Notifications, Profile
   - Active state highlighting
   - Icon + label

6. **DesktopSidebar**
   - Quick links with icons
   - Category list with counts
   - User statistics card
   - Sticky positioning

7. **Header**
   - Logo with gradient
   - Search bar (desktop)
   - New question button
   - User avatar menu

8. **EmptyState**
   - Reusable component
   - Icon, title, description
   - Optional CTA button

9. **FloatingActionButton**
   - Mobile-only
   - Quick access to new question
   - Shadow elevation

10. **QuestionSkeleton**
    - Loading state placeholder
    - Matches QuestionCard layout
    - Shimmer animation

## ♿ Accessibility Features

- **RTL Support**: Full right-to-left layout
- **Keyboard Navigation**: Tab order and focus indicators
- **ARIA Labels**: Screen reader support
- **Color Contrast**: WCAG AA compliance (≥ 4.5:1)
- **Touch Targets**: Minimum 44x44px
- **Motion**: `prefers-reduced-motion` support
- **Focus Visible**: Custom ring styling

## 🎭 Interactions & Animations

- **Hover Effects**: Card lift, button color shift
- **Tap/Click**: Scale down (0.98), ripple effect
- **Voting**: Animated count, color pulse
- **Bookmark**: Fill animation, confetti on first save
- **Loading**: Skeleton screens with shimmer
- **Page Transitions**: Fade-in animation
- **Empty States**: Bounce animation on CTA
- **Error States**: Shake animation on invalid fields

## 🔧 Technical Stack

- **Framework**: React 18.3.1
- **Router**: React Router 7.13.0 (Data mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **Forms**: React Hook Form
- **Build Tool**: Vite

## 📐 Layout Structure

```
App
├── Header (Sticky)
│   ├── Logo
│   ├── SearchBar (Desktop)
│   └── User Avatar
├── Main Content
│   ├── DesktopSidebar (Left)
│   │   ├── Quick Links
│   │   ├── Categories
│   │   └── User Stats
│   └── Page Content (Router Outlet)
├── BottomNav (Mobile, Fixed)
└── FloatingActionButton (Mobile)
```

## 🎯 Responsive Behavior

### Mobile (< 768px)
- Bottom navigation visible
- Floating action button visible
- Single column layout
- Full-width cards
- Horizontal scroll for filters
- Sidebar hidden

### Tablet (768px - 1200px)
- Bottom navigation hidden
- Left sidebar visible
- Two-column layout
- Right panel hidden

### Desktop (> 1200px)
- Full three-column layout
- All sidebars visible
- Maximum content width: 1200px
- Sticky sidebars

## 🔐 User Roles

1. **User** (Default)
   - Ask questions
   - Write answers
   - Vote and comment
   - Save bookmarks

2. **Moderator**
   - All user permissions
   - Access moderation queue
   - Approve/reject reports

3. **Admin**
   - All moderator permissions
   - Access admin dashboard
   - Manage users and categories
   - Configure system settings

## 📊 Gamification System

### Reputation Points
- Ask question: +5 points
- Write answer: +10 points
- Upvote received: +15 points
- Answer accepted: +25 points

### Tiers
- مبتدئ (Beginner): 0-99
- نشط (Active): 100-499
- متميز (Distinguished): 500-999
- خبير (Expert): 1000-4999
- أسطورة (Legend): 5000+

## 🌍 Localization

- Primary Language: Arabic (ar-SA)
- Direction: RTL
- Number Format: Arabic numerals (١٢٣٤)
- Date Format: Relative timestamps in Arabic
- Font: Tajawal with Cairo fallback

## 🚀 Performance Optimizations

- Lazy loading for images
- Code splitting by route
- Skeleton screens for loading states
- Debounced search inputs
- Optimized re-renders with React hooks
- CSS animations (GPU accelerated)

## 📝 Content Validation

### Question
- Title: 15-150 characters
- Description: 20-3000 characters
- Tags: 2-5 required
- Category: Required
- Location: Optional

### Answer
- Content: 10-5000 characters
- Attachments: Optional (images)

### Comment
- Content: 10-500 characters

## 🎨 Color Semantics

- **Primary (Indigo)**: Actions, links, active states
- **Secondary (Teal)**: Success, verification
- **Green**: Success messages, active status
- **Red**: Errors, destructive actions, reports
- **Blue**: Information, notifications
- **Amber**: Warnings, premium features
- **Purple**: Featured content, special badges

---

Built with ❤️ for the Arabic-speaking community
