import { api } from './api';

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  // Initialize the service worker
  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');

      // Check for existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();

      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  // Request permission and subscribe to push notifications
  async requestPermission(): Promise<boolean> {
    if (!this.registration) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<boolean> {
    if (!this.registration) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    try {
      // Check if already subscribed
      if (this.subscription) {
        console.log('Already subscribed to push notifications');
        return true;
      }

      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const permitted = await this.requestPermission();
        if (!permitted) return false;
      }

      // Fetch VAPID public key from server
      const vapidPublicKey = await api.getVapidPublicKey();

      // Subscribe to push notifications with VAPID key
      const uint8Array = urlBase64ToUint8Array(vapidPublicKey);
      this.subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: uint8Array as BufferSource,
      });

      // Send subscription to backend
      await api.subscribeToPushNotifications(this.subscription);

      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      console.log('No active subscription to unsubscribe from');
      return true;
    }

    try {
      const endpoint = this.subscription.endpoint;

      // Unsubscribe from push manager
      await this.subscription.unsubscribe();

      // Remove subscription from backend
      await api.unsubscribeFromPushNotifications(endpoint);

      this.subscription = null;
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      await this.init();
    }

    if (!this.registration) return false;

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription !== null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get current subscription
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission state
  getPermission(): NotificationPermission {
    return Notification.permission;
  }
}

// Helper function to convert VAPID key (for future use)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const notificationService = new NotificationService();
