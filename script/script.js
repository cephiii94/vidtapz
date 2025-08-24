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
        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadVideos();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
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
    
    // FUNGSI DIPERBARUI: Menambahkan fallback jika oEmbed gagal
    async fetchVideoDetails(youtubeUrl, category) {
        const videoId = new URL(youtubeUrl).searchParams.get('v');
        if (!videoId) return null;

        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
        
        try {
            const response = await fetch(oembedUrl);
            if (!response.ok) {
                throw new Error(`Status: ${response.status}`);
            }
            const data = await response.json();
            return {
                id: `yt_${videoId}`,
                title: data.title,
                description: `Video oleh: ${data.author_name}`,
                thumbnail: data.thumbnail_url.replace('hqdefault.jpg', 'maxresdefault.jpg'),
                platform: 'youtube',
                videoId: videoId,
                category: category,
                embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&mute=1&rel=0`,
                author: data.author_name,
            };
        } catch (error) {
            console.warn(`oEmbed fetch failed for ${youtubeUrl}: ${error.message}. Using fallback.`);
            // Fallback: Buat objek video dengan data minimal jika oEmbed gagal
            return {
                id: `yt_${videoId}`,
                title: "Video not available (oEmbed failed)",
                description: "Could not fetch video details.",
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                platform: 'youtube',
                videoId: videoId,
                category: category,
                embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&mute=1&rel=0`,
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
                console.error('YouTube API Error:', data.error.message);
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
            console.error('Error fetching related videos:', error);
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

    openModal(videoId, directData = null) {
        let video = directData;
        if (!video) {
            video = this.videos.find(v => v.id === videoId);
        }
        if (!video) {
            console.error(`Video with ID ${videoId} not found.`);
            return;
        }

        this.currentModal = video.id;
        
        const modal = document.getElementById('videoModal');
        document.getElementById('modalTitle').textContent = video.title;
        document.getElementById('modalAuthor').textContent = `by ${video.author}`;
        
        document.getElementById('videoPlayer').innerHTML = `
            <iframe src="${video.embedUrl}" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
        `;
        
        modal.classList.add('active');
        
        this.fetchAndDisplayRelatedVideos(video.title, video.videoId);
    }

    closeModal() {
        const modal = document.getElementById('videoModal');
        modal.classList.remove('active');
        document.getElementById('videoPlayer').innerHTML = '';
        document.getElementById('relatedVideosContainer').innerHTML = '';
        this.currentModal = null;
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
