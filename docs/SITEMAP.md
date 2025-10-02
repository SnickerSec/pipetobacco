# The Ember Society - Sitemap & Page Structure

## Public Pages (Unauthenticated)

### `/`
**Landing Page**
- Hero section with branding
- Feature highlights (Clubs, Events, Reviews)
- Call-to-action (Sign Up / Login)
- Preview of public clubs/content

### `/login`
**Login Page**
- Email/password form
- "Forgot password" link
- OAuth buttons (Google, Facebook)
- Link to register

### `/register`
**Registration Page**
- Sign-up form (email, username, password, display name)
- OAuth registration options
- Terms of service acceptance
- Link back to login

### `/forgot-password`
**Password Reset**
- Email input for reset link
- Success/error messaging

### `/reset-password/:token`
**Password Reset Confirmation**
- New password form
- Token validation

### `/clubs/public`
**Browse Public Clubs**
- Search/filter clubs
- Club cards with preview
- Join/request access buttons

### `/clubs/:slug` (public clubs only)
**Public Club Page** (limited view)
- Club info and member count
- Recent posts preview
- "Join to see more" CTA

---

## Authenticated Pages

### `/feed`
**Home Activity Feed** (Default after login)
- Personalized feed from followed users & joined clubs
- Create post composer
- Feed filters (All / Following / Clubs)
- Infinite scroll

### `/explore`
**Explore Page**
- Trending posts
- Suggested clubs
- Suggested users to follow
- Popular reviews

---

## User Pages

### `/profile/:username`
**User Profile Page**
- Profile header (avatar, display name, bio, location)
- Follow/Unfollow button
- Edit profile button (own profile only)
- Tabs:
  - Posts
  - Reviews
  - Clubs
  - About

### `/profile/:username/following`
**Following List**
- List of users being followed
- Follow/unfollow actions

### `/profile/:username/followers`
**Followers List**
- List of followers
- Follow back actions

### `/settings`
**User Settings**
- Tabs/sections:
  - Profile settings (avatar, bio, location)
  - Account settings (email, password, username)
  - Privacy settings (private account toggle)
  - Notification preferences
  - Connected accounts (OAuth)
  - Blocked users
  - Delete account

---

## Club Pages

### `/clubs`
**Browse All Clubs** (Authenticated)
- Search bar
- Filters (Public/Private, My Clubs, All)
- Grid/list view toggle
- Create new club button

### `/clubs/new`
**Create Club**
- Form: name, description, avatar, cover
- Privacy toggle (public/private)
- Submit/cancel

### `/clubs/:slug`
**Club Detail Page**
- Club header (cover, avatar, name, description)
- Member count
- Join/leave button (or request if private)
- Tabs:
  - **Feed** - Club posts
  - **Events** - Upcoming/past events
  - **Members** - Member list with roles
  - **About** - Full description, rules

### `/clubs/:slug/manage` (Admins only)
**Club Management**
- Tabs:
  - Settings (edit club info, privacy)
  - Members (manage roles, remove members)
  - Invitations (send invites, view pending)
  - Moderation (reported content)

### `/clubs/:slug/invite`
**Club Invite Page** (from email link)
- Club preview
- Accept/decline invitation

---

## Post & Content Pages

### `/posts/:postId`
**Single Post Page**
- Full post with media
- All comments (threaded)
- Reactions
- Share options

### `/posts/new` (or modal)
**Create Post**
- Text editor
- Media upload (image/video)
- Post to: Profile or Club selector
- Submit/cancel

---

## Event Pages

### `/events`
**Event Calendar (All)**
- Calendar view (month/week/day)
- Upcoming events from joined clubs
- Filter by club
- RSVP status indicators

### `/events/:eventId`
**Event Detail Page**
- Event info (title, description, time, location)
- RSVP button (Going/Maybe/Not Going)
- RSVP list (who's going)
- Comments/discussion
- Add to calendar button

### `/clubs/:slug/events/new` (Club admins)
**Create Event**
- Form: title, description, location, date/time
- Privacy toggle (public/private)
- Submit/cancel

---

## Messaging Pages

### `/messages`
**Direct Messages Inbox**
- List of conversations (left sidebar)
- Selected conversation (right panel)
- Message composer
- Real-time updates

### `/messages/:userId`
**Direct Conversation**
- Message thread with specific user
- Message composer
- User profile quick view

---

## Notification Pages

### `/notifications`
**Notifications Center**
- List of all notifications
- Mark as read
- Filter by type
- Clear all

---

## Review Pages

### `/reviews`
**Browse Reviews**
- Filter by category (Pipe Tobacco, Cigars, Pipes, Accessories)
- Sort by rating, date
- Search products

### `/reviews/new`
**Write Review**
- Form: product name, brand, category
- Star rating (1-5)
- Title and content
- Optional: post to club
- Submit/cancel

### `/reviews/:reviewId`
**Review Detail Page**
- Full review
- Author info
- Comments
- Related reviews

---

## Admin/Moderation Pages (Future)

### `/admin`
**Admin Dashboard**
- User management
- Club management
- Report queue
- Site analytics

### `/admin/reports`
**Moderation Queue**
- Pending reports
- Review/resolve actions

---

## Error Pages

### `/404`
**Page Not Found**
- Friendly message
- Navigation back to feed/home

### `/403`
**Forbidden**
- "You don't have permission to view this"
- Navigation back

### `/500`
**Server Error**
- Error message
- Try again / contact support

---

## Component Hierarchy

### Global Components (Present on all authenticated pages)
- **Navigation Bar**
  - Logo
  - Search bar
  - Icons: Feed, Clubs, Events, Messages, Notifications
  - User avatar dropdown (Profile, Settings, Logout)
- **Mobile Navigation** (bottom tab bar)
  - Feed, Explore, Create, Notifications, Profile

### Shared Components
- **Post Card** (used in feeds)
- **Comment Thread**
- **User Card** (avatar, name, follow button)
- **Club Card** (avatar, name, member count, join button)
- **Event Card** (date, title, RSVP status)
- **Notification Item**
- **Message Preview**
- **Review Card**

---

## Navigation Flow

```
Landing (/)
  → Login (/login) → Feed (/feed)
  → Register (/register) → Feed (/feed)

Feed (/feed)
  → User Profile (/profile/:username)
  → Club (/clubs/:slug)
  → Post (/posts/:postId)
  → Messages (/messages)
  → Notifications (/notifications)
  → Settings (/settings)

Clubs (/clubs)
  → Browse (/clubs)
  → Create (/clubs/new)
  → Detail (/clubs/:slug)
  → Manage (/clubs/:slug/manage)

Events (/events)
  → Calendar (/events)
  → Detail (/events/:eventId)
  → Create (/clubs/:slug/events/new)
```

---

## Mobile-First Considerations

### Mobile Adaptations
- Bottom tab navigation (replace top nav icons)
- Collapsible search
- Swipe gestures for messages/notifications
- Full-screen modals for create actions
- Simplified club/profile headers

### Responsive Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (sidebar + main)
- **Desktop**: > 1024px (3-column layout: sidebar, feed, widgets)

---

## Page Priority for Development

### Phase 1 (MVP - Weeks 3-4)
1. `/login` & `/register` - Authentication
2. `/feed` - Home feed
3. `/profile/:username` - User profiles

### Phase 2 (Core Features - Weeks 5-6)
4. `/clubs` & `/clubs/:slug` - Club browsing/viewing
5. `/clubs/new` - Club creation
6. `/posts/:postId` - Single post view
7. `/messages` - Direct messaging

### Phase 3 (Advanced - Weeks 7-8)
8. `/events` & `/events/:eventId` - Event calendar
9. `/reviews` - Review system
10. `/settings` - User settings
11. `/notifications` - Notification center

### Phase 4 (Polish - Weeks 9-10)
12. `/explore` - Discovery features
13. Error pages (404, 403, 500)
14. Admin/moderation tools
