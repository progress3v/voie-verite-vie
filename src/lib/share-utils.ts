import html2canvas from 'html2canvas';

export interface SharePreviewData {
  title: string;
  subtitle?: string;
  reading?: string;
  text?: string;
  meditation?: string;
  prayer?: string;
  adoration?: string;
  number?: number;
  type: 'station' | 'day';
}

/**
 * Capture le Dialog complet (sans troncature)
 */
export const generateShareImage = async (data: SharePreviewData): Promise<Blob | null> => {
  try {
    console.log('📸 Capture du Dialog complet');
    
    // Récupérer le Dialog
    const dialogContent = document.getElementById('share-source');
    
    if (!dialogContent) {
      console.error('❌ Dialog non trouvé');
      return null;
    }
    
    console.log('✅ Dialog trouvé');
    
    // Sauvegarder les styles originaux
    const originalMaxHeight = dialogContent.style.maxHeight;
    const originalOverflow = dialogContent.style.overflow;
    const originalHeight = dialogContent.style.height;
    
    // Retirer les contraintes pour capturer tout
    dialogContent.style.maxHeight = 'none';
    dialogContent.style.overflow = 'visible';
    dialogContent.style.height = 'auto';
    
    console.log('🔧 Styles modifiés pour capture complète');
    
    // Attendre que le DOM se mette à jour
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capturer
    const canvas = await html2canvas(dialogContent, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      windowHeight: dialogContent.scrollHeight,
    });
    
    // Restaurer les styles originaux
    dialogContent.style.maxHeight = originalMaxHeight;
    dialogContent.style.overflow = originalOverflow;
    dialogContent.style.height = originalHeight;
    
    console.log('✅ Image capturée:', canvas.width, 'x', canvas.height);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('💾 Image:', blob.size, 'bytes');
        }
        resolve(blob);
      }, 'image/png', 0.95);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
};

/**
 * Partage l'image
 */
export const shareImage = async (blob: Blob, title: string): Promise<boolean> => {
  try {
    console.log('🔄 Partage image:', blob.size, 'bytes');
    
    if (!blob || blob.size === 0) {
      return false;
    }

    const isDesktop = !/android|iphone|ipad|ipod|webos/i.test(navigator.userAgent.toLowerCase());

    const file = new File([blob], `${title.replace(/\s+/g, '-')}.png`, {
      type: 'image/png',
    });

    // Mobile avec Web Share
    if (!isDesktop && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: '✝️ Voie, Vérité, Vie',
        });
        return true;
      } catch (err) {
        console.error('Erreur partage mobile:', err);
        return false;
      }
    } else if (isDesktop) {
      // Desktop: télécharger
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 500);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur partage:', error);
    return false;
  }
};
