// Morrowind-OwS OuijaGPT App

class OuijaGPTApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.conversations = [];
        this.currentConversationId = null;
        this.isLoading = false;
        
        this.loadConversations();
        this.initializeUI();
    }

    initializeUI() {
        const contentElement = document.getElementById(`${this.windowId}-content`);
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="oracle-content">
                <div class="oracle-header">
                    <div class="oracle-logo ouijagpt-icon"></div>
                    <div class="oracle-title">OuijaGPT</div>
                    <div class="oracle-crystal-ball"></div>
                </div>
                <div class="oracle-messages" id="oracle-messages">
                    <div class="oracle-welcome">
                        <div class="oracle-message-bubble">
                            Welcome, seeker of wisdom. I am OuijaGPT, keeper of ancient knowledge. Ask me anything, and I shall divine the answers you seek.
                        </div>
                    </div>
                </div>
                <div class="oracle-input-container">
                    <div class="oracle-input-wrapper">
                        <input type="text" class="input oracle-input" id="oracle-input" placeholder="Ask OuijaGPT a question..." disabled>
                        <button class="btn btn-primary oracle-send-btn" id="oracle-send-btn" disabled>Consult</button>
                    </div>
                    <div class="oracle-status" id="oracle-status">OuijaGPT is meditating...</div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.checkAPIKey();
    }

    setupEventListeners() {
        const sendBtn = document.getElementById('oracle-send-btn');
        const inputField = document.getElementById('oracle-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle if this window is active
            if (window.MorrowindOS.activeWindow !== this.windowId) return;

            // Ctrl+K to focus input
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                if (inputField) inputField.focus();
            }
        });
    }

    checkAPIKey() {
        // Check if API key is available
        const hasAPIKey = sessionStorage.getItem('openai-api-key') || 
                          window.MorrowindOS.config?.openaiApiKey;
        
        const inputField = document.getElementById('oracle-input');
        const sendBtn = document.getElementById('oracle-send-btn');
        const status = document.getElementById('oracle-status');
        
        if (hasAPIKey) {
            if (inputField) inputField.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            if (status) status.textContent = 'OuijaGPT is ready to consult.';
        } else {
            if (inputField) inputField.disabled = true;
            if (sendBtn) sendBtn.disabled = true;
            if (status) status.textContent = 'OuijaGPT requires an API key to divine answers.';
            
            // Show setup dialog
            setTimeout(() => this.showAPIKeyDialog(), 1000);
        }
    }

    showAPIKeyDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content animate-scale-in">
                <div class="modal-header">OuijaGPT Configuration</div>
                <div class="modal-body">
                    <p>To consult OuijaGPT, you need an OpenAI API key.</p>
                    <p>You can get one from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI's website</a>.</p>
                    <div class="form-group">
                        <label for="api-key-input">API Key:</label>
                        <input type="password" class="input" id="api-key-input" placeholder="sk-...">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="cancel-api-key">Cancel</button>
                    <button class="btn btn-primary" id="save-api-key">Save Key</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('cancel-api-key').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('save-api-key').addEventListener('click', () => {
            const apiKeyInput = document.getElementById('api-key-input');
            if (apiKeyInput && apiKeyInput.value.trim()) {
                if (OpenAIService.saveAPIKey(apiKeyInput.value.trim())) {
                    modal.remove();
                    this.checkAPIKey();
                    window.MorrowindOS.showNotification('API Key Saved', 'OuijaGPT can now divine answers for you.', 'success');
                } else {
                    window.MorrowindOS.showNotification('Invalid Key', 'Please enter a valid OpenAI API key.', 'error');
                }
            } else {
                window.MorrowindOS.showNotification('Invalid Key', 'Please enter a valid API key.', 'error');
            }
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async sendMessage() {
        const inputField = document.getElementById('oracle-input');
        if (!inputField || this.isLoading) return;
        
        const message = inputField.value.trim();
        if (!message) return;
        
        // Clear input
        inputField.value = '';
        
        // Create or get conversation
        if (!this.currentConversationId) {
            this.currentConversationId = this.createConversation();
        }
        
        // Add user message
        this.addMessage('user', message);
        
        // Show loading state
        this.setLoading(true);
        
        try {
            // Call OpenAI API using shared service
            const response = await OpenAIService.generateOuijaResponse(message, this.getConversationHistory());
            
            // Add AI response
            this.addMessage('assistant', response);
            
            // Update conversation
            this.updateConversation(this.currentConversationId, message, response);
            
        } catch (error) {
            console.error('OuijaGPT error:', error);
            this.addMessage('system', `OuijaGPT's vision is clouded: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }


    addMessage(role, content) {
        const messagesContainer = document.getElementById('oracle-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `oracle-message ${role}`;
        
        const bubbleElement = document.createElement('div');
        bubbleElement.className = 'oracle-message-bubble';
        bubbleElement.textContent = content;
        
        messageElement.appendChild(bubbleElement);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        const inputField = document.getElementById('oracle-input');
        const sendBtn = document.getElementById('oracle-send-btn');
        const status = document.getElementById('oracle-status');
        
        if (inputField) inputField.disabled = isLoading;
        if (sendBtn) sendBtn.disabled = isLoading;
        
        if (status) {
            if (isLoading) {
                status.textContent = 'OuijaGPT is divining your answer...';
                status.classList.add('loading');
            } else {
                status.textContent = 'OuijaGPT is ready to consult.';
                status.classList.remove('loading');
            }
        }
    }

    createConversation() {
        const conversationId = this.generateId();
        const conversation = {
            id: conversationId,
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.conversations.push(conversation);
        this.saveConversations();
        return conversationId;
    }

    updateConversation(conversationId, userMessage, assistantMessage) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        conversation.messages.push(
            { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
            { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() }
        );
        
        this.saveConversations();
    }

    getConversationHistory() {
        if (!this.currentConversationId) return [];
        
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        return conversation ? conversation.messages : [];
    }

    saveConversations() {
        try {
            localStorage.setItem('ouijagpt-conversations', JSON.stringify(this.conversations));
        } catch (e) {
            console.error('Failed to save conversations:', e);
        }
    }

    loadConversations() {
        try {
            const savedConversations = localStorage.getItem('ouijagpt-conversations');
            if (savedConversations) {
                this.conversations = JSON.parse(savedConversations);
            }
        } catch (e) {
            console.error('Failed to load conversations:', e);
            this.conversations = [];
        }
    }

    generateId() {
        return 'conv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    cleanup() {
        // Save any pending data
        this.saveConversations();
    }
}

// Register app initialization function
window.MorrowindOS = window.MorrowindOS || {};
window.MorrowindOS.apps = window.MorrowindOS.apps || {};
window.MorrowindOS.apps.ouijagpt = function(windowId) {
    window.ouijagptApp = new OuijaGPTApp(windowId);
};

function loadAppContent(appName, windowId) {
    if (appName === 'ouijagpt') {
        // Content is already loaded by OuijaGPTApp constructor
        console.log('OuijaGPT content loaded');
    }
}

function cleanupApp(appName, windowId) {
    if (appName === 'ouijagpt' && window.ouijagptApp) {
        window.ouijagptApp.cleanup();
        window.ouijagptApp = null;
    }
}

// Export for use in main.js
// Don't override window.initializeApp - it's now handled by OS
window.loadAppContent = loadAppContent;
window.cleanupApp = cleanupApp;