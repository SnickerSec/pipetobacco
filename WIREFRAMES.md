# The Ember Society - Wireframe Documentation

## Overview

This document provides low-fidelity wireframe descriptions for all major pages. The actual wireframes have been implemented as React components with placeholder content to demonstrate layout and UX flow.

---

## Design Principles

### Mobile-First
- All pages designed for mobile screens first, then scaled up
- Bottom navigation on mobile, top navigation on desktop
- Touch-friendly tap targets (minimum 44x44px)
- Collapsible/expandable sections for complex content

### Warm & Refined Aesthetic
- **Primary Color**: Ember (#ed710a - warm orange)
- **Secondary Color**: Tobacco (#a4825e - warm brown)
- **Font**: Inter (clean, modern sans-serif)
- **Spacing**: Generous padding and whitespace
- **Cards**: Rounded corners, subtle shadows

### Consistent Patterns
- User avatars: Circular
- Action buttons: Rounded rectangles with ember-600 background
- Cards: White background, rounded-lg, shadow
- Post engagement: Emoji reactions (🔥 ❤️ 💬 🔗)

---

## Page Layouts

### 1. Landing Page (`/`)

**Layout**: Public layout with simple header

**Sections**:
1. **Hero Section**
   - Large headline: "Welcome to The Ember Society"
   - Subtitle: Brief description
   - CTA buttons: "Join the Community" + "Sign In"
   - Gradient background (ember to tobacco)

2. **Features Grid** (3x2 on desktop, 1 column on mobile)
   - 6 feature cards with emoji icons
   - Short descriptions
   - Icons: 👥 📅 ⭐ 💬 📱 🔔

3. **Bottom CTA Section**
   - Ember background
   - "Ready to Join?" headline
   - Sign-up button

---

### 2. Login Page (`/login`)

**Layout**: Centered card on public layout

**Components**:
- Email input
- Password input
- Remember me checkbox
- Forgot password link
- Submit button
- Divider: "Or continue with"
- OAuth buttons: Google, Facebook (side by side)
- Sign-up link at bottom

---

### 3. Register Page (`/register`)

**Layout**: Centered card on public layout

**Components**:
- Email input
- Username input (with validation hint)
- Display name input
- Password input (with hint: min 8 chars)
- Confirm password input
- Terms of service checkbox
- Submit button
- OAuth buttons: Google, Facebook
- Login link at bottom

---

### 4. Feed Page (`/feed`)

**Layout**: Authenticated layout, max-w-2xl centered

**Components**:

1. **Create Post Card**
   - Avatar + textarea
   - Media buttons: 📷 Photo, 🎥 Video
   - Post button (right-aligned)

2. **Feed Filters** (horizontal tabs)
   - All (active)
   - Following
   - Clubs

3. **Post Cards** (repeating)
   - User avatar + name + timestamp + club badge
   - Post content (text)
   - Optional: Media (image placeholder)
   - Engagement bar: Reactions (count) | Comments (count) | Share
   - Border-top separator

---

### 5. Profile Page (`/profile/:username`)

**Layout**: Authenticated layout, max-w-4xl

**Components**:

1. **Profile Header Card**
   - Cover photo (gradient placeholder)
   - Avatar (overlapping cover, -mt-12)
   - Display name + username
   - Bio text
   - Stats: Posts | Followers | Following | Clubs
   - Actions: Edit Profile + Share buttons

2. **Tabs Navigation**
   - Posts (active) | Reviews | Clubs | About

3. **Posts Grid/Feed**
   - Same post card design as Feed page

---

### 6. Clubs Page (`/clubs`)

**Layout**: Authenticated layout, full width

**Components**:

1. **Header**
   - Page title + description
   - "Create Club" button (right-aligned)

2. **Filter Bar Card**
   - Search input (flex-1)
   - Filter buttons: All (active) | My Clubs | Public

3. **Clubs Grid** (3 columns desktop, 2 tablet, 1 mobile)
   - Club cards with:
     - Cover photo gradient
     - Avatar (overlapping)
     - Club name
     - Description (2 lines clamped)
     - Member count
     - Join/Request button

---

### 7. Club Detail Page (`/clubs/:slug`)

**Layout**: Authenticated layout, max-w-4xl

**Components**:

1. **Club Header Card**
   - Cover photo
   - Avatar (overlapping)
   - Club name + slug
   - Description
   - Stats: Members | Posts | Events
   - Actions: Joined button + Invite button

2. **Tabs Navigation**
   - Feed (active) | Events | Members | About

3. **Create Post Card** (for members)
   - Simplified version of feed create post

4. **Club Feed**
   - Pinned post (border-l-4 border-ember-600, badge)
   - Regular posts

---

### 8. Events Page (`/events`)

**Layout**: Authenticated layout, full width

**Components**:

1. **Header**
   - Page title + description

2. **Filter Tabs**
   - Upcoming (active) | My Events | Past

3. **Event Cards List** (vertical)
   - Date badge (left side, colored box with day/month)
   - Event info (flex-1):
     - Title (bold)
     - Club + Time
     - Description
     - Location + Attendee count
     - RSVP button (right-aligned)

---

### 9. Messages Page (`/messages`)

**Layout**: Authenticated layout, full-height card

**Components**:

**Two-Panel Layout** (desktop):

1. **Left Panel: Conversations List** (w-80, scrollable)
   - Search input
   - Conversation items:
     - Avatar (with online indicator or unread badge)
     - Name + timestamp
     - Message preview (truncated)
     - Highlight: Active (border-l-4 ember) | Unread (bg-blue-50 + badge)

2. **Right Panel: Chat Area** (flex-1)
   - Header: Avatar + name + online status
   - Messages (scrollable):
     - Received: Left-aligned, tobacco-100 background
     - Sent: Right-aligned, ember-600 background, white text
     - Timestamps below each message
   - Input: Text field + Send button

**Mobile**: Show only conversations list, tapping opens full-screen chat

---

### 10. Notifications Page (`/notifications`)

**Layout**: Authenticated layout, max-w-2xl

**Components**:

1. **Header**
   - Page title
   - "Mark all as read" button (right-aligned)

2. **Notifications List Card** (divide-y)
   - Notification items:
     - Avatar/icon (left)
     - Content (text with bold names)
     - Optional: Preview text
     - Optional: Action buttons (Accept/Decline for invites)
     - Timestamp (bottom)
     - Indicators: Unread (bg-blue-50 + dot), Important (bg-yellow-50)

---

## Shared Components

### Navigation Bar (Desktop)
- Logo (left)
- Search bar (center, max-w-md)
- Nav icons: Feed | Clubs | Events | Messages | Notifications
- User avatar dropdown (right)

### Mobile Bottom Navigation
- 5 icons: Feed | Clubs | Events | Notifications | Profile
- Active state: ember-600 color
- Fixed bottom position

### Post Card
- User header: Avatar + Name + Timestamp + Club badge
- Content: Text (pre-wrap)
- Media: Image/video placeholder
- Engagement bar: Reaction emoji + count | Comments | Share
- Hover: shadow-lg transition

### Club Card
- Cover gradient
- Avatar (overlapping, -mt-16, border-4 white)
- Name
- Description (line-clamp-2)
- Stats + CTA button

### Event Card
- Date badge (colored box)
- Title + subtitle (club + time)
- Description
- Meta: Location + attendees
- RSVP button

---

## Responsive Breakpoints

```css
/* Mobile */
< 768px: Single column, bottom nav, simplified headers

/* Tablet */
768px - 1024px: 2 columns for grids, side-by-side layouts

/* Desktop */
> 1024px: 3 columns for grids, full navigation, max-width constraints
```

---

## Interactive States

### Buttons
- Default: ember-600 background
- Hover: ember-700
- Secondary: tobacco-200 background, tobacco-700 text

### Inputs
- Focus: ring-2 ring-ember-500
- Border: tobacco-300

### Cards
- Default: shadow
- Hover: shadow-lg transition

### Links
- Default: ember-600
- Hover: ember-500

---

## Accessibility Considerations

- All buttons have clear labels
- Form inputs have associated labels
- Focus states visible (ring-2)
- Color contrast meets WCAG AA standards
- Semantic HTML (nav, main, header, footer)

---

## Next Steps

### Phase 2: Make Interactive (Week 3-4)
1. Add state management (Zustand)
2. Connect to API endpoints
3. Implement authentication flow
4. Add form validation
5. Add loading states

### Phase 3: Polish (Week 9-10)
1. Add animations (transitions, micro-interactions)
2. Implement skeleton loaders
3. Add error states
4. Optimize images (lazy loading)
5. Add PWA features (service worker, manifest)

---

## Viewing the Wireframes

To view these wireframes locally:

```bash
cd apps/web
npm install
npm run dev
```

Then navigate to:
- `/` - Landing page
- `/login` - Login
- `/register` - Registration
- `/feed` - Feed (requires changing `isAuthenticated` to `true` in App.tsx)
- `/clubs` - Clubs
- `/events` - Events
- `/messages` - Messages
- `/notifications` - Notifications
- `/profile/johndoe` - Profile

---

## Design Files

For high-fidelity designs, consider using:
- Figma (recommended)
- Adobe XD
- Sketch

Export specifications:
- Colors: ember-600 (#ed710a), tobacco-600 (#8b6d4f)
- Font: Inter (Google Fonts)
- Icons: Heroicons (already integrated)
- Spacing: Tailwind default scale (4px base unit)
