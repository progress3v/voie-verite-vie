/**
 * Système de notifications pour les nouveautés et changements
 * Détecte les mises à jour et envoie les notifications automatiquement
 * Version revisitée avec cleanup approprié pour éviter les fuites mémoire
 */

import { supabase } from '@/integrations/supabase/client';
import {
  sendCaremeReminder,
  sendCheminDeCroixReminder,
  sendActivityNotification,
  sendUpdateNotification,
} from './notification-service';

/**
 * Initialise le système de notifications pour les changements
 * Retourne une fonction cleanup pour nettoyer les listeners
 */
export const initChangeNotificationSystem = async (userId?: string): Promise<() => void> => {
  try {
    if (!userId) return () => {};

    const subscriptions: any[] = [];
    let isActive = true;

    // Écouter les changements pour Carême
    const caremeSubscription = supabase
      .channel(`page-content-changes:${userId}:careme-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content',
          filter: `program_key=eq.careme-2026`,
        },
        async (payload) => {
          if (!isActive) return;
          try {
            if (payload.eventType === 'INSERT') {
              const day = payload.new.day_number || 1;
              const title = payload.new.day_title || `Jour ${day}`;
              await sendCaremeReminder(day, title);
            } else if (payload.eventType === 'UPDATE') {
              const day = payload.new.day_number || 1;
              const title = payload.new.day_title || `Jour ${day}`;
              await sendUpdateNotification(`Mise à jour Carême`, `Jour ${day} a été mis à jour`);
            }
          } catch (err) {
            console.log('Erreur notification Carême:', err);
          }
        }
      )
      .subscribe();

    subscriptions.push(caremeSubscription);

    // Écouter les changements pour Chemin de Croix
    const cheminSubscription = supabase
      .channel(`page-content-changes:${userId}:chemin-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_content',
          filter: `program_key=eq.chemin-de-croix`,
        },
        async (payload) => {
          if (!isActive) return;
          try {
            if (payload.eventType === 'INSERT') {
              const station = payload.new.station_number || 1;
              const title = payload.new.station_title || `Station ${station}`;
              await sendCheminDeCroixReminder(station, title);
            } else if (payload.eventType === 'UPDATE') {
              const station = payload.new.station_number || 1;
              await sendUpdateNotification(`Mise à jour Chemin de Croix`, `Station ${station} a été mise à jour`);
            }
          } catch (err) {
            console.log('Erreur notification Chemin:', err);
          }
        }
      )
      .subscribe();

    subscriptions.push(cheminSubscription);

    // Écouter les changements pour les activités
    const activitiesSubscription = supabase
      .channel(`activities-changes:${userId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        async (payload) => {
          if (!isActive) return;
          try {
            if (payload.eventType === 'INSERT') {
              const name = payload.new.title || 'Nouvelle activité';
              const description = payload.new.description || '';
              await sendActivityNotification(name, description);
            } else if (payload.eventType === 'UPDATE') {
              const name = payload.new.title || 'Activité mise à jour';
              await sendUpdateNotification(`Mise à jour d'activité`, `${name} a été mise à jour`);
            }
          } catch (err) {
            console.log('Erreur notification activité:', err);
          }
        }
      )
      .subscribe();

    subscriptions.push(activitiesSubscription);

    // Retourner la fonction cleanup
    return async () => {
      isActive = false;
      try {
        for (const subscription of subscriptions) {
          await supabase.removeChannel(subscription);
        }
        subscriptions.length = 0;
      } catch (err) {
        console.log('Erreur cleanup:', err);
      }
    };
  } catch (err) {
    console.log('Erreur initChangeNotificationSystem:', err);
    return () => {};
  }
};

/**
 * Envoie une notification de bienvenue avec un résumé des activités disponibles
 */
export const sendWelcomeNotification = async () => {
  await sendUpdateNotification(
    '👋 Bienvenue!',
    'Accédez au Carême, Chemin de Croix, lectures bibliques et plus'
  );
};

/**
 * Envoie une notification pour rappeler les activités disponibles
 */
export const sendActivityReminderNotification = async () => {
  const messages = [
    { title: '📖 Lecture biblique', body: 'Découvrez les écritures saintes d\'aujourd\'hui' },
    { title: '🙏 Carême 2026', body: 'Votre méditation du jour vous attend' },
    { title: '✝️ Chemin de Croix', body: 'Méditez sur les stations du chemin' },
    { title: '🎯 Activités', body: 'Participez aux événements de notre communauté' },
  ];

  // Sélectionner aléatoirement un rappel
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  await sendUpdateNotification(randomMessage.title, randomMessage.body);
};
