import * as db from '@ember-society/database';
import webpush from 'web-push';

const prisma = db.prisma;

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:noreply@embersociety.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

interface NotificationData {
  userId: string;
  type: 'NEW_FOLLOWER' | 'NEW_POST_IN_CLUB' | 'NEW_COMMENT' | 'NEW_REPLY' | 'POST_MENTION' | 'EVENT_REMINDER' | 'CLUB_INVITE' | 'NEW_MESSAGE';
  title: string;
  message: string;
  linkUrl?: string;
}

export async function createNotification(data: NotificationData): Promise<void> {
  try {
    // Check if user has this notification type enabled
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: data.userId },
    });

    // Map notification types to preference fields
    const preferenceMap: Record<string, keyof typeof preferences> = {
      NEW_FOLLOWER: 'newFollower',
      NEW_POST_IN_CLUB: 'newPostInClub',
      NEW_COMMENT: 'newComment',
      NEW_REPLY: 'newReply',
      POST_MENTION: 'postMention',
      EVENT_REMINDER: 'eventReminder',
      CLUB_INVITE: 'clubInvite',
      NEW_MESSAGE: 'newMessage',
    };

    const preferenceField = preferenceMap[data.type];

    // If user has disabled this notification type, don't create it
    if (preferences && preferenceField && !preferences[preferenceField]) {
      return;
    }

    // Create the notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl || null,
      },
    });

    // Send push notification if user has push enabled
    if (preferences?.pushEnabled) {
      await sendPushNotification(data.userId, {
        title: data.title,
        body: data.message,
        url: data.linkUrl,
        id: notification.id,
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notifications are non-critical
  }
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  id: string;
}

async function sendPushNotification(userId: string, payload: PushPayload): Promise<void> {
  try {
    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    // Send to all subscriptions
    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload)
        );
      } catch (error: any) {
        // If subscription is no longer valid, delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
        console.error('Error sending push notification:', error);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}

// Helper function to notify all club members except the actor
export async function notifyClubMembers(
  clubId: string,
  excludeUserId: string,
  notification: Omit<NotificationData, 'userId'>
): Promise<void> {
  try {
    const members = await prisma.clubMember.findMany({
      where: {
        clubId,
        userId: { not: excludeUserId },
      },
      select: { userId: true },
    });

    await Promise.all(
      members.map((member) =>
        createNotification({
          ...notification,
          userId: member.userId,
        })
      )
    );
  } catch (error) {
    console.error('Error notifying club members:', error);
  }
}

// Helper function to notify followers
export async function notifyFollowers(
  userId: string,
  notification: Omit<NotificationData, 'userId'>
): Promise<void> {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });

    await Promise.all(
      followers.map((follower) =>
        createNotification({
          ...notification,
          userId: follower.followerId,
        })
      )
    );
  } catch (error) {
    console.error('Error notifying followers:', error);
  }
}

// Helper function to extract @mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Extract username without @
  }

  return [...new Set(mentions)]; // Remove duplicates
}

// Helper function to notify mentioned users
export async function notifyMentionedUsers(
  content: string,
  excludeUserId: string,
  notification: Omit<NotificationData, 'userId' | 'type'>
): Promise<void> {
  try {
    const usernames = extractMentions(content);

    if (usernames.length === 0) return;

    // Find users by username
    const users = await prisma.user.findMany({
      where: {
        username: { in: usernames },
        id: { not: excludeUserId }, // Don't notify if user mentions themselves
      },
      select: { id: true },
    });

    // Send notifications
    await Promise.all(
      users.map((user) =>
        createNotification({
          ...notification,
          userId: user.id,
          type: 'POST_MENTION',
        })
      )
    );
  } catch (error) {
    console.error('Error notifying mentioned users:', error);
  }
}
