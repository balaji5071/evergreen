// Service Worker for Evergreen Web Push Notifications

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Evergreen Cafe & Restaurant";
    const options = {
      body: data.body || "You have a new update on your order!",
      icon: data.icon || "/logo.png",
      badge: data.badge || "/logo.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.data?.url || "/orders",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error("Error parsing push payload:", e);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/orders";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
