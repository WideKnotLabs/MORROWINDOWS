# Morrowindows - Dark Fantasy High Elf Themed Operating System

A mystical operating system inspired by Morrowind, featuring a dark fantasy high elf aesthetic with magical apps and interactions.

## Features

### Core System
- **Desktop Environment**: Mystical wallpaper with floating particles and mist effects
- **Taskbar**: Fantasy-styled bottom bar with app management
- **Window Management**: Draggable, resizable windows with minimize/maximize/close controls
- **Context Menus**: Right-click menus with fantasy-themed options
- **Loading Screen**: Mystical boot sequence with progress bar

### Applications

1. **Spellbook** - A magical notes application for storing arcane knowledge
   - Create, edit, and delete notes
   - Auto-save functionality
   - Export notes as JSON files
   - Search through notes

2. **Oracle** - A ChatGPT-powered divination app
   - Ask questions to a mystical AI oracle
   - Conversation history
   - Fantasy-themed responses
   - API key configuration

3. **Whispering Stone** - A voice communication app (ElevenLabs integration)
   - Dialer interface with fantasy styling
   - Contact management
   - Call history
   - Voice synthesis capabilities

4. **Fated Encounters** - A mystical dating app
   - 20 unique fantasy characters with detailed profiles
   - Swipe interface to accept or reject matches
   - Compatibility system based on elemental affinities
   - Match history

5. **The Elder Scroll** - A Reddit-style social media app
   - Create posts with AI-generated content
   - Upvote and comment system
   - Fantasy-themed posts and interactions
   - Post history

6. **Dungeons & Dragons Minigame** - A fantasy RPG game
   - 6 character classes (Warrior, Mage, Rogue, Cleric, Ranger, Paladin)
   - Turn-based combat system
   - Dice rolling mechanics
   - Enemy encounters with different difficulty levels
   - Victory and defeat screens

## Technical Implementation

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with animations and transitions
- **JavaScript ES6+**: Modular code with class-based architecture
- **Responsive Design**: Adapts to different screen sizes

### Architecture
- **Component-based**: Each app is a self-contained module
- **Event-driven**: Uses event listeners for user interactions
- **State Management**: Centralized state management for the OS
- **Local Storage**: Persists user data and preferences

### Design System
- **Dark Fantasy Theme**: Deep blues, purples, and mystical accents
- **High Elf Aesthetic**: Elegant, magical, and ethereal visual elements
- **Micro-interactions**: Hover effects, transitions, and animations
- **World-building**: Consistent fantasy lore and terminology throughout

## Installation

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No additional setup required

## Usage

1. **Desktop**: Double-click on app icons to launch applications
2. **Start Menu**: Click the mystical orb in the taskbar to access all apps
3. **Window Management**: Drag windows by title bar, use controls to minimize/maximize/close
4. **Keyboard Shortcuts**: 
   - `Alt + Tab`: Switch between windows
   - `Ctrl + S`: Save in most apps
   - `Ctrl + N`: New note/document
   - `Escape`: Close menus or dialogs

## API Integration

### OpenAI (Oracle & Elder Scroll)
- Requires an OpenAI API key
- Configure in app settings
- Used for generating AI responses and content

### ElevenLabs (Whispering Stone)
- Requires an ElevenLabs API key
- Configure in app settings
- Used for voice synthesis

### API Key Security

**IMPORTANT**: Your API keys are valuable and should be protected. Here's how Morrowindows handles your API keys:

#### Storage Method
- API keys are stored in **sessionStorage**, not localStorage
- Keys are automatically cleared when you close the browser tab or window
- Keys are never stored on our servers or in your browser's persistent storage

#### Security Benefits
- **Session-based**: Keys only exist during your current browsing session
- **Auto-cleanup**: Keys are automatically removed when you close the tab/window
- **No persistence**: Keys are not saved between browser sessions
- **Client-side only**: Keys never leave your browser except for legitimate API calls

#### Security Considerations
- Keys are stored as plain text in browser memory during your session
- Anyone with physical access to your device during your session could potentially access them
- Malicious browser extensions could potentially access the keys
- Keys are visible in browser developer tools during your session

#### Best Practices
1. **Never share your API keys** with anyone
2. **Use API keys with limited permissions** and usage quotas
3. **Monitor your API usage** regularly through your provider's dashboard
4. **Regenerate keys** if you suspect they've been compromised
5. **Close the browser tab** when you're done using Morrowindows to clear the keys

#### Deployment Security
When deployed to GitHub Pages or similar static hosting:
- No API keys are hardcoded in the application
- Each user must provide their own API keys
- This ensures no one can abuse your API quota
- Your keys remain private to your browsing session

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## Development

To extend or modify the operating system:

1. **Add New Apps**: Create a new app class in `js/apps/`
2. **Modify Theme**: Update CSS variables in `css/main.css`
3. **Add Features**: Implement new functionality in the core system files

## License

This project is open source and available under the MIT License.

## Credits

Created with mystical energy by a team of fantasy enthusiasts and developers.