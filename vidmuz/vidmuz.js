class VidMuzApp {
    constructor() {
        this.tracks = [];
        this.allVideos = [];
        this.currentTrack = null;
        this.currentIndex = -1;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.theme = localStorage.getItem('theme') || 'light';
        this.progressInterval = null;
        
        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadTracks();
        this.renderTracks();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce(() => this.searchMusic(e.target.value), 300)();
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    if (!e.target.matches('input')) {
                        e.preventDefault();
                        this.togglePlayPause();
                    }
                    break;
                case 'ArrowRight':
                    if (!e.target.matches('input')) {
                        e.preventDefault();
                        this.nextTrack();
                    }
                    break;
                case 'ArrowLeft':
                    if (!e.target.matches('input')) {
                        e.preventDefault();
                        this.previousTrack();
                    }
                    break;
            }
        });
    }

    async loadTracks() {
        this.showLoading(true);
        console.log('🔄 VidMuz: Starting to load tracks...');
        
        try {
            let allVideos = [];
            
            // 1. Load dari videos.js
            console.log('📁 VidMuz: Loading from videos.js...');
            const jsVideos = await this.loadVideosFromJS();
            if (jsVideos.length > 0) {
                allVideos = [...allVideos, ...jsVideos];
                console.log(`✅ VidMuz: Loaded ${jsVideos.length} videos from videos.js`);
                
                // Debug: Check music videos from JS
                const musicFromJS = jsVideos.filter(video => video.category === 'music');
                console.log(`🎵 VidMuz: Found ${musicFromJS.length} music videos from JS:`, musicFromJS);
            } else {
                console.log('❌ VidMuz: No videos found in videos.js');
            }
            
            // 2. Load dari videos.json
            console.log('📁 VidMuz: Loading from videos.json...');
            const jsonVideos = await this.loadVideosFromJSON();
            if (jsonVideos.length > 0) {
                allVideos = [...allVideos, ...jsonVideos];
                console.log(`✅ VidMuz: Loaded ${jsonVideos.length} videos from videos.json`);
                
                // Debug: Check music videos from JSON
                const musicFromJSON = jsonVideos.filter(video => video.category === 'music');
                console.log(`🎵 VidMuz: Found ${musicFromJSON.length} music videos from JSON:`, musicFromJSON);
            } else {
                console.log('❌ VidMuz: No videos found in videos.json');
            }
            
            // 3. Tambahkan default videos jika diperlukan
            if (allVideos.length === 0) {
                console.log('📁 VidMuz: No external videos found, loading default videos...');
                const defaultVideos = this.getDefaultVideos();
                allVideos = [...allVideos, ...defaultVideos];
                console.log(`✅ VidMuz: Loaded ${defaultVideos.length} default videos`);
            }
            
            // Simpan semua video
            this.allVideos = this.removeDuplicateVideos(allVideos);
            console.log(`📚 VidMuz: Total unique videos: ${this.allVideos.length}`);
            
            // Filter hanya video musik
            this.tracks = this.allVideos.filter(video => {
                const isMusic = video.category === 'music';
                if (isMusic) {
                    console.log(`🎵 VidMuz: Found music track - ${video.id}: ${video.title}`);
                }
                return isMusic;
            });
            
            console.log(`🎵 VidMuz: Total music tracks after filtering: ${this.tracks.length}`);
            
            // Jika masih tidak ada musik, tambahkan default music tracks
            if (this.tracks.length === 0) {
                console.log('🎵 VidMuz: No music found, adding default music tracks...');
                const defaultMusic = this.getDefaultMusicTracks();
                this.tracks = defaultMusic;
                // Juga tambahkan ke allVideos agar konsisten
                this.allVideos = [...this.allVideos, ...defaultMusic];
                console.log(`✅ VidMuz: Added ${defaultMusic.length} default music tracks`);
            }
            
            console.log(`🎵 VidMuz: Final music tracks count: ${this.tracks.length}`);
            this.tracks.forEach(track => {
                console.log(`  - ${track.id}: ${track.title} (${track.artist || 'Unknown Artist'})`);
            });
            
        } catch (error) {
            console.error('❌ VidMuz: Error loading music tracks:', error);
            console.log('🎵 VidMuz: Falling back to default music tracks...');
            this.tracks = this.getDefaultMusicTracks();
            this.allVideos = [...this.tracks]; // Ensure allVideos contains the defaults
        }
        
        this.showLoading(false);
    }

    async loadVideosFromJS() {
        return new Promise((resolve) => {
            try {
                let allVideos = [];
                
                // Load from VIDTAPZ_VIDEOS
                if (window.VIDTAPZ_VIDEOS && Array.isArray(window.VIDTAPZ_VIDEOS)) {
                    console.log('✅ VidMuz: window.VIDTAPZ_VIDEOS found with', window.VIDTAPZ_VIDEOS.length, 'videos');
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS];
                } else {
                    console.log('❌ VidMuz: window.VIDTAPZ_VIDEOS not found or not an array');
                }
                
                // Load from VIDTAPZ_VIDEOS_MUSIC
                if (window.VIDTAPZ_VIDEOS_MUSIC && Array.isArray(window.VIDTAPZ_VIDEOS_MUSIC)) {
                    console.log('✅ VidMuz: window.VIDTAPZ_VIDEOS_MUSIC found with', window.VIDTAPZ_VIDEOS_MUSIC.length, 'music videos');
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS_MUSIC];
                } else {
                    console.log('❌ VidMuz: window.VIDTAPZ_VIDEOS_MUSIC not found or not an array');
                }
                
                resolve(allVideos);
            } catch (error) {
                console.warn('❌ VidMuz: Error loading from videos.js:', error);
                resolve([]);
            }
        });
    }

    async loadVideosFromJSON() {
        try {
            const response = await fetch('./videos.json');
            if (response.ok) {
                const data = await response.json();
                const videos = data.videos || [];
                console.log('✅ VidMuz: videos.json loaded with', videos.length, 'videos');
                return videos;
            } else {
                console.log('❌ VidMuz: videos.json not found or error loading (status:', response.status, ')');
                return [];
            }
        } catch (error) {
            console.log('❌ VidMuz: videos.json not accessible:', error.message);
            return [];
        }
    }

    removeDuplicateVideos(videos) {
        const uniqueVideos = [];
        const seenIds = new Set();
        
        videos.forEach(video => {
            if (!seenIds.has(video.id)) {
                seenIds.add(video.id);
                uniqueVideos.push(video);
            } else {
                console.log(`🔄 VidMuz: Duplicate video removed - ${video.id}`);
            }
        });
        
        return uniqueVideos;
    }

    getDefaultVideos() {
        console.log('🎵 VidMuz: Creating default videos with music category...');
        return [
            {
                id: 'default_video_1',
                title: 'Programming Tutorial - JavaScript Basics',
                description: 'Learn JavaScript from scratch with this comprehensive tutorial',
                thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'W6NZfCO5SIk',
                category: 'education',
                embedUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk'
            },
            {
                id: 'default_music_1',
                title: 'Relaxing Piano Music for Study',
                description: 'Beautiful piano melodies perfect for studying and concentration',
                thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'M7lc1UVf-VE',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
                artist: 'Piano Collective',
                duration: '1:23:45'
            },
            {
                id: 'default_music_2',
                title: 'Epic Orchestral Music',
                description: 'Powerful orchestral music for motivation and inspiration',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'dQw4w9WgXcQ',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                artist: 'Epic Music World',
                duration: '45:30'
            },
            {
                id: 'default_music_3',
                title: 'Lofi Hip Hop Beats',
                description: 'Chill lofi beats to relax and focus',
                thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'jfKfPfyJRdk',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
                artist: 'Lofi Girl',
                duration: '2:15:30'
            }
        ];
    }

    getDefaultMusicTracks() {
        console.log('🎵 VidMuz: Creating default music tracks...');
        const defaultTracks = [
            {
                id: 'music_default_1',
                title: 'Peaceful Piano Session',
                description: 'Relaxing piano music for meditation and sleep',
                thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'M7lc1UVf-VE',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1',
                artist: 'Peaceful Sounds',
                duration: '3:45:20'
            },
            {
                id: 'music_default_2',
                title: 'Uplifting Orchestral Mix',
                description: 'Epic and uplifting orchestral music compilation',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'dQw4w9WgXcQ',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
                artist: 'Epic Music Collection',
                duration: '1:15:45'
            },
            {
                id: 'music_default_3',
                title: 'Chill Lofi Vibes',
                description: 'Perfect lofi hip hop for studying and working',
                thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'jfKfPfyJRdk',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1',
                artist: 'Lofi Collective',
                duration: '2:30:15'
            },
            {
                id: 'music_default_4',
                title: 'Jazz Cafe Ambience',
                description: 'Smooth jazz music with cafe atmosphere',
                thumbnail: 'https://img.youtube.com/vi/bO8HaELusLk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'bO8HaELusLk',
                category: 'music', // 👈 Pastikan kategori musik
                embedUrl: 'https://www.youtube.com/embed/bO8HaELusLk?autoplay=1',
                artist: 'Jazz Cafe',
                duration: '4:20:30'
            }
        ];
        
        console.log(`🎵 VidMuz: Created ${defaultTracks.length} default music tracks:`);
        defaultTracks.forEach(track => {
            console.log(`  - ${track.id}: ${track.title} (category: ${track.category})`);
        });
        
        return defaultTracks;
    }

    renderTracks() {
        const musicGrid = document.getElementById('musicGrid');
        
        console.log(`🎨 VidMuz: Rendering ${this.tracks.length} tracks`);
        
        if (this.tracks.length === 0) {
            console.log('❌ VidMuz: No tracks to render');
            musicGrid.innerHTML = `
                <div class="music-loading">
                    <i class="fas fa-music"></i>
                    <p>No music tracks available</p>
                    <p>Add videos with category "music" to see them here</p>
                    <button onclick="app.forceLoadDefaults()" class="retry-btn">Load Default Music</button>
                </div>
            `;
            return;
        }

        musicGrid.innerHTML = this.tracks.map((track, index) => {
            console.log(`🎨 VidMuz: Rendering track ${index + 1} - ${track.title}`);
            return `
                <div class="music-card ${this.currentIndex === index ? 'playing' : ''}" 
                     onclick="app.playTrack(${index})">
                    <div class="music-thumbnail">
                        <img src="${track.thumbnail}" alt="${track.title}" loading="lazy">
                        <div class="music-play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                        ${this.currentIndex === index ? '<div class="playing-indicator">Now Playing</div>' : ''}
                    </div>
                    <div class="music-info">
                        <h4>${track.title}</h4>
                        <p class="artist">${track.artist || 'Unknown Artist'}</p>
                        <p class="duration">${track.duration || 'Unknown Duration'}</p>
                        <div class="music-badges">
                            <span class="music-badge category">${track.category || 'music'}</span>
                            <span class="music-badge platform ${track.platform}">${track.platform.toUpperCase()}</span>
                            <span class="source-badge">${this.getVideoSource(track.id)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update track counter
        this.updateTrackCounter();
        console.log('✅ VidMuz: Tracks rendered successfully');
    }

    // Fungsi untuk force load defaults (untuk debugging)
    forceLoadDefaults() {
        console.log('🔄 VidMuz: Force loading default music tracks...');
        this.tracks = this.getDefaultMusicTracks();
        this.allVideos = [...this.tracks];
        this.renderTracks();
    }

    embedPlayer() {
        if (!ytPlayerReady || !this.currentTrack) {
            console.log('❌ VidMuz: YouTube player not ready or no current track');
            console.log('ytPlayerReady:', ytPlayerReady, 'currentTrack:', this.currentTrack);
            return;
        }
        
        console.log('🎵 VidMuz: Loading video:', this.currentTrack.videoId);
        
        try {
            ytPlayer.loadVideoById({
                videoId: this.currentTrack.videoId,
                startSeconds: 0
            });
            
            // Wait a bit before playing to ensure video is loaded
            setTimeout(() => {
                if (ytPlayer && ytPlayerReady) {
                    ytPlayer.playVideo();
                    console.log('▶️ VidMuz: Video playback started');
                }
            }, 1000);

            // Start progress update interval
            if (this.progressInterval) clearInterval(this.progressInterval);
            this.progressInterval = setInterval(() => this.updateProgress(), 500);
        } catch (error) {
            console.error('❌ VidMuz: Error loading video:', error);
        }
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

        if (ytPlayerReady && ytPlayer) {
            if (this.isPlaying) {
                ytPlayer.playVideo();
            } else {
                ytPlayer.pauseVideo();
            }
        }

        console.log(this.isPlaying ? '▶️ Playing' : '⏸️ Paused');
    }

    stopPlayback() {
        this.isPlaying = false;
        this.currentTrack = null;
        this.currentIndex = -1;

        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        // Stop YouTube player
        if (ytPlayerReady && ytPlayer) {
            ytPlayer.stopVideo();
        }

        // Reset UI
        this.updatePlayButtons();
        this.renderTracks();

        // Reset now playing
        const playerTitle = document.getElementById('playerTitle');
        const playerArtist = document.getElementById('playerArtist');
        const playerArt = document.getElementById('playerArt');

        if (playerTitle) playerTitle.textContent = 'Select a song';
        if (playerArtist) playerArtist.textContent = 'No song playing';
        if (playerArt) playerArt.src = '';
    }

    getVideoSource(videoId) {
        if (videoId.startsWith('js_')) return 'JS';
        if (videoId.startsWith('json_')) return 'JSON';
        if (videoId.startsWith('default_')) return 'DEFAULT';
        if (videoId.startsWith('music_default_')) return 'DEFAULT';
        return 'EXTERNAL';
    }

    updateTrackCounter() {
        const libraryHeader = document.querySelector('.music-library h3');
        if (libraryHeader) {
            libraryHeader.textContent = `Music Library (${this.tracks.length} tracks)`;
        }
    }

    searchMusic(query = '') {
        const searchQuery = query.toLowerCase().trim();
        
        if (searchQuery === '') {
            this.tracks = this.allVideos.filter(video => video.category === 'music');
        } else {
            const musicVideos = this.allVideos.filter(video => video.category === 'music');
            this.tracks = musicVideos.filter(track => 
                track.title.toLowerCase().includes(searchQuery) ||
                track.description.toLowerCase().includes(searchQuery) ||
                (track.artist && track.artist.toLowerCase().includes(searchQuery))
            );
        }
        
        this.renderTracks();
        
        // Reset current playing if track is not in filtered results
        if (this.currentTrack && !this.tracks.find(t => t.id === this.currentTrack.id)) {
            this.stopPlayback();
        }
    }

    playTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentIndex = index;
        this.currentTrack = this.tracks[index];
        this.isPlaying = true;
        
        // Update now playing section
        this.updateNowPlaying();
        
        // Update UI
        this.updatePlayButtons();
        this.renderTracks();
        
        console.log('🎵 Now playing:', this.currentTrack.title);
        
        // Embed video player (audio only would be better for music)
        this.embedPlayer();
    }

    updateNowPlaying() {
        if (!this.currentTrack) return;
        
        const playerArt = document.getElementById('playerArt');
        const playerTitle = document.getElementById('playerTitle');
        const playerArtist = document.getElementById('playerArtist');
        
        if (playerArt) {
            playerArt.src = this.currentTrack.thumbnail;
            playerArt.alt = this.currentTrack.title;
        }
        
        if (playerTitle) {
            playerTitle.textContent = this.currentTrack.title;
        }
        
        if (playerArtist) {
            playerArtist.textContent = this.currentTrack.artist || 'Unknown Artist';
        }
        
        // Jangan panggil simulatePlayback di sini!
        // this.simulatePlayback();
    }

    simulatePlayback() {
        // Parse duration from string format (e.g., "3:45" or "1:23:45")
        const totalSeconds = this.parseDuration(this.currentTrack.duration || '3:00');
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
        if (!duration) return 180; // Default 3 minutes
        
        const parts = duration.split(':').map(p => parseInt(p) || 0);
        
        if (parts.length === 2) {
            // MM:SS format
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS format
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        
        return 180; // Default fallback
    }

    updateProgress() {
        if (!ytPlayer || !ytPlayerReady) return;
        
        try {
            const currentTime = ytPlayer.getCurrentTime() || 0;
            const duration = ytPlayer.getDuration() || 0;
            const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
            
            // Update progress bar
            const progressBar = document.querySelector('.progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Update time display
            const currentTimeEl = document.getElementById('currentTime');
            const totalTimeEl = document.getElementById('totalTime');
            
            if (currentTimeEl) {
                currentTimeEl.textContent = this.formatTime(currentTime);
            }
            if (totalTimeEl && duration > 0) {
                totalTimeEl.textContent = this.formatTime(duration);
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

        if (ytPlayerReady && ytPlayer) {
            if (this.isPlaying) {
                ytPlayer.playVideo();
            } else {
                ytPlayer.pauseVideo();
            }
        }

        console.log(this.isPlaying ? '▶️ Playing' : '⏸️ Paused');
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
        
        console.log(`⏭️ Seeked to: ${this.formatTime(this.currentTime)}`);
    }

    stopPlayback() {
        this.isPlaying = false;
        this.currentTrack = null;
        this.currentIndex = -1;

        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        // Stop YouTube player
        if (ytPlayerReady && ytPlayer) {
            ytPlayer.stopVideo();
        }

        // Reset UI
        this.updatePlayButtons();
        this.renderTracks();

        // Reset now playing
        const playerTitle = document.getElementById('playerTitle');
        const playerArtist = document.getElementById('playerArtist');
        const playerArt = document.getElementById('playerArt');

        if (playerTitle) playerTitle.textContent = 'Select a song';
        if (playerArtist) playerArtist.textContent = 'No song playing';
        if (playerArt) playerArt.src = '';
    }

    showLoading(show) {
        console.log(show ? '🔄 VidMuz: Loading music...' : '✅ VidMuz: Music loaded');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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

// --- Tambahkan di luar class, sebelum const app = new VidMuzApp(); ---
let ytPlayer;
let ytPlayerReady = false;

window.onYouTubeIframeAPIReady = function() {
    console.log('🎬 VidMuz: YouTube API Ready, initializing player...');
    
    ytPlayer = new YT.Player('ytPlayer', {
        height: '169',
        width: '300',
        videoId: '',
        events: {
            'onReady': function(event) {
                console.log('✅ VidMuz: YouTube Player Ready');
                ytPlayerReady = true;
                ytPlayer.setVolume(80); // Volume awal 80%
                
                // Hide the player container initially
                const container = document.getElementById('ytPlayerContainer');
                if (container) {
                    container.style.display = 'none';
                }
            },
            'onStateChange': function(event) {
                console.log('🎵 VidMuz: Player state changed:', event.data);
                if (event.data === YT.PlayerState.ENDED) {
                    if (app && app.nextTrack) {
                        app.nextTrack();
                    }
                } else if (event.data === YT.PlayerState.PLAYING) {
                    console.log('▶️ VidMuz: Video is now playing');
                } else if (event.data === YT.PlayerState.PAUSED) {
                    console.log('⏸️ VidMuz: Video is paused');
                }
            },
            'onError': function(event) {
                console.error('❌ VidMuz: YouTube Player Error:', event.data);
            }
        },
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'fs': 0,
            'modestbranding': 1,
            'playsinline': 1
        }
    });
};
// --- Akhir bagian global ---

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
    app.searchMusic(query);
}

function setVolume(val) {
    if (ytPlayer && ytPlayerReady) {
        ytPlayer.setVolume(Number(val));
    }
}

// Initialize app after YouTube API is ready
let app;

// Wait for YouTube API to be ready before initializing app
function initializeApp() {
    if (typeof YT !== 'undefined' && YT.Player) {
        app = new VidMuzApp();
        console.log('✅ VidMuz: App initialized successfully');
    } else {
        console.log('⏳ VidMuz: Waiting for YouTube API...');
        setTimeout(initializeApp, 100);
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
