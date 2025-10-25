// Morrowind-OwS System Settings App
class SystemSettingsApp {
    constructor() {
        this.windowId = null;
        this.window = null;
        this.isActive = false;
        this._originalOnWindowClose = null;
    }

    init() {
        // This method is called when the app is initialized
        console.log('System Settings App initialized');
    }

    open(windowId) {
        if (!windowId) {
            if (this.windowId) {
                window.windowManager.focusWindow(this.windowId);
            } else {
                console.error('System Settings App: missing windowId.');
            }
            return;
        }

        if (!window.windowManager) {
            console.error('System Settings App: window manager not available.');
            return;
        }

        this.windowId = windowId;
        this.window = window.windowManager.getWindow(windowId);

        if (!this.window) {
            console.error(`System Settings App: window ${windowId} not found.`);
            return;
        }

        if (this.isActive) {
            window.windowManager.focusWindow(this.windowId);
            return;
        }

        if (!this.initializeWindowContent()) {
            return;
        }

        this.setupEventListeners();
        this.loadSavedSettings();
        this.registerCloseHandler();

        this.isActive = true;
        window.windowManager.focusWindow(this.windowId);
    }

    initializeWindowContent() {
        const template = document.getElementById('system-settings-window');
        const contentElement = document.getElementById(`${this.windowId}-content`);

        if (!template || !contentElement) {
            console.error('System Settings App: failed to locate template or content container.');
            return false;
        }

        contentElement.innerHTML = template.innerHTML.trim();
        contentElement.scrollTop = 0;

        if (this.window && this.window.element) {
            this.window.element.classList.add('system-settings-window');
        }

        return true;
    }

    registerCloseHandler() {
        if (!this.window || !this.window.element) return;

        const handleClose = () => {
            this.isActive = false;
            this.window = null;
            this.windowId = null;

            if (this._originalOnWindowClose) {
                window.windowManager.onWindowClose = this._originalOnWindowClose;
                this._originalOnWindowClose = null;
            }
        };

        const closeButton = this.window.element.querySelector('.window-control.close');
        if (closeButton) {
            closeButton.addEventListener('click', handleClose, { once: true });
        }

        if (!this._originalOnWindowClose && window.windowManager) {
            const originalOnWindowClose = window.windowManager.onWindowClose.bind(window.windowManager);
            this._originalOnWindowClose = originalOnWindowClose;

            window.windowManager.onWindowClose = (windowId) => {
                if (windowId === this.windowId) {
                    handleClose();
                }
                originalOnWindowClose(windowId);
            };
        }
    }

    setupEventListeners() {
        const windowElement = this.window.element;
        
        // Tab switching
        const tabs = windowElement.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.getAttribute('data-tab'));
            });
        });

        // OpenAI API Key
        const saveOpenAIKeyBtn = windowElement.querySelector('#save-openai-key');
        if (saveOpenAIKeyBtn) {
            saveOpenAIKeyBtn.addEventListener('click', () => {
                this.saveOpenAIKey();
            });
        }

        const testOpenAIKeyBtn = windowElement.querySelector('#test-openai-key');
        if (testOpenAIKeyBtn) {
            testOpenAIKeyBtn.addEventListener('click', () => {
                this.testOpenAIKey();
            });
        }

        // ElevenLabs API Key
        const saveElevenLabsKeyBtn = windowElement.querySelector('#save-elevenlabs-key');
        if (saveElevenLabsKeyBtn) {
            saveElevenLabsKeyBtn.addEventListener('click', () => {
                this.saveElevenLabsKey();
            });
        }

        const testElevenLabsKeyBtn = windowElement.querySelector('#test-elevenlabs-key');
        if (testElevenLabsKeyBtn) {
            testElevenLabsKeyBtn.addEventListener('click', () => {
                this.testElevenLabsKey();
            });
        }

        // Voice IDs
        const saveVoiceIdsBtn = windowElement.querySelector('#save-voice-ids');
        if (saveVoiceIdsBtn) {
            saveVoiceIdsBtn.addEventListener('click', () => {
                this.saveVoiceIds();
            });
        }

        const testVoiceBtn = windowElement.querySelector('#test-voice');
        if (testVoiceBtn) {
            testVoiceBtn.addEventListener('click', () => {
                this.testRandomVoice();
            });
        }
    }

    switchTab(tabName) {
        const windowElement = this.window.element;
        
        // Update tab active states
        const tabs = windowElement.querySelectorAll('.tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update content visibility
        const tabContents = windowElement.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    loadSavedSettings() {
        const windowElement = this.window.element;
        
        // Load OpenAI API Key
        const openAIKey = window.OpenAIService ? window.OpenAIService.getAPIKey() : '';
        const openAIKeyInput = windowElement.querySelector('#openai-api-key');
        if (openAIKeyInput && openAIKey) {
            openAIKeyInput.value = openAIKey;
        }

        // Load ElevenLabs API Key
        const elevenLabsKey = window.ElevenLabsService ? window.ElevenLabsService.getAPIKey() : '';
        const elevenLabsKeyInput = windowElement.querySelector('#elevenlabs-api-key');
        if (elevenLabsKeyInput && elevenLabsKey) {
            elevenLabsKeyInput.value = elevenLabsKey;
        }

        // Load custom voice IDs
        const customVoiceIds = sessionStorage.getItem('custom-voice-ids') || '';
        const customVoiceIdsTextarea = windowElement.querySelector('#custom-voice-ids');
        if (customVoiceIdsTextarea) {
            customVoiceIdsTextarea.value = customVoiceIds;
        }
    }

    saveOpenAIKey() {
        const windowElement = this.window.element;
        const apiKeyInput = windowElement.querySelector('#openai-api-key');
        const statusDiv = windowElement.querySelector('#openai-status');
        
        if (!apiKeyInput || !statusDiv) return;
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus(statusDiv, 'Please enter an API key', 'error');
            return;
        }
        
        if (!window.OpenAIService) {
            this.showStatus(statusDiv, 'OpenAI service not available', 'error');
            return;
        }
        
        if (window.OpenAIService.saveAPIKey(apiKey)) {
            this.showStatus(statusDiv, 'API key saved successfully', 'success');
        } else {
            this.showStatus(statusDiv, 'Invalid API key format', 'error');
        }
    }

    async testOpenAIKey() {
        const windowElement = this.window.element;
        const apiKeyInput = windowElement.querySelector('#openai-api-key');
        const statusDiv = windowElement.querySelector('#openai-status');
        
        if (!apiKeyInput || !statusDiv) return;
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus(statusDiv, 'Please enter an API key', 'error');
            return;
        }
        
        if (!window.OpenAIService) {
            this.showStatus(statusDiv, 'OpenAI service not available', 'error');
            return;
        }
        
        this.showStatus(statusDiv, 'Testing connection...', 'warning');
        
        try {
            // Temporarily save the key for testing
            const originalKey = window.OpenAIService.getAPIKey();
            window.OpenAIService.saveAPIKey(apiKey);
            
            // Test with a simple request
            await window.OpenAIService.callAPI(
                'Hello',
                'You are a helpful assistant.',
                { maxTokens: 10 }
            );
            
            this.showStatus(statusDiv, 'Connection successful!', 'success');
        } catch (error) {
            this.showStatus(statusDiv, `Connection failed: ${error.message}`, 'error');
        }
    }

    saveElevenLabsKey() {
        const windowElement = this.window.element;
        const apiKeyInput = windowElement.querySelector('#elevenlabs-api-key');
        const statusDiv = windowElement.querySelector('#elevenlabs-status');
        
        if (!apiKeyInput || !statusDiv) return;
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus(statusDiv, 'Please enter an API key', 'error');
            return;
        }
        
        if (!window.ElevenLabsService) {
            this.showStatus(statusDiv, 'ElevenLabs service not available', 'error');
            return;
        }
        
        if (window.ElevenLabsService.saveAPIKey(apiKey)) {
            this.showStatus(statusDiv, 'API key saved successfully', 'success');
        } else {
            this.showStatus(statusDiv, 'Invalid API key format', 'error');
        }
    }

    async testElevenLabsKey() {
        const windowElement = this.window.element;
        const apiKeyInput = windowElement.querySelector('#elevenlabs-api-key');
        const statusDiv = windowElement.querySelector('#elevenlabs-status');
        
        if (!apiKeyInput || !statusDiv) return;
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus(statusDiv, 'Please enter an API key', 'error');
            return;
        }
        
        if (!window.ElevenLabsService) {
            this.showStatus(statusDiv, 'ElevenLabs service not available', 'error');
            return;
        }
        
        this.showStatus(statusDiv, 'Testing connection...', 'warning');
        
        try {
            // Temporarily save the key for testing
            const originalKey = window.ElevenLabsService.getAPIKey();
            window.ElevenLabsService.saveAPIKey(apiKey);
            
            // Test with a simple request
            const result = await window.ElevenLabsService.testVoice('EXAVITGu4C4rW3tX2DQ2');
            
            if (result.success) {
                this.showStatus(statusDiv, 'Connection successful!', 'success');
                // Clean up the test audio URL
                setTimeout(() => {
                    window.ElevenLabsService.revokeAudioUrl(result.audioUrl);
                }, 5000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showStatus(statusDiv, `Connection failed: ${error.message}`, 'error');
        }
    }

    saveVoiceIds() {
        const windowElement = this.window.element;
        const voiceIdsTextarea = windowElement.querySelector('#custom-voice-ids');
        const statusDiv = windowElement.querySelector('#voice-status');
        
        if (!voiceIdsTextarea || !statusDiv) return;
        
        const voiceIds = voiceIdsTextarea.value.trim();
        
        // Save to session storage
        sessionStorage.setItem('custom-voice-ids', voiceIds);
        
        // Update WraithsApp settings if available
        if (window.wraithsApp && window.wraithsApp.settings) {
            const voiceIdArray = voiceIds.split('\n')
                .map(id => id.trim())
                .filter(id => id.length > 0);
            
            window.wraithsApp.settings.voiceIds = voiceIdArray;
        }
        
        this.showStatus(statusDiv, 'Voice IDs saved successfully', 'success');
    }

    async testRandomVoice() {
        const windowElement = this.window.element;
        const statusDiv = windowElement.querySelector('#voice-status');
        
        if (!statusDiv) return;
        
        if (!window.ElevenLabsService) {
            this.showStatus(statusDiv, 'ElevenLabs service not available', 'error');
            return;
        }
        
        this.showStatus(statusDiv, 'Testing random voice...', 'warning');
        
        try {
            const voiceId = window.ElevenLabsService.getRandomVoiceId();
            const result = await this.testVoice(voiceId);
            
            if (result) {
                this.showStatus(statusDiv, `Voice test successful!`, 'success');
            }
        } catch (error) {
            this.showStatus(statusDiv, `Voice test failed: ${error.message}`, 'error');
        }
    }

    async testVoice(voiceId) {
        if (!window.ElevenLabsService) {
            throw new Error('ElevenLabs service not available');
        }
        
        const testText = "This is a test of the voice synthesis system.";
        const result = await window.ElevenLabsService.generateSpeech(testText, voiceId);
        
        if (result.success) {
            // Create audio element to play the test
            const audio = new Audio(result.audioUrl);
            audio.play();
            
            // Clean up the audio URL after playing
            audio.addEventListener('ended', () => {
                window.ElevenLabsService.revokeAudioUrl(result.audioUrl);
            });
            
            return true;
        } else {
            throw new Error(result.error);
        }
    }

    showStatus(element, message, type) {
        if (!element) return;
        
        element.className = `status-message status-${type}`;
        element.textContent = message;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.textContent = '';
                element.className = '';
            }, 5000);
        }
    }
}

// Create and register the app
const systemSettingsApp = new SystemSettingsApp();

// Register with the app registry
if (!window.AppRegistry) {
    window.AppRegistry = {};
}

const existingConfig = window.AppRegistry['system-settings'] || {};

window.AppRegistry['system-settings'] = {
    ...existingConfig,
    open: (windowId) => systemSettingsApp.open(windowId)
};

// Export for use in other files
window.SystemSettingsApp = SystemSettingsApp;
window.systemSettingsApp = systemSettingsApp;
