# Supabase Backend Integration Guide

## Overview
The backend is fully ready. This guide explains how to integrate the frontend with the real Supabase backend.

## Services Created

### `/src/lib/services/`
- `questions.service.ts` - Questions CRUD + attachments + bookmarks
- `answers.service.ts` - Answers CRUD + attachments + comments
- `votes.service.ts` - Voting system (up/down votes)
- `reviews.service.ts` - Entity reviews + rating calculation
- `notifications.service.ts` - User notifications
- `auth.service.ts` - Authentication (sign up, sign in, sign out)
- `spaces.service.ts` - Community spaces (Coming Soon)
- `users.service.ts` - User profiles + leaderboard

### `/src/lib/hooks/`
- `use-questions.ts` - React Query hooks for questions
- `use-answers.ts` - React Query hooks for answers
- `use-auth.ts` - React Query hooks for authentication
- `use-realtime.ts` - Real-time subscriptions utility

## Database Schema

Run `supabase/schema.sql` in Supabase SQL Editor to create:
- `profiles` - Users with reputation system
- `questions` - Questions with counters
- `question_attachments` - Images, links, locations
- `answers` - Answers with verification
- `answer_attachments` - Proof attachments
- `comments` - Comments on answers
- `votes` - Voting system
- `bookmarks` - Saved questions
- `reviews` - Entity reviews
- `reputation_logs` - Gamification audit trail

## Storage Buckets

Create in Supabase Dashboard or run `supabase/storage.sql`:
1. `question-images` (public, 10MB)
2. `answer-images` (public, 10MB)
3. `review-images` (public, 10MB)
4. `avatars` (public, 5MB)

## Integration Steps

### 1. Use feed hooks in pages
Replace any legacy context usage with React Query hooks:

```tsx
// Feed data
const { data: questions, isLoading } = useFeedQuestions();

// Auth
const { currentUser } = useAuthSession();

// Votes & bookmarks
const { bookmarkedIds, voteQuestion, toggleBookmark } = useQuestionInteractions();
```

### 2. Update form submissions
In `new-question.tsx` and `question-detail.tsx`:
- Use `useAppActions().addQuestion()` or `useCreateQuestion()` mutation
- Use `useAppActions().addAnswer()` or `useCreateAnswer()` mutation

### 3. Add real-time subscriptions
Add to pages that need live updates:
```tsx
useRealtimeQuestions((newQuestion) => {
  queryClient.setQueryData(["questions"], (old: Question[]) => [newQuestion, ...old]);
});
```

### 4. Environment Variables
Copy `.env.production.example` to `.env` and fill in your project values from **Supabase Dashboard → Settings → API**:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
```

Never commit real credentials to git.

## Reputation Engine (Automatic)
The following triggers are already in schema.sql:
- +5 points for asking a question
- +10 points for posting an answer
- +15 points for upvote received
- +150 points for entity verification

All reputation changes are logged in `reputation_logs` table.