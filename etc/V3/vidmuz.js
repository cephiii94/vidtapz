class VidMuzApp {
    constructor() {
        this.tracks = [];
        this.currentTrack = null;
        this.currentIndex = -1;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadTracks();
        this.renderTracks();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowRight':
                    this.nextTrack();
                    break;
                case 'ArrowLeft':
                    this.previousTrack();
                    break;
            }
        });
    }

    async loadTracks() {
        // Load music tracks
        this.tracks = [
            {
                id: 'music_1',
                title: 'Relaxing Piano Music',
                artist: 'Peaceful Sounds',
                description: 'Beautiful piano melodies for relaxation and study',
                thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'M7lc1UVf-VE',
                embedUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1',
                category: 'classical',
                duration: '3:45'
            },
            {
                id: 'music_2',
                title: 'Upbeat Electronic Dance',
                artist: 'EDM Masters',
                description: 'High energy electronic dance music to get you moving',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'dQw4w9WgXcQ',
                embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
                category: 'electronic',
                duration: '4:12'
            },
            {
                id: 'music_3',
                title: 'Acoustic Guitar Sessions',
                artist: 'Indie Folk',
                description: 'Soothing acoustic guitar with folk influences',
                thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'W6NZfCO5SIk',
                embedUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk?autoplay=1',
                category: 'acoustic',
                duration: '5:23'
            },
            {
                id: 'music_4',
                title: 'Jazz Night Vibes',
                artist: 'Smooth Jazz Collective',
                description: 'Smooth jazz perfect for evening relaxation',
                thumbnail: 'https://img.youtube.com/vi/bO8HaELusLk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'bO8HaELusLk',
                embedUrl: 'https://www.youtube.com/embed/bO8HaELusLk?autoplay=1',
                category: 'jazz',
                duration: '6:15'
            }
        ];
    }

    renderTracks() {
        const musicGrid = document.getElementById('musicGrid');
        
        if (this.tracks.length === 0) {
            musicGrid.innerHTML = `
                <div class="music-loading">
                    <i class="fas fa-music"></i>
                    <p>No music tracks available</p>
                </div>
            `;
            return;
        }

        musicGrid.innerHTML = this.tracks.map((track, index) => `
            <div class="music-card ${this.currentIndex === index ? 'playing' : ''}" 
                 onclick="app.playTrack(${index})">
                <div class="music-thumbnail">
                    <img src="${track.thumbnail}" alt="${track.title}">
                    <div class="music-play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    ${this.currentIndex === index ? '<div class="playing-indicator">Playing</div>' : ''}
                </div>
                <div class="music-info">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                    <p>${track.duration}</p>
                    <div class="music-badges">
                        <span class="music-badge">${track.category}</span>
                        <span class="music-badge">${track.platform}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    playTrack(index) {
        this.currentIndex = index;
        this.currentTrack = this.tracks[index];
        this.isPlaying = true;
        
        // Update now playing section
        this.updateNowPlaying();
        
        // Update UI
        this.updatePlayButtons();
        this.renderTracks();
        
        console.log('Playing:', this.currentTrack.title);
    }

    updateNowPlaying() {
        if (!this.currentTrack) return;
        
        document.getElementById('playerArt').src = this.currentTrack.thumbnail;
        document.getElementById('playerTitle').textContent = this.currentTrack.title;
        document.getElementById('playerArtist').textContent = this.currentTrack.artist;
        
        // In a real app, you would embed the audio/video player here
        // For demo purposes, we'll simulate playback
        this.simulatePlayback();
    }

    simulatePlayback() {
        // Simulate audio playback progress
        const totalSeconds = this.parseDuration(this.currentTrack.duration);
        this.duration = totalSeconds;
        this.currentTime = 0;
        
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }
        
        this.playbackInterval = setInterval(() => {
            if (this.isPlaying && this.currentTime < this.duration) {
                this.currentTime++;
                this.updateProgress();
            } else if (this.currentTime >= this.duration) {
                this.nextTrack();
            }
        }, 1000);
        
        this.updateProgress();
    }

    parseDuration(duration) {
        const parts = duration.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        document.getElementById('progress').style.width = progress + '%';
        document.getElementById('currentTime').textContent = this.formatTime(this.currentTime);
        document.getElementById('totalTime').textContent = this.formatTime(this.duration);
    }

    togglePlayPause() {
        if (!this.currentTrack) {
            if (this.tracks.length > 0) {
                this.playTrack(0);
            }
            return;
        }
        
        this.isPlaying = !this.isPlaying;
        this.updatePlayButtons();
        
        console.log(this.isPlaying ? 'Playing' : 'Paused');
    }

    updatePlayButtons() {
        const playPauseIcon = document.getElementById('playPauseIcon');
        const mainPlayIcon = document.getElementById('mainPlayIcon');
        const iconClass = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        
        if (playPauseIcon) playPauseIcon.className = iconClass;
        if (mainPlayIcon) mainPlayIcon.className = iconClass;
    }

    nextTrack() {
        if (this.tracks.length === 0) return;
        
        const nextIndex = (this.currentIndex + 1) % this.tracks.length;
        this.playTrack(nextIndex);
    }

    previousTrack() {
        if (this.tracks.length === 0) return;
        
        const prevIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.tracks.length - 1;
        this.playTrack(prevIndex);
    }

    seekTo(event) {
        if (!this.currentTrack) return;
        
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        this.currentTime = Math.floor(this.duration * percentage);
        this.updateProgress();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        const iconClass = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;
    }
}

// Global functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const isActive = mobileMenu.classList.contains('active');
    
    if (isActive) {
        mobileMenu.classList.remove('active');
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.classList.add('active');
        mobileMenu.style.display = 'block';
    }
}

function toggleTheme() {
    app.theme = app.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', app.theme);
    app.applyTheme();
}

function togglePlayPause() {
    app.togglePlayPause();
}

function nextTrack() {
    app.nextTrack();
}

function previousTrack() {
    app.previousTrack();
}

function seekTo(event) {
    app.seekTo(event);
}

function searchMusic() {
    const query = document.getElementById('searchInput').value;
    console.log('Searching music:', query);
    // Add search functionality
}

// Initialize app
const app = new VidMuzApp();
