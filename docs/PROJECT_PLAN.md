Project Plan: The Ember Society (Pipe & Cigar Social Platform)
Goal: To build a fully responsive, feature-rich social networking platform dedicated to pipe tobacco and cigar enthusiasts, prioritizing community organization and real-time interaction.

Duration Estimate: 10 Weeks (5 Sprints)

Phase 1: Discovery, Architecture, & UX Foundation (Weeks 1-2)
This phase establishes the foundational structure and design for the entire platform.

|

| Task ID | Task Description | Dependencies | Estimated Time |
| 1.1 | Finalize Technical Stack: Select backend (e.g., Node.js/Python), frontend framework (e.g., React/Angular/Vue), and Database (e.g., Firestore/PostgreSQL). | N/A | 1 Week |
| 1.2 | Create Data Schema: Design database structure for Users, Clubs, Posts, Events, and Notifications. | 1.1 | 1 Week |
| 1.3 | Wireframing & Sitemap: Develop low-fidelity mockups for all core pages: Home Feed, User Profile, Club Page, Event Calendar, and Sign-Up Flow. | N/A | 1 Week |
| 1.4 | Design System Definition (Branding): Define color palette, typography (Inter font recommended), and aesthetic style (refined, warm, mobile-first). | 1.3 | 1 Week |
| 1.5 | Setup Core Hosting & CI/CD Pipeline: Provision cloud hosting and establish development, staging, and production environments. | 1.1 | 1 Week |

Phase 2: Authentication & Core User Services (Weeks 3-4)
Focus on making the site functional for individual users and implementing secure sign-on.

| Task ID | Task Description | Dependencies | Estimated Time | Status |
| 2.1 | Base User Registration & Login: Implement traditional email/password authentication. | 1.2, 1.4 | 1 Week | Skipped (SSO only) |
| 2.2 | SSO Integration (Google & Facebook): Integrate at least two primary SSO providers. (Instagram typically requires advanced business verification, plan for future integration.) | 1.2, 2.1 | 1 Week | ✅ Complete |
| 2.3 | Build User Profile Management: Allow users to upload profile picture, bio, location, and set basic Privacy Settings (Source 1.1). | 1.4 | 1 Week | ✅ Complete |
| 2.4 | Develop Activity Feed Backend Logic: Implement logic for displaying a customized, reverse-chronological feed of content from followed users and joined clubs. | 1.2 | 1 Week | ✅ Complete |
| 2.5 | Implement "Follow" and "Block" Functionality. | 2.3 | 0.5 Week | ✅ Complete (Follow done, Block deferred) |

Phase 3: Community & Content Engine (Weeks 5-6)
Developing the core functionality for user groups and media posting.

| Task ID | Task Description | Dependencies | Estimated Time | Status |
| 3.1 | Club Creation & Management UI/UX: Build forms for creating new clubs, setting name, description, and the Public/Private toggle. | 1.4, 2.4 | 1 Week | ✅ Complete |
| 3.2 | Club Invitation System: Develop mechanism for users to invite others via username or email. | 3.1 | 1 Week | ✅ Complete |
| 3.3 | Post Creation & Upload: Implement forms and storage for users to upload and post text, Images, and Video content to a Club or their Profile Feed. | 1.2 | 1 Week | ✅ Complete |
| 3.4 | Engagement Features: Implement Likes/Reactions, Commenting thread system, and User Tagging (@mention) logic. | 3.3 | 1 Week | ✅ Complete |
| 3.5 | Develop Direct Messaging (DM) System: Implement real-time, one-to-one private chat between users (Source 1.2). | 2.3 | 1 Week | ✅ Complete |

Phase 4: Advanced Features & Integrations (Weeks 7-8)
Implementing the complex, interactive, and communication features, including notifications and calendars.

| Task ID | Task Description | Dependencies | Estimated Time | Status |
| 4.1 | Shared Club Calendar Implementation (CRUD): Build the UI and backend for clubs to create, read, update, and delete events. | 3.1 | 1 Week | ✅ Complete |
| 4.2 | Calendar Event Permissions: Implement public/private visibility settings for events. | 4.1 | 0.5 Week | ✅ Complete |
| 4.3 | Web Push Notification Setup: Integrate a push notification service (e.g., Firebase Cloud Messaging or a third-party service) and develop the opt-in flow (Source 3.1). | 2.3 | 1 Week | ✅ Complete |
| 4.4 | Notification Logic: Define triggers for push and email: New Club Post, New Comment/Reply, Event Reminders (24h/1h), New Followers, Post Mentions, Club Invites, New Messages. | 4.3 | 1 Week | ✅ Complete |
| 4.5 | Review & Rating Feature: Implement a structured way for users to submit reviews of cigars/pipe tobaccos with a rating system, tied to a specific club or general feed. | 3.3 | 1 Week | ✅ Complete |
| 4.6 | Moderation & Reporting System: Implement a mechanism for users to report inappropriate posts, comments, or users to site administrators. | 3.4 | 0.5 Week | ✅ Complete |

Phase 5: Testing, Polish, & Deployment (Weeks 9-10)
The final phase for ensuring quality, responsiveness, and a smooth launch.

| Task ID | Task Description | Dependencies | Estimated Time | Status |
| 5.1 | Mobile Responsiveness Audit & Polish: Rigorous testing on various mobile devices (iOS/Android) and screen sizes to ensure a flawless experience. | All UI/UX Tasks | 1 Week | ✅ Complete |
| 5.2 | Performance & Load Testing: Optimize database queries, content loading (lazy loading for feeds), and media serving. | All Backend Tasks | 1 Week | ✅ Complete - Performance report created, image lazy loading implemented |
| 5.3 | Security Audit: Test for common vulnerabilities (XSS, CSRF) and verify SSO security. | 2.2 | 0.5 Week | ⏳ Pending |
| 5.4 | Beta Testing & Feedback Cycle: Recruit a small group of enthusiasts for real-world testing and bug fixing. | 5.1, 5.2 | 1 Week | ⏳ Pending |
| 5.5 | Final Production Deployment & Launch. | 5.4 | 0.5 Week | ⏳ Pending |