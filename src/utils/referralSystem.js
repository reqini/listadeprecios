// Sistema de referidos con código compartible
class ReferralSystem {
  constructor() {
    this.STORAGE_KEY = 'referral_data';
    this.init();
  }

  init() {
    // Verificar si hay código de referido en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      this.saveReferral(referralCode);
      // Limpiar el parámetro de la URL sin recargar
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]ref=[^&]*/, '').replace(/^&/, '?');
      window.history.replaceState({}, '', newUrl || window.location.pathname);
    }
  }

  // Generar código de referido único para el usuario
  generateReferralCode(username) {
    // Combinar username con timestamp para crear código único
    const timestamp = Date.now().toString(36);
    const usernameHash = btoa(username).substring(0, 6).replace(/[^a-zA-Z0-9]/g, '');
    return `${usernameHash}${timestamp}`.toUpperCase();
  }

  // Obtener código de referido del usuario actual
  getUserReferralCode() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;

      const user = JSON.parse(userData);
      const username = user.username || user.email;

      if (!username) return null;

      // Obtener o generar código
      const referralData = this.getReferralData();
      if (referralData.code) {
        return referralData.code;
      }

      // Generar nuevo código
      const code = this.generateReferralCode(username);
      this.setReferralData({ code, username });
      return code;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  }

  // Guardar referencia de quién refirió
  saveReferral(referralCode) {
    try {
      const referralData = this.getReferralData();
      if (referralData.referredBy) {
        console.log('Usuario ya tiene un referidor');
        return;
      }

      referralData.referredBy = referralCode;
      referralData.referredAt = new Date().toISOString();
      this.setReferralData(referralData);

      console.log('✅ Referido guardado:', referralCode);
      
      // Aquí se podría hacer un tracking o enviar a backend
      this.trackReferral(referralCode);
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  }

  // Tracking de referidos (se puede conectar a backend)
  trackReferral(referralCode) {
    try {
      // Guardar en localStorage para análisis
      const referrals = JSON.parse(localStorage.getItem('referral_tracking') || '[]');
      referrals.push({
        code: referralCode,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });

      // Mantener solo los últimos 50
      if (referrals.length > 50) {
        referrals.shift();
      }

      localStorage.setItem('referral_tracking', JSON.stringify(referrals));
      
      // Aquí se podría hacer una llamada al backend
      // fetch('/api/referrals/track', { method: 'POST', body: JSON.stringify({ code: referralCode }) });
    } catch (error) {
      console.error('Error tracking referral:', error);
    }
  }

  // Generar link de referido
  generateReferralLink(code = null) {
    const referralCode = code || this.getUserReferralCode();
    if (!referralCode) return null;

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?ref=${referralCode}`;
  }

  // Compartir código de referido
  async shareReferralLink() {
    const code = this.getUserReferralCode();
    if (!code) {
      console.error('No se pudo generar código de referido');
      return;
    }

    const link = this.generateReferralLink(code);
    const message = `🎉 ¡Únete a Catálogo Simple usando mi código de referido!\n\n👉 ${link}\n\n✨ Accedé a todas las funcionalidades premium`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Catálogo Simple - Código de Referido',
          text: message,
          url: link,
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(link);
        alert('✅ Link copiado al portapapeles!\n\n' + link);
      }
    } catch (error) {
      // Si el usuario cancela el share, intentar copiar
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(link);
          alert('✅ Link copiado al portapapeles!\n\n' + link);
        } catch (clipboardError) {
          console.error('Error compartiendo referido:', error);
        }
      }
    }
  }

  // Obtener datos de referidos
  getReferralData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting referral data:', error);
      return {};
    }
  }

  // Guardar datos de referidos
  setReferralData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting referral data:', error);
    }
  }

  // Obtener estadísticas de referidos
  getReferralStats() {
    try {
      const referrals = JSON.parse(localStorage.getItem('referral_tracking') || '[]');
      const referralData = this.getReferralData();

      return {
        myCode: referralData.code || null,
        referredBy: referralData.referredBy || null,
        referredAt: referralData.referredAt || null,
        totalReferrals: referrals.length,
        recentReferrals: referrals.slice(-10),
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        myCode: null,
        referredBy: null,
        referredAt: null,
        totalReferrals: 0,
        recentReferrals: [],
      };
    }
  }
}

// Instancia singleton
const referralSystem = new ReferralSystem();

export default referralSystem;
