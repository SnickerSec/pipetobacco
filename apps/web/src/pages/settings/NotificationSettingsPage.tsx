import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { notificationService } from '../../services/notificationService';

interface NotificationPreferences {
  pushEnabled: boolean;
  newFollower: boolean;
  newPostInClub: boolean;
  newComment: boolean;
  newReply: boolean;
  postMention: boolean;
  eventReminder: boolean;
  clubInvite: boolean;
  newMessage: boolean;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushEnabled: true,
    newFollower: true,
    newPostInClub: true,
    newComment: true,
    newReply: true,
    postMention: true,
    eventReminder: true,
    clubInvite: true,
    newMessage: true,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    checkSubscriptionStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await api.getNotificationPreferences();
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (notificationService.isSupported()) {
      await notificationService.init();
      const subscribed = await notificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const handleTogglePush = async () => {
    if (!notificationService.isSupported()) {
      alert('Push notifications are not supported in your browser');
      return;
    }

    try {
      if (isSubscribed) {
        await notificationService.unsubscribe();
        setIsSubscribed(false);
      } else {
        const success = await notificationService.subscribe();
        if (success) {
          setIsSubscribed(true);
        } else {
          alert('Failed to enable push notifications. Please check your browser settings.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update push notification settings');
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const updatedPrefs = { ...preferences, [key]: value };
    setPreferences(updatedPrefs);

    try {
      setSaving(true);
      await api.updateNotificationPreferences({ [key]: value });
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-600">Loading preferences...</div>
        </div>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'newFollower' as const, label: 'New Follower', description: 'When someone follows you' },
    {
      key: 'newPostInClub' as const,
      label: 'New Club Post',
      description: 'When someone posts in a club you\'re in',
    },
    { key: 'newComment' as const, label: 'New Comment', description: 'When someone comments on your post' },
    { key: 'newReply' as const, label: 'New Reply', description: 'When someone replies to your comment' },
    { key: 'postMention' as const, label: 'Mentions', description: 'When someone mentions you in a post' },
    {
      key: 'eventReminder' as const,
      label: 'Event Reminders',
      description: 'Reminders for upcoming events',
    },
    { key: 'clubInvite' as const, label: 'Club Invites', description: 'When you\'re invited to a club' },
    { key: 'newMessage' as const, label: 'New Messages', description: 'When you receive a direct message' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with back button */}
      <div className="mb-6">
        <Link
          to="/settings/profile"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
        >
          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-2 text-gray-600">Manage how you receive notifications</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Push Notifications Master Toggle */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
            <p className="mt-1 text-sm text-gray-600">
              {notificationService.isSupported()
                ? isSubscribed
                  ? 'You are subscribed to push notifications'
                  : 'Enable browser push notifications'
                : 'Push notifications are not supported in your browser'}
            </p>
          </div>
          {notificationService.isSupported() && (
            <button
              onClick={handleTogglePush}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSubscribed ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSubscribed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          <p className="mt-1 text-sm text-gray-600">Choose what notifications you want to receive</p>
        </div>

        <div className="divide-y divide-gray-200">
          {notificationTypes.map((type) => (
            <div key={type.key} className="p-6 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{type.label}</h3>
                <p className="mt-1 text-sm text-gray-600">{type.description}</p>
              </div>
              <button
                onClick={() => handlePreferenceChange(type.key, !preferences[type.key])}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences[type.key] ? 'bg-orange-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences[type.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg
            className="h-5 w-5 text-blue-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              These settings control which notifications you receive. Push notifications require browser
              permission and will only work when enabled above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
