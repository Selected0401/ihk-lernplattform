/**
 * Performance Suite - Maximale Performance-Optimierung
 * Core Web Vitals, Memory Management, Battery Optimization, Network Optimization
 * 
 * @author Emilia
 * @version 1.0.0
 */

class PerformanceSuite {
    constructor() {
        this.metrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
            fcp: 0,
            tti: 0,
            memory: 0,
            fps: 60,
            batteryLevel: 1.0,
            networkType: '4g'
        };
        
        this.observers = new Map();
        this.imageObserver = null;
        this.loadedImages = new Set();
        this.cleanupTasks = [];
        this.isLowPowerMode = false;
        this.isLowDataMode = false;
        
        this.maxMemory = 50 * 1024 * 1024; // 50MB
        this.performanceMode = 'high';
        
        this.initializeComponents();
    }
    
    initializeComponents() {
        this.criticalCSSGenerator = new CriticalCSSGenerator();
        this.imageOptimizer = new ImageOptimizer();
        this.memoryManager = new MemoryManager();
        this.batteryOptimizer = new BatteryOptimizer();
        this.networkOptimizer = new NetworkOptimizer();
        this.performanceMonitor = new PerformanceMonitor();
    }
    
    async initialize() {
        console.log('🚀 Performance Suite initializing...');
        
        // Critical CSS inline
        this.criticalCSSGenerator.inlineCriticalCSS();
        
        // Image Optimization
        this.imageOptimizer.setupLazyLoading();
        this.imageOptimizer.preloadCriticalImages();
        
        // Memory Management
        this.memoryManager.startMonitoring();
        
        // Battery Optimization
        await this.batteryOptimizer.initialize();
        
        // Network Optimization
        await this.networkOptimizer.initialize();
        
        // Performance Monitoring
        this.performanceMonitor.startMonitoring();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Performance Suite initialized');
        this.reportInitialMetrics();
    }
    
    setupEventListeners() {
        // Passive event listeners for better scroll performance
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        
        // Throttled scroll events
        let ticking = false;
        const updateScrollPosition = () => {
            this.optimizeScrollPerformance();
            ticking = false;
        };
        
        document.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });
        
        // Visibility change for performance adjustments
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.enableBackgroundMode();
            } else {
                this.enableForegroundMode();
            }
        });
        
        // Memory pressure
        if ('memory' in performance) {
            setInterval(() => {
                this.checkMemoryPressure();
            }, 5000);
        }
    }
    
    optimizeScrollPerformance() {
        // Reduce work during scroll
        if (this.isLowPowerMode) {
            document.body.classList.add('reduced-motion');
        }
    }
    
    enableBackgroundMode() {
        console.log('🔋 Background mode enabled');
        this.pauseAnimations();
        this.reduceUpdateFrequency();
    }
    
    enableForegroundMode() {
        console.log('⚡ Foreground mode enabled');
        this.resumeAnimations();
        this.restoreUpdateFrequency();
    }
    
    pauseAnimations() {
        document.body.style.setProperty('--animation-duration', '0s');
    }
    
    resumeAnimations() {
        const duration = this.isLowPowerMode ? '0.3s' : '0.6s';
        document.body.style.setProperty('--animation-duration', duration);
    }
    
    checkMemoryPressure() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usage = memory.usedJSHeapSize;
            
            if (usage > this.maxMemory) {
                console.warn('⚠️ Memory pressure detected, performing cleanup');
                this.performCleanup();
            }
        }
    }
    
    performCleanup() {
        // Execute cleanup tasks
        this.cleanupTasks.forEach(task => {
            try {
                task();
            } catch (error) {
                console.warn('Cleanup task failed:', error);
            }
        });
        this.cleanupTasks = [];
        
        // Clear image cache if needed
        if (this.loadedImages.size > 50) {
            const toRemove = Array.from(this.loadedImages).slice(0, 25);
            toRemove.forEach(src => this.loadedImages.delete(src));
        }
        
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
    
    addCleanupTask(task) {
        this.cleanupTasks.push(task);
    }
    
    reduceUpdateFrequency() {
        // Reduce frequency of updates in background/low power mode
        this.isLowPowerMode = true;
    }
    
    restoreUpdateFrequency() {
        // Restore normal update frequency
        this.isLowPowerMode = false;
    }
    
    reportInitialMetrics() {
        setTimeout(() => {
            console.log('📊 Initial Performance Metrics:', {
                LCP: `${this.metrics.lcp.toFixed(0)}ms`,
                FID: `${this.metrics.fid.toFixed(0)}ms`,
                CLS: this.metrics.cls.toFixed(3),
                Memory: `${(this.metrics.memory / 1024 / 1024).toFixed(1)}MB`,
                FPS: this.metrics.fps,
                Battery: `${(this.metrics.batteryLevel * 100).toFixed(0)}%`,
                Network: this.metrics.networkType
            });
        }, 3000);
    }
}

/**
 * Critical CSS Generator
 */
class CriticalCSSGenerator {
    constructor() {
        this.criticalCSS = `
            /* Critical CSS for above-the-fold content */
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .game-container { display: grid; grid-template-areas: "header header" "sidebar main" "footer footer"; grid-template-columns: 250px 1fr; grid-template-rows: 60px 1fr 40px; height: 100vh; }
            .game-header { grid-area: header; background: #d4af37; padding: 0 20px; display: flex; align-items: center; }
            .game-sidebar { grid-area: sidebar; background: #f4e4c1; padding: 20px; overflow-y: auto; }
            .game-main { grid-area: main; padding: 20px; overflow-y: auto; }
            .game-footer { grid-area: footer; background: #8b4513; color: white; padding: 10px 20px; }
            .loading { opacity: 0.6; pointer-events: none; }
            .lazy { background: #f0f0f0; transition: opacity 0.3s; }
            .lazy.loaded { opacity: 1; }
        `;
    }
    
    inlineCriticalCSS() {
        const style = document.createElement('style');
        style.textContent = this.criticalCSS;
        style.setAttribute('data-critical', 'true');
        document.head.appendChild(style);
    }
}

/**
 * Image Optimizer
 */
class ImageOptimizer {
    constructor() {
        this.imageObserver = null;
        this.loadedImages = new Set();
    }
    
    setupLazyLoading() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (!src || this.loadedImages.has(src)) return;
        
        // Try WebP first
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        img.onload = () => {
            img.classList.remove('lazy');
            img.classList.add('loaded');
            this.loadedImages.add(src);
            if (this.imageObserver) {
                this.imageObserver.unobserve(img);
            }
        };
        
        img.onerror = () => {
            // Fallback to original
            img.src = src;
        };
        
        // Try WebP first
        img.src = webpSrc;
    }
    
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('[data-critical="true"]');
        criticalImages.forEach(img => {
            if (img.dataset.src) {
                this.loadImage(img);
            }
        });
    }
}

/**
 * Memory Manager
 */
class MemoryManager {
    constructor() {
        this.memoryUsage = 0;
        this.maxMemory = 50 * 1024 * 1024;
        this.monitoringInterval = null;
    }
    
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.monitorMemoryUsage();
        }, 3000);
    }
    
    monitorMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.memoryUsage = memory.usedJSHeapSize;
            
            if (this.memoryUsage > this.maxMemory) {
                console.warn('⚠️ High memory usage detected');
                this.performCleanup();
            }
        }
    }
    
    performCleanup() {
        // Clear caches
        if (window.performanceSuite) {
            window.performanceSuite.performCleanup();
        }
        
        // Optimize object pools
        this.optimizeObjectPools();
    }
    
    optimizeObjectPools() {
        // Implementation for object pool optimization
        if (window.gameUI && window.gameUI.objectPool) {
            window.gameUI.objectPool.cleanup();
        }
    }
}

/**
 * Battery Optimizer
 */
class BatteryOptimizer {
    constructor() {
        this.batteryLevel = 1.0;
        this.isCharging = true;
        this.performanceMode = 'high';
    }
    
    async initialize() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                
                this.batteryLevel = battery.level;
                this.isCharging = battery.charging;
                
                battery.addEventListener('levelchange', () => {
                    this.batteryLevel = battery.level;
                    this.adjustPerformanceMode();
                });
                
                battery.addEventListener('chargingchange', () => {
                    this.isCharging = battery.charging;
                    this.adjustPerformanceMode();
                });
                
                this.adjustPerformanceMode();
                
            } catch (error) {
                console.warn('Battery API not available');
            }
        }
    }
    
    adjustPerformanceMode() {
        if (this.batteryLevel < 0.2 && !this.isCharging) {
            this.performanceMode = 'low';
            this.enableLowPowerMode();
        } else if (this.batteryLevel < 0.5 && !this.isCharging) {
            this.performanceMode = 'medium';
            this.enableMediumPowerMode();
        } else {
            this.performanceMode = 'high';
            this.enableHighPowerMode();
        }
        
        // Update performance suite
        if (window.performanceSuite) {
            window.performanceSuite.isLowPowerMode = this.performanceMode === 'low';
        }
    }
    
    enableLowPowerMode() {
        document.body.classList.add('low-power');
        document.body.style.setProperty('--animation-duration', '0s');
        
        // Stop background processes
        this.stopBackgroundProcesses();
        
        // Pause media content
        this.pauseMediaContent();
    }
    
    enableMediumPowerMode() {
        document.body.classList.remove('low-power');
        document.body.style.setProperty('--animation-duration', '0.3s');
        
        this.reduceUpdateFrequency();
    }
    
    enableHighPowerMode() {
        document.body.classList.remove('low-power');
        document.body.style.setProperty('--animation-duration', '0.6s');
        
        this.restoreUpdateFrequency();
    }
    
    stopBackgroundProcesses() {
        // Stop unnecessary background processes
        if (window.gameUI && window.gameUI.stopBackgroundTasks) {
            window.gameUI.stopBackgroundTasks();
        }
    }
    
    pauseMediaContent() {
        // Pause all media elements
        document.querySelectorAll('video, audio').forEach(media => {
            if (!media.paused) {
                media.pause();
            }
        });
    }
    
    reduceUpdateFrequency() {
        // Reduce update frequency for animations and timers
        if (window.gameUI && window.gameUI.reduceUpdateFrequency) {
            window.gameUI.reduceUpdateFrequency();
        }
    }
    
    restoreUpdateFrequency() {
        // Restore normal update frequency
        if (window.gameUI && window.gameUI.restoreUpdateFrequency) {
            window.gameUI.restoreUpdateFrequency();
        }
    }
}

/**
 * Network Optimizer
 */
class NetworkOptimizer {
    constructor() {
        this.connectionType = '4g';
        this.isOnline = navigator.onLine;
        this.cache = new Map();
    }
    
    async initialize() {
        // Initialize Network API
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.connectionType = connection.effectiveType;
            
            connection.addEventListener('change', () => {
                this.connectionType = connection.effectiveType;
                this.adjustNetworkStrategy();
            });
        }
        
        // Online/Offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.enableOfflineMode();
        });
        
        this.adjustNetworkStrategy();
        
        // Update performance suite
        if (window.performanceSuite) {
            window.performanceSuite.metrics.networkType = this.connectionType;
        }
    }
    
    adjustNetworkStrategy() {
        switch(this.connectionType) {
            case 'slow-2g':
            case '2g':
                this.enableLowDataMode();
                break;
            case '3g':
                this.enableMediumDataMode();
                break;
            case '4g':
            case '5g':
                this.enableHighDataMode();
                break;
        }
    }
    
    enableLowDataMode() {
        document.body.classList.add('low-data');
        this.disableMediaAutoplay();
        this.useCompressedImages();
        this.throttleAPIRequests();
        
        if (window.performanceSuite) {
            window.performanceSuite.isLowDataMode = true;
        }
    }
    
    enableMediumDataMode() {
        document.body.classList.remove('low-data');
        this.enableMediaAutoplay();
        this.useOptimizedImages();
        
        if (window.performanceSuite) {
            window.performanceSuite.isLowDataMode = false;
        }
    }
    
    enableHighDataMode() {
        document.body.classList.remove('low-data');
        this.enableMediaAutoplay();
        this.useFullQualityImages();
        
        if (window.performanceSuite) {
            window.performanceSuite.isLowDataMode = false;
        }
    }
    
    enableOfflineMode() {
        document.body.classList.add('offline');
        this.setupOfflineCache();
        this.useLocalData();
    }
    
    disableMediaAutoplay() {
        document.querySelectorAll('video[autoplay], audio[autoplay]').forEach(media => {
            media.removeAttribute('autoplay');
            media.pause();
        });
    }
    
    enableMediaAutoplay() {
        // Re-enable autoplay for high-speed connections
        document.querySelectorAll('video[data-autoplay], audio[data-autoplay]').forEach(media => {
            media.setAttribute('autoplay', '');
        });
    }
    
    useCompressedImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.dataset.src;
            if (src) {
                img.dataset.src = src.replace(/\.(jpg|jpeg|png)$/i, '.min.$1');
            }
        });
    }
    
    useOptimizedImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.dataset.src;
            if (src) {
                img.dataset.src = src.replace(/\.min\.(jpg|jpeg|png)$/i, '.$1');
            }
        });
    }
    
    useFullQualityImages() {
        // Use full quality images
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.dataset.src;
            if (src && src.includes('.min.')) {
                img.dataset.src = src.replace(/\.min\.(jpg|jpeg|png)$/i, '.$1');
            }
        });
    }
    
    throttleAPIRequests() {
        // Implement API request throttling
        if (window.gameUI && window.gameAPI) {
            window.gameAPI.setThrottleDelay(2000);
        }
    }
    
    setupOfflineCache() {
        // Service Worker will handle offline caching
        console.log('📴 Offline mode enabled');
    }
    
    useLocalData() {
        // Use local cached data
        if (window.gameUI && window.gameUI.useLocalData) {
            window.gameUI.useLocalData();
        }
    }
    
    syncOfflineData() {
        // Sync data when coming back online
        if (window.gameUI && window.gameUI.syncOfflineData) {
            window.gameUI.syncOfflineData();
        }
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
            fcp: 0,
            tti: 0,
            memory: 0,
            fps: 60
        };
        
        this.observers = new Map();
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
    }
    
    startMonitoring() {
        this.setupWebVitalsObservers();
        this.measureFrameRate();
        this.monitorMemory();
    }
    
    setupWebVitalsObservers() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                this.updatePerformanceSuite('lcp', this.metrics.lcp);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
            
            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    this.updatePerformanceSuite('fid', this.metrics.fid);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', fidObserver);
            
            // Cumulative Layout Shift
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.cls = clsValue;
                        this.updatePerformanceSuite('cls', this.metrics.cls);
                    }
                });
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        }
    }
    
    measureFrameRate() {
        const measureFPS = (currentTime) => {
            this.frameCount++;
            
            if (currentTime - this.lastFrameTime >= 1000) {
                const fps = this.frameCount;
                this.frameCount = 0;
                this.lastFrameTime = currentTime;
                
                this.metrics.fps = fps;
                this.updatePerformanceSuite('fps', fps);
                
                if (fps < 55) {
                    this.optimizeForLowFPS();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    monitorMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memory = memory.usedJSHeapSize;
                this.updatePerformanceSuite('memory', this.metrics.memory);
            }, 5000);
        }
    }
    
    updatePerformanceSuite(metric, value) {
        if (window.performanceSuite) {
            window.performanceSuite.metrics[metric] = value;
        }
    }
    
    optimizeForLowFPS() {
        console.warn('⚠️ Low FPS detected, optimizing performance');
        document.body.classList.add('reduced-motion');
        
        // Reduce animation complexity
        if (window.performanceSuite) {
            window.performanceSuite.isLowPowerMode = true;
        }
    }
}

// Initialize Performance Suite
window.performanceSuite = new PerformanceSuite();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceSuite.initialize();
    });
} else {
    window.performanceSuite.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceSuite };
}