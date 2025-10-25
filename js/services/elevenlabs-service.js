// Morrowind-OwS ElevenLabs Service
// Centralized service for ElevenLabs TTS API calls used by WraithsApp

class ElevenLabsService {
    static async callAPI(text, voiceId, options = {}) {
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            throw new Error('ElevenLabs API key not configured');
        }

        const requestBody = {
            text: text,
            model_id: options.modelId || 'eleven_monolingual_v1',
            voice_settings: {
                stability: options.stability || 0.45,
                similarity_boost: options.similarityBoost || 0.75,
                style: options.style || 0.0,
                use_speaker_boost: options.useSpeakerBoost !== false
            }
        };

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);
        } catch (error) {
            console.error('ElevenLabs API error:', error);
            throw error;
        }
    }

    static getAPIKey() {
        return sessionStorage.getItem('elevenlabs-api-key') || 
               window.MorrowindOS.config?.elevenlabsApiKey;
    }
    
    static saveAPIKey(key) {
        if (key && key.trim().length > 10) {
            sessionStorage.setItem('elevenlabs-api-key', key.trim());
            return true;
        }
        return false;
    }

    static validateAPIKey(key) {
        return !!(key && key.trim().length > 10);
    }

    static getVoicePool() {
        return [
            // Male voices
            { id: 'PIGsltMj3gFMR34aFDI3', name: 'Adam', gender: 'male', accent: 'american' },
            { id: 'LruHrtVF6PSyGItzMNHS', name: 'Sam', gender: 'male', accent: 'british' },
            { id: 'GUDYcgRAONiI1nXDcNQQ', name: 'Arnold', gender: 'male', accent: 'american' },
            
            // Female voices
            { id: 'EXAVITGu4C4rW3tX2DQ2', name: 'Bella', gender: 'female', accent: 'american' },
            { id: 'ErXwobaJiN0UyJm4U0J', name: 'Rachel', gender: 'female', accent: 'american' }
        ];
    }

    static getRandomVoiceId(gender = null, accent = null) {
        // First check if custom VoiceIDs are available in WraithsApp settings
        if (window.wraithsApp && window.wraithsApp.settings && window.wraithsApp.settings.voiceIds && window.wraithsApp.settings.voiceIds.length > 0) {
            const customVoiceIds = window.wraithsApp.settings.voiceIds;
            const randomIndex = Math.floor(Math.random() * customVoiceIds.length);
            return customVoiceIds[randomIndex];
        }

        // Fallback to default voice pool
        let filteredVoices = this.getVoicePool();

        if (gender) {
            filteredVoices = filteredVoices.filter(voice => voice.gender === gender);
        }

        if (accent) {
            filteredVoices = filteredVoices.filter(voice => voice.accent === accent);
        }

        if (filteredVoices.length === 0) {
            // Fallback to the full list if no voices match the criteria
            filteredVoices = this.getVoicePool();
        }

        const randomIndex = Math.floor(Math.random() * filteredVoices.length);
        return filteredVoices[randomIndex].id;
    }

    static getVoiceById(voiceId) {
        const voicePool = this.getVoicePool();
        return voicePool.find(voice => voice.id === voiceId);
    }

    static getVoicesByTag(tag) {
        const voicePool = this.getVoicePool();
        
        switch (tag) {
            case 'light':
                return voicePool.filter(voice => 
                    ['Bella', 'Elli', 'Domi', 'Gigi', 'Aria', 'Jess'].includes(voice.name)
                );
            case 'dark':
                return voicePool.filter(voice => 
                    ['Arnold', 'Clyde', 'Paul', 'Drew'].includes(voice.name)
                );
            case 'ashlander':
                return voicePool.filter(voice => 
                    ['Arnold', 'Clyde', 'Rachel', 'Nicole'].includes(voice.name)
                );
            case 'imperial':
                return voicePool.filter(voice => 
                    ['Adam', 'Sam', 'Bella', 'Rachel'].includes(voice.name)
                );
            default:
                return voicePool;
        }
    }

    static async generateSpeech(text, voiceId, options = {}) {
        try {
            const audioUrl = await this.callAPI(text, voiceId, options);
            return {
                success: true,
                audioUrl: audioUrl,
                voiceId: voiceId
            };
        } catch (error) {
            console.error('Error generating speech:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async testVoice(voiceId) {
        const testText = "This is a test of the voice synthesis system.";
        return await this.generateSpeech(testText, voiceId);
    }

    static revokeAudioUrl(audioUrl) {
        if (audioUrl && audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElevenLabsService;
} else {
    window.ElevenLabsService = ElevenLabsService;
}