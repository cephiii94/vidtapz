class VidtapzApp {
    constructor() {
        this.videos = [];
        this.filteredVideos = [];
        this.currentFilter = 'all';
        this.currentModal = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.debouncedSearch = this.debounce((value) => this.searchVideos(value), 300);

        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadVideos();
        this.renderVideos();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debouncedSearch(e.target.value);
            });
        }

        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

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

    // FUNGSI BARU: Mengambil detail video dari API oEmbed YouTube
    async fetchVideoDetails(youtubeUrl, category) {
        // Endpoint oEmbed dari YouTube. Tidak memerlukan API Key.
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;

        try {
            const response = await fetch(oembedUrl);
            if (!response.ok) {
                // Jika video tidak ditemukan atau privat, kembalikan null
                console.warn(`Could not fetch details for ${youtubeUrl}: ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            
            // Ekstrak Video ID dari URL untuk membuat embed URL yang benar
            const videoId = new URL(youtubeUrl).searchParams.get('v');

            // Membuat objek video yang konsisten dengan format lama
            return {
                id: `yt_${videoId}`,
                title: data.title,
                description: `Video oleh: ${data.author_name}`, // Deskripsi bisa di-custom
                thumbnail: data.thumbnail_url.replace('hqdefault.jpg', 'maxresdefault.jpg'), // Mengambil thumbnail kualitas tertinggi
                platform: 'youtube',
                videoId: videoId,
                category: category,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                author: data.author_name,
            };
        } catch (error) {
            console.error(`Error fetching oEmbed data for ${youtubeUrl}:`, error);
            return null;
        }
    }

    // FUNGSI DIMODIFIKASI: Memuat semua video dari file kategori
    async loadVideos() {
        this.showLoading(true);

        // Daftar semua kategori dan variabel globalnya
        const categories = {
            'dakwah': window.VIDTAPZ_URLS_DAKWAH || [],
            'education': window.VIDTAPZ_URLS_EDUCATION || [],
            'music': window.VIDTAPZ_URLS_MUSIC || [],
            'gaming': window.VIDTAPZ_URLS_GAMING || [],
            'entertainment': window.VIDTAPZ_URLS_ENTERTAINMENT || [],
            'sports': window.VIDTAPZ_URLS_SPORTS || [],
            'news': window.VIDTAPZ_URLS_NEWS || [],
        };

        const fetchPromises = [];

        // Loop melalui setiap kategori dan URL di dalamnya
        for (const category in categories) {
            const urls = categories[category];
            for (const url of urls) {
                // Tambahkan promise untuk setiap permintaan fetch
                fetchPromises.push(this.fetchVideoDetails(url, category));
            }
        }
        
        // Jalankan semua permintaan fetch secara paralel untuk efisiensi
        const results = await Promise.all(fetchPromises);

        // Filter hasil yang null (video error/privat) dan hapus duplikat
        this.videos = this.removeDuplicateVideos(results.filter(video => video !== null));
        this.filteredVideos = [...this.videos];

        this.showLoading(false);
        console.log(`🎥 Total unique videos loaded via oEmbed: ${this.videos.length}`);
    }
    
    removeDuplicateVideos(videos) {
        const uniqueVideos = [];
        const seenIds = new Set();
        
        videos.forEach(video => {
            if (!seenIds.has(video.id)) {
                seenIds.add(video.id);
                uniqueVideos.push(video);
            }
        });
        
        return uniqueVideos;
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
            <div class="video-card" tabindex="0" onclick="app.openModal('${video.id}')" onkeydown="app.handleCardKeydown(event, '${video.id}')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg';">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-badges">
                        <span class="platform-badge ${video.platform}">${video.platform.toUpperCase()}</span>
                         <span class="category-badge">${video.category}</span>
                    </div>
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description}</p>
                </div>
            </div>
        `).join('');
    }

    filterVideos(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        if (category === 'all') {
            this.filteredVideos = [...this.videos];
        } else {
            this.filteredVideos = this.videos.filter(video =>
                video.category &&
                video.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        this.renderVideos();
    }

    searchVideos(query = '') {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = query || searchInput.value.toLowerCase().trim();
        
        this.filterVideos(this.currentFilter); // Mulai dari video yang sudah difilter
        
        if (searchQuery) {
            this.filteredVideos = this.filteredVideos.filter(video => 
                video.title.toLowerCase().includes(searchQuery) ||
                video.description.toLowerCase().includes(searchQuery)
            );
        }
        
        this.renderVideos();
    }

    openModal(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;
        
        lastVideoTitle = video.title;
        lastVideoSrc = video.embedUrl;
        
        const modal = document.getElementById('videoModal');
        const modalTitle = document.getElementById('modalTitle');
        const videoPlayer = document.getElementById('videoPlayer');
        const platformBadge = document.getElementById('platformBadge');
        const videoDescription = document.getElementById('videoDescription');
        
        modalTitle.textContent = video.title;
        platformBadge.textContent = video.platform.toUpperCase();
        platformBadge.className = `platform-badge ${video.platform}`;
        videoDescription.textContent = video.description;
        
        videoPlayer.innerHTML = `
            <iframe 
                src="${video.embedUrl}?autoplay=1" 
                allowfullscreen 
                allow="autoplay; encrypted-media"
                title="${video.title}">
            </iframe>
        `;
        
        modal.style.display = 'block';
        this.currentModal = videoId;
        
        setTimeout(() => {
            modal.querySelector('.close-btn').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('videoPlayer');
        
        modal.style.display = 'none';
        videoPlayer.innerHTML = '';
        this.currentModal = null;
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.getElementById('themeIcon');
        const themeIconMobile = document.getElementById('themeIconMobile');
        const iconClass = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';

        if (themeIcon) themeIcon.className = iconClass;
        if (themeIconMobile) themeIconMobile.className = iconClass;
    }

    handleKeyboardNavigation(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focused = document.activeElement;
            if (focused.classList.contains('video-card')) {
                e.preventDefault();
                focused.click();
            }
        }
    }

    handleCardKeydown(event, videoId) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.openModal(videoId);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'flex' : 'none';
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
}

// Global variables and functions
let lastVideoTitle = '';
let lastVideoSrc = '';

function filterVideos(category) { app.filterVideos(category); }
function searchVideos() { app.searchVideos(); }
function toggleTheme() { app.toggleTheme(); }
function closeModal() { app.closeModal(); }

function minimizeModal() {
    const videoPlayer = document.getElementById('videoPlayer');
    const miniPlayerVideo = document.getElementById('miniPlayerVideo');
    const videoModal = document.getElementById('videoModal');
    const miniPlayer = document.getElementById('miniPlayer');

    const videoElement = videoPlayer.firstElementChild;
    if (videoElement) {
        miniPlayerVideo.appendChild(videoElement);
    }
    
    videoModal.style.display = 'none';
    miniPlayer.style.display = 'block';
    document.getElementById('miniPlayerTitle').textContent = lastVideoTitle;
}

function restoreModal() {
    const videoPlayer = document.getElementById('videoPlayer');
    const miniPlayerVideo = document.getElementById('miniPlayerVideo');
    const videoModal = document.getElementById('videoModal');
    const miniPlayer = document.getElementById('miniPlayer');

    const videoElement = miniPlayerVideo.firstElementChild;
    if (videoElement) {
        videoPlayer.appendChild(videoElement);
    }
    
    miniPlayer.style.display = 'none';
    videoModal.style.display = 'block';
}

function closeMiniPlayer() {
    const miniPlayer = document.getElementById('miniPlayer');
    const miniPlayerVideo = document.getElementById('miniPlayerVideo');
    
    miniPlayerVideo.innerHTML = '';
    miniPlayer.style.display = 'none';
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
}

// Initialize app
const app = new VidtapzApp();
