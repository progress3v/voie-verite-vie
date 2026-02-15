import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { SettingsProvider } from "@/hooks/useSettings";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollToTop from "@/components/ScrollToTop";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { initNotificationsAutomatically, initNotificationClickHandler } from "@/lib/notification-service";
import { initChangeNotificationSystem, sendWelcomeNotification } from "@/lib/change-notification-system";
import Index from "./pages/Index";
import About from "./pages/About";
import Activities from "./pages/Activities";
import BiblicalReading from "./pages/BiblicalReading";
import BibleBookDetail from "./pages/BibleBookDetail";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import FAQ from "./pages/FAQ";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import AIChat from "./pages/AIChat";
import PrayerForum from "./pages/PrayerForum";
import Careme2026 from "./pages/Careme2026";
import CheminDeCroix from "./pages/CheminDeCroix";
import ShareDebug from "./pages/ShareDebug";
import Admin from "./pages/Admin";
import AdminReadings from "./pages/admin/AdminReadings";
import AdminPrayers from "./pages/admin/AdminPrayers";
import AdminContact from "./pages/admin/AdminContact";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHome from "./pages/admin/AdminHome";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminActivities from "./pages/admin/AdminActivities";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminAI from "./pages/admin/AdminAI";
import AdminCareme2026 from "./pages/admin/AdminCareme2026";
import AdminCheminDeCroix from "./pages/admin/AdminCheminDeCroix";
import Creator from "./pages/Creator";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour initialiser les notifications automatiquement
const AppNotificationInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { notifyUpdate } = useNotifications();

  useEffect(() => {
    if (!user) return;

    const initializeNotifications = async () => {
      try {
        // Initialiser le système de changements
        const cleanup = await initChangeNotificationSystem(user.id);
        
        // Envoyer une notification de bienvenue une fois par session
        if (!sessionStorage.getItem('notification-welcome-sent')) {
          await sendWelcomeNotification();
          sessionStorage.setItem('notification-welcome-sent', 'true');
        }

        // Retourner la fonction cleanup
        return cleanup;
      } catch (err) {
        console.log('Erreur lors de l\'initialisation des notifications:', err);
      }
    };

    let cleanupFn: (() => void | Promise<void>) | undefined;
    
    initializeNotifications().then((fn) => {
      cleanupFn = fn;
    });

    // Nettoyer les listeners lors du unmount
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [user?.id]); // Ajouter user.id comme dépendance, pas tout le user object

  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SettingsProvider>
            {isLoading && <LoadingScreen />}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppNotificationInitializer>
              <ScrollToTop />
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/biblical-reading" element={<BiblicalReading />} />
              <Route path="/bible-book/:bookId" element={<BibleBookDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/contacts" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/install" element={<Install />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/prayer-forum" element={<PrayerForum />} />
              <Route path="/careme-2026" element={<Careme2026 />} />
              <Route path="/chemin-de-croix" element={<CheminDeCroix />} />
              <Route path="/share-debug" element={<ShareDebug />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/createur" element={<Creator />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/home" element={<AdminHome />} />
              <Route path="/admin/about" element={<AdminAbout />} />
              <Route path="/admin/careme2026" element={<AdminCareme2026 />} />
              <Route path="/admin/chemin-de-croix" element={<AdminCheminDeCroix />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route path="/admin/readings" element={<AdminReadings />} />
              <Route path="/admin/prayers" element={<AdminPrayers />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/faq" element={<AdminFAQ />} />
              <Route path="/admin/contact" element={<AdminContact />} />
              <Route path="/admin/ai" element={<AdminAI />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              </AppNotificationInitializer>
            </BrowserRouter>
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
