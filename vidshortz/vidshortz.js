class VidShortzApp {
    constructor() {
        this.shorts = [];
        this.currentIndex = 0;
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadShorts();
        this.renderShorts();
    }

    setupEventListeners() {
        // Keyboard navigation for shorts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousShort();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.nextShort();
                    break;
                case ' ':
                    e.preventDefault();
                    // Toggle play/pause if needed
                    break;
            }
        });

        // Touch/scroll navigation
        let isScrolling = false;
        document.addEventListener('scroll', () => {
            if (!isScrolling) {
                isScrolling = true;
                setTimeout(() => {
                    this.updateCurrentShort();
                    isScrolling = false;
                }, 100);
            }
        });
    }

    async loadShorts() {
        // Load short videos (vertical format preferred)
        this.shorts = [
            {
                id: 'short_1',
                title: 'Amazing Nature Timelapse',
                description: 'Watch nature transform in this stunning timelapse video #nature #timelapse',
                thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'M7lc1UVf-VE',
                embedUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&mute=1&loop=1&playlist=M7lc1UVf-VE',
                category: 'nature'
            },
            {
                id: 'short_2',
                title: 'Quick Coding Tips',
                description: 'Learn JavaScript tricks in 60 seconds! #coding #javascript #tips',
                thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'W6NZfCO5SIk',
                embedUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk?autoplay=1&mute=1&loop=1&playlist=W6NZfCO5SIk',
                category: 'education'
            },
            {
                id: 'short_3',
                title: 'Epic Gaming Moment',
                description: 'Unbelievable gaming play! Watch till the end 🎮 #gaming #epic',
                thumbnail: 'https://img.youtube.com/vi/bO8HaELusLk/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'bO8HaELusLk',
                embedUrl: 'https://www.youtube.com/embed/bO8HaELusLk?autoplay=1&mute=1&loop=1&playlist=bO8HaELusLk',
                category: 'gaming'
            },
            {
                id: 'short_4',
                title: 'Music Beat Drop',
                description: 'This beat hits different 🔥 #music #beats #viral',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                platform: 'youtube',
                videoId: 'dQw4w9WgXcQ',
                embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ',
                category: 'music'
            }
        ];
    }

    renderShorts() {
        const shortsFeed = document.getElementById('shortsFeed');
        
        if (this.shorts.length === 0) {
            shortsFeed.innerHTML = `
                <div class="shorts-loading">
                    <i class="fas fa-mobile-alt"></i>
                    <p>No shorts available</p>
                </div>
            `;
            return;
        }

        shortsFeed.innerHTML = this.shorts.map((short, index) => `
            <div class="short-video" data-index="${index}">
                <iframe 
                    src="${short.embedUrl}" 
                    allowfullscreen 
                    allow="autoplay; encrypted-media"
                    title="${short.title}">
                </iframe>
                
                <div class="short-overlay">
                    <div class="short-info">
                        <div class="short-badges">
                            <span class="short-badge">${short.platform.toUpperCase()}</span>
                            <span class="short-badge">#${short.category}</span>
                        </div>
                        <h3>${short.title}</h3>
                        <p>${short.description}</p>
                    </div>
                </div>
                
                <div class="short-actions">
                    <button class="short-action-btn" onclick="likeShort('${short.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="short-action-btn" onclick="shareShort('${short.id}')">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="short-action-btn" onclick="saveShort('${short.id}')">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    nextShort() {
        if (this.currentIndex < this.shorts.length - 1) {
            this.currentIndex++;
            this.scrollToShort(this.currentIndex);
        }
    }

    previousShort() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.scrollToShort(this.currentIndex);
        }
    }

    scrollToShort(index) {
        const shortElement = document.querySelector(`[data-index="${index}"]`);
        if (shortElement) {
            shortElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    updateCurrentShort() {
        const shortElements = document.querySelectorAll('.short-video');
        const windowHeight = window.innerHeight;
        
        shortElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < windowHeight / 2) {
                this.currentIndex = index;
            }
        });
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

function likeShort(shortId) {
    console.log('Liked short:', shortId);
    // Add like functionality
}

function shareShort(shortId) {
    console.log('Shared short:', shortId);
    // Add share functionality
}

function saveShort(shortId) {
    console.log('Saved short:', shortId);
    // Add save functionality
}

function searchVideos() {
    const query = document.getElementById('searchInput').value;
    console.log('Searching shorts:', query);
    // Add search functionality
}

// Initialize app
const app = new VidShortzApp();
