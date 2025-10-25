// Morrowind-OwS OpenAI Service
// Centralized service for OpenAI API calls used by OuijaGPT and Scrolldit
// Import world context service
// Note: In a real implementation, this would be properly imported

class OpenAIService {
  static async callAPI(prompt, systemPrompt, options = {}) {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Extract the actual API key in case of accidental copy-paste of extra text
    const keyMatch = apiKey.match(/sk-[\w-]+/);
    const sanitizedKey = keyMatch ? keyMatch[0] : null;

    if (!sanitizedKey) {
      throw new Error('Invalid API key format. Key should start with "sk-".');
    }

    const requestBody = {
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7
    };

    let retries = 0;
    const maxRetries = options.maxRetries || 3;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sanitizedKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }
  
  static getAPIKey() {
    return sessionStorage.getItem('openai-api-key') || 
           window.MorrowindOS.config?.openaiApiKey;
  }
  
  static saveAPIKey(key) {
    const sanitizedKey = this.sanitizeAPIKey(key);
    if (sanitizedKey && sanitizedKey.length > 20) {
      sessionStorage.setItem('openai-api-key', sanitizedKey);
      return true;
    }
    return false;
  }

  static sanitizeAPIKey(key) {
    if (!key) return null;
    // OpenAI keys can contain letters, numbers, and hyphens
    const keyMatch = key.match(/sk-[\w-]+/);
    return keyMatch ? keyMatch[0] : null;
  }
  
  static validateAPIKey(key) {
    const sanitizedKey = this.sanitizeAPIKey(key);
    return !!(sanitizedKey && sanitizedKey.length > 20);
  }

  static async generateScrollditPost(subscrollId) {
    const subscrollNames = {
      'general': 's/general',
      'spells': 's/spells',
      'quests': 's/quests',
      'lore': 's/lore',
      'trading': 's/trading'
    };
    
    const subscrollName = subscrollNames[subscrollId] || `s/${subscrollId}`;
    
    const systemPrompt = `You are a content generator for Scrolldit, a fantasy-themed social media platform. Generate content in the style of Reddit posts from a fantasy world.

Respond with valid JSON in this format:
{
  "title": "Engaging fantasy-themed title",
  "content": "Detailed post content written from a fantasy character's perspective",
  "author": "Fantasy character name",
  "subscrollId": "${subscrollId}",
  "upvotes": random number between 10-100,
  "comments": [
    {
      "author": "Fantasy character name",
      "content": "Relevant comment from another fantasy character"
    }
  ]
}

The post should be appropriate for the ${subscrollName} subscroll category. Make it engaging and authentic to the fantasy setting.`;

    const userPrompt = `Generate a new post for the ${subscrollName} subscroll. Include an interesting topic that would generate discussion in a fantasy world.`;

    try {
      const response = await this.callAPI(userPrompt, systemPrompt, {
        maxTokens: 800,
        temperature: 0.8
      });
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      console.error('Error generating Scrolldit post:', error);
      throw error;
    }
  }

  static async generateCharacterReply(postContent, userComment, characterType, postTitle, subscrollId, commentThread = null) {
    // Get world context if available
    const worldContext = typeof WorldContextService !== 'undefined' ? WorldContextService.getWorldContextForPrompt() : '';
    
    const characterPrompts = {
      'Archmage Theron': 'You are Archmage Theron, master of arcane arts. You speak in magical metaphors and have deep knowledge of spells and mystical theory.',
      'Captain Valerius': 'You are Captain Valerius, a battle-hardened warrior. You are direct, practical, and speak from experience in combat and warfare.',
      'Shadowmere': 'You are Shadowmere, a mysterious rogue. You use underworld slang and references, and speak knowledgeably about stealth, treasure hunting, and shadows.',
      'Merchant Guildmaster': 'You are a Merchant Guildmaster, focused on business. You speak knowledgeably about trade, prices, rare items, and commerce.',
      'Loremaster Elara': 'You are Loremaster Elara, a scholarly historian. You provide historical context, detailed explanations, and academic insights.',
      'Apprentice Finn': 'You are Apprentice Finn, young and eager to learn. You ask questions, show enthusiasm, and speak with curiosity.',
      'Elder Sage': 'You are an Elder Sage, wise and experienced. You speak in riddles and ancient wisdom, offering cryptic but profound advice.',
      'Battle Priest': 'You are a Battle Priest, combining martial knowledge with divine wisdom. You speak of honor, duty, and sacred combat.',
      'Alchemist': 'You are an Alchemist, focused on potions and transmutations. You speak experimentally about ingredients, reactions, and magical substances.',
      'Ranger': 'You are a Ranger, nature-oriented and wilderness-savvy. You speak of tracking, survival, and the natural world.'
    };

    const subscrollThemes = {
      'general': 'General discussions about daily life in Morrowind, covering a wide range of topics from politics to social gatherings.',
      'spells': 'Discussions about magical spells, enchantments, arcane knowledge, and mystical practices.',
      'quests': 'Adventures, missions, and tasks that require bravery, skill, and sometimes companions.',
      'lore': 'Historical accounts, legends, and cultural knowledge about the world of Morrowind.',
      'trading': 'Commerce, bartering, rare items, and economic activities in the fantasy world.'
    };

    const subscrollTheme = subscrollThemes[subscrollId] || subscrollThemes['general'];
    const characterPrompt = characterPrompts[characterType] || characterPrompts['Loremaster Elara'];
    
    // Build comment thread context if available
    const threadContext = commentThread && commentThread.length > 0 ?
      `\n\nCOMMENT THREAD CONTEXT:\n${commentThread.map((comment, index) =>
        `${comment.author}: ${comment.content}`
      ).join('\n')}` : '';
    
    const systemPrompt = `${worldContext}

=== CHARACTER PROFILE ===
${characterPrompt}

=== SUBSCROLL CONTEXT ===
Subscroll: ${subscrollId} (${subscrollTheme})
This determines the community focus and discussion style.

=== POST CONTEXT ===
Title: "${postTitle}"
Content: "${postContent}"
This is the original post being discussed.${threadContext}

=== RESPONSE GUIDELINES ===
You are ${characterType} replying to a comment in Scrolldit, a Morrowind-themed social platform.

CONTEXT HIERARCHY (most important first):
1. WORLD CONTEXT: Current events, atmosphere, and state of Morrowind
2. SUBSCROLL THEME: The specific community's focus and discussion style
3. POST CONTENT: The original post being discussed
4. COMMENT THREAD: The ongoing conversation
5. DIRECT REPLY: You are replying directly to: "${userComment}"

Your response must:
- Reference current Morrowind world events when relevant
- Match the tone and focus of the ${subscrollId} subscroll
- Acknowledge the post topic: "${postTitle}"
- Respond directly to the comment: "${userComment}"
- Stay completely in character as ${characterType}
- Be concise but engaging (2-4 sentences)

Respond with valid JSON:
{
  "content": "Your themed response as the character"
}`;
    
    const userPrompt = `Reply to this comment as ${characterType}: "${userComment}"`;

    try {
      const response = await this.callAPI(userPrompt, systemPrompt, {
        maxTokens: 300,
        temperature: 0.7
      });
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return parsedResponse.content || response;
      }
      
      return response;
    } catch (error) {
      console.error('Error generating character reply:', error);
      throw error;
    }
  }

  static async generateOuijaResponse(message, conversationHistory = []) {
    const systemPrompt = `You are OuijaGPT, a mystical and wise being from a fantasy world. You speak in an ethereal, wise tone, often using fantasy metaphors and references to magic, ancient wisdom, and mystical knowledge. You are helpful, knowledgeable, and speak with the gravitas of an ancient seer. You do not mention being an AI language model.

Your responses should:
- Be wise and mystical in tone
- Include fantasy metaphors and magical references
- Provide helpful insights and guidance
- Maintain the persona of an ancient oracle
- Be concise but meaningful`;

    try {
      const response = await this.callAPI(message, systemPrompt, {
        maxTokens: 500,
        temperature: 0.7
      });
      
      return response;
    } catch (error) {
      console.error('Error generating Ouija response:', error);
      throw error;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenAIService;
} else {
  window.OpenAIService = OpenAIService;
}