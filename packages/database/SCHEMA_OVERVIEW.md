# Database Schema Overview - The Ember Society

## Schema Statistics

- **14 Models** total
- **7 Enums** for type safety
- **60+ Indexed fields** for query optimization
- **Cascading deletes** configured for data integrity

---

## Core Entities

### 1. User & Authentication
- **User** - Core user profile with OAuth support (Google, Facebook)
- **Follow** - User follow/follower relationships
- **Block** - User blocking for privacy

**Key Features:**
- Email/password + OAuth authentication
- Privacy settings (private accounts)
- Account status (verified, suspended)
- Profile customization (avatar, bio, location)

---

### 2. Clubs & Communities
- **Club** - Community groups for enthusiasts
- **ClubMember** - Membership with roles (Owner, Admin, Moderator, Member)
- **ClubInvite** - Email-based club invitations

**Key Features:**
- Public/private clubs
- Role-based permissions
- Slug-based URLs
- Member count tracking
- Invitation system with expiration

---

### 3. Content & Engagement
- **Post** - User/club posts (text, image, video, link)
- **Comment** - Threaded comments on posts
- **Reaction** - Emoji reactions (Like, Love, Fire, Smoke, Cheers)
- **PostMention** - User @mentions in posts

**Key Features:**
- Multiple post types with media support
- Threaded comment replies
- Reaction counts denormalized for performance
- User tagging system

---

### 4. Events & Calendar
- **Event** - Club events with date/time/location
- **EventRSVP** - User responses (Going, Maybe, Not Going)

**Key Features:**
- Public/private events
- Club association
- RSVP tracking
- Time-based queries optimized

---

### 5. Direct Messaging
- **Message** - One-to-one private messaging

**Key Features:**
- Read/unread status
- Indexed for conversation retrieval
- Real-time support ready (Socket.io)

---

### 6. Notifications
- **Notification** - System notifications for user actions

**Notification Types:**
- New follower
- New club post
- New comment/reply
- Post mention
- Event reminders (24h/1h)
- Club invites
- New messages

**Key Features:**
- Read/unread tracking
- Optional link URLs for actions
- Indexed for fast retrieval

---

### 7. Reviews & Ratings
- **Review** - Product reviews with ratings

**Categories:**
- Pipe Tobacco
- Cigars
- Pipes
- Accessories

**Key Features:**
- 1-5 star ratings
- Product name + brand tracking
- Optional club association
- Indexed by category and rating

---

### 8. Moderation
- **Report** - User reports for inappropriate content

**Report Types:**
- Spam
- Harassment
- Inappropriate content
- Misinformation
- Other

**Key Features:**
- Status workflow (Pending → Reviewed → Resolved/Dismissed)
- Can report users, posts, or comments
- Admin moderation queue

---

## Data Relationships

### User Relationships
```
User 1:N Post (author)
User 1:N Comment (author)
User 1:N Reaction
User M:N Club (via ClubMember)
User M:N User (via Follow - followers/following)
User M:N User (via Block)
User 1:N Message (sender/receiver)
User 1:N Notification
User 1:N Review
User 1:N EventRSVP
User 1:N Report (reporter/reported)
```

### Club Relationships
```
Club 1:1 User (creator)
Club 1:N ClubMember
Club 1:N Post
Club 1:N Event
Club 1:N ClubInvite
```

### Post Relationships
```
Post 1:1 User (author)
Post 1:1 Club (optional)
Post 1:N Comment
Post 1:N Reaction
Post 1:N PostMention
```

---

## Performance Optimizations

### Indexes
All foreign keys are indexed for join performance:
- User lookups: `email`, `username`, `createdAt`
- Feed queries: `Post.createdAt`, `Post.clubId`, `Post.authorId`
- Club queries: `Club.slug`, `Club.isPrivate`
- Event queries: `Event.startTime`, `Event.clubId`
- Message queries: `Message.senderId`, `Message.receiverId`, `Message.createdAt`
- Notification queries: `Notification.userId`, `Notification.isRead`

### Denormalization
- `Club.memberCount` - Cached for performance
- `Post.reactionCount` - Cached to avoid expensive aggregations
- `Post.commentCount` - Cached to avoid expensive aggregations

### Cascade Deletes
All relations use `onDelete: Cascade` to maintain referential integrity:
- Deleting a user removes all their content
- Deleting a club removes all members, posts, events
- Deleting a post removes all comments and reactions

---

## Migration Strategy

### Initial Migration (Week 1-2)
1. Run `npm run prisma:generate` to create Prisma Client
2. Run `npm run prisma:migrate` to create database tables
3. Seed initial data (admin user, sample clubs)

### Future Migrations
- Use `prisma migrate dev` for development
- Use `prisma migrate deploy` for production
- Always review generated SQL before applying

---

## Next Steps (Phase 2)

1. **Implement Authentication** (Task 2.1-2.2)
   - User registration/login endpoints
   - JWT token generation
   - OAuth integration (Google, Facebook)

2. **Build User Services** (Task 2.3-2.5)
   - Profile management CRUD
   - Follow/unfollow logic
   - Block user functionality
   - Activity feed algorithm

3. **Test Schema**
   - Write seed data scripts
   - Test all relationships
   - Validate indexes with EXPLAIN ANALYZE
