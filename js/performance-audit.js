/**
 * Performance Audit Script
 * Measures Core Web Vitals and identifies performance issues
 */

class PerformanceAudit {
    constructor() {
        this.metrics = {};
        this.issues = [];
        this.recommendations = [];
    }

    async runAudit() {
        console.log('🔍 Starting Performance Audit...');
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.measureCoreWebVitals();
        this.analyzeResources();
        this.checkLazyLoading();
        this.analyzeCodeSplitting();
        this.checkServiceWorker();
        this.measureFrameRate();
        this.generateReport();
    }

    measureCoreWebVitals() {
        console.log('📊 Measuring Core Web Vitals...');
        
        // LCP - Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
            this.checkLCP(this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID - First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.metrics.fid = entry.processingStart - entry.startTime;
                this.checkFID(this.metrics.fid);
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.metrics.cls = clsValue;
                    this.checkCLS(clsValue);
                }
            });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // FCP - First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
                this.metrics.fcp = entries[0].startTime;
                this.checkFCP(this.metrics.fcp);
            }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        
        // TTI - Time to Interactive (approximation)
        setTimeout(() => {
            const perfEntries = performance.getEntriesByType('navigation');
            if (perfEntries.length > 0) {
                const navEntry = perfEntries[0];
                this.metrics.tti = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
                this.checkTTI(this.metrics.tti);
            }
        }, 3000);
    }

    checkLCP(lcp) {
        const status = lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor';
        console.log(`LCP: ${lcp.toFixed(0)}ms [${status}]`);
        
        if (status !== 'good') {
            this.issues.push({
                metric: 'LCP',
                value: lcp,
                status: status,
                message: 'Largest Contentful Paint too slow',
                impact: 'high'
            });
            this.recommendations.push({
                metric: 'LCP',
                action: 'Optimize LCP',
                suggestions: [
                    'Remove render-blocking resources',
                    'Optimize images (WebP, lazy loading)',
                    'Implement critical CSS',
                    'Reduce server response time',
                    'Use CDN for static assets'
                ]
            });
        }
    }

    checkFID(fid) {
        const status = fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor';
        console.log(`FID: ${fid.toFixed(0)}ms [${status}]`);
        
        if (status !== 'good') {
            this.issues.push({
                metric: 'FID',
                value: fid,
                status: status,
                message: 'First Input Delay too slow',
                impact: 'high'
            });
            this.recommendations.push({
                metric: 'FID',
                action: 'Optimize FID',
                suggestions: [
                    'Reduce JavaScript execution time',
                    'Code splitting and lazy loading',
                    'Remove unused JavaScript',
                    'Use Web Workers for heavy tasks',
                    'Minimize main thread work'
                ]
            });
        }
    }

    checkCLS(cls) {
        const status = cls < 0.1 ? 'good' : cls < 0.25 ? 'needs-improvement' : 'poor';
        console.log(`CLS: ${cls.toFixed(3)} [${status}]`);
        
        if (status !== 'good') {
            this.issues.push({
                metric: 'CLS',
                value: cls,
                status: status,
                message: 'Cumulative Layout Shift too high',
                impact: 'medium'
            });
            this.recommendations.push({
                metric: 'CLS',
                action: 'Fix Layout Shift',
                suggestions: [
                    'Reserve space for images and ads',
                    'Avoid inserting content above existing content',
                    'Use transform animations instead of top/left',
                    'Set explicit dimensions for media elements',
                    'Load fonts with font-display: swap'
                ]
            });
        }
    }

    checkFCP(fcp) {
        const status = fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor';
        console.log(`FCP: ${fcp.toFixed(0)}ms [${status}]`);
        
        if (status !== 'good') {
            this.issues.push({
                metric: 'FCP',
                value: fcp,
                status: status,
                message: 'First Contentful Paint too slow',
                impact: 'high'
            });
        }
    }

    checkTTI(tti) {
        const status = tti < 3500 ? 'good' : tti < 5000 ? 'needs-improvement' : 'poor';
        console.log(`TTI: ${tti.toFixed(0)}ms [${status}]`);
        
        if (status !== 'good') {
            this.issues.push({
                metric: 'TTI',
                value: tti,
                status: status,
                message: 'Time to Interactive too slow',
                impact: 'high'
            });
        }
    }

    analyzeResources() {
        console.log('📦 Analyzing Resources...');
        
        const resources = performance.getEntriesByType('resource');
        const resourceTypes = {};
        let totalSize = 0;
        
        resources.forEach(resource => {
            const type = resource.initiatorType;
            resourceTypes[type] = (resourceTypes[type] || 0) + 1;
            totalSize += resource.transferSize || 0;
        });
        
        this.metrics.resources = {
            total: resources.length,
            byType: resourceTypes,
            totalSize: totalSize
        };
        
        console.log('Resources:', resourceTypes);
        console.log('Total size:', (totalSize / 1024).toFixed(2), 'KB');
        
        // Check for large resources
        resources.forEach(resource => {
            const size = resource.transferSize || 0;
            if (size > 100 * 1024) { // > 100KB
                this.issues.push({
                    metric: 'Resource',
                    value: size,
                    status: 'warning',
                    message: `Large resource: ${resource.name} (${(size/1024).toFixed(2)}KB)`,
                    impact: 'medium'
                });
            }
        });
    }

    checkLazyLoading() {
        console.log('🖼️ Checking Lazy Loading...');
        
        const images = document.querySelectorAll('img');
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const dataSrcImages = document.querySelectorAll('img[data-src]');
        
        this.metrics.images = {
            total: images.length,
            lazy: lazyImages.length,
            dataSrc: dataSrcImages.length
        };
        
        console.log(`Images: ${images.length}, Lazy: ${lazyImages.length}, data-src: ${dataSrcImages.length}`);
        
        if (images.length > 0 && lazyImages.length === 0 && dataSrcImages.length === 0) {
            this.issues.push({
                metric: 'Lazy Loading',
                value: 0,
                status: 'warning',
                message: 'No lazy loading implemented for images',
                impact: 'medium'
            });
            this.recommendations.push({
                metric: 'Lazy Loading',
                action: 'Implement Lazy Loading',
                suggestions: [
                    'Add loading="lazy" attribute to below-fold images',
                    'Use Intersection Observer for custom lazy loading',
                    'Implement responsive images with srcset',
                    'Use WebP format with fallbacks'
                ]
            });
        }
    }

    analyzeCodeSplitting() {
        console.log('📜 Analyzing Code Splitting...');
        
        const scripts = performance.getEntriesByType('resource')
            .filter(r => r.initiatorType === 'script');
        
        const totalScriptSize = scripts.reduce((sum, s) => sum + (s.transferSize || 0), 0);
        
        this.metrics.scripts = {
            count: scripts.length,
            totalSize: totalScriptSize
        };
        
        console.log(`Scripts: ${scripts.length}, Total size: ${(totalScriptSize/1024).toFixed(2)}KB`);
        
        if (totalScriptSize > 150 * 1024) { // > 150KB
            this.issues.push({
                metric: 'JavaScript Bundle',
                value: totalScriptSize,
                status: 'warning',
                message: `JavaScript bundle too large: ${(totalScriptSize/1024).toFixed(2)}KB`,
                impact: 'high'
            });
            this.recommendations.push({
                metric: 'Code Splitting',
                action: 'Implement Code Splitting',
                suggestions: [
                    'Use dynamic imports for route-based splitting',
                    'Split vendor bundles from application code',
                    'Tree-shake unused code',
                    'Minify and compress JavaScript',
                    'Use code splitting libraries (Webpack, Rollup)'
                ]
            });
        }
    }

    checkServiceWorker() {
        console.log('🔧 Checking Service Worker...');
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                this.metrics.serviceWorker = {
                    registered: registrations.length > 0,
                    count: registrations.length
                };
                
                console.log(`Service Workers: ${registrations.length}`);
                
                if (registrations.length === 0) {
                    this.issues.push({
                        metric: 'Service Worker',
                        value: 0,
                        status: 'warning',
                        message: 'No service worker registered',
                        impact: 'medium'
                    });
                    this.recommendations.push({
                        metric: 'Service Worker',
                        action: 'Implement Service Worker',
                        suggestions: [
                            'Register service worker for offline support',
                            'Implement cache-first strategy for static assets',
                            'Add background sync for offline data',
                            'Cache API responses for faster loading'
                        ]
                    });
                }
            });
        } else {
            console.log('Service Worker not supported');
        }
    }

    measureFrameRate() {
        console.log('🎮 Measuring Frame Rate...');
        
        let fps = 0;
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                this.metrics.fps = fps;
                console.log(`FPS: ${fps}`);
                
                if (fps < 55) {
                    this.issues.push({
                        metric: 'FPS',
                        value: fps,
                        status: 'warning',
                        message: `Frame rate below target: ${fps}fps (target: 60fps)`,
                        impact: 'high'
                    });
                    this.recommendations.push({
                        metric: 'FPS',
                        action: 'Optimize Frame Rate',
                        suggestions: [
                            'Reduce JavaScript execution time',
                            'Use CSS transforms instead of layout changes',
                            'Implement object pooling for frequent objects',
                            'Use requestAnimationFrame for animations',
                            'Reduce DOM manipulations'
                        ]
                    });
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    generateReport() {
        setTimeout(() => {
            console.log('\n📋 PERFORMANCE AUDIT REPORT');
            console.log('================================\n');
            
            console.log('METRICS:');
            console.log(JSON.stringify(this.metrics, null, 2));
            
            console.log('\nISSUES:');
            if (this.issues.length === 0) {
                console.log('✅ No issues found!');
            } else {
                this.issues.forEach((issue, index) => {
                    console.log(`${index + 1}. [${issue.status.toUpperCase()}] ${issue.message}`);
                    console.log(`   Impact: ${issue.impact}, Value: ${typeof issue.value === 'number' ? (issue.value/1024).toFixed(2) + 'KB' : issue.value}`);
                });
            }
            
            console.log('\nRECOMMENDATIONS:');
            this.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.action}:`);
                rec.suggestions.forEach(suggestion => {
                    console.log(`   - ${suggestion}`);
                });
            });
            
            console.log('\n================================');
            console.log('Audit complete!');
            
            // Save report to window for inspection
            window.performanceAuditReport = {
                metrics: this.metrics,
                issues: this.issues,
                recommendations: this.recommendations,
                timestamp: new Date().toISOString()
            };
        }, 5000);
    }
}

// Run audit when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceAudit = new PerformanceAudit();
        window.performanceAudit.runAudit();
    });
} else {
    window.performanceAudit = new PerformanceAudit();
    window.performanceAudit.runAudit();
}