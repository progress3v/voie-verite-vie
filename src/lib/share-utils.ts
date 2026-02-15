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
 * Génère une image optimisée pour le partage (1080x1920 pour WhatsApp Status)
 * Le pied de page est sur UNE SEULE ligne
 */
export const generateShareImage = async (data: SharePreviewData): Promise<Blob | null> => {
  try {
    // Créer un conteneur invisible avec dimensions optimales
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: 1080px;
      background: white;
      padding: 40px;
      color: #1f2937;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    `;

    let html = `
      <!-- Header avec logo et numéro -->
      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 30px; gap: 16px;">
        <img src="/logo-3v.png" alt="Logo 3V" style="height: 50px;">
        ${data.number ? `<div style="font-size: 48px; font-weight: bold; color: #7c3aed;">${String(data.number).padStart(2, '0')}</div>` : ''}
      </div>

      <!-- Titre -->
      <h1 style="font-size: 40px; font-weight: bold; margin: 0 0 16px 0; color: #581c87; text-align: center;">
        ${data.title}
      </h1>
    `;

    // Sous-titre ou lecture
    if (data.reading) {
      html += `
        <p style="font-size: 16px; color: #a855f7; margin: 0 0 24px 0; text-align: center; font-weight: 500;">
          ${data.reading}
        </p>
      `;
    }

    if (data.subtitle) {
      html += `
        <p style="font-size: 18px; color: #9333ea; margin: 0 0 24px 0; text-align: center; font-style: italic;">
          ${data.subtitle}
        </p>
      `;
    }

    // Texte principal
    if (data.text) {
      html += `
        <div style="background: #f3e8ff; padding: 24px; margin-bottom: 24px; border-left: 5px solid #7c3aed; border-radius: 4px;">
          <p style="font-size: 18px; line-height: 1.7; color: #3730a3; font-style: italic; margin: 0;">
            "${data.text}"
          </p>
        </div>
      `;
    }

    // Méditation
    if (data.meditation) {
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #6b21a8; margin: 0 0 12px 0;">💭 Méditation</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4c1d95; margin: 0;">
            ${data.meditation}
          </p>
        </div>
      `;
    }

    // Prière
    if (data.prayer) {
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #6b21a8; margin: 0 0 12px 0;">🙏 Prière</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #5b21b6; font-style: italic; margin: 0;">
            ${data.prayer}
          </p>
        </div>
      `;
    }

    // Adoration
    if (data.adoration) {
      html += `
        <div style="text-align: center; margin: 24px 0; padding: 16px; background: #faf5ff; border-radius: 4px; line-height: 2;">
          <p style="font-size: 14px; font-style: italic; color: #6b21a8; margin: 0;">
            ${data.adoration.split('\n').join('<br/>')}
          </p>
        </div>
      `;
    }

    // Pied de page sur UNE SEULE LIGNE
    html += `
      <div style="margin-top: 32px; padding-top: 20px; border-top: 2px solid #e5d4ff; display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: nowrap;">
        <img src="/logo-3v.png" alt="Logo 3V" style="height: 24px; flex-shrink: 0;">
        <span style="font-weight: 600; color: #581c87; font-size: 14px; flex-shrink: 0;">VOIE, VÉRITÉ, VIE</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff0000" style="flex-shrink: 0;">
          <path d="M19.615 3.175c-3.673-3.059-9.158-3.059-12.831 0-3.673 3.059-3.673 8.017 0 11.076 1.836 1.529 4.261 2.529 6.916 2.529 2.655 0 5.08-1 6.916-2.529 3.672-3.059 3.672-8.017-.001-11.076zm-2.39 14.868c-1.225.703-2.665 1.109-4.202 1.109-1.537 0-2.977-.406-4.202-1.109-2.44-1.403-4.085-3.84-4.085-6.701 0-4.368 3.529-7.906 7.887-7.906 4.358 0 7.887 3.538 7.887 7.906 0 2.861-1.645 5.298-4.285 6.701z"/>
        </svg>
        <a href="https://voie-verite-vie.netlify.app" style="color: #6b7280; font-size: 13px; text-decoration: none; white-space: nowrap;">voie-verite-vie.netlify.app</a>
      </div>
    `;

    container.innerHTML = html;
    document.body.appendChild(container);

    // Générer l'image avec haute qualité
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: 1080,
      windowHeight: 1920,
    });

    document.body.removeChild(container);

    // Convertir en blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.95);
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    return null;
  }
};

/**
 * Partage l'image via Web Share API ou copie dans le presse-papiers
 */
export const shareImage = async (blob: Blob, title: string): Promise<boolean> => {
  try {
    const file = new File([blob], `${title.replace(/\s+/g, '-')}.png`, {
      type: 'image/png',
    });

    // Vérifier si Web Share API est disponible (principalement sur mobile)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: '✝️ Voie, Vérité, Vie',
        });
        return true;
      } catch (shareError) {
        if ((shareError as Error).name !== 'AbortError') {
          console.error('Erreur partage:', shareError);
        }
        return false;
      }
    } else {
      // Fallback desktop: copier dans le presse-papiers
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        alert('✅ Image copiée! Collez-la directement sur WhatsApp, Instagram, Telegram, etc.');
        return true;
      } catch (clipboardError) {
        console.error('Erreur copie:', clipboardError);
        alert('❌ Impossible de copier. Veuillez réessayer.');
        return false;
      }
    }
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    alert('Erreur: impossible de générer l\'image');
    return false;
  }
};
