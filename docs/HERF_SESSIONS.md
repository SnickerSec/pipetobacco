# Virtual Herf Sessions

Virtual Herf Sessions allow users to host and join video chat rooms for smoking cigars and pipe tobacco together remotely.

## Features

- **Video Chat**: HD video and audio powered by Daily.co
- **Real-time Chat**: Text chat alongside video using Socket.io
- **Session Management**: Create, schedule, start, and end sessions
- **Participant Management**: Track who joins and leaves sessions
- **Privacy Controls**: Public or private sessions
- **Club Integration**: Associate sessions with clubs
- **Capacity Limits**: Configure max participants (2-20)

## Architecture

### Backend

**Database Schema** (`packages/database/prisma/schema.prisma`):
- `HerfSession` - Main session record
- `HerfParticipant` - Tracks session participants
- `HerfChatMessage` - Stores chat messages
- `HerfStatus` enum - SCHEDULED, LIVE, ENDED, CANCELLED

**API Routes** (`apps/api/src/routes/herf.ts`):
- `POST /api/herf/sessions` - Create session
- `GET /api/herf/sessions` - List sessions (with filters)
- `GET /api/herf/sessions/:id` - Get session details
- `POST /api/herf/sessions/:id/start` - Start session (creates Daily.co room)
- `POST /api/herf/sessions/:id/join` - Join session (get meeting token)
- `POST /api/herf/sessions/:id/leave` - Leave session
- `POST /api/herf/sessions/:id/end` - End session (host only)
- `DELETE /api/herf/sessions/:id` - Cancel session
- `GET /api/herf/sessions/:id/messages` - Get chat history

**Daily.co Service** (`apps/api/src/services/dailyService.ts`):
- `createRoom()` - Creates video room
- `createMeetingToken()` - Generates auth token for participants
- `deleteRoom()` - Removes room
- `getRoomInfo()` - Fetches room details

**Socket.io Integration** (`apps/api/src/socket/herfSocket.ts`):
- Namespace: `/herf`
- Events:
  - `join-session` - Join a session room
  - `leave-session` - Leave a session room
  - `chat-message` - Send chat message
  - `typing` / `stop-typing` - Typing indicators
  - `user-joined` / `user-left` - Participant events
  - `new-message` - Broadcast chat message
  - `chat-history` - Initial messages on join

### Frontend

**Service Layer** (`apps/web/src/services/herfService.ts`):
- API client functions for all herf endpoints
- TypeScript interfaces for type safety

**Components**:
- `HerfSession.tsx` - Main video chat component with Daily.co iframe and chat sidebar
- `HerfSessions.tsx` - List view with filters and create modal
- `HerfSessionPage.tsx` - Session lobby and join page

**Routes**:
- `/herf` - Sessions list
- `/herf/:sessionId` - Session lobby/video call

## Setup

### 1. Daily.co Account

Sign up for a free Daily.co account at https://daily.co

1. Create an account
2. Go to Developers → API Keys
3. Create a new API key
4. Copy the API key

### 2. Environment Variables

**Backend** (`apps/api/.env`):
```env
DAILY_API_KEY=your_daily_api_key_here
```

**Frontend** (`apps/web/.env`):
```env
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Database Migration

Run the Prisma migration to add the herf session tables:

```bash
cd packages/database
npm run prisma:migrate
```

Or push schema changes without migration:

```bash
npm run prisma:push
```

### 4. Install Dependencies

Frontend packages are already installed:
- `@daily-co/daily-js` - Daily.co video SDK
- `socket.io-client` - Socket.io client

Backend packages are already installed:
- `socket.io` - Socket.io server
- `axios` - HTTP client for Daily.co API

## Usage

### Creating a Session

1. Navigate to `/herf`
2. Click "Create Session"
3. Fill in:
   - Title (required)
   - Description (optional)
   - Scheduled time (optional)
   - Max participants (2-20)
   - Privacy (public/private)
   - Club association (optional)
4. Click "Create"

### Starting a Session

Only the host can start a session:

1. Go to the session page
2. Click "Start Session"
3. This creates the Daily.co video room
4. Host automatically joins after starting

### Joining a Session

1. Find a LIVE session in the list
2. Click the session card
3. Click "Join Session"
4. Video call and chat will load

### During a Session

**Video Controls**:
- Toggle camera on/off
- Toggle microphone on/off
- Screen share (if enabled)
- Leave meeting button

**Chat**:
- Send text messages
- See typing indicators
- View chat history
- Hide/show chat sidebar

### Ending a Session

Only the host can end a session:

1. In the session page, click "End Session"
2. Confirm the action
3. This removes the Daily.co room and marks session as ENDED

## Daily.co Free Tier Limits

- **10,000 participant minutes/month**
- Approximately 20 sessions of 8 people for 1 hour each
- Unlimited rooms
- HD video quality
- HIPAA compliant
- No credit card required

## Socket.io Events

### Client → Server

```typescript
// Join a session
socket.emit('join-session', { sessionId: 'xxx' });

// Send a message
socket.emit('chat-message', { sessionId: 'xxx', message: 'Hello!' });

// Typing indicator
socket.emit('typing', { sessionId: 'xxx' });
socket.emit('stop-typing', { sessionId: 'xxx' });

// Leave session
socket.emit('leave-session', { sessionId: 'xxx' });
```

### Server → Client

```typescript
// Receive chat history
socket.on('chat-history', (messages: HerfChatMessage[]) => {});

// New message broadcast
socket.on('new-message', (message: HerfChatMessage) => {});

// User joined
socket.on('user-joined', (data: { user, timestamp }) => {});

// User left
socket.on('user-left', (data: { user, timestamp }) => {});

// Someone is typing
socket.on('user-typing', (data: { userId, username }) => {});

// Error
socket.on('error', (error: { message: string }) => {});
```

## API Examples

### Create Session

```bash
curl -X POST http://localhost:3000/api/herf/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Friday Night Herf",
    "description": "Let's smoke some Cubans",
    "maxParticipants": 8,
    "isPrivate": false
  }'
```

### List Live Sessions

```bash
curl http://localhost:3000/api/herf/sessions?status=LIVE
```

### Start Session

```bash
curl -X POST http://localhost:3000/api/herf/sessions/SESSION_ID/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Join Session

```bash
curl -X POST http://localhost:3000/api/herf/sessions/SESSION_ID/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "token": "eyJ...",
  "roomUrl": "https://ember-society.daily.co/herf-SESSION_ID",
  "sessionId": "SESSION_ID",
  "isHost": false
}
```

## Security

- **Authentication**: JWT required for all endpoints except public session lists
- **Authorization**:
  - Only hosts can start/end sessions
  - Only participants can access private sessions
  - Club members can access club sessions
- **Meeting Tokens**: Daily.co tokens expire after 24 hours
- **Room Expiry**: Video rooms auto-expire after 7 days

## Troubleshooting

### Video not loading

1. Check Daily.co API key is set
2. Verify room was created (`roomUrl` is set on session)
3. Check browser console for errors
4. Ensure browser has camera/mic permissions

### Chat not working

1. Verify Socket.io connection
2. Check JWT token is valid
3. Ensure user joined session room
4. Check server logs for Socket.io errors

### Can't join session

1. Verify session status is LIVE
2. Check if session is at capacity
3. For private sessions, verify access permissions
4. Check if user is blocked from club

## Future Enhancements

- [ ] Session recordings
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Polls during session
- [ ] Integration with calendar events
- [ ] Mobile app support (React Native Daily SDK)
- [ ] Session analytics (duration, peak participants)
- [ ] Scheduled reminders
- [ ] Waiting room for private sessions
- [ ] Co-host permissions
