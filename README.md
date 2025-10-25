# Morrowindows - Dark Fantasy High Elf Themed Operating System

A mystical operating system inspired by Morrowind, featuring a dark fantasy high elf aesthetic with magical apps and interactions.

## Project Overview

Morrowindows is a fully functional web-based operating system that brings the mystical world of Morrowind to your browser. It features a complete desktop environment with draggable windows, a taskbar, context menus, and six unique applications that demonstrate various web development capabilities while maintaining an immersive fantasy experience throughout.

The project is built with modern web technologies and follows best practices for security, particularly around API key management, making it safe for deployment on platforms like GitHub Pages.

## Key Features

- **Complete Desktop Environment**: Fully functional OS interface with window management, taskbar, and system controls
- **Six Unique Applications**: Each app demonstrates different web technologies and use cases
- **Immersive Fantasy Theme**: Consistent Morrowind-inspired design throughout the entire experience
- **Secure API Integration**: Session-based API key storage with automatic cleanup
- **Responsive Design**: Adapts to different screen sizes and devices
- **Modern Web Technologies**: Built with HTML5, CSS3, and JavaScript ES6+

## Features

### Core System
- **Desktop Environment**: Mystical wallpaper with floating particles and mist effects
- **Taskbar**: Fantasy-styled bottom bar with app management
- **Window Management**: Draggable, resizable windows with minimize/maximize/close controls
- **Context Menus**: Right-click menus with fantasy-themed options
- **Loading Screen**: Mystical boot sequence with progress bar

### Applications

1. **OuijaGPT (Oracle)** - A mystical AI-powered divination app
   - Interactive chat interface with ChatGPT integration
   - Fantasy-themed responses and styling
   - Conversation history tracking
   - Secure API key management with session storage
   - Responsive design for mobile and desktop

2. **WraithsApp (Whispering Stone)** - A WhatsApp-style group chat app
   - Multiple fantasy-themed chat groups with unique NPCs
   - AI-generated character responses based on personality profiles
   - Optional voice synthesis using ElevenLabs API
   - Real-time message updates with auto-refresh
   - Customizable settings for voice chance and event frequency

3. **Scrolldit (The Elder Scroll)** - A Reddit-style social media app
   - Fantasy-themed posts and comments
   - AI-generated content using OpenAI
   - Upvoting system
   - Multiple subscrolls (subreddits) with different themes
   - Character-based replies with unique personalities

4. **Timber** - A Dark Souls-inspired game
   - Turn-based combat mechanics
   - Multiple enemy types with increasing difficulty
   - Dice rolling for combat calculations
   - Victory and defeat screens with fantasy styling
   - Sound effects and animations

5. **Abacus** - A mystical calculator app
   - Basic arithmetic operations with fantasy theme
   - Historical calculation tracking
   - Animated number transitions
   - Fantasy-themed button design

6. **Laudify** - A mystical music player
   - Built-in fantasy soundtrack
   - Playlist management
   - Audio controls with custom styling
   - Visual feedback during playback
   - Responsive player interface

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

## Technical Architecture

### Security-First Design
Morrowindows is built with security as a primary consideration, especially around API key management:

- **Session-Based Storage**: API keys are stored in sessionStorage, not localStorage
- **Automatic Cleanup**: Keys are cleared when browser tab/window closes
- **No Server Storage**: Keys never touch our servers
- **Client-Side Only**: API calls made directly from user's browser
- **Transparent Warnings**: Users are clearly informed about key handling

### Modern Web Standards
- **HTML5 Semantic Markup**: Proper document structure for accessibility
- **CSS3 with Custom Properties**: Maintainable theming system
- **JavaScript ES6+**: Modern syntax with modular architecture
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Event-Driven Architecture**: Loose coupling between components
- **Component-Based Apps**: Each application is self-contained

### Performance Optimizations
- **Lazy Loading**: Apps load content only when needed
- **Efficient DOM Manipulation**: Minimal reflows and repaints
- **Optimized Animations**: CSS transforms for smooth 60fps animations
- **Memory Management**: Proper cleanup of event listeners and objects
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