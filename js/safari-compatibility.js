/**
 * Safari Compatibility Module
 * Handles Safari-specific issues and provides fallbacks
 */

const SafariCompatibility = {
  isSafari: false,
  isIOS: false,
  version: 0,
  
  init() {
    this.detectSafari();
    this.applyFixes();
    this.logCompatibilityInfo();
  },
  
  detectSafari() {
    const ua = navigator.userAgent;
    this.isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    this.isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Extract Safari version
    const match = ua.match(/Version\/(\d+\.\d+)/);
    if (match) {
      this.version = parseFloat(match[1]);
    }
  },
  
  applyFixes() {
    if (this.isSafari) {
      document.documentElement.classList.add('safari');
      
      if (this.isIOS) {
        document.documentElement.classList.add('ios');
        this.applyIOSFixes();
      } else {
        document.documentElement.classList.add('safari-desktop');
        this.applySafariDesktopFixes();
      }
    }
  },
  
  applyIOSFixes() {
    // Fix safe area insets for iPhone X+
    this.addSafeAreaSupport();
    
    // Fix touch scrolling
    this.fixTouchScrolling();
    
    // Fix localStorage quota issues
    this.fixLocalStorageQuota();
    
    // Fix viewport height issues
    this.fixViewportHeight();
  },
  
  applySafariDesktopFixes() {
    // Fix localStorage quota issues
    this.fixLocalStorageQuota();
    
    // Fix Service Worker issues
    this.fixServiceWorkerIssues();
  },
  
  addSafeAreaSupport() {
    // Add CSS variables for safe area insets
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
      }
      
      .ios .sidebar {
        padding-top: var(--safe-area-inset-top);
        padding-bottom: var(--safe-area-inset-bottom);
      }
      
      .ios .main-content {
        padding-left: var(--safe-area-inset-left);
        padding-right: var(--safe-area-inset-right);
      }
    `;
    document.head.appendChild(style);
  },
  
  fixTouchScrolling() {
    // Enable momentum scrolling
    const style = document.createElement('style');
    style.textContent = `
      .ios .main-content {
        -webkit-overflow-scrolling: touch;
        overflow-y: auto;
      }
      
      .ios .sidebar {
        -webkit-overflow-scrolling: touch;
        overflow-y: auto;
      }
    `;
    document.head.appendChild(style);
  },
  
  fixLocalStorageQuota() {
    // Wrap localStorage.setItem with quota handling
    const originalSetItem = Storage.prototype.setItem;
    
    Storage.prototype.setItem = function(key, value) {
      try {
        originalSetItem.call(this, key, value);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded - cleaning up');
          SafariCompatibility.cleanupLocalStorage();
          try {
            originalSetItem.call(this, key, value);
          } catch (retryError) {
            console.error('Still cannot store after cleanup:', retryError);
            // Fallback to sessionStorage
            try {
              sessionStorage.setItem(key, value);
              console.info('Stored in sessionStorage as fallback');
            } catch (sessionError) {
              console.error('sessionStorage also full:', sessionError);
            }
          }
        } else {
          throw e;
        }
      }
    };
  },
  
  cleanupLocalStorage() {
    // Remove old or non-essential data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Remove cached data older than 7 days
      if (key.startsWith('cache_')) {
        const timestamp = parseInt(key.split('_')[1]);
        if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleaned up ${keysToRemove.length} old localStorage entries`);
  },
  
  fixViewportHeight() {
    // Fix 100vh issues on iOS (address bar)
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
  },
  
  fixServiceWorkerIssues() {
    // Safari doesn't support Background Sync or Push
    if (!('sync' in ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync not supported - using polling fallback');
      this.setupSyncFallback();
    }
    
    if (!('PushManager' in window)) {
      console.warn('Push Notifications not supported - using in-app notifications');
    }
  },
  
  setupSyncFallback() {
    // Poll for offline data sync every 30 seconds
    setInterval(() => {
      if (navigator.onLine) {
        this.syncOfflineData();
      }
    }, 30000);
    
    // Also sync when coming back online
    window.addEventListener('online', () => {
      this.syncOfflineData();
    });
  },
  
  async syncOfflineData() {
    try {
      const offlineActions = localStorage.getItem('offlineActions');
      if (offlineActions) {
        const actions = JSON.parse(offlineActions);
        console.log(`Syncing ${actions.length} offline actions`);
        
        for (const action of actions) {
          try {
            await fetch(action.url, {
              method: action.method,
              headers: action.headers,
              body: action.body
            });
            console.log(`Synced action: ${action.type}`);
          } catch (e) {
            console.error(`Failed to sync action: ${action.type}`, e);
          }
        }
        
        localStorage.removeItem('offlineActions');
      }
    } catch (e) {
      console.error('Sync failed:', e);
    }
  },
  
  logCompatibilityInfo() {
    console.log('🍎 Safari Compatibility Info:');
    console.log(`  Safari: ${this.isSafari}`);
    console.log(`  iOS: ${this.isIOS}`);
    console.log(`  Version: ${this.version || 'Unknown'}`);
    console.log(`  Service Worker: ${'serviceWorker' in navigator ? '✅' : '❌'}`);
    console.log(`  Background Sync: ${'sync' in ServiceWorkerRegistration.prototype ? '✅' : '❌'}`);
    console.log(`  Push: ${'PushManager' in window ? '✅' : '❌'}`);
    console.log(`  IntersectionObserver: ${'IntersectionObserver' in window ? '✅' : '❌'}`);
    console.log(`  CSS Grid: ${CSS.supports('display', 'grid') ? '✅' : '❌'}`);
    console.log(`  Flexbox: ${CSS.supports('display', 'flex') ? '✅' : '❌'}`);
  },
  
  // Feature detection utilities
  supports(feature) {
    const features = {
      serviceWorker: () => 'serviceWorker' in navigator,
      backgroundSync: () => 'sync' in ServiceWorkerRegistration.prototype,
      push: () => 'PushManager' in window,
      intersectionObserver: () => 'IntersectionObserver' in window,
      cssGrid: () => CSS.supports('display', 'grid'),
      flexbox: () => CSS.supports('display', 'flex'),
      localStorage: () => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      },
      indexedDB: () => 'indexedDB' in window
    };
    
    return features[feature] ? features[feature]() : false;
  },
  
  // Get unsupported features
  getUnsupportedFeatures() {
    const requiredFeatures = [
      'serviceWorker',
      'localStorage',
      'cssGrid',
      'flexbox'
    ];
    
    return requiredFeatures.filter(feature => !this.supports(feature));
  },
  
  // Check if browser meets minimum requirements
  meetsRequirements() {
    const unsupported = this.getUnsupportedFeatures();
    if (unsupported.length > 0) {
      console.error(`Missing required features: ${unsupported.join(', ')}`);
      return false;
    }
    return true;
  }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SafariCompatibility.init());
} else {
  SafariCompatibility.init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SafariCompatibility;
}