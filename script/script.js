// --- KONFIGURASI ---
const YOUTUBE_API_KEY = 'AIzaSyCwGeMX-l_F6C4-5nHuZF2uOJHPFgRxmzg'; 
// -------------------

class VidtapzApp {
    constructor() {
        this.videos = [];
        this.filteredVideos = [];
        this.currentFilter = 'all';
        this.currentModal = null;
        this.theme = localStorage.getItem('theme') || 'light';
        // Properti baru untuk melacak video dan status autoplay
        this.currentVideoIndex = -1;
        this.player = null; // Untuk objek YouTube Player
        this.isAutoplayOn = true; // Autoplay aktif secara default
        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadVideos();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.currentModal) return;
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft') this.playPrevious();
            if (e.key === 'ArrowRight') this.playNext();
        });

        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                }
            });
        }
    }
    
    // Fungsi ini tidak lagi membuat embedUrl, hanya mengambil data
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
        const fetchPromises = [];
        for (const category in categories) {
            for (const url of categories[category]) {
                fetchPromises.push(this.fetchVideoDetails(url, category));
            }
        }
        const results = await Promise.all(fetchPromises);
        this.videos = results.filter(video => video !== null);
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
            noResults.querySelector('p').textContent = 'No videos found in this category.';
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
            : this.videos.filter(v => v.category && v.category.toLowerCase() === category.toLowerCase());
        this.renderVideos();
    }

    async fetchAndDisplayRelatedVideos(videoTitle, currentVideoId) {
        // ... (fungsi ini tetap sama, tidak perlu diubah)
        const container = document.getElementById('relatedVideosContainer');
        container.innerHTML = '<p class="related-loading">Loading related videos...</p>';
        if (YOUTUBE_API_KEY === 'MASUKKAN_API_KEY_ANDA_DISINI' || !YOUTUBE_API_KEY) {
            container.innerHTML = '<p class="related-error">API Key not configured.</p>';
            return;
        }
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(videoTitle)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=11`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.error) {
                container.innerHTML = `<p class="related-error">Error: ${data.error.message}</p>`;
                return;
            }
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
            container.innerHTML = '<p class="related-error">Could not load related videos.</p>';
        }
    }
    
    async openModalFromRelated(videoId) {
        const videoData = await this.fetchVideoDetails(`https://www.youtube.com/watch?v=${videoId}`, 'related');
        if (videoData) {
            this.openModal(videoData.id, videoData);
        } else {
            alert("Could not load details for the selected related video.");
        }
    }

    // Fungsi openModal sekarang memanggil initPlayer
    openModal(videoId, directData = null) {
        let video = directData;
        if (video) {
            this.currentVideoIndex = -1;
        } else {
            video = this.filteredVideos.find(v => v.id === videoId);
            this.currentVideoIndex = this.filteredVideos.findIndex(v => v.id === videoId);
        }

        if (!video) return;

        this.currentModal = video.id;
        
        const modal = document.getElementById('videoModal');
        document.getElementById('modalTitle').textContent = video.title;
        document.getElementById('modalAuthor').textContent = `by ${video.author}`;
        
        this.initPlayer(video); // Memanggil fungsi player baru
        
        document.body.classList.add('modal-open');
        modal.classList.add('active');
        
        this.updatePlayerControlsState();
        this.fetchAndDisplayRelatedVideos(video.title, video.videoId);
    }

    // Fungsi closeModal sekarang menghancurkan player
    closeModal() {
        const modal = document.getElementById('videoModal');
        document.body.classList.remove('modal-open');
        modal.classList.remove('active');
        
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        document.getElementById('videoPlayer').innerHTML = ''; // Membersihkan sisa
        document.getElementById('relatedVideosContainer').innerHTML = '';
        this.currentModal = null;
        this.currentVideoIndex = -1;
    }

    // --- FUNGSI BARU UNTUK YOUTUBE PLAYER ---
    initPlayer(video) {
        if (this.player) {
            this.player.destroy();
        }
        this.player = new YT.Player('videoPlayer', {
            videoId: video.videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0,
                'mute': 0
            },
            events: {
                'onStateChange': this.onPlayerStateChange.bind(this)
            }
        });
    }

    onPlayerStateChange(event) {
        // YT.PlayerState.ENDED nilainya 0
        if (event.data === YT.PlayerState.ENDED && this.isAutoplayOn) {
            this.playNext();
        }
    }
    
    toggleAutoplay() {
        this.isAutoplayOn = !this.isAutoplayOn;
        const autoplayBtn = document.getElementById('autoplayBtn');
        autoplayBtn.classList.toggle('active', this.isAutoplayOn);
        autoplayBtn.title = this.isAutoplayOn ? 'Autoplay On' : 'Autoplay Off';
    }
    // --- AKHIR FUNGSI BARU ---
    
    updatePlayerControlsState() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const shuffleBtn = document.getElementById('shuffleBtn');

        if (this.currentVideoIndex === -1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            shuffleBtn.disabled = true;
        } else {
            prevBtn.disabled = this.currentVideoIndex === 0;
            nextBtn.disabled = this.currentVideoIndex >= this.filteredVideos.length - 1;
            shuffleBtn.disabled = this.filteredVideos.length <= 1;
        }
    }

    playNext() {
        if (this.currentVideoIndex < this.filteredVideos.length - 1) {
            const nextIndex = this.currentVideoIndex + 1;
            const nextVideo = this.filteredVideos[nextIndex];
            this.openModal(nextVideo.id);
        }
    }

    playPrevious() {
        if (this.currentVideoIndex > 0) {
            const prevIndex = this.currentVideoIndex - 1;
            const prevVideo = this.filteredVideos[prevIndex];
            this.openModal(prevVideo.id);
        }
    }
    
    playRandom() {
        if (this.filteredVideos.length > 1) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.filteredVideos.length);
            } while (randomIndex === this.currentVideoIndex);
            
            const randomVideo = this.filteredVideos[randomIndex];
            this.openModal(randomVideo.id);
        }
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

// Global functions
function filterVideos(category) { app.filterVideos(category); }
function closeModal() { app.closeModal(); }
function toggleTheme() { app.toggleTheme(); }
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
}

// Mini player functions
let lastVideoTitle = '';
let lastVideoSrc = '';

function minimizeModal() { /* ... logika mini player ... */ }
function restoreModal() { /* ... logika mini player ... */ }
function closeMiniPlayer() { /* ... logika mini player ... */ }
