# The Ember Society - Component Library

A comprehensive guide to using the design system components.

---

## UI Components (`components/ui/`)

### Button

A flexible button component with multiple variants and states.

**Import:**
```tsx
import { Button } from '@/components/ui';
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'outline' | 'ghost'` - Button style (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `isLoading?: boolean` - Show loading spinner
- All standard `<button>` HTML attributes

**Examples:**
```tsx
// Primary button
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Small outline button
<Button variant="outline" size="sm">Edit</Button>
```

---

### Input

Text input with label, error, and helper text support.

**Import:**
```tsx
import { Input } from '@/components/ui';
```

**Props:**
- `label?: string` - Input label
- `error?: string` - Error message (shows red border)
- `helperText?: string` - Helper text below input
- All standard `<input>` HTML attributes

**Examples:**
```tsx
// Basic input
<Input placeholder="Enter your email" />

// With label
<Input label="Email address" type="email" />

// With error
<Input label="Username" error="Username is required" />

// With helper text
<Input
  label="Password"
  type="password"
  helperText="Minimum 8 characters"
/>
```

---

### Textarea

Multi-line text input with the same features as Input.

**Import:**
```tsx
import { Textarea } from '@/components/ui';
```

**Props:**
- `label?: string`
- `error?: string`
- `helperText?: string`
- All standard `<textarea>` HTML attributes

**Example:**
```tsx
<Textarea
  label="Bio"
  rows={4}
  placeholder="Tell us about yourself..."
  helperText="Maximum 500 characters"
/>
```

---

### Card

Container component for content with optional hover effect.

**Import:**
```tsx
import { Card } from '@/components/ui';
```

**Props:**
- `hover?: boolean` - Enable hover shadow effect (default: false)
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Internal padding (default: 'md')
- All standard `<div>` HTML attributes

**Examples:**
```tsx
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</Card>

// Hoverable card (for clickable items)
<Card hover>
  <a href="/link">Clickable card</a>
</Card>

// No padding (for custom layouts)
<Card padding="none">
  <img src="cover.jpg" />
  <div className="p-6">Content</div>
</Card>
```

---

### Avatar

User avatar with automatic fallback to initials.

**Import:**
```tsx
import { Avatar } from '@/components/ui';
```

**Props:**
- `src?: string` - Image URL
- `alt: string` - Alt text (required)
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Avatar size (default: 'md')
- `fallback?: string` - Custom fallback text (default: first letter of alt)
- All standard `<img>` HTML attributes

**Examples:**
```tsx
// With image
<Avatar src="/avatars/user.jpg" alt="John Doe" />

// Without image (shows initials)
<Avatar alt="John Doe" />

// Large size
<Avatar src="/avatar.jpg" alt="Jane Smith" size="xl" />

// Custom fallback
<Avatar alt="Bot Account" fallback="🤖" />
```

---

### Badge

Small label component for status indicators.

**Import:**
```tsx
import { Badge } from '@/components/ui';
```

**Props:**
- `variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'` - Badge style (default: 'default')
- `size?: 'sm' | 'md'` - Badge size (default: 'md')
- All standard `<span>` HTML attributes

**Examples:**
```tsx
<Badge>Default</Badge>
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
<Badge size="sm">Small</Badge>
```

---

### Skeleton

Loading placeholder component.

**Import:**
```tsx
import { Skeleton } from '@/components/ui';
```

**Props:**
- `variant?: 'text' | 'circular' | 'rectangular'` - Skeleton shape (default: 'text')
- `width?: string | number` - Width (CSS value or px)
- `height?: string | number` - Height (CSS value or px)
- All standard `<div>` HTML attributes

**Examples:**
```tsx
// Text line
<Skeleton />

// Custom width
<Skeleton width="60%" />

// Circular (for avatars)
<Skeleton variant="circular" width={48} height={48} />

// Rectangular (for images)
<Skeleton variant="rectangular" height={200} />
```

---

### Spinner

Loading spinner indicator.

**Import:**
```tsx
import { Spinner } from '@/components/ui';
```

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: 'md')
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<div className="flex justify-center">
  <Spinner size="lg" />
</div>
```

---

## Shared Components (`components/shared/`)

### PostCard

Displays a social media post with engagement actions.

**Import:**
```tsx
import { PostCard } from '@/components/shared';
```

**Props:**
```tsx
interface PostCardProps {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  mediaUrls?: string[];
  club?: {
    name: string;
    slug: string;
  };
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  onReact?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}
```

**Example:**
```tsx
<PostCard
  id="post123"
  author={{
    username: "johndoe",
    displayName: "John Doe",
    avatarUrl: "/avatars/john.jpg"
  }}
  content="Great smoke today! 🔥"
  club={{ name: "Peterson Pipe Club", slug: "peterson" }}
  reactionCount={42}
  commentCount={8}
  createdAt="2 hours ago"
  onReact={() => handleReact("post123")}
  onComment={() => handleComment("post123")}
  onShare={() => handleShare("post123")}
/>
```

---

### UserCard

User profile card with follow/unfollow action.

**Import:**
```tsx
import { UserCard } from '@/components/shared';
```

**Props:**
```tsx
interface UserCardProps {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followerCount?: number;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}
```

**Example:**
```tsx
<UserCard
  username="janedoe"
  displayName="Jane Doe"
  bio="Cigar enthusiast from Miami"
  followerCount={1234}
  isFollowing={false}
  onFollow={() => handleFollow("janedoe")}
/>
```

---

### ClubCard

Club card with join/leave action.

**Import:**
```tsx
import { ClubCard } from '@/components/shared';
```

**Props:**
```tsx
interface ClubCardProps {
  slug: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  memberCount: number;
  isPrivate?: boolean;
  isMember?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onRequest?: () => void;
}
```

**Example:**
```tsx
<ClubCard
  slug="peterson-club"
  name="Peterson Pipe Club"
  description="A community for Peterson enthusiasts"
  memberCount={1200}
  isPrivate={false}
  isMember={false}
  onJoin={() => handleJoin("peterson-club")}
/>
```

---

### EventCard

Event card with RSVP action.

**Import:**
```tsx
import { EventCard } from '@/components/shared';
```

**Props:**
```tsx
interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  club: {
    name: string;
    slug: string;
  };
  attendeeCount: number;
  isPublic?: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  onRSVP?: (status: 'going' | 'maybe' | 'not_going') => void;
}
```

**Example:**
```tsx
<EventCard
  id="event123"
  title="Monthly Pipe Social"
  description="Join us for our monthly gathering"
  startTime={new Date('2025-10-15T14:00:00')}
  location="Portland, OR"
  club={{ name: "Peterson Pipe Club", slug: "peterson" }}
  attendeeCount={23}
  rsvpStatus="going"
  onRSVP={(status) => handleRSVP("event123", status)}
/>
```

---

### EmptyState

Empty state placeholder with optional action.

**Import:**
```tsx
import { EmptyState } from '@/components/shared';
```

**Props:**
```tsx
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Example:**
```tsx
<EmptyState
  icon="📭"
  title="No messages yet"
  description="Start a conversation with other members"
  actionLabel="Find People"
  onAction={() => navigate('/explore')}
/>
```

---

### PostCardSkeleton

Loading skeleton for PostCard.

**Import:**
```tsx
import { PostCardSkeleton } from '@/components/shared';
```

**Example:**
```tsx
{isLoading ? (
  <>
    <PostCardSkeleton />
    <PostCardSkeleton />
    <PostCardSkeleton />
  </>
) : (
  posts.map(post => <PostCard key={post.id} {...post} />)
)}
```

---

### ClubCardSkeleton

Loading skeleton for ClubCard.

**Import:**
```tsx
import { ClubCardSkeleton } from '@/components/shared';
```

**Example:**
```tsx
<div className="grid md:grid-cols-3 gap-6">
  {isLoading ? (
    <>
      <ClubCardSkeleton />
      <ClubCardSkeleton />
      <ClubCardSkeleton />
    </>
  ) : (
    clubs.map(club => <ClubCard key={club.slug} {...club} />)
  )}
</div>
```

---

## Animations

Custom Tailwind animation classes available:

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Slide down
<div className="animate-slide-down">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>

// Pulse (built-in, used by Skeleton)
<div className="animate-pulse">Content</div>
```

---

## Color System

### Ember (Primary) - Warm Orange
- `ember-50` to `ember-900`
- Use for: Primary actions, links, highlights, active states

### Tobacco (Secondary) - Warm Brown
- `tobacco-50` to `tobacco-900`
- Use for: Text, backgrounds, secondary actions, borders

**Examples:**
```tsx
// Primary button
<button className="bg-ember-600 hover:bg-ember-700 text-white">
  Click me
</button>

// Secondary button
<button className="bg-tobacco-200 hover:bg-tobacco-300 text-tobacco-700">
  Cancel
</button>

// Text colors
<p className="text-tobacco-900">Primary text</p>
<p className="text-tobacco-600">Secondary text</p>

// Backgrounds
<div className="bg-tobacco-50">Light background</div>
```

---

## Best Practices

### Consistency
- Always use provided components instead of recreating similar ones
- Follow the established color system
- Use consistent spacing (Tailwind's default scale)

### Accessibility
- Always provide `alt` text for images and avatars
- Use semantic HTML elements
- Ensure sufficient color contrast
- Include keyboard navigation support

### Performance
- Use skeleton loaders for better perceived performance
- Implement lazy loading for images
- Use React.memo() for expensive list items (like PostCard in feeds)

### Mobile-First
- Test all components on mobile screens
- Use responsive classes (`sm:`, `md:`, `lg:`)
- Ensure touch targets are at least 44x44px

---

## Examples

### Loading State Pattern
```tsx
function FeedPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No posts yet"
        description="Start following users or join clubs to see posts"
        actionLabel="Explore Clubs"
        onAction={() => navigate('/clubs')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} {...post} />
      ))}
    </div>
  );
}
```

### Form Pattern
```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          className="mt-4"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full mt-6"
        >
          Sign In
        </Button>
      </form>
    </Card>
  );
}
```

---

## Contributing

When adding new components:
1. Follow existing patterns and naming conventions
2. Use TypeScript for type safety
3. Support all necessary props with sensible defaults
4. Include forwardRef for components that wrap native elements
5. Export types alongside components
6. Update this documentation
