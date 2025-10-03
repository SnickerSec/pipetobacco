import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  UserCircleIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import NotificationPermissionPrompt from '../components/NotificationPermissionPrompt';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
  };

  // Close search results and user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const [users, clubs, reviews] = await Promise.all([
          api.searchUsers(searchQuery).catch(() => []),
          api.getClubs().then(clubs =>
            clubs.filter(c =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          ).catch(() => []),
          api.getReviews({ limit: 10 }).then(reviews =>
            reviews.filter(r =>
              r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.brand?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          ).catch(() => []),
        ]);

        setSearchResults({
          users: users.slice(0, 5),
          clubs: clubs.slice(0, 5),
          reviews: reviews.slice(0, 5),
        });
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const navItems = [
    { path: '/feed', icon: HomeIcon, label: 'Feed' },
    { path: '/clubs', icon: UsersIcon, label: 'Clubs' },
    { path: '/reviews', icon: StarIcon, label: 'Reviews' },
    { path: '/events', icon: CalendarIcon, label: 'Events' },
    { path: '/messages', icon: ChatBubbleLeftIcon, label: 'Messages' },
    { path: '/notifications', icon: BellIcon, label: 'Notifications' },
  ];

  return (
    <div className="min-h-screen bg-tobacco-50">
      {/* Top Navigation (Desktop) */}
      <header className="bg-white shadow-sm border-b border-tobacco-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/feed" className="flex items-center space-x-2">
              <span className="text-2xl text-ember-600 hidden md:inline" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", fontWeight: 400 }}>
                The Ember Society
              </span>
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tobacco-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults && setShowSearchResults(true)}
                  placeholder="Search clubs, users, reviews..."
                  className="w-full pl-10 pr-4 py-2 border border-tobacco-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ember-500"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-tobacco-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-tobacco-600">Searching...</div>
                    ) : (
                      <>
                        {/* Users */}
                        {searchResults.users?.length > 0 && (
                          <div className="border-b border-tobacco-100">
                            <div className="px-4 py-2 text-xs font-semibold text-tobacco-500 uppercase">Users</div>
                            {searchResults.users.map((user: any) => (
                              <Link
                                key={user.id}
                                to={`/u/${user.username}`}
                                onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-tobacco-50 transition"
                              >
                                <img
                                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName || user.username}`}
                                  alt={user.username}
                                  className="h-10 w-10 rounded-full"
                                />
                                <div>
                                  <div className="font-medium text-tobacco-900">{user.displayName || user.username}</div>
                                  <div className="text-sm text-tobacco-600">@{user.username}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Clubs */}
                        {searchResults.clubs?.length > 0 && (
                          <div className="border-b border-tobacco-100">
                            <div className="px-4 py-2 text-xs font-semibold text-tobacco-500 uppercase">Clubs</div>
                            {searchResults.clubs.map((club: any) => (
                              <Link
                                key={club.id}
                                to={`/clubs/${club.slug}`}
                                onClick={() => { setShowSearchResults(false); setSearchQuery(''); }}
                                className="block px-4 py-3 hover:bg-tobacco-50 transition"
                              >
                                <div className="font-medium text-tobacco-900">{club.name}</div>
                                {club.description && (
                                  <div className="text-sm text-tobacco-600 line-clamp-1">{club.description}</div>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Reviews */}
                        {searchResults.reviews?.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-tobacco-500 uppercase">Reviews</div>
                            {searchResults.reviews.map((review: any) => (
                              <div
                                key={review.id}
                                onClick={() => { setShowSearchResults(false); setSearchQuery(''); navigate('/reviews'); }}
                                className="block px-4 py-3 hover:bg-tobacco-50 transition cursor-pointer"
                              >
                                <div className="font-medium text-tobacco-900">{review.productName}</div>
                                <div className="text-sm text-tobacco-600 line-clamp-1">{review.title}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* No results */}
                        {searchResults.users?.length === 0 &&
                         searchResults.clubs?.length === 0 &&
                         searchResults.reviews?.length === 0 && (
                          <div className="px-4 py-8 text-center text-tobacco-600">
                            No results found for "{searchQuery}"
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-ember-100 text-ember-700'
                        : 'text-tobacco-600 hover:bg-tobacco-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 hover:opacity-80"
                >
                  <UserCircleIcon className="h-8 w-8 text-tobacco-600" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-tobacco-200 rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/profile/me"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-tobacco-700 hover:bg-tobacco-50 transition"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-tobacco-700 hover:bg-tobacco-50 transition"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-tobacco-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 text-tobacco-600 hover:text-tobacco-900"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Add bottom padding on mobile for bottom nav */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-tobacco-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-1 min-w-0 ${
                  isActive(item.path) ? 'text-ember-600' : 'text-tobacco-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 leading-tight truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Modal */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                <Link
                  to="/profile/me"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-tobacco-50 text-tobacco-900"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="font-medium">My Profile</span>
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-tobacco-50 text-tobacco-900"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="font-medium">Notifications</span>
                </Link>

                <div className="border-t border-tobacco-200 my-4"></div>

                <a
                  href="/api/auth/logout"
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Log Out</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
