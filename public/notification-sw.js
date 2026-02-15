// Service Worker pour les notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification reçue');

  let data = {
    title: 'Voie, Vérité, Vie',
    body: 'Vous avez une nouvelle notification',
    badge: '/logo-3v.png',
    icon: '/logo-3v.png',
    tag: 'default',
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      badge: data.badge,
      icon: data.icon,
      tag: data.tag,
      requireInteraction: true,
      data: data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique sur notification');

  event.notification.close();

  let urlToOpen = '/';

  if (event.notification.data && event.notification.data.action) {
    switch (event.notification.data.action) {
      case 'careme':
        urlToOpen = '/careme-2026';
        break;
      case 'chemin-croix':
        urlToOpen = '/chemin-de-croix';
        break;
      case 'activity':
        urlToOpen = '/activities';
        break;
      default:
        urlToOpen = '/';
    }
  }

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Chercher un onglet existant
      for (let i = 0; i < allClients.length; i++) {
        const client = allClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // Ouvrir un nouvel onglet si aucun n'existe
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })()
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification fermée');
});

// Pour les messages depuis le client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message reçu', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
