const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export async function subscribeUserToPush() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return null;
  }

  if (!publicVapidKey) {
    console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured.");
    return null;
  }

  try {
    // Check Notification permission
    if ("Notification" in window && Notification.permission === "denied") {
      console.warn("Push notification permission denied by user.");
      return null;
    }

    const register = await navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("ServiceWorker registration failed:", err);
      return null;
    });

    if (!register) return null;

    // Wait until ready
    await navigator.serviceWorker.ready;

    const subscription = await register.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })
      .catch((err) => {
        // Handle AbortError (e.g. Push service error, Chrome FCM issue, offline)
        if (err.name === "AbortError") {
          console.warn("Push service registration aborted. Browser push service might be unavailable:", err.message);
        } else {
          console.warn("Push Manager subscription error:", err);
        }
        return null;
      });

    if (!subscription) return null;

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    }).catch((err) => {
      console.warn("Failed to save push subscription to backend:", err);
    });

    return subscription;
  } catch (error) {
    console.warn("Failed to subscribe user to push notifications:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
