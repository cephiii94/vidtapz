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
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debouncedSearch(e.target.value);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Modal close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Close modal when clicking outside
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                }
            });
        }
    }

    async loadVideos() {
        this.showLoading(true);
        
        let allVideos = [];
        
        try {
            // 1. Coba load dari videos.js
            const jsVideos = await this.loadVideosFromJS();
            if (jsVideos.length > 0) {
                allVideos = [...allVideos, ...jsVideos];
                console.log(`✅ Loaded ${jsVideos.length} videos from videos.js`);
            }
            
            // 2. Coba load dari videos.json
            const jsonVideos = await this.loadVideosFromJSON();
            if (jsonVideos.length > 0) {
                allVideos = [...allVideos, ...jsonVideos];
                console.log(`✅ Loaded ${jsonVideos.length} videos from videos.json`);
            }
            
            // 3. Jika tidak ada yang berhasil, gunakan default
            if (allVideos.length === 0) {
                allVideos = this.getDefaultVideos();
                console.log(`✅ Using ${allVideos.length} default videos`);
            }
            
        } catch (error) {
            console.warn('Error loading external videos:', error);
            allVideos = this.getDefaultVideos();
        }
        
        // Hapus duplikat berdasarkan ID
        this.videos = this.removeDuplicateVideos(allVideos);
        this.filteredVideos = [...this.videos];
        
        this.showLoading(false);
        console.log(`🎥 Total unique videos loaded: ${this.videos.length}`);
    }

    async loadVideosFromJS() {
        return new Promise((resolve) => {
            try {
                let allVideos = [];
                
                // Load main videos if available
                if (window.VIDTAPZ_VIDEOS && Array.isArray(window.VIDTAPZ_VIDEOS)) {
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS];
                    console.log('✅ Loaded videos from VIDTAPZ_VIDEOS');
                }
                
                // Load dakwah videos if available
                if (window.VIDTAPZ_VIDEOS_DAKWAH && Array.isArray(window.VIDTAPZ_VIDEOS_DAKWAH)) {
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS_DAKWAH];
                    console.log('✅ Loaded videos from VIDTAPZ_VIDEOS_DAKWAH');
                }

                // Load music videos if available
                if (window.VIDTAPZ_VIDEOS_MUSIC && Array.isArray(window.VIDTAPZ_VIDEOS_MUSIC)) {
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS_MUSIC];
                    console.log('✅ Loaded videos from VIDTAPZ_VIDEOS_MUSIC');
                }

                // Load gaming videos if available
                if (window.VIDTAPZ_VIDEOS_GAMING && Array.isArray(window.VIDTAPZ_VIDEOS_GAMING)) {
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS_GAMING];
                    console.log('✅ Loaded videos from VIDTAPZ_VIDEOS_GAMING');
                }

                // Load education videos if available
                if (window.VIDTAPZ_VIDEOS_EDUCATION && Array.isArray(window.VIDTAPZ_VIDEOS_EDUCATION)) {
                    allVideos = [...allVideos, ...window.VIDTAPZ_VIDEOS_EDUCATION];
                    console.log('✅ Loaded videos from VIDTAPZ_VIDEOS_EDUCATION');
                }
                
                resolve(allVideos);
            } catch (error) {
                console.warn('Error loading from JS files:', error);
                resolve([]);
            }
        });
    }

    async loadVideosFromJSON() {
        try {
            const response = await fetch('/script/videos.json');
            if (response.ok) {
                const data = await response.json();
                return data.videos || [];
            } else {
                console.log('videos.json not found or error loading');
                return [];
            }
        } catch (error) {
            console.log('videos.json not accessible:', error.message);
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
                console.warn(`⚠️ Duplicate video ID found: ${video.id} - "${video.title}"`);
            }
        });
        
        return uniqueVideos;
    }

    getDefaultVideos() {
        return [
            {
                id: 'default_yt_1',
                title: 'Amazing Nature Documentary - Wildlife Adventure',
                description: 'Explore the incredible world of wildlife in this stunning nature documentary featuring amazing animals from around the globe.',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'dQw4w9WgXcQ',
                category: 'education',
                embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                id: 'default_yt_2',
                title: 'Epic Gaming Montage - Best Moments',
                description: 'The most epic gaming moments compiled into one amazing montage. Featuring incredible plays and highlights.',
                thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'jNQXAC9IVRw',
                category: 'gaming',
                embedUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw'
            },
            {
                id: 'default_dm_1',
                title: 'Music Festival Live Performance',
                description: 'Experience the energy of live music with this incredible festival performance featuring top artists.',
                thumbnail: 'https://www.dailymotion.com/thumbnail/video/x7tgad0',
                platform: 'dailymotion',
                videoId: 'x7tgad0',
                category: 'music',
                embedUrl: 'https://www.dailymotion.com/embed/video/x7tgad0'
            },
            {
                id: 'default_yt_3',
                title: 'Cooking Masterclass - Italian Cuisine',
                description: 'Learn to cook authentic Italian dishes with this comprehensive cooking masterclass from professional chefs.',
                thumbnail: 'https://img.youtube.com/vi/BxV14h0kFs0/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'BxV14h0kFs0',
                category: 'education',
                embedUrl: 'https://www.youtube.com/embed/BxV14h0kFs0'
            }
        ];
    }

    renderVideos() {
        const videoGrid = document.getElementById('videoGrid');
        const noResults = document.getElementById('noResults');
        
        if (this.filteredVideos.length === 0) {
            videoGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        videoGrid.innerHTML = this.filteredVideos.map(video => `
            <div class="video-card" tabindex="0" onclick="app.openModal('${video.id}')" onkeydown="app.handleCardKeydown(event, '${video.id}')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-badges">
                        <span class="platform-badge ${video.platform}">${video.platform.toUpperCase()}</span>
                        <span class="source-badge">${this.getVideoSource(video.id)}</span>
                    </div>
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description}</p>
                </div>
            </div>
        `).join('');
    }

    getVideoSource(videoId) {
        if (videoId.startsWith('js_')) return 'JS';
        if (videoId.startsWith('json_')) return 'JSON';
        if (videoId.startsWith('default_')) return 'DEFAULT';
        return 'EXTERNAL';
    }

    filterVideos(category) {
        this.currentFilter = category;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        // Filter videos
        if (category === 'all') {
            this.filteredVideos = [...this.videos];
        } else {
            this.filteredVideos = this.videos.filter(video => video.category === category);
        }
        
        this.renderVideos();
    }

    searchVideos(query = '') {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = query || searchInput.value.toLowerCase().trim();
        
        if (searchQuery === '') {
            this.filteredVideos = this.currentFilter === 'all' 
                ? [...this.videos] 
                : this.videos.filter(video => video.category === this.currentFilter);
        } else {
            let baseVideos = this.currentFilter === 'all' 
                ? this.videos 
                : this.videos.filter(video => video.category === this.currentFilter);
                
            this.filteredVideos = baseVideos.filter(video => 
                video.title.toLowerCase().includes(searchQuery) ||
                video.description.toLowerCase().includes(searchQuery)
            );
        }
        
        this.renderVideos();
    }

    openModal(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;
        
        // Set global variables for mini player
        lastVideoTitle = video.title;
        lastVideoThumb = video.thumbnail;
        lastVideoSrc = video.embedUrl;
        lastVideoType = video.platform;
        
        const modal = document.getElementById('videoModal');
        const modalTitle = document.getElementById('modalTitle');
        const videoPlayer = document.getElementById('videoPlayer');
        const platformBadge = document.getElementById('platformBadge');
        const videoDescription = document.getElementById('videoDescription');
        
        modalTitle.textContent = video.title;
        platformBadge.textContent = video.platform.toUpperCase();
        platformBadge.className = `platform-badge ${video.platform}`;
        videoDescription.textContent = video.description;
        
        // Create responsive iframe
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
        
        // Focus management
        setTimeout(() => {
            const closeBtn = modal.querySelector('.close-btn');
            closeBtn.focus();
        }, 100);

        // YouTube player API
        if (typeof YT !== 'undefined' && YT.Player) {
            this.onYouTubeIframeAPIReady(videoId);
        }
    }

    onYouTubeIframeAPIReady(videoId) {
        // Inisialisasi player YouTube
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        // Misal id iframe: 'ytplayer'
        ytPlayer = new YT.Player('ytplayer', {
            events: {
                'onReady': function(event) {
                    if (lastTime > 0) event.target.seekTo(lastTime);
                    event.target.playVideo();
                }
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('videoModal');
        const videoPlayer = document.getElementById('videoPlayer');
        
        modal.style.display = 'none';
        videoPlayer.innerHTML = '';
        this.currentModal = null;

        // Hentikan dan hancurkan player YouTube jika ada
        if (ytPlayer) {
            ytPlayer.destroy();
            ytPlayer = null;
        }
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
                const onclick = focused.getAttribute('onclick');
                if (onclick) {
                    eval(onclick);
                }
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
        loading.style.display = show ? 'block' : 'none';
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

// Global functions for inline event handlers
function filterVideos(category) {
    app.filterVideos(category);
}

function searchVideos() {
    app.searchVideos();
}

function toggleTheme() {
    app.toggleTheme();
}

function closeModal() {
    app.closeModal();
}

let lastTime = 0;
let lastVideoTitle = '';
let lastVideoThumb = '';
let lastVideoSrc = '';
let lastVideoType = '';

function minimizeModal() {
    const videoPlayer = document.getElementById('videoPlayer');
    const miniPlayerVideo = document.getElementById('miniPlayerVideo');
    const videoModal = document.getElementById('videoModal');
    const miniPlayer = document.getElementById('miniPlayer');

    // Simpan elemen video yang ada
    const videoElement = videoPlayer.firstElementChild;
    if (videoElement) {
        // Pindahkan video ke mini player
        miniPlayerVideo.appendChild(videoElement);

        // Pastikan video tetap berjalan dengan menyimpan status pemutaran
        if (videoElement.tagName === 'IFRAME') {
            // Untuk video YouTube/Dailymotion, biarkan iframe berjalan
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
        }
    }
    
    // Sembunyikan modal dan tampilkan mini player
    videoModal.style.display = 'none';
    miniPlayer.style.display = 'block';
    
    // Update judul di mini player
    document.getElementById('miniPlayerTitle').textContent = lastVideoTitle;
}

function restoreModal() {
    const videoPlayer = document.getElementById('videoPlayer');
    const miniPlayerVideo = document.getElementById('miniPlayerVideo');
    const videoModal = document.getElementById('videoModal');
    const miniPlayer = document.getElementById('miniPlayer');

    // Pindahkan video kembali ke modal
    const videoElement = miniPlayerVideo.firstElementChild;
    if (videoElement) {
        // Pindahkan video ke modal tanpa me-reset pemutaran
        videoPlayer.appendChild(videoElement);

        // Sesuaikan ukuran video untuk modal
        if (videoElement.tagName === 'IFRAME') {
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
        }
    }
    
    // Tampilkan modal dan sembunyikan mini player
    miniPlayer.style.display = 'none';
    videoModal.style.display = 'block';
}

function closeMiniPlayer() {
    const miniPlayer = document.getElementById('miniPlayer');
    const miniPlayerVideo = document.getElementById('miniPlayerVideo');
    
    // Bersihkan video dan sembunyikan mini player
    miniPlayerVideo.innerHTML = '';
    miniPlayer.style.display = 'none';
}

// Initialize app
const app = new VidtapzApp();

// Mobile menu functionality
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) return;
    const isActive = mobileMenu.classList.contains('active');

    if (isActive) {
        mobileMenu.classList.remove('active');
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.classList.add('active');
        mobileMenu.style.display = 'block';
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (!mobileMenu || !mobileMenuBtn) return;
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        mobileMenu.style.display = 'none';
    }
});

function getYouTubeId(url) {
    // Handle embed URL format
    if (url.includes('/embed/')) {
        return url.split('/embed/')[1].split('?')[0];
    }
    
    // Handle watch URL format
    const urlParams = new URL(url).searchParams;
    return urlParams.get('v') || '';
}

function getYouTubeThumbnail(url) {
    const id = getYouTubeId(url);
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
