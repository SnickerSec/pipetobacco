import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Redirect component for profile legacy route
function ProfileRedirect() {
  const { username } = useParams<{ username: string }>();
  return <Navigate to={`/u/${username}`} replace />;
}

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';

// Authenticated Pages
import FeedPage from './pages/FeedPage';
import PostDetailPage from './pages/PostDetailPage';
import ClubsPage from './pages/ClubsPage';
import ClubPage from './pages/ClubPage';
import ClubSettingsPage from './pages/ClubSettingsPage';
import ClubMessagesPage from './pages/ClubMessagesPage';
import ClubInvitePage from './pages/ClubInvitePage';
import EventsPage from './pages/event/EventsPage';
import EventDetailPage from './pages/event/EventDetailPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/profile/ProfilePage';
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage';
import NotificationSettingsPage from './pages/settings/NotificationSettingsPage';
import ReviewsPage from './pages/ReviewsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* OAuth Callback (no layout) */}
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Protected Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              <Route path="/u/:username" element={<UserProfilePage />} />
              {/* Redirect old /profile route to /u */}
              <Route path="/profile/:username" element={<ProfileRedirect />} />
              <Route path="/settings/profile" element={<ProfileSettingsPage />} />
              <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:slug" element={<ClubPage />} />
              <Route path="/clubs/:slug/settings" element={<ClubSettingsPage />} />
              <Route path="/clubs/:slug/messages" element={<ClubMessagesPage />} />
              <Route path="/clubs/invites/:token" element={<ClubInvitePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:username" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
