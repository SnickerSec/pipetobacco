import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export default function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!notificationService.isSupported()) {
      return;
    }

    await notificationService.init();
    const subscribed = await notificationService.isSubscribed();
    setIsSubscribed(subscribed);

    // Show prompt if not subscribed and permission not denied
    if (!subscribed && notificationService.getPermission() === 'default') {
      // Show after a short delay to not overwhelm the user
      setTimeout(() => setShow(true), 2000);
    }
  };

  const handleEnable = async () => {
    const success = await notificationService.subscribe();
    if (success) {
      setIsSubscribed(true);
      setShow(false);
    } else {
      alert('Failed to enable notifications. Please check your browser settings.');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Don't show again for this session
    sessionStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Don't show if already subscribed or dismissed this session
  if (!show || isSubscribed || sessionStorage.getItem('notificationPromptDismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">Enable Notifications</h3>
          <p className="mt-1 text-sm text-gray-600">
            Stay updated with new posts, comments, and club activities
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleEnable}
              className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
