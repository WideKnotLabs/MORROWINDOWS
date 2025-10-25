// Laudify - Mystical Music Player App
class LaudifyApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentTrack = null;
        this.isPlaying = false;
        this.audio = new Audio();
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.volume = 0.7;
        this.isRepeat = false;
        this.isShuffle = false;
        this.playlist = [];

        this.init();
    }

    init() {
        this.loadTracks();
        this.render();
        this.setupEventListeners();
        this.setupAudioEvents();
    }

    loadTracks() {
        // Load tracks from public/music folder
        this.tracks = [
            {
                id: 1,
                title: "Shadows of Vvardenfell",
                artist: "Alcomar",
                file: "Alcomar - Shadows of Vvardenfell.wav",
                duration: "3:45"
            },
            {
                id: 2,
                title: "Start of the Quest",
                artist: "Aliortis",
                file: "Aliortis - Start of the Quest.mp3",
                duration: "4:12"
            },
            {
                id: 3,
                title: "War Shadow",
                artist: "Argula",
                file: "Argula - War Shadow.wav",
                duration: "3:30"
            },
            {
                id: 4,
                title: "Dirge of the Midnight Crown",
                artist: "Aura",
                file: "Aura - Dirge of the Midnight Crown.wav",
                duration: "5:23"
            },
            {
                id: 5,
                title: "Whisper of Shadows",
                artist: "Bi Li Eilish",
                file: "Bi Li Eilish - Whisper of Shadows.wav",
                duration: "3:58"
            },
            {
                id: 6,
                title: "The Raven's Call",
                artist: "Fangst",
                file: "Fangst - The Raven's Call.mp3",
                duration: "4:37"
            },
            {
                id: 7,
                title: "Whispered Shadows",
                artist: "Sombra",
                file: "Sombra - Whispered Shadows.mp3",
                duration: "4:15"
            },
            {
                id: 8,
                title: "Shadows of the Iron Tide",
                artist: "Warjura",
                file: "Warjura - Shadows of the Iron Tide.mp3",
                duration: "5:02"
            }
        ];

        // Initialize playlist with all tracks
        this.playlist = [...this.tracks];
    }

    render() {
        const contentElement = document.getElementById(`${this.windowId}-content`);
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="laudify-content">
                <div class="laudify-header">
                    <div class="laudify-logo laudify-icon"></div>
                    <div class="laudify-title">Laudify</div>
                    <div class="laudify-subtitle">Mystical Music Player</div>
                </div>
                
                <div class="laudify-main">
                    <div class="laudify-player">
                        <div class="laudify-album-art" id="laudify-album-art">
                            <div class="laudify-album-placeholder">
                                <div class="laudify-album-icon">🎵</div>
                            </div>
                        </div>
                        
                        <div class="laudify-track-info">
                            <div class="laudify-track-title" id="laudify-track-title">No Track Selected</div>
                            <div class="laudify-track-artist" id="laudify-track-artist">Choose a track to play</div>
                        </div>
                        
                        <div class="laudify-progress-container">
                            <div class="laudify-time-current" id="laudify-time-current">0:00</div>
                            <div class="laudify-progress">
                                <div class="laudify-progress-bar" id="laudify-progress-bar"></div>
                            </div>
                            <div class="laudify-time-total" id="laudify-time-total">0:00</div>
                        </div>
                        
                        <div class="laudify-controls">
                            <button class="laudify-btn laudify-btn-control" id="laudify-shuffle-btn" title="Shuffle">
                                <span class="laudify-control-icon">🔀</span>
                            </button>
                            <button class="laudify-btn laudify-btn-control" id="laudify-prev-btn" title="Previous">
                                <span class="laudify-control-icon">⏮</span>
                            </button>
                            <button class="laudify-btn laudify-btn-play" id="laudify-play-btn" title="Play">
                                <span class="laudify-control-icon">▶</span>
                            </button>
                            <button class="laudify-btn laudify-btn-control" id="laudify-next-btn" title="Next">
                                <span class="laudify-control-icon">⏭</span>
                            </button>
                            <button class="laudify-btn laudify-btn-control" id="laudify-repeat-btn" title="Repeat">
                                <span class="laudify-control-icon">🔁</span>
                            </button>
                        </div>
                        
                        <div class="laudify-volume-container">
                            <span class="laudify-control-icon">🔊</span>
                            <div class="laudify-volume">
                                <div class="laudify-volume-bar" id="laudify-volume-bar"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="laudify-playlist">
                        <div class="laudify-playlist-header">
                            <h3>Morrowind Melodies</h3>
                        </div>
                        <div class="laudify-track-list" id="laudify-track-list">
                            ${this.renderTrackList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateVolumeDisplay();
    }

    renderTrackList() {
        return this.tracks.map((track, index) => `
            <div class="laudify-track-item ${this.currentTrackIndex === index ? 'active' : ''}" data-track-id="${track.id}" data-index="${index}">
                <div class="laudify-track-number">${index + 1}</div>
                <div class="laudify-track-info">
                    <div class="laudify-track-name">${track.title}</div>
                    <div class="laudify-track-artist-name">${track.artist}</div>
                </div>
                <div class="laudify-track-duration">${track.duration}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Play/Pause button
        const playBtn = document.getElementById('laudify-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Previous button
        const prevBtn = document.getElementById('laudify-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.playPrevious());
        }

        // Next button
        const nextBtn = document.getElementById('laudify-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.playNext());
        }

        // Shuffle button
        const shuffleBtn = document.getElementById('laudify-shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }

        // Repeat button
        const repeatBtn = document.getElementById('laudify-repeat-btn');
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }

        // Volume control
        const volumeBar = document.getElementById('laudify-volume-bar');
        if (volumeBar) {
            volumeBar.addEventListener('click', (e) => this.setVolume(e));
        }

        // Progress bar
        const progressBar = document.getElementById('laudify-progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => this.seekTo(e));
        }

        // Track list items
        const trackItems = document.querySelectorAll('.laudify-track-item');
        trackItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.playTrack(index);
            });
        });


        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.getElementById(`${this.windowId}-content`)) {
                this.handleKeyPress(e);
            }
        });
    }

    setupAudioEvents() {
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
    }

    handleKeyPress(e) {
        // Only handle if this window is active
        if (window.MorrowindOS.activeWindow !== this.windowId) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowRight':
                this.playNext();
                break;
            case 'ArrowLeft':
                this.playPrevious();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.adjustVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.adjustVolume(-0.1);
                break;
        }
    }

    playTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;

        // Stop current playback if any
        this.audio.pause();

        this.currentTrackIndex = index;
        this.currentTrack = this.tracks[index];

        // Update UI
        this.updateTrackInfo();
        this.updateTrackListHighlight();

        // Load and play track
        const trackUrl = `public/music/${this.currentTrack.file}`;
        this.audio.src = trackUrl;

        // Set up a one-time event to start playing only when audio is ready
        const playWhenReady = () => {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayButton();
                })
                .catch(error => {
                    console.error('Play error:', error);
                    this.isPlaying = false;
                    this.updatePlayButton();
                });
            this.audio.removeEventListener('canplay', playWhenReady);
        };

        this.audio.addEventListener('canplay', playWhenReady);

        // Set a timeout in case canplay doesn't fire
        setTimeout(() => {
            this.audio.removeEventListener('canplay', playWhenReady);
            if (!this.isPlaying) {
                this.isPlaying = false;
                this.updatePlayButton();
            }
        }, 3000);
    }

    togglePlayPause() {
        if (!this.currentTrack) {
            // If no track is selected, play first track
            this.playTrack(0);
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play();
            this.isPlaying = true;
        }

        this.updatePlayButton();
    }

    playNext() {
        if (this.tracks.length === 0) return;

        let nextIndex;
        if (this.isShuffle) {
            // Get a random track that's not the current one
            do {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            } while (nextIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else {
            nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }

        this.playTrack(nextIndex);
    }

    playPrevious() {
        if (this.tracks.length === 0) return;

        let prevIndex;
        if (this.isShuffle) {
            // Get a random track that's not the current one
            do {
                prevIndex = Math.floor(Math.random() * this.tracks.length);
            } while (prevIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else {
            prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        }

        this.playTrack(prevIndex);
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const shuffleBtn = document.getElementById('laudify-shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.isShuffle);
        }
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const repeatBtn = document.getElementById('laudify-repeat-btn');
        if (repeatBtn) {
            repeatBtn.classList.toggle('active', this.isRepeat);
        }
    }

    setVolume(e) {
        const volumeBar = e.currentTarget;
        const rect = volumeBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.volume = percent;
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        const volumeBar = document.getElementById('laudify-volume-bar');
        if (volumeBar) {
            volumeBar.style.width = `${this.volume * 100}%`;
        }
    }

    seekTo(e) {
        if (!this.audio.duration) return;

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    }

    updateProgress() {
        if (!this.audio.duration) return;

        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        const progressBar = document.getElementById('laudify-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }

        const currentTimeEl = document.getElementById('laudify-time-current');
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        const totalTimeEl = document.getElementById('laudify-time-total');
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    updateTrackInfo() {
        if (!this.currentTrack) return;

        const titleEl = document.getElementById('laudify-track-title');
        const artistEl = document.getElementById('laudify-track-artist');

        if (titleEl) titleEl.textContent = this.currentTrack.title;
        if (artistEl) artistEl.textContent = this.currentTrack.artist;
    }

    updateTrackListHighlight() {
        const trackItems = document.querySelectorAll('.laudify-track-item');
        trackItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentTrackIndex);
        });
    }

    updatePlayButton() {
        const playBtn = document.getElementById('laudify-play-btn');
        if (playBtn) {
            const icon = playBtn.querySelector('.laudify-control-icon');
            if (icon) {
                icon.textContent = this.isPlaying ? '⏸' : '▶';
            }
        }
    }

    onTrackEnded() {
        if (this.isRepeat) {
            // Repeat the current track
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            // Play the next track
            this.playNext();
        }
    }

    onAudioError(e) {
        console.error('Audio error:', e);
        // Don't automatically play next track on error to prevent infinite loop
        this.isPlaying = false;
        this.updatePlayButton();

        // Show error notification
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification('Playback Error', 'Could not play this track. Please try another one.', 'error');
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }


    cleanup() {
        // Clean up audio and event listeners
        this.audio.pause();
        this.audio.src = '';

        // Remove keyboard event listener
        document.removeEventListener('keydown', this.handleKeyPress);

        console.log('Laudify app cleaned up');
    }
}

// Initialize function for app
function initLaudifyApp(windowId) {
    window.laudifyApp = new LaudifyApp(windowId);
}

// Register app
window.MorrowindOS = window.MorrowindOS || {};
window.MorrowindOS.apps = window.MorrowindOS.apps || {};
window.MorrowindOS.apps.laudify = initLaudifyApp;

// Cleanup function
function cleanupLaudifyApp(appName, windowId) {
    if (appName === 'laudify' && window.laudifyApp) {
        window.laudifyApp.cleanup();
        window.laudifyApp = null;
    }
}

// Load app content function
function loadLaudifyAppContent(appName, windowId) {
    if (appName === 'laudify') {
        // Content is already loaded by the LaudifyApp constructor
        console.log('Laudify content loaded');
    }
}