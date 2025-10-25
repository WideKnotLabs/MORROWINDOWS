
// Morrowind-OwS WraithsApp - WhatsApp-style Chat App

class WraithsApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.chats = [];
        this.currentChatId = null;
        this.isLoading = false;
        this.autoRefreshInterval = null;
        this.lastRefreshTime = {};
        
        // Default settings
        this.settings = {
            voiceChance: 40,
            autoRefresh: false,
            refreshInterval: 25000, // 25 seconds
            eventFrequency: 30,
            temperature: 0.8,
            maxWords: 18,
            voiceIds: [] // Array to store custom VoiceIDs
        };
        
        this.loadChats();
        this.loadSettings();
        this.initializeUI();
    }

    initializeUI() {
        const contentElement = document.getElementById(`${this.windowId}-content`);
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="wraiths-content">
                <div class="wraiths-header">
                    <div class="wraiths-logo wraiths-icon"></div>
                    <div class="wraiths-title">WraithsApp</div>
                    <div class="wraiths-actions">
                        <button class="wraiths-settings-btn" id="wraiths-settings-btn">⚙</button>
                    </div>
                </div>
                
                <div class="wraiths-main">
                    <div class="wraiths-chat-list" id="wraiths-chat-list">
                        <!-- Chat list will be populated here -->
                    </div>
                    
                    <div class="wraiths-chat-view" id="wraiths-chat-view">
                        <div class="wraiths-empty-state">
                            <div class="wraiths-empty-icon">👻</div>
                            <div class="wraiths-empty-text">Select a chat to begin communing with the spirits</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.populateChatList();
        this.checkAPIKeys();
    }

    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('wraiths-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle if this window is active
            if (window.MorrowindOS.activeWindow !== this.windowId) return;

            // Ctrl+R to refresh current chat
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                if (this.currentChatId) {
                    this.refreshChat(this.currentChatId);
                }
            }
        });
    }

    checkAPIKeys() {
        const hasOpenAIKey = sessionStorage.getItem('openai-api-key') || 
                            window.MorrowindOS.config?.openaiApiKey;
        const hasElevenLabsKey = sessionStorage.getItem('elevenlabs-api-key') || 
                                window.MorrowindOS.config?.elevenlabsApiKey;
        
        if (!hasOpenAIKey) {
            setTimeout(() => this.showSettingsModal(), 1000);
        }
    }

    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content animate-scale-in">
                <div class="modal-header">WraithsApp Configuration</div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="openai-key-input">OpenAI API Key:</label>
                        <input type="password" class="input" id="openai-key-input" placeholder="sk-..." value="${sessionStorage.getItem('openai-api-key') || ''}">
                        <small>Required for NPC responses</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="elevenlabs-key-input">ElevenLabs API Key:</label>
                        <input type="password" class="input" id="elevenlabs-key-input" placeholder="..." value="${sessionStorage.getItem('elevenlabs-api-key') || ''}">
                        <small>Optional for voice messages</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="voice-ids-input">Voice IDs:</label>
                        <input type="text" class="input" id="voice-ids-input" placeholder="Enter Voice IDs separated by commas (max 10)" value="${this.settings.voiceIds ? this.settings.voiceIds.join(', ') : ''}">
                        <small>ElevenLabs Voice IDs for NPC voices (comma-separated, max 10)</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="voice-chance-slider">Voice Chance: <span id="voice-chance-value">${this.settings.voiceChance}%</span></label>
                        <input type="range" id="voice-chance-slider" min="0" max="100" value="${this.settings.voiceChance}" class="slider">
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="auto-refresh-checkbox" ${this.settings.autoRefresh ? 'checked' : ''}>
                            Auto-refresh chats
                        </label>
                        <div id="refresh-interval-group" style="${this.settings.autoRefresh ? '' : 'display: none;'}">
                            <label for="refresh-interval-slider">Interval: <span id="refresh-interval-value">${this.settings.refreshInterval / 1000}s</span></label>
                            <input type="range" id="refresh-interval-slider" min="20" max="60" value="${this.settings.refreshInterval / 1000}" class="slider">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-frequency-slider">Event Frequency: <span id="event-frequency-value">${this.settings.eventFrequency}%</span></label>
                        <input type="range" id="event-frequency-slider" min="0" max="100" value="${this.settings.eventFrequency}" class="slider">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="cancel-settings">Cancel</button>
                    <button class="btn btn-primary" id="save-settings">Save Settings</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners
        const voiceChanceSlider = document.getElementById('voice-chance-slider');
        const voiceChanceValue = document.getElementById('voice-chance-value');
        const autoRefreshCheckbox = document.getElementById('auto-refresh-checkbox');
        const refreshIntervalGroup = document.getElementById('refresh-interval-group');
        const refreshIntervalSlider = document.getElementById('refresh-interval-slider');
        const refreshIntervalValue = document.getElementById('refresh-interval-value');
        const eventFrequencySlider = document.getElementById('event-frequency-slider');
        const eventFrequencyValue = document.getElementById('event-frequency-value');
        
        voiceChanceSlider.addEventListener('input', (e) => {
            voiceChanceValue.textContent = e.target.value + '%';
        });
        
        autoRefreshCheckbox.addEventListener('change', (e) => {
            refreshIntervalGroup.style.display = e.target.checked ? 'block' : 'none';
        });
        
        refreshIntervalSlider.addEventListener('input', (e) => {
            refreshIntervalValue.textContent = e.target.value + 's';
        });
        
        eventFrequencySlider.addEventListener('input', (e) => {
            eventFrequencyValue.textContent = e.target.value + '%';
        });
        
        document.getElementById('cancel-settings').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings(modal);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveSettings(modal) {
        const openAIKey = document.getElementById('openai-key-input').value.trim();
        const elevenLabsKey = document.getElementById('elevenlabs-key-input').value.trim();
        const voiceIdsInput = document.getElementById('voice-ids-input').value.trim();
        
        if (openAIKey && OpenAIService.saveAPIKey(openAIKey)) {
            sessionStorage.setItem('openai-api-key', openAIKey);
        }
        
        if (elevenLabsKey) {
            sessionStorage.setItem('elevenlabs-api-key', elevenLabsKey);
        }
        
        // Process VoiceIDs
        let voiceIds = [];
        if (voiceIdsInput) {
            voiceIds = voiceIdsInput.split(',').map(id => id.trim()).filter(id => id.length > 0);
            
            // Limit to maximum of 10 VoiceIDs
            if (voiceIds.length > 10) {
                voiceIds = voiceIds.slice(0, 10);
                window.MorrowindOS.showNotification('Warning', 'Only the first 10 Voice IDs will be used.', 'warning');
            }
        }
        
        // Update settings
        this.settings.voiceChance = parseInt(document.getElementById('voice-chance-slider').value);
        this.settings.autoRefresh = document.getElementById('auto-refresh-checkbox').checked;
        this.settings.refreshInterval = parseInt(document.getElementById('refresh-interval-slider').value) * 1000;
        this.settings.eventFrequency = parseInt(document.getElementById('event-frequency-slider').value);
        this.settings.voiceIds = voiceIds;
        
        this.saveSettingsToStorage();
        this.setupAutoRefresh();
        
        modal.remove();
        
        window.MorrowindOS.showNotification('Settings Saved', 'WraithsApp configuration updated.', 'success');
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('wraiths-settings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        this.setupAutoRefresh();
    }

    saveSettingsToStorage() {
        localStorage.setItem('wraiths-settings', JSON.stringify(this.settings));
    }

    setupAutoRefresh() {
        // Clear existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        // Setup new interval if enabled
        if (this.settings.autoRefresh) {
            this.autoRefreshInterval = setInterval(() => {
                if (this.currentChatId) {
                    this.refreshChat(this.currentChatId);
                }
            }, this.settings.refreshInterval);
        }
    }

    populateChatList() {
        const chatList = document.getElementById('wraiths-chat-list');
        if (!chatList) return;

        chatList.innerHTML = '';

        this.chats.forEach(chat => {
            const chatElement = this.createChatListItem(chat);
            chatList.appendChild(chatElement);
        });
    }

    createChatListItem(chat) {
        const chatDiv = document.createElement('div');
        chatDiv.className = 'wraiths-chat-item';
        chatDiv.setAttribute('data-chat-id', chat.id);
        
        const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
        const lastMessageText = lastMessage ? lastMessage.text : 'No messages yet';
        const lastMessageTime = lastMessage ? this.formatTime(lastMessage.ts) : '';

        chatDiv.innerHTML = `
            <div class="wraiths-chat-avatar" style="background-color: ${chat.emblem}">
                <span>${chat.title.charAt(0).toUpperCase()}</span>
            </div>
            <div class="wraiths-chat-info">
                <div class="wraiths-chat-title">${chat.title}</div>
                <div class="wraiths-chat-last-message">${lastMessageText}</div>
            </div>
            <div class="wraiths-chat-time">${lastMessageTime}</div>
        `;

        chatDiv.addEventListener('click', () => {
            this.openChat(chat.id);
        });

        return chatDiv;
    }

    openChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        this.currentChatId = chatId;

        // Update active state in chat list
        document.querySelectorAll('.wraiths-chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('active');

        // Render chat view
        this.renderChatView(chat);
    }

    renderChatView(chat) {
        const chatView = document.getElementById('wraiths-chat-view');
        if (!chatView) return;

        chatView.innerHTML = `
            <div class="wraiths-chat-header">
                <div class="wraiths-chat-header-avatar" style="background-color: ${chat.emblem}">
                    <span>${chat.title.charAt(0).toUpperCase()}</span>
                </div>
                <div class="wraiths-chat-header-info">
                    <div class="wraiths-chat-header-title">${chat.title}</div>
                    <div class="wraiths-chat-header-subtitle">${chat.npcs.length} spirits</div>
                </div>
                <div class="wraiths-chat-header-actions">
                    <button class="wraiths-refresh-btn" id="refresh-chat-btn">↻</button>
                </div>
            </div>
            
            <div class="wraiths-messages" id="wraiths-messages-${chat.id}">
                ${this.renderMessages(chat.messages)}
            </div>
            
            <div class="wraiths-input-container">
                <div class="wraiths-input-wrapper">
                    <input type="text" class="input wraiths-input" id="wraiths-input-${chat.id}" placeholder="Type a message..." ${this.isLoading ? 'disabled' : ''}>
                    <button class="btn btn-primary wraiths-send-btn" id="wraiths-send-btn-${chat.id}" ${this.isLoading ? 'disabled' : ''}>Send</button>
                </div>
            </div>
        `;

        // Setup event listeners for this chat
        this.setupChatEventListeners(chat);

        // Scroll to bottom
        const messagesContainer = document.getElementById(`wraiths-messages-${chat.id}`);
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    renderMessages(messages) {
        if (messages.length === 0) {
            return '<div class="wraiths-no-messages">No messages yet. Start the conversation...</div>';
        }

        return messages.map(message => this.renderMessage(message)).join('');
    }

    renderMessage(message) {
        const isUser = message.npcId === 'user';
        const npc = !isUser ? this.getNPCById(message.npcId) : null;
        const time = this.formatTime(message.ts);
        const hasAudio = message.hasAudio && message.audioUrl;
        
        return `
            <div class="wraiths-message ${isUser ? 'user' : 'npc'}">
                ${!isUser ? `
                    <div class="wraiths-message-avatar" style="background-color: ${npc ? npc.color : '#666'}">
                        <span>${npc ? npc.name.charAt(0).toUpperCase() : '?'}</span>
                    </div>
                ` : ''}
                <div class="wraiths-message-content">
                    ${!isUser ? `<div class="wraiths-message-author">${npc ? npc.name : 'Unknown'}</div>` : ''}
                    <div class="wraiths-message-bubble ${hasAudio ? 'audio-only' : ''}">
                        ${hasAudio ? '' : message.text}
                        ${hasAudio ? `
                            <div class="wraiths-audio-control">
                                <audio controls src="${message.audioUrl}"></audio>
                            </div>
                        ` : ''}
                    </div>
                    <div class="wraiths-message-time">${time}</div>
                </div>
            </div>
        `;
    }

    setupChatEventListeners(chat) {
        const sendBtn = document.getElementById(`wraiths-send-btn-${chat.id}`);
        const inputField = document.getElementById(`wraiths-input-${chat.id}`);
        const refreshBtn = document.getElementById('refresh-chat-btn');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage(chat.id));
        }

        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(chat.id);
                }
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshChat(chat.id));
        }
    }

    async sendMessage(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat || this.isLoading) return;

        const inputField = document.getElementById(`wraiths-input-${chatId}`);
        if (!inputField) return;

        const message = inputField.value.trim();
        if (!message) return;

        // Clear input
        inputField.value = '';

        // Add user message
        this.addMessage(chatId, {
            id: this.generateId(),
            chatId: chatId,
            npcId: 'user',
            text: message,
            ts: new Date().toISOString(),
            hasAudio: false
        });

        // Generate NPC responses
        await this.generateNPCResponses(chatId, message);
    }

    async refreshChat(chatId) {
        // Prevent too frequent refreshes
        const now = Date.now();
        if (this.lastRefreshTime[chatId] && now - this.lastRefreshTime[chatId] < 5000) {
            return;
        }
        this.lastRefreshTime[chatId] = now;

        const chat = this.chats.find(c => c.id === chatId);
        if (!chat || this.isLoading) return;

        // Check if we have enough recent messages to avoid repetition
        if (chat.messages.length < 3) {
            console.log('Not enough messages for refresh, skipping');
            return;
        }

        // Check if last message is too recent (avoid spam)
        const lastMessage = chat.messages[chat.messages.length - 1];
        const lastMessageTime = new Date(lastMessage.ts).getTime();
        if (now - lastMessageTime < 10000) { // 10 seconds
            console.log('Last message too recent, skipping refresh');
            return;
        }

        // Generate NPC responses without user message
        await this.generateNPCResponses(chatId);
    }

    async generateNPCResponses(chatId, userMessage = null) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        this.setLoading(true);

        try {
            // Determine number of responses (75% one, 25% two)
            const numResponses = Math.random() < 0.75 ? 1 : 2;
            
            // Get recent messages for context
            const recentMessages = chat.messages.slice(-8);
            
            // Check if we should include an event card
            const includeEvent = Math.random() * 100 < this.settings.eventFrequency;
            let eventCard = null;
            if (includeEvent) {
                eventCard = this.getRandomEventCard();
            }

            for (let i = 0; i < numResponses; i++) {
                // Select NPC (weighted random with boost if mentioned)
                const selectedNPC = this.selectNPC(chat, userMessage);
                
                // Generate response using ChatGPT
                const response = await this.generateNPCResponse(
                    selectedNPC,
                    chat,
                    recentMessages,
                    userMessage,
                    eventCard
                );

                // Check if we should generate audio
                const shouldGenerateAudio = Math.random() * 100 < this.settings.voiceChance;
                let audioUrl = null;
                
                if (shouldGenerateAudio) {
                    audioUrl = await this.generateAudio(response, selectedNPC);
                }

                // Add NPC message
                this.addMessage(chatId, {
                    id: this.generateId(),
                    chatId: chatId,
                    npcId: selectedNPC.id,
                    text: response,
                    ts: new Date().toISOString(),
                    hasAudio: !!audioUrl,
                    audioUrl: audioUrl
                });

                // Small delay between multiple responses
                if (i < numResponses - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error('Error generating NPC responses:', error);
            
            // Add error message
            this.addMessage(chatId, {
                id: this.generateId(),
                chatId: chatId,
                npcId: 'system',
                text: 'Silence falls over the channel.',
                ts: new Date().toISOString(),
                hasAudio: false
            });
        } finally {
            this.setLoading(false);
        }
    }

    selectNPC(chat, userMessage = null) {
        // Check if user mentioned any NPC by name or role
        let mentionedNPC = null;
        if (userMessage) {
            const lowerMessage = userMessage.toLowerCase();
            mentionedNPC = chat.npcs.find(npc => 
                lowerMessage.includes(npc.name.toLowerCase()) || 
                lowerMessage.includes(npc.role.toLowerCase())
            );
        }

        // Weighted random selection
        const weights = chat.npcs.map(npc => {
            let weight = npc.rarityWeight || 1;
            if (mentionedNPC && npc.id === mentionedNPC.id) {
                weight *= 3; // Boost mentioned NPCs
            }
            return weight;
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < chat.npcs.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return chat.npcs[i];
            }
        }
        
        return chat.npcs[0]; // Fallback
    }

    async generateNPCResponse(npc, chat, recentMessages, userMessage = null, eventCard = null) {
        // Get world context if available
        const worldContext = typeof WorldContextService !== 'undefined' ? WorldContextService.getWorldContextForPrompt() : '';
        
        // Get current timestamp to add uniqueness
        const currentTime = new Date().toISOString();
        const randomSeed = Math.random().toString(36).substring(2, 15);
        
        // Get the last 20 messages for better context
        const lastTwentyMessages = recentMessages.slice(-20);
        
        // Build conversation history with proper weighting
        const conversationHistory = lastTwentyMessages.map((msg, index) => {
            const sender = msg.npcId === 'user' ? 'User' : this.getNPCById(msg.npcId)?.name || 'Unknown';
            const weight = index === lastTwentyMessages.length - 1 ? ' [MOST RECENT]' :
                          index >= lastTwentyMessages.length - 3 ? ' [RECENT]' : '';
            return `${sender}${weight}: ${msg.text}`;
        }).join('\n');
        
        const systemPrompt = `${worldContext}

=== CHAT GROUP CONTEXT ===
Group Name: ${chat.title}
Group Purpose: ${chat.loreSeed}
Chat Mood: ${chat.mood}
Members: ${chat.npcs.map(n => n.name).join(', ')}

=== CHARACTER PROFILE ===
Name: ${npc.name}
Role: ${npc.role}
Personality: ${npc.quirk}
Hidden Agenda: ${npc.agenda}

=== CONVERSATION HISTORY ===
${conversationHistory}

${eventCard ? `=== CURRENT EVENT ===\n${eventCard}` : ''}

${userMessage ? `=== DIRECT MESSAGE TO RESPOND TO ===\nUser: "${userMessage}"` : ''}

=== RESPONSE GUIDELINES ===
CONTEXT HIERARCHY (most important first):
1. WORLD CONTEXT: Current events, atmosphere, and state of Morrowind
2. CHAT GROUP: Purpose, mood, and members of this specific chat
3. CONVERSATION HISTORY: Recent messages with emphasis on most recent
4. ${userMessage ? 'DIRECT REPLY: You are replying directly to user message' : 'CONTINUATION: Continue conversation naturally'}

You are ${npc.name} in a WhatsApp-style group chat.

Your response must:
- Reference current Morrowind events when relevant to chat topic
- Match the ${chat.mood} mood of "${chat.title}"
- Stay completely in character using your persona and agenda
- ${userMessage ? 'Respond directly to the user message' : 'Continue the conversation naturally'}
- Keep responses between 8-18 words for authentic chat feel
- Use Morrowind-specific references when appropriate
- Create immersive, original responses that advance the narrative

Respond with ONLY the message text as ${npc.name} would say it:`;

        try {
            // Use the user message as the prompt, or empty string for refresh
            const prompt = userMessage || '';
            const response = await OpenAIService.callAPI(prompt, systemPrompt, {
                maxTokens: 100,
                temperature: this.settings.temperature + 0.2, // Increase temperature slightly for more variety
                model: 'gpt-3.5-turbo' // Explicitly set model
            });
            
            // Check if response is too similar to recent messages
            const trimmedResponse = response.trim();
            const isDuplicate = recentMessages.some(msg =>
                msg.text.toLowerCase() === trimmedResponse.toLowerCase() ||
                (msg.npcId === npc.id && msg.text.toLowerCase().includes(trimmedResponse.toLowerCase().substring(0, 5)))
            );
            
            if (isDuplicate) {
                console.log('Duplicate detected, regenerating...');
                // Try once more with higher temperature
                return await this.generateNPCResponseWithRetry(npc, chat, recentMessages, userMessage, eventCard, 1);
            }
            
            return trimmedResponse;
        } catch (error) {
            console.error('Error generating NPC response:', error);
            throw error;
        }
    }
    
    async generateNPCResponseWithRetry(npc, chat, recentMessages, userMessage = null, eventCard = null, retryCount = 0) {
        if (retryCount >= 2) {
            // Fallback response after 2 retries
            return `${npc.name}: ${this.getFallbackResponse(npc, chat)}`;
        }
        
        const randomSeed = Math.random().toString(36).substring(2, 15);
        const systemPrompt = `Generate a UNIQUE WhatsApp-style line for ${npc.name} (${npc.role}, ${npc.quirk}).
        Chat: ${chat.title} (${chat.mood} mood).
        AVOID repeating: ${recentMessages.slice(-3).map(m => m.text).join(', ')}.
        Session: ${randomSeed}. Retry: ${retryCount + 1}.
        
        Return ONLY the dialogue line, 8-18 words, completely original.`;

        try {
            const response = await OpenAIService.callAPI('', systemPrompt, {
                maxTokens: 100,
                temperature: 0.9 + (retryCount * 0.1), // Increase temperature with each retry
                model: 'gpt-3.5-turbo'
            });
            
            return response.trim();
        } catch (error) {
            console.error(`Retry ${retryCount + 1} failed:`, error);
            return await this.generateNPCResponseWithRetry(npc, chat, recentMessages, userMessage, eventCard, retryCount + 1);
        }
    }
    
    getFallbackResponse(npc, chat) {
        const fallbackResponses = {
            'formal': ['The council will reconvene shortly.', 'We must consider all perspectives.', 'This matter requires further deliberation.'],
            'sly': ['The tides change quickly.', 'Keep your wits about you.', 'Not all is as it seems.'],
            'serene': ['Blessings upon this gathering.', 'May wisdom guide our path.', 'Peace be with us all.'],
            'ancestral': ['The ancestors watch over us.', 'Old ways guide new paths.', 'Tradition holds the answer.'],
            'brisk': ['Time is of the essence.', 'Let us proceed with purpose.', 'Efficiency in all things.'],
            'eccentric': ['Fascinating dimensional shifts!', 'The arcane currents flow strangely today.', 'Reality seems quite malleable!']
        };
        
        const moodResponses = fallbackResponses[chat.mood] || fallbackResponses['formal'];
        return moodResponses[Math.floor(Math.random() * moodResponses.length)];
    }

    async generateAudio(text, npc) {
        try {
            // Check if ElevenLabs API key is available
            const apiKey = ElevenLabsService.getAPIKey();
            if (!apiKey) {
                console.warn('ElevenLabs API key not configured, skipping audio generation');
                return null;
            }
            
            // Use NPC's voiceId or select a random one
            const voiceId = npc.voiceId || ElevenLabsService.getRandomVoiceId();
            
            // Generate speech with random variations
            const result = await ElevenLabsService.generateSpeech(text, voiceId, {
                stability: 0.35 + Math.random() * 0.2, // 0.35-0.55
                style: 0.1 + Math.random() * 0.2, // 0.1-0.3
                useSpeakerBoost: true
            });
            
            if (result.success) {
                console.log('Audio generated successfully for', npc.name);
                return result.audioUrl;
            } else {
                console.error('Audio generation failed:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error generating audio:', error);
            return null;
        }
    }

    getRandomEventCard() {
        const events = {
            'mysterious': [
                'Strange lights flicker over Red Mountain at midnight',
                'Whispers in an ancient Daedric language echo through ashlands',
                'A mysterious stranger arrived asking about Nerevarine prophecy',
                'Ghostly figures seen dancing in ruins of Ald Daedroth',
                'An ancient map showing hidden treasure surfaces in Balmora',
                'The moons Masser and Secunda turn blood red for three nights',
                'A child born with glowing eyes in the remote ashlands',
                'Time seems to flow backwards in the forgotten dwarven ruins',
                'Dreams of a terrible future plague the sleep of Vvardenfell',
                'An invisible barrier appears around Ghostgate'
            ],
            'political': [
                'Imperial Legion doubles patrols around Vivec City',
                'House Hlaalu proposes controversial trade agreement with outlanders',
                'Assassination attempt on Redoran councilor fails',
                'Telvanni wizards declare independence from Empire',
                'Temple declares heresy against Sixth House cultists',
                'New tax on magical items sparks guild rebellion',
                'Peace treaty between rival Great Houses proposed',
                'Imperial spymaster arrested for treason',
                'Ashlander tribes unite against colonial expansion',
                'Daedric worshipers demand religious freedom'
            ],
            'supernatural': [
                'Daedra portal opens unexpectedly in Seyda Neen',
                'Vampire attacks increase dramatically at nightfall',
                'Werewolf sightings reported in the Grazelands',
                'Corprus disease spreads to new settlements',
                'Ancient lich awakens in ancestral tomb',
                'Summoned elemental breaks free from Mages Guild',
                'Cursed artifact causes madness in Caldera',
                'Soul gems begin cracking across Vvardenfell',
                'Deadric prince makes personal appearance to worshipers',
                'Reality distortion field detected around Telvanni tower'
            ],
            'economic': [
                'Skooma prices skyrocket after Imperial crackdown',
                'Ebony mine collapse causes market panic',
                'New trade route to mainland discovered',
                'Guild monopoly on enchanted items challenged',
                'Dwemer artifacts flood black market',
                'Rare alchemical ingredients become extinct',
                'Merchant caravan attacked by unknown creatures',
                'Bank of Vvardenfell faces financial crisis',
                'Smugglers offer rare goods at discount prices',
                'Magical components shortage affects all guilds'
            ],
            'social': [
                'Festival of the New Life celebrated across Vvardenfell',
                'Marriage alliance between rival houses announced',
                'Famous bard performs controversial songs about Tribunal',
                'Pilgrimage to Red Mountain draws thousands',
                'New fashion trend: Daedric-inspired clothing',
                'Popular gladiator tournament announced in Vivec',
                'Outlander customs gaining popularity among youth',
                'Traditional ashlander rituals revived',
                'Celebrity enchanter opens shop in Balmora',
                'Scandalous love affair rocks Great House politics'
            ],
            'dangerous': [
                'Cliff racer migration path changes toward settlements',
                'Bandit king unites criminal gangs under one banner',
                'Ancient curse awakens in forgotten tomb',
                'Plague of insects destroys crops across West Gash',
                'Volcanic activity increases near Red Mountain',
                'Sea monsters attack ships in Zafirbel Bay',
                'Assassins guild accepts contract on important figure',
                'Rogue mage experiments with forbidden magic',
                'Daedric cult attempts mass sacrifice ritual',
                'Sixth House activity detected near major cities'
            ]
        };
        
        // Select a category based on current chat mood or random
        const categories = Object.keys(events);
        let selectedCategory;
        
        // Try to match category to chat mood if possible
        const moodToCategory = {
            'mysterious': 'mysterious',
            'shadowy': 'dangerous',
            'intriguing': 'political',
            'cultish': 'supernatural',
            'academic': 'economic',
            'unsettling': 'supernatural'
        };
        
        // Get current chat to determine mood
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (currentChat && moodToCategory[currentChat.mood]) {
            selectedCategory = moodToCategory[currentChat.mood];
        } else {
            selectedCategory = categories[Math.floor(Math.random() * categories.length)];
        }
        
        const categoryEvents = events[selectedCategory];
        return categoryEvents[Math.floor(Math.random() * categoryEvents.length)];
    }

    addMessage(chatId, message) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        chat.messages.push(message);
        
        // Keep only last 200 messages
        if (chat.messages.length > 200) {
            chat.messages = chat.messages.slice(-200);
        }

        this.saveChats();
        
        // Update UI if this chat is currently open
        if (this.currentChatId === chatId) {
            const messagesContainer = document.getElementById(`wraiths-messages-${chatId}`);
            if (messagesContainer) {
                const messageElement = document.createElement('div');
                messageElement.innerHTML = this.renderMessage(message);
                messagesContainer.appendChild(messageElement.firstElementChild);
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
        
        // Update chat list
        this.updateChatListItem(chatId);
    }

    updateChatListItem(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;

        const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (!chatItem) return;

        const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
        const lastMessageText = lastMessage ? lastMessage.text : 'No messages yet';
        const lastMessageTime = lastMessage ? this.formatTime(lastMessage.ts) : '';

        chatItem.querySelector('.wraiths-chat-last-message').textContent = lastMessageText;
        chatItem.querySelector('.wraiths-chat-time').textContent = lastMessageTime;
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        const sendBtn = document.getElementById(`wraiths-send-btn-${this.currentChatId}`);
        const inputField = document.getElementById(`wraiths-input-${this.currentChatId}`);
        
        if (sendBtn) sendBtn.disabled = isLoading;
        if (inputField) inputField.disabled = isLoading;
    }

    getNPCById(npcId) {
        for (const chat of this.chats) {
            const npc = chat.npcs.find(n => n.id === npcId);
            if (npc) return npc;
        }
        return null;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    generateId() {
        return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    loadChats() {
        try {
            const savedChats = localStorage.getItem('wraiths-chats');
            if (savedChats) {
                this.chats = JSON.parse(savedChats);
            } else {
                this.chats = this.getDefaultChats();
                this.saveChats();
            }
        } catch (e) {
            console.error('Failed to load chats:', e);
            this.chats = this.getDefaultChats();
        }
    }

    saveChats() {
        try {
            localStorage.setItem('wraiths-chats', JSON.stringify(this.chats));
        } catch (e) {
            console.error('Failed to save chats:', e);
        }
    }

    getDefaultChats() {
        return [
            {
                id: 'red-mountain-observers',
                title: 'Red Mountain Observers',
                emblem: '#8B0000',
                loreSeed: 'dwarven ruins awakening, volcanic tremors, strange lights, ancient machinery',
                mood: 'mysterious',
                npcs: [
                    {
                        id: 'archaeologist-veloth',
                        name: 'Archaeologist Veloth',
                        role: 'Dwemer Scholar',
                        quirk: 'Obsessed with patterns, speaks in theories',
                        agenda: 'Uncover the truth of the Heart',
                        voiceId: null,
                        rarityWeight: 1.2,
                        color: '#8B0000'
                    },
                    {
                        id: 'pilgrim-mara',
                        name: 'Pilgrim Mara',
                        role: 'Temple Seeker',
                        quirk: 'Spiritual visions, prophetic dreams',
                        agenda: 'Understand the mountain\'s warnings',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#FF6B6B'
                    },
                    {
                        id: 'ash-zombie-hunter',
                        name: 'Ash Zombie Hunter',
                        role: 'Monster Slayer',
                        quirk: 'Gruff, paranoid, always armed',
                        agenda: 'Protect settlements from corprus',
                        voiceId: null,
                        rarityWeight: 1.1,
                        color: '#4A4A4A'
                    },
                    {
                        id: 'dwarven-automaton',
                        name: 'Centurion-7',
                        role: 'Ancient Machine',
                        quirk: 'Logical, speaks in binary references',
                        agenda: 'Execute forgotten protocols',
                        voiceId: null,
                        rarityWeight: 0.8,
                        color: '#C0C0C0'
                    },
                    {
                        id: 'vivec-prophet',
                        name: 'Vivec\'s Prophet',
                        role: 'Mystic',
                        quirk: 'Speaks in riddles, references the 36 lessons',
                        agenda: 'Interpret divine signs',
                        voiceId: null,
                        rarityWeight: 0.9,
                        color: '#FFD700'
                    }
                ],
                settings: {},
                messages: []
            },
            {
                id: 'black-market-vvardenfell',
                title: 'Black Market Vvardenfell',
                emblem: '#2F1B1B',
                loreSeed: 'forbidden artifacts, soul gems, skooma trade, imperial contraband',
                mood: 'shadowy',
                npcs: [
                    {
                        id: 'thieves-guild-master',
                        name: 'Shadow-Hand',
                        role: 'Thieves Guild Master',
                        quirk: 'Codespeak, never reveals true identity',
                        agenda: 'Control the underground economy',
                        voiceId: null,
                        rarityWeight: 1.2,
                        color: '#2F1B1B'
                    },
                    {
                        id: 'daedra-smuggler',
                        name: 'Xithen',
                        role: 'Daedric Artifact Dealer',
                        quirk: 'Whispers, paranoid about curses',
                        agenda: 'Acquire powerful artifacts',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#8B008B'
                    },
                    {
                        id: 'skooma-dealer',
                        name: 'Sweet-Tooth',
                        role: 'Skooma Merchant',
                        quirk: 'Hyperactive, twitchy, always selling',
                        agenda: 'Expand customer base',
                        voiceId: null,
                        rarityWeight: 1.1,
                        color: '#FF1493'
                    },
                    {
                        id: 'imperial-informant',
                        name: 'Cloak-and-Dagger',
                        role: 'Double Agent',
                        quirk: 'Changes stories, plays both sides',
                        agenda: 'Survive the coming conflict',
                        voiceId: null,
                        rarityWeight: 0.9,
                        color: '#4169E1'
                    },
                    {
                        id: 'fence-master',
                        name: 'Quick-Silver',
                        role: 'Master Fence',
                        quirk: 'Appraises everything, knows all values',
                        agenda: 'Profit from chaos',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#C0C0C0'
                    }
                ],
                settings: {},
                messages: []
            },
            {
                id: 'great-house-politics',
                title: 'Great House Politics',
                emblem: '#4B0082',
                loreSeed: 'council assassinations, land disputes, marriage alliances, ancient rivalries',
                mood: 'intriguing',
                npcs: [
                    {
                        id: 'hlaalu-noble',
                        name: 'Dram Bero',
                        role: 'Hlaalu Councilor',
                        quirk: 'Charismatic but ruthless',
                        agenda: 'Expand Hlaalu trade routes',
                        voiceId: null,
                        rarityWeight: 1.2,
                        color: '#4B0082'
                    },
                    {
                        id: 'redoran-warrior',
                        name: 'Bolvyn Venim',
                        role: 'Redoran Archmaster',
                        quirk: 'Honor-obsessed, traditional',
                        agenda: 'Restore Redoran glory',
                        voiceId: null,
                        rarityWeight: 1.1,
                        color: '#8B0000'
                    },
                    {
                        id: 'telvanni-wizard',
                        name: 'Aryon',
                        role: 'Telvanni Master',
                        quirk: 'Arrogant, power-hungry',
                        agenda: 'Become Telvanni Archmagister',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#9400D3'
                    },
                    {
                        id: 'imperial-spymaster',
                        name: 'Caius Cosades',
                        role: 'Blades Spymaster',
                        quirk: 'Seems drunk, actually brilliant',
                        agenda: 'Maintain Imperial control',
                        voiceId: null,
                        rarityWeight: 0.9,
                        color: '#FFD700'
                    },
                    {
                        id: 'ashlander-chieftain',
                        name: 'Sul-Matuul',
                        role: 'Ashkhan',
                        quirk: 'Wise, speaks in prophecies',
                        agenda: 'Protect ancestral lands',
                        voiceId: null,
                        rarityWeight: 0.8,
                        color: '#8B7355'
                    }
                ],
                settings: {},
                messages: []
            },
            {
                id: 'daedric-worshipers',
                title: 'Daedric Worshipers',
                emblem: '#8B008B',
                loreSeed: 'forbidden rituals, otherworldly summons, dark pacts, reality distortions',
                mood: 'cultish',
                npcs: [
                    {
                        id: 'azura-priest',
                        name: 'Moon-and-Star',
                        role: 'Azura Cultist',
                        quirk: 'Speaks in twilight metaphors',
                        agenda: 'Prepare for the Nerevarine',
                        voiceId: null,
                        rarityWeight: 1.2,
                        color: '#9370DB'
                    },
                    {
                        id: 'mehrunes-dagon-cultist',
                        name: 'Flame-Hand',
                        role: 'Dagon Worshiper',
                        quirk: 'Obsessed with destruction',
                        agenda: 'Open Oblivion gates',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#FF4500'
                    },
                    {
                        id: 'hermaeus-mora-scribe',
                        name: 'Forbidden-Knowledge',
                        role: 'Mora\'s Scribe',
                        quirk: 'Speaks in riddles and secrets',
                        agenda: 'Collect all forbidden lore',
                        voiceId: null,
                        rarityWeight: 1.1,
                        color: '#2F4F4F'
                    },
                    {
                        id: 'sheogorath-trickster',
                        name: 'Mad-Jester',
                        role: 'Sheogorath\'s Fool',
                        quirk: 'Completely insane but insightful',
                        agenda: 'Spread delightful madness',
                        voiceId: null,
                        rarityWeight: 0.9,
                        color: '#FF69B4'
                    },
                    {
                        id: 'vamprir-lord',
                        name: 'Ancient-Blood',
                        role: 'Clan Quarra Vampire',
                        quirk: 'Speaks of eternal hunger',
                        agenda: 'Build vampire dominance',
                        voiceId: null,
                        rarityWeight: 0.8,
                        color: '#8B0000'
                    }
                ],
                settings: {},
                messages: []
            },
            {
                id: 'mages-guild-research',
                title: 'Mages Guild Research',
                emblem: '#4169E1',
                loreSeed: 'magical experiments gone wrong, planar travel, spell creation, artifact studies',
                mood: 'academic',
                npcs: [
                    {
                        id: 'archmage-trebonius',
                        name: 'Trebonius Artorius',
                        role: 'Guild Archmage',
                        quirk: 'Brilliant but socially awkward',
                        agenda: 'Revolutionize magical theory',
                        voiceId: null,
                        rarityWeight: 1.2,
                        color: '#4169E1'
                    },
                    {
                        id: 'enchanter-sulinus',
                        name: 'Sulinus Vantus',
                        role: 'Master Enchanter',
                        quirk: 'Obsessed with soul gems',
                        agenda: 'Create the ultimate enchantment',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#9370DB'
                    },
                    {
                        id: 'alchemist-ajira',
                        name: 'Ajira',
                        role: 'Khajiit Alchemist',
                        quirk: 'Purrs in speech, cat-like metaphors',
                        agenda: 'Discover new potion recipes',
                        voiceId: null,
                        rarityWeight: 1.1,
                        color: '#FF8C00'
                    },
                    {
                        id: 'conjurer-eldril',
                        name: 'Eldril',
                        role: 'Daedra Summoner',
                        quirk: 'Speaks to invisible companions',
                        agenda: 'Master planar travel',
                        voiceId: null,
                        rarityWeight: 0.9,
                        color: '#8B008B'
                    },
                    {
                        id: 'apprentice-galbedir',
                        name: 'Galbedir',
                        role: 'Struggling Apprentice',
                        quirk: 'Nervous, always seeking approval',
                        agenda: 'Pass the guild tests',
                        voiceId: null,
                        rarityWeight: 0.8,
                        color: '#87CEEB'
                    }
                ],
                settings: {},
                messages: []
            },
            {
                id: 'sixth-house-cult',
                title: 'Sixth House Cult',
                emblem: '#2F4F2F',
                loreSeed: 'divine disease transformation, sleepers awake, dreamers, corpus experiments',
                mood: 'unsettling',
                npcs: [
                    {
                        id: 'dagoth-ur',
                        name: 'Dagoth Ur',
                        role: 'God-Heart',
                        quirk: 'Speaks with divine authority',
                        agenda: 'Drive out the outlanders',
                        voiceId: null,
                        rarityWeight: 1.3,
                        color: '#2F4F2F'
                    },
                    {
                        id: 'ascended-sleeper',
                        name: 'Dreamer-Voice',
                        role: 'Ascended Sleeper',
                        quirk: 'Whispers, speaks in dreams',
                        agenda: 'Awaken the sleepers',
                        voiceId: null,
                        rarityWeight: 1.0,
                        color: '#708090'
                    },
                    {
                        id: 'corprus-beast',
                        name: 'Flesh-Changed',
                        role: 'Corprus Victim',
                        quirk: 'Distorted speech, body horror',
                        agenda: 'Spread the divine disease',
                        voiceId: null,
                        rarityWeight: 0.9,
                        color: '#8B7D6B'
                    },
                    {
                        id: 'ash-zombie',
                        name: 'Ash-Wraith',
                        role: 'Mindless Servant',
                        quirk: 'Repetitive, single-minded',
                        agenda: 'Serve Dagoth Ur',
                        voiceId: null,
                        rarityWeight: 0.7,
                        color: '#696969'
                    },
                    {
                        id: 'dreamer-cultist',
                        name: 'True-Believer',
                        role: 'Sixth House Priest',
                        quirk: 'Fanatical, prophetic',
                        agenda: 'Convert all Vvardenfell',
                        voiceId: null,
                        rarityWeight: 1.1,
                        color: '#556B2F'
                    }
                ],
                settings: {},
                messages: []
            }
        ];
    }

    cleanup() {
        // Clear auto-refresh interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        // Save any pending data
        this.saveChats();
        this.saveSettingsToStorage();
    }
}

// Register app initialization function
window.MorrowindOS = window.MorrowindOS || {};
window.MorrowindOS.apps = window.MorrowindOS.apps || {};
window.MorrowindOS.apps.wraiths = function(windowId) {
    window.wraithsApp = new WraithsApp(windowId);
};

function loadAppContent(appName, windowId) {
    if (appName === 'wraiths') {
        // Content is already loaded by WraithsApp constructor
        console.log('WraithsApp content loaded');
    }
}

function cleanupApp(appName, windowId) {
    if (appName === 'wraiths' && window.wraithsApp) {
        window.wraithsApp.cleanup();
        window.wraithsApp = null;
    }
}

// Export for use in main.js
window.loadAppContent = loadAppContent;
window.cleanupApp = cleanupApp;