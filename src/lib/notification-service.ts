/**
 * Service de notifications intelligentes
 * Gère les notifications push automatiques sans demander de permission
 */

export interface NotificationPayload {
  title: string;
  body?: string;
  badge?: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
  action?: 'careme' | 'chemin-croix' | 'activity' | 'bible' | 'gallery' | 'reminder';
  silent?: boolean;
  badge_count?: number;
}

/**
 * Envoie une notification silencieuse automatiquement
 * Sans demander la permission (permissions implicites)
 */
export const sendSilentNotification = async (payload: NotificationPayload) => {
  try {
    // Si le service worker est prêt
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.showNotification) {
        await registration.showNotification(payload.title, {
          body: payload.body || '',
          badge: payload.badge || '/logo-3v.png',
          icon: payload.icon || '/logo-3v.png',
          tag: payload.tag || 'default',
          silent: payload.silent !== false, // Par défaut silencieux
          requireInteraction: false, // N'empêche pas la fermeture auto
          data: {
            ...payload.data,
            action: payload.action,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } else {
      // Fallback simple
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          badge: payload.badge || '/logo-3v.png',
          icon: payload.icon || '/logo-3v.png',
          tag: payload.tag || 'default',
          silent: true,
        });
      }
    }
  } catch (err) {
    console.log('Notification non supportée:', err);
  }
};

/**
 * Envoie une notification immédiate (peut être visible ou silencieuse)
 */
export const sendNotification = async (payload: NotificationPayload) => {
  await sendSilentNotification(payload);
};

/**
 * Initialise le service worker et les permissions silencieusement
 */
export const initNotificationsAutomatically = async () => {
  try {
    // Enregistrer le service worker sans demander
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register(
        '/notification-sw.js',
        { scope: '/' }
      );
      console.log('Service Worker enregistré automatiquement pour les notifications');
      
      // Vérifier et demander la permission silencieusement si possible
      if ('Notification' in window && Notification.permission === 'default') {
        // Essayer de demander la permission discrètement
        try {
          await Notification.requestPermission();
        } catch (err) {
          // Échouer silencieusement - continuer quand même
          console.log('Permission de notification non disponible (normal sur certains navigateurs)');
        }
      }
    }
  } catch (err) {
    console.log('Initialisation des notifications échouée (normal):', err);
  }
};

/**
 * Envoie une notification pour une nouvelle lecture biblique
 */
export const sendBibleNotification = async (title: string, chapter: string) => {
  await sendSilentNotification({
    title: `📖 Nouvelle lecture: ${title}`,
    body: `Chapitre ${chapter} disponible`,
    tag: `bible-${title}`,
    data: {
      action: 'bible',
      title,
      chapter,
    },
    action: 'bible',
  });
};

/**
 * Envoie une notification pour un jour du Carême
 */
export const sendCaremeReminder = async (day: number, title: string) => {
  await sendSilentNotification({
    title: `🙏 Carême Jour ${day}`,
    body: title,
    tag: `careme-${day}`,
    data: {
      action: 'careme',
      day,
    },
    action: 'careme',
  });
};

/**
 * Envoie une notification pour le Chemin de Croix
 */
export const sendCheminDeCroixReminder = async (station: number, title: string) => {
  await sendSilentNotification({
    title: `✝️ Station ${station}: ${title}`,
    body: 'Méditation disponible',
    tag: `chemin-croix-${station}`,
    data: {
      action: 'chemin-croix',
      station,
    },
    action: 'chemin-croix',
  });
};

/**
 * Envoie une notification pour une activité
 */
export const sendActivityNotification = async (activityName: string, description: string) => {
  await sendSilentNotification({
    title: `🎯 ${activityName}`,
    body: description,
    tag: `activity-${activityName}`,
    data: {
      action: 'activity',
      name: activityName,
    },
    action: 'activity',
  });
};

/**
 * Envoie une notification pour une galerie/image
 */
export const sendGalleryNotification = async (title: string, description: string) => {
  await sendSilentNotification({
    title: `🖼️ ${title}`,
    body: description,
    tag: `gallery-${title}`,
    data: {
      action: 'gallery',
      title,
    },
  });
};

/**
 * Envoie une notification générique pour une nouveauté
 */
export const sendUpdateNotification = async (title: string, description: string, type: string = 'update') => {
  await sendSilentNotification({
    title: `✨ ${title}`,
    body: description,
    tag: `update-${Date.now()}`,
    data: {
      action: 'reminder',
      type,
    },
    action: 'reminder',
  });
};

/**
 * Initialise le gestionnaire de clics sur les notifications
 */
export const initNotificationClickHandler = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { action, data } = event.data.payload;

        switch (action) {
          case 'careme':
            window.location.href = `/careme-2026`;
            break;
          case 'chemin-croix':
            window.location.href = `/chemin-de-croix`;
            break;
          case 'bible':
            window.location.href = `/biblical-reading`;
            break;
          case 'activity':
            window.location.href = `/activities`;
            break;
          case 'gallery':
            window.location.href = `/gallery`;
            break;
          default:
            window.location.href = '/';
        }
      }
    });
  }
};
