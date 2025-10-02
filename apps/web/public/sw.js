// Service Worker for Push Notifications
// This file handles push notification events

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'The Ember Society',
      body: event.data.text(),
    };
  }

  const title = data.title || 'The Ember Society';
  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: data.tag || 'notification',
    data: {
      url: data.url || data.linkUrl || '/',
      notificationId: data.id,
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed', event.notification.data);
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});
