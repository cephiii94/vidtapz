// vidtapz-plugin-manager.js
class VidtapzPluginManager {
    constructor() {
        this.plugins = [];
        this.hooks = {};
    }
    
    // Register plugin
    registerPlugin(plugin) {
        this.plugins.push(plugin);
        if (plugin.init && typeof plugin.init === 'function') {
            plugin.init();
        }
    }
    
    // Load plugin dari file
    async loadPlugin(pluginUrl) {
        try {
            const script = document.createElement('script');
            script.src = pluginUrl;
            script.onload = () => {
                console.log(`Plugin loaded: ${pluginUrl}`);
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error loading plugin:', error);
        }
    }
    
    // Hook system untuk extensibility
    addHook(hookName, callback) {
        if (!this.hooks[hookName]) {
            this.hooks[hookName] = [];
        }
        this.hooks[hookName].push(callback);
    }
    
    executeHook(hookName, data = null) {
        if (this.hooks[hookName]) {
            this.hooks[hookName].forEach(callback => {
                callback(data);
            });
        }
    }
}

// Initialize plugin manager
window.VidtapzPlugins = new VidtapzPluginManager();
