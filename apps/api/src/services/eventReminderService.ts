import * as db from '@ember-society/database';
import { createNotification } from './notificationService.js';

const prisma = db.prisma;

/**
 * Check for upcoming events and send reminder notifications
 * This function should be called periodically (e.g., every hour via cron job)
 */
export async function sendEventReminders(): Promise<void> {
  try {
    const now = new Date();

    // Calculate time windows for 24h and 1h reminders
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Add a small buffer (5 minutes) to account for cron job timing
    const bufferMinutes = 5;
    const twentyFourHourBuffer = new Date(twentyFourHoursFromNow.getTime() + bufferMinutes * 60 * 1000);
    const oneHourBuffer = new Date(oneHourFromNow.getTime() + bufferMinutes * 60 * 1000);

    // Find events that need 24h reminders
    const eventsFor24hReminders = await prisma.event.findMany({
      where: {
        startTime: {
          gte: twentyFourHoursFromNow,
          lte: twentyFourHourBuffer,
        },
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        rsvps: {
          where: {
            status: 'GOING',
          },
          select: {
            userId: true,
          },
        },
      },
    });

    // Find events that need 1h reminders
    const eventsFor1hReminders = await prisma.event.findMany({
      where: {
        startTime: {
          gte: oneHourFromNow,
          lte: oneHourBuffer,
        },
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        rsvps: {
          where: {
            status: 'GOING',
          },
          select: {
            userId: true,
          },
        },
      },
    });

    // Send 24h reminders
    for (const event of eventsFor24hReminders) {
      await Promise.all(
        event.rsvps.map((rsvp) =>
          createNotification({
            userId: rsvp.userId,
            type: 'EVENT_REMINDER',
            title: 'Event starting in 24 hours',
            message: `${event.title} in ${event.club.name} starts tomorrow`,
            linkUrl: `/events/${event.id}`,
          })
        )
      );
    }

    // Send 1h reminders
    for (const event of eventsFor1hReminders) {
      await Promise.all(
        event.rsvps.map((rsvp) =>
          createNotification({
            userId: rsvp.userId,
            type: 'EVENT_REMINDER',
            title: 'Event starting in 1 hour',
            message: `${event.title} in ${event.club.name} starts soon`,
            linkUrl: `/events/${event.id}`,
          })
        )
      );
    }

    console.log(
      `Event reminders sent: ${eventsFor24hReminders.length} 24h reminders, ${eventsFor1hReminders.length} 1h reminders`
    );
  } catch (error) {
    console.error('Error sending event reminders:', error);
  }
}

/**
 * Start the event reminder scheduler
 * Checks for events every hour
 */
export function startEventReminderScheduler(): void {
  // Run immediately on startup
  sendEventReminders();

  // Then run every hour
  setInterval(() => {
    sendEventReminders();
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  console.log('Event reminder scheduler started (runs every hour)');
}
