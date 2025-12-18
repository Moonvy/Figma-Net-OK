// 关闭弃用警告
process.noDeprecation = true;

// Polyfill for Node.js v12 which doesn't have global performance
if (typeof performance === 'undefined') {
    try {
        const { performance: perf } = require('perf_hooks');
        globalThis.performance = perf;
    } catch (e) {
        // Fallback if perf_hooks is not available
        globalThis.performance = {
            now: function() {
                const [sec, nsec] = process.hrtime();
                return sec * 1000 + nsec / 1000000;
            }
        };
    }
}
