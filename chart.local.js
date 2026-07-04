/* Chart.js Local Backup - Minimal version for offline use */
window.Chart = function(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.data = config.data || {};
    this.options = config.options || {};
    
    this.render = function() {
        // Simple fallback - just log that chart would be rendered
        console.log('Chart.js would render here:', config);
    };
    
    this.update = function() {
        console.log('Chart.js update called');
    };
    
    this.destroy = function() {
        console.log('Chart.js destroy called');
    };
};

Chart.defaults = {
    global: {},
    scale: {},
    plugins: {}
};

// Register chart types
Chart.register = function() {};
Chart.plugins = [];