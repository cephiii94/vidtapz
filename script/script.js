// --- KONFIGURASI ---
// Menggunakan CONFIG global dari config.js
const YOUTUBE_API_KEY = window.CONFIG ? window.CONFIG.YOUTUBE_API_KEY : 'YOUR_API_KEY_HERE'; 
// -------------------

class VidtapzApp {
    constructor() {
        this.videos = [];
        this.filteredVideos = [];
        this.currentFilter = 'all';
        this.currentModal = null;
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.player = null;
        this.progressInterval = null;
        this.isAutonext = true; // Autonext aktif secara default

        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        this.updateAutonextButton();
        await this.loadVideos();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) this.closeModal();
            if (document.fullscreenElement && e.key === 'Escape') this.closeFullscreen();
        });

        const videoModal = document.getElementById('videoModal');
        videoModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
        
        // Event listener untuk kontrol kustom
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.setVolume(e.target.value));
        document.getElementById('progressBar').addEventListener('input', (e) => this.seek(e.target.value));
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleQualityMenu();
        });
        document.getElementById('autonextBtn').addEventListener('click', () => this.toggleAutonext());

        // Menutup menu kualitas jika klik di luar
        document.addEventListener('click', (e) => {
            const qualityMenu = document.getElementById('qualityMenu');
            if (qualityMenu.classList.contains('active') && !qualityMenu.contains(e.target)) {
                this.toggleQualityMenu(false);
            }
        });
    }
    
    async fetchVideoDetails(youtubeUrl, category) {
        const videoId = new URL(youtubeUrl).searchParams.get('v');
        if (!videoId) return null;

        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
        
        try {
            const response = await fetch(oembedUrl);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const data = await response.json();
            return {
                id: `yt_${videoId}`,
                title: data.title,
                thumbnail: data.thumbnail_url.replace('hqdefault.jpg', 'maxresdefault.jpg'),
                videoId: videoId,
                category: category,
                author: data.author_name,
            };
        } catch (error) {
            console.warn(`oEmbed fetch failed for ${youtubeUrl}: ${error.message}. Using fallback.`);
            return {
                id: `yt_${videoId}`,
                title: "Video not available (oEmbed failed)",
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId,
                category: category,
                author: "Unknown Author",
            };
        }
    }

    async loadVideos() {
        this.showLoading(true);
        const categories = {
            'music': window.VIDTAPZ_URLS_MUSIC || [],
            'gaming': window.VIDTAPZ_URLS_GAMING || [],
            'education': window.VIDTAPZ_URLS_EDUCATION || [],
            'dakwah': window.VIDTAPZ_URLS_DAKWAH || [],
            'sports': window.VIDTAPZ_URLS_SPORTS || [],
        };

        const fetchPromises = Object.entries(categories).flatMap(([category, urls]) => 
            urls.map(url => this.fetchVideoDetails(url, category))
        );
        
        const results = await Promise.all(fetchPromises);
        this.videos = results.filter(Boolean);
        this.filteredVideos = [...this.videos];
        this.showLoading(false);
        this.renderVideos();
    }

    renderVideos() {
        const videoGrid = document.getElementById('videoGrid');
        const noResults = document.getElementById('noResults');
        if (this.filteredVideos.length === 0) {
            videoGrid.innerHTML = '';
            noResults.style.display = 'flex';
            return;
        }
        noResults.style.display = 'none';
        videoGrid.innerHTML = this.filteredVideos.map(video => `
            <div class="video-card" tabindex="0" onclick="app.openModal('${video.id}')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg';">
                    <div class="play-overlay"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.author}</p>
                </div>
            </div>
        `).join('');
    }

    filterVideos(category) {
        this.currentFilter = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.filteredVideos = (category === 'all')
            ? [...this.videos]
            : this.videos.filter(v => v.category === category);
        this.renderVideos();
    }

    async fetchAndDisplayRelatedVideos(videoTitle, currentVideoId) {
        const container = document.getElementById('relatedVideosContainer');
        container.innerHTML = '<p class="related-loading">Loading related videos...</p>';

        if (!YOUTUBE_API_KEY) {
            container.innerHTML = '<p class="related-error">API Key not configured.</p>';
            return;
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(videoTitle)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=11`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error.message);

            const relatedItems = data.items.filter(item => item.id.videoId !== currentVideoId);

            if (relatedItems.length > 0) {
                container.innerHTML = relatedItems.slice(0, 10).map(item => `
                    <div class="related-video-item" onclick="app.openModalFromRelated('${item.id.videoId}')">
                        <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}" loading="lazy">
                        <div class="related-video-info">
                            <span class="related-title">${item.snippet.title}</span>
                            <span class="related-channel">${item.snippet.channelTitle}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p>No related videos found.</p>';
            }
        } catch (error) {
            console.error('Error fetching related videos:', error);
            container.innerHTML = `<p class="related-error">Could not load related videos. ${error.message}</p>`;
        }
    }
    
    async openModalFromRelated(videoId) {
        const videoData = await this.fetchVideoDetails(`https://www.youtube.com/watch?v=${videoId}`, 'related');
        if (videoData) {
            if (this.player) {
                this.player.destroy();
                this.player = null;
            }
            this.openModal(videoData.id, videoData);
        } else {
            alert("Could not load details for the selected related video.");
        }
    }

    openModal(videoId, directData = null) {
        let video = directData || this.videos.find(v => v.id === videoId);
        if (!video) return;

        this.currentModal = video.id;
        
        const modal = document.getElementById('videoModal');
        document.getElementById('modalTitle').textContent = video.title;
        document.getElementById('modalAuthor').textContent = `by ${video.author}`;
        
        document.getElementById('videoPlayer').innerHTML = '';
        document.getElementById('qualityMenu').innerHTML = '';
        
        if (typeof YT !== 'undefined' && YT.Player) {
            this.loadYouTubePlayer(video.videoId);
        } else {
            document.getElementById('videoPlayer').innerHTML = '<p class="related-error">Error: YouTube Player could not be loaded.</p>';
        }
        
        modal.classList.add('active');
        document.body.classList.add('body-modal-open');
        
        this.fetchAndDisplayRelatedVideos(video.title, video.videoId);
    }

    closeModal() {
        const modal = document.getElementById('videoModal');
        modal.classList.remove('active');
        document.body.classList.remove('body-modal-open');
        
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        clearInterval(this.progressInterval);
        this.progressInterval = null;

        this.toggleQualityMenu(false);
        document.getElementById('relatedVideosContainer').innerHTML = '';
        this.currentModal = null;
    }

    loadYouTubePlayer(videoId) {
        this.player = new YT.Player('videoPlayer', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'iv_load_policy': 3, 'modestbranding': 1 },
            events: {
                'onReady': (e) => this.onPlayerReady(e),
                'onStateChange': (e) => this.onPlayerStateChange(e)
            }
        });
    }

    onPlayerReady(event) {
        event.target.playVideo();
        const initialVolume = document.getElementById('volumeSlider').value;
        event.target.setVolume(initialVolume);
        this.updateVolumeIcon(initialVolume);
    }

    onPlayerStateChange(event) {
        const playPauseIcon = document.querySelector('#playPauseBtn i');
        if (event.data === YT.PlayerState.PLAYING) {
            playPauseIcon.className = 'fas fa-pause';
            this.startProgressTracker();
            this.populateQualityMenu();
        } else {
            playPauseIcon.className = 'fas fa-play';
            this.stopProgressTracker();
        }

        if (event.data === YT.PlayerState.ENDED && this.isAutonext) {
            const nextVideo = document.querySelector('.related-video-item');
            if (nextVideo) {
                nextVideo.click();
            }
        }
    }
    
    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    startProgressTracker() {
        if (this.progressInterval) clearInterval(this.progressInterval);
        this.progressInterval = setInterval(() => {
            if (this.player && typeof this.player.getCurrentTime === 'function') {
                const currentTime = this.player.getCurrentTime();
                const duration = this.player.getDuration();
                if (duration > 0) {
                    document.getElementById('progressBar').value = (currentTime / duration) * 100;
                    document.getElementById('currentTime').textContent = this.formatTime(currentTime);
                    document.getElementById('duration').textContent = this.formatTime(duration);
                }
            }
        }, 250);
    }

    stopProgressTracker() {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
    }

    togglePlayPause() {
        if (!this.player || typeof this.player.getPlayerState !== 'function') return;
        const state = this.player.getPlayerState();
        (state === YT.PlayerState.PLAYING) ? this.player.pauseVideo() : this.player.playVideo();
    }

    toggleMute() {
        if (!this.player || typeof this.player.isMuted !== 'function') return;
        this.player.isMuted() ? this.player.unMute() : this.player.mute();
        this.updateVolumeIcon(this.player.isMuted() ? 0 : this.player.getVolume());
    }
    
    updateVolumeIcon(volume) {
        const muteIcon = document.querySelector('#muteBtn i');
        if (volume == 0 || (this.player && this.player.isMuted())) {
            muteIcon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            muteIcon.className = 'fas fa-volume-down';
        } else {
            muteIcon.className = 'fas fa-volume-up';
        }
    }

    setVolume(value) {
        if (!this.player || typeof this.player.setVolume !== 'function') return;
        this.player.setVolume(value);
        if (value > 0 && this.player.isMuted()) this.player.unMute();
        this.updateVolumeIcon(value);
    }

    seek(value) {
        if (!this.player || typeof this.player.getDuration !== 'function') return;
        this.player.seekTo(this.player.getDuration() * (value / 100), true);
    }
    
    toggleFullscreen() {
        const playerContainer = document.querySelector('.modal-video-main');
        if (!document.fullscreenElement) {
            playerContainer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleQualityMenu(forceState) {
        const qualityMenu = document.getElementById('qualityMenu');
        qualityMenu.classList.toggle('active', forceState);
    }

    populateQualityMenu() {
        if (!this.player || typeof this.player.getAvailableQualityLevels !== 'function') return;
        const availableQualities = this.player.getAvailableQualityLevels();
        const currentQuality = this.player.getPlaybackQuality();
        const qualityMenu = document.getElementById('qualityMenu');
        qualityMenu.innerHTML = '';

        availableQualities.unshift('auto');

        availableQualities.forEach(quality => {
            const option = document.createElement('div');
            option.classList.add('quality-option');
            option.textContent = quality === 'auto' ? 'Auto' : `${quality.replace('hd', '')}p`;
            if (quality === currentQuality) {
                option.classList.add('selected');
            }
            option.addEventListener('click', () => {
                this.player.setPlaybackQuality(quality);
                this.toggleQualityMenu(false);
            });
            qualityMenu.appendChild(option);
        });
    }

    toggleAutonext() {
        this.isAutonext = !this.isAutonext;
        this.updateAutonextButton();
    }

    updateAutonextButton() {
        const autonextBtn = document.getElementById('autonextBtn');
        autonextBtn.classList.toggle('active', this.isAutonext);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const iconClass = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        if(themeIcon) themeIcon.className = iconClass;
        if(themeIconMobile) themeIconMobile.className = iconClass;
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }
}

const app = new VidtapzApp();

function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame API is ready.");
}

function filterVideos(category) { if(app) app.filterVideos(category); }
function closeModal() { if(app) app.closeModal(); }
function toggleTheme() { if(app) app.toggleTheme(); }
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
}
