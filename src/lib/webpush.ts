import webPush from "web-push";
import { connectToDatabase } from "./db";
import { PushSubscription } from "./models/PushSubscription";

const publicVapidKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@evergreen.com";

if (publicVapidKey && privateVapidKey) {
  webPush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  try {
    await connectToDatabase();
    const subscriptions = await PushSubscription.find({ userId });

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      data: {
        url: payload.url || "/orders",
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };
        await webPush.sendNotification(pushSubscription, notificationPayload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

export async function broadcastPushNotification(payload: PushNotificationPayload) {
  try {
    await connectToDatabase();
    const subscriptions = await PushSubscription.find({});

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      data: {
        url: payload.url || "/menu",
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };
        await webPush.sendNotification(pushSubscription, notificationPayload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error("Error broadcasting push notification:", error);
  }
}
