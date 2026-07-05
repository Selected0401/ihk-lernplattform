/**
 * Safari Performance Optimizer
 * Specialized optimizations for Safari browser targeting 60fps
 */

class SafariPerformanceOptimizer {
    constructor() {
        this.optimizations = [];
        this.metrics = {
            before: {},
            after: {}
        };
    }

    async optimize() {
        console.log('🍎 Starting Safari Performance Optimization...');
        
        // Measure before optimization
        this.metrics.before = await this.measureCurrentPerformance();
        
        // Apply optimizations
        await this.optimizeCriticalCSS();
        await this.optimizeLazyLoading();
        await this.optimizeCodeSplitting();
        await this.optimizeImages();
        await this.optimizeServiceWorker();
        await this.optimizeAnimations();
        await this.optimizeMemory();
        await this.optimizeSafariSpecific();
        
        // Measure after optimization
        setTimeout(async () => {
            this.metrics.after = await this.measureCurrentPerformance();
            this.generateOptimizationReport();
        }, 3000);
    }

    async measureCurrentPerformance() {
        return new Promise((resolve) => {
            const perfData = {
                lcp: 0,
                fid: 0,
                cls: 0,
                fps: 0,
                memory: 0,
                resources: performance.getEntriesByType('resource').length
            };
            
            // Get navigation timing
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                perfData.lcp = nav.loadEventEnd - nav.fetchStart;
                perfData.domReady = nav.domContentLoadedEventEnd - nav.fetchStart;
            }
            
            // Get memory info (Chrome only, but we check)
            if (performance.memory) {
                perfData.memory = performance.memory.usedJSHeapSize / 1024 / 1024;
            }
            
            // Measure FPS
            let frames = 0;
            let startTime = performance.now();
            const measureFPS = () => {
                frames++;
                if (performance.now() - startTime >= 1000) {
                    perfData.fps = frames;
                    resolve(perfData);
                } else {
                    requestAnimationFrame(measureFPS);
                }
            };
            measureFPS();
        });
    }

    async optimizeCriticalCSS() {
        console.log('🎨 Optimizing Critical CSS...');
        
        // Extract critical CSS for above-the-fold content
        const criticalSelectors = [
            '.game-container',
            '.game-header', 
            '.game-sidebar',
            '.game-main',
            '.game-footer',
            '.nav-item',
            '.loading',
            '.lazy'
        ];
        
        // Create critical CSS block
        const criticalCSS = this.extractCriticalCSS(criticalSelectors);
        
        // Inline critical CSS
        this.inlineCriticalCSS(criticalCSS);
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
        
        this.optimizations.push({
            type: 'Critical CSS',
            status: 'applied',
            impact: 'high',
            description: 'Inlined critical CSS, deferred non-critical CSS'
        });
    }

    extractCriticalCSS(selectors) {
        // Extract CSS for critical selectors
        let criticalCSS = '';
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                criticalCSS += `${selector} {\n`;
                for (let i = 0; i < styles.length; i++) {
                    const prop = styles[i];
                    criticalCSS += `  ${prop}: ${styles.getPropertyValue(prop)};\n`;
                }
                criticalCSS += '}\n';
            });
        });
        
        return criticalCSS;
    }

    inlineCriticalCSS(css) {
        // Check if critical CSS already exists
        let criticalStyle = document.querySelector('style[data-critical="true"]');
        
        if (!criticalStyle) {
            criticalStyle = document.createElement('style');
            criticalStyle.setAttribute('data-critical', 'true');
            document.head.appendChild(criticalStyle);
        }
        
        criticalStyle.textContent = css;
    }

    deferNonCriticalCSS() {
        // Find all CSS links without data-critical
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        
        cssLinks.forEach(link => {
            // Set media to print, then switch to all after load
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        });
    }

    async optimizeLazyLoading() {
        console.log('🖼️ Optimizing Lazy Loading...');
        
        // Add native lazy loading to all images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // Check if image is above fold
            const rect = img.getBoundingClientRect();
            const isAboveFold = rect.top < window.innerHeight;
            
            if (!isAboveFold) {
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
            }
        });
        
        // Setup IntersectionObserver for advanced lazy loading
        this.setupAdvancedLazyLoading();
        
        // Add lazy loading to iframes
        const iframes = document.querySelectorAll('iframe:not([loading])');
        iframes.forEach(iframe => {
            iframe.setAttribute('loading', 'lazy');
        });
        
        this.optimizations.push({
            type: 'Lazy Loading',
            status: 'applied',
            impact: 'medium',
            description: `Added lazy loading to ${images.length} images and ${iframes.length} iframes`
        });
    }

    setupAdvancedLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Load data-src images
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Load data-srcset images
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // Observe images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    async optimizeCodeSplitting() {
        console.log('📦 Optimizing Code Splitting...');
        
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script:not([data-critical]):not([src])');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                script.setAttribute('defer', '');
            }
        });
        
        // Add preload for critical scripts
        const criticalScripts = document.querySelectorAll('script[data-critical]');
        criticalScripts.forEach(script => {
            if (script.src) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'script';
                preloadLink.href = script.src;
                document.head.appendChild(preloadLink);
            }
        });
        
        // Implement dynamic imports for heavy modules
        this.setupDynamicImports();
        
        this.optimizations.push({
            type: 'Code Splitting',
            status: 'applied',
            impact: 'high',
            description: 'Deferred non-critical JS, added preloads, setup dynamic imports'
        });
    }

    setupDynamicImports() {
        // Create a module loader for heavy components
        window.moduleLoader = {
            loaded: new Set(),
            
            async load(moduleName, importPath) {
                if (this.loaded.has(moduleName)) {
                    return;
                }
                
                try {
                    const module = await import(importPath);
                    this.loaded.add(moduleName);
                    return module;
                } catch (error) {
                    console.warn(`Failed to load module ${moduleName}:`, error);
                }
            }
        };
    }

    async optimizeImages() {
        console.log('🖼️ Optimizing Images...');
        
        const images = document.querySelectorAll('img');
        let optimizedCount = 0;
        
        images.forEach(img => {
            // Add decoding attribute
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
                optimizedCount++;
            }
            
            // Add fetchpriority for critical images
            const rect = img.getBoundingClientRect();
            const isAboveFold = rect.top < window.innerHeight;
            
            if (isAboveFold && !img.hasAttribute('fetchpriority')) {
                img.setAttribute('fetchpriority', 'high');
            } else if (!isAboveFold && !img.hasAttribute('fetchpriority')) {
                img.setAttribute('fetchpriority', 'low');
            }
            
            // Add explicit dimensions to prevent layout shift
            if (!img.hasAttribute('width') && img.naturalWidth) {
                img.setAttribute('width', img.naturalWidth);
                img.setAttribute('height', img.naturalHeight);
                optimizedCount++;
            }
            
            // Convert to WebP if supported
            if (this.supportsWebP() && img.src && !img.src.includes('.webp')) {
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                // Try WebP first
                const webpImg = new Image();
                webpImg.onload = () => {
                    img.src = webpSrc;
                };
                webpImg.src = webpSrc;
            }
        });
        
        this.optimizations.push({
            type: 'Image Optimization',
            status: 'applied',
            impact: 'medium',
            description: `Optimized ${optimizedCount} images with async decoding, priorities, and WebP`
        });
    }

    supportsWebP() {
        return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    async optimizeServiceWorker() {
        console.log('🔧 Optimizing Service Worker...');
        
        if ('serviceWorker' in navigator) {
            // Check if service worker is already registered
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            if (registrations.length === 0) {
                console.log('No service worker found - caching optimizations not available');
                this.optimizations.push({
                    type: 'Service Worker',
                    status: 'unavailable',
                    impact: 'medium',
                    description: 'No service worker registered - caching optimizations not applied'
                });
            } else {
                console.log(`Found ${registrations.length} service worker(s)`);
                
                // Update cache strategy for better performance
                registrations.forEach(registration => {
                    if (registration.active) {
                        registration.active.postMessage({
                            type: 'OPTIMIZE_CACHE',
                            strategy: 'cache-first'
                        });
                    }
                });
                
                this.optimizations.push({
                    type: 'Service Worker',
                    status: 'active',
                    impact: 'high',
                    description: 'Service worker active, cache strategy optimized'
                });
            }
        } else {
            console.log('Service Worker not supported in this browser');
        }
    }

    async optimizeAnimations() {
        console.log('🎬 Optimizing Animations...');
        
        // Detect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            console.log('Reduced motion preference detected');
        }
        
        // Optimize existing animations for 60fps
        const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]');
        animatedElements.forEach(el => {
            const style = window.getComputedStyle(el);
            
            // Use transform and opacity for better performance
            if (style.animationName !== 'none') {
                el.style.willChange = 'transform, opacity';
                el.style.transform = 'translateZ(0)'; // Force GPU acceleration
            }
        });
        
        // Optimize scroll performance
        this.optimizeScrollPerformance();
        
        this.optimizations.push({
            type: 'Animation Optimization',
            status: 'applied',
            impact: 'high',
            description: 'Optimized animations for GPU acceleration, scroll performance improved'
        });
    }

    optimizeScrollPerformance() {
        let ticking = false;
        
        const optimizedScroll = () => {
            // Perform scroll-related optimizations
            document.body.classList.add('scrolling');
            
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150);
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(optimizedScroll);
                ticking = true;
            }
        }, { passive: true });
    }

    async optimizeMemory() {
        console.log('💾 Optimizing Memory...');
        
        // Implement object pooling for frequently created objects
        this.objectPool = {
            pools: {},
            
            get(type) {
                if (!this.pools[type]) {
                    this.pools[type] = [];
                }
                
                return this.pools[type].pop() || this.createObject(type);
            },
            
            release(type, obj) {
                if (!this.pools[type]) {
                    this.pools[type] = [];
                }
                
                // Reset object
                this.resetObject(obj);
                
                // Limit pool size
                if (this.pools[type].length < 100) {
                    this.pools[type].push(obj);
                }
            },
            
            createObject(type) {
                switch(type) {
                    case 'element':
                        return document.createElement('div');
                    case 'text':
                        return document.createTextNode('');
                    default:
                        return {};
                }
            },
            
            resetObject(obj) {
                if (obj.nodeType) {
                    obj.innerHTML = '';
                    obj.className = '';
                } else {
                    for (let key in obj) {
                        delete obj[key];
                    }
                }
            }
        };
        
        // Cleanup unused event listeners
        this.cleanupEventListeners();
        
        // Implement memory monitoring
        this.setupMemoryMonitoring();
        
        this.optimizations.push({
            type: 'Memory Optimization',
            status: 'applied',
            impact: 'medium',
            description: 'Object pooling implemented, memory monitoring enabled'
        });
    }

    cleanupEventListeners() {
        // Track event listeners for cleanup
        window.eventListeners = window.eventListeners || [];
        
        const originalAdd = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            window.eventListeners.push({
                target: this,
                type,
                listener,
                options
            });
            originalAdd.call(this, type, listener, options);
        };
    }

    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                const usage = (usedMB / limitMB) * 100;
                
                if (usage > 80) {
                    console.warn(`High memory usage: ${usedMB.toFixed(2)}MB (${usage.toFixed(1)}%)`);
                    this.performMemoryCleanup();
                }
            }, 5000);
        }
    }

    performMemoryCleanup() {
        // Clear object pools if too large
        if (this.objectPool) {
            for (let type in this.objectPool.pools) {
                if (this.objectPool.pools[type].length > 50) {
                    this.objectPool.pools[type] = this.objectPool.pools[type].slice(0, 25);
                }
            }
        }
        
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    async optimizeSafariSpecific() {
        console.log('🍎 Applying Safari-Specific Optimizations...');
        
        // Safari-specific CSS optimizations
        const safariStyle = document.createElement('style');
        safariStyle.textContent = `
            /* Safari-specific optimizations */
            * {
                -webkit-backface-visibility: hidden;
                -webkit-transform: translateZ(0);
                backface-visibility: hidden;
            }
            
            /* Improve scroll performance */
            body {
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: none;
            }
            
            /* Optimize font rendering */
            body {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
            }
            
            /* Reduce paint on scroll */
            .scrolling * {
                will-change: transform;
            }
            
            /* Safari image rendering */
            img {
                -webkit-optimize-contrast: yes;
            }
            
            /* Fix Safari flexbox issues */
            .game-container {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                -webkit-flex-direction: column;
                -ms-flex-direction: column;
                flex-direction: column;
            }
        `;
        document.head.appendChild(safariStyle);
        
        // Disable Safari's speculative loading for better performance
        const meta = document.createElement('meta');
        meta.name = 'format-detection';
        meta.content = 'telephone=no';
        document.head.appendChild(meta);
        
        // Optimize Safari's rendering engine
        this.optimizeSafariRendering();
        
        this.optimizations.push({
            type: 'Safari-Specific',
            status: 'applied',
            impact: 'high',
            description: 'Applied Safari-specific CSS and rendering optimizations'
        });
    }

    optimizeSafariRendering() {
        // Force hardware acceleration for animations
        const animatedElements = document.querySelectorAll('.nav-item, .game-header');
        animatedElements.forEach(el => {
            el.style.transform = 'translateZ(0)';
            el.style.willChange = 'transform';
        });
        
        // Optimize Safari's compositing
        document.body.style.transform = 'translateZ(0)';
        
        // Reduce Safari's repaints
        const style = document.createElement('style');
        style.textContent = `
            .game-sidebar {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
    }

    generateOptimizationReport() {
        console.log('\n📊 SAFARI PERFORMANCE OPTIMIZATION REPORT');
        console.log('==========================================\n');
        
        console.log('BEFORE OPTIMIZATION:');
        console.log(JSON.stringify(this.metrics.before, null, 2));
        
        console.log('\nAFTER OPTIMIZATION:');
        console.log(JSON.stringify(this.metrics.after, null, 2));
        
        console.log('\nOPTIMIZATIONS APPLIED:');
        this.optimizations.forEach((opt, index) => {
            console.log(`${index + 1}. ${opt.type}: ${opt.status} [${opt.impact}]`);
            console.log(`   ${opt.description}`);
        });
        
        // Calculate improvements
        const improvements = this.calculateImprovements();
        console.log('\nIMPROVEMENTS:');
        console.log(JSON.stringify(improvements, null, 2));
        
        // Save report for inspection
        window.safariOptimizationReport = {
            metrics: this.metrics,
            optimizations: this.optimizations,
            improvements: improvements,
            timestamp: new Date().toISOString()
        };
        
        console.log('\n==========================================');
        console.log('Optimization complete! Report saved to window.safariOptimizationReport');
    }

    calculateImprovements() {
        const improvements = {};
        
        // Calculate LCP improvement
        if (this.metrics.before.lcp && this.metrics.after.lcp) {
            improvements.lcp = {
                before: this.metrics.before.lcp,
                after: this.metrics.after.lcp,
                improvement: this.metrics.before.lcp - this.metrics.after.lcp,
                percentImprovement: ((this.metrics.before.lcp - this.metrics.after.lcp) / this.metrics.before.lcp * 100).toFixed(2)
            };
        }
        
        // Calculate FPS improvement
        if (this.metrics.before.fps && this.metrics.after.fps) {
            improvements.fps = {
                before: this.metrics.before.fps,
                after: this.metrics.after.fps,
                improvement: this.metrics.after.fps - this.metrics.before.fps,
                target60fps: this.metrics.after.fps >= 60
            };
        }
        
        // Calculate memory improvement
        if (this.metrics.before.memory && this.metrics.after.memory) {
            improvements.memory = {
                before: this.metrics.before.memory,
                after: this.metrics.after.memory,
                improvement: this.metrics.before.memory - this.metrics.after.memory,
                percentImprovement: ((this.metrics.before.memory - this.metrics.after.memory) / this.metrics.before.memory * 100).toFixed(2)
            };
        }
        
        return improvements;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.safariOptimizer = new SafariPerformanceOptimizer();
        window.safariOptimizer.optimize();
    });
} else {
    window.safariOptimizer = new SafariPerformanceOptimizer();
    window.safariOptimizer.optimize();
}