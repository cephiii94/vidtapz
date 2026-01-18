class SmartTVApp {
    constructor() {
        this.videos = [];
        this.theme = localStorage.getItem('tv-theme') || 'dark';
        
        this.focusedArea = 'grid'; 
        this.sidebarIndex = 0;
        this.gridRow = 0;
        this.gridCol = 0;
        this.gridCols = 4;
        this.isCategoryOpen = false;
        
        this.player = null;
        this.lastFocusedElement = null;

        this.init();
    }

    async init() {
        this.dom = {
            sidebar: document.getElementById('sidebar'),
            sidebarContent: document.getElementById('sidebar-content'),
            themeToggleContainer: document.getElementById('theme-toggle-container'),
            grid: document.getElementById('video-grid-tv'),
            categoryTitle: document.getElementById('category-title'),
            playerOverlay: document.getElementById('player-overlay'),
            playerContainer: document.getElementById('player-container'),
            html: document.documentElement,
            // New References
            categoryDropdown: document.querySelector('.category-dropdown'),
            arrowIcon: document.querySelector('.arrow-icon'),
            themeIcon: document.getElementById('theme-icon')
        };
        
        this.applyTheme();
        await this.loadVideos();
        this.updateThemeIcon(); // Initialize correct icon
        this.filterVideos('all', true); 
        this.setFocus('grid', 0, 0);
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Close Button Listener
        const closeBtn = document.querySelector('.close-player-btn');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => this.closePlayer());
        }

        // MOUSE INTERACTION: Sidebar
        const sidebarItems = this.getFocusableSidebarItems();
        sidebarItems.forEach((item, index) => {
            // Hover to focus
            item.addEventListener('mouseenter', () => {
                this.setFocus('sidebar', index);
            });
            // Click to trigger action
            item.addEventListener('click', () => {
                this.handleAction(item);
            });
        });

        // RESIZE LISTENER: Fix Grid/JS mismatch
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-render grid to update Data Attributes (row/col) to match new CSS layout
                // Filter again with current category to refresh layout
                const activeCategory = this.getCurrentCategory();
                this.filterVideos(activeCategory, true); // true = keep position (sort of)
                this.setFocus('grid', 0, 0); // Reset focus to top-left to avoid getting lost
            }, 200);
        });

        // MOUSE INTERACTION: Grid (Event Delegation)
        // Fix jitter: track last mouse position to ensure intention
        let lastMouseX = 0, lastMouseY = 0;
        
        this.dom.grid.addEventListener('mousemove', (e) => {
            // Ignore if mouse hasn't moved significantly (browser quirk or scroll)
            if (Math.abs(e.clientX - lastMouseX) < 5 && Math.abs(e.clientY - lastMouseY) < 5) return;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            const card = e.target.closest('.video-card-tv');
            if (card) {
                const row = parseInt(card.dataset.row);
                const col = parseInt(card.dataset.col);
                // Only update if changed
                if (this.gridRow !== row || this.gridCol !== col || this.focusedArea !== 'grid') {
                    this.setFocus('grid', row, col);
                }
            }
        });

        this.dom.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.video-card-tv');
            if (card) {
                this.playVideo(card.dataset.videoId);
            }
        });
    }
    
    getCurrentCategory() {
        // Helper to get current filter state
        const title = this.dom.categoryTitle.textContent.toLowerCase();
        if (title.includes('all')) return 'all';
        return title.replace(' videos', '');
    }
    
    applyTheme() {
        this.dom.html.setAttribute('data-theme', this.theme);
        localStorage.setItem('tv-theme', this.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        if(this.dom.themeIcon) {
            this.dom.themeIcon.className = this.theme === 'dark' 
                ? 'fas fa-sun icon' 
                : 'fas fa-moon icon';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }

    showAddVideoModal() {
        const modal = document.getElementById('add-video-modal');
        const urlInput = document.getElementById('add-url');
        const catSelect = document.getElementById('add-category');
        const btnCancel = document.getElementById('btn-cancel-add');
        const btnConfirm = document.getElementById('btn-confirm-add');

        modal.style.display = 'flex';
        urlInput.focus();

        const close = () => {
            modal.style.display = 'none';
            this.setFocus('sidebar', this.sidebarIndex); // Return focus
        };

        btnCancel.onclick = close;
        
        btnConfirm.onclick = async () => {
            const url = urlInput.value.trim();
            const category = catSelect.value;
            if(!url) return;

            btnConfirm.innerText = "Fetching...";
            const details = await this.fetchVideoDetails(url, category);
            if(details) {
                this.videos.unshift(details); // Add to beginning
                this.saveToLocalStorage();
                this.filterVideos('all');
                close();
            } else {
                alert("Invalid YouTube URL or Info not found");
            }
            btnConfirm.innerText = "Add Video";
            urlInput.value = "";
        };
    }

    async fetchVideoDetails(youtubeUrl, category) {
        try {
            const urlObj = new URL(youtubeUrl);
            const videoId = urlObj.searchParams.get('v');
            if (!videoId) return null;

            // Sanitized URL: only keep video ID to prevent oEmbed errors from extra params like 'pp'
            const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;

            const response = await fetch(oembedUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
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
            console.warn(`oEmbed fetch failed for ${youtubeUrl}:`, error);
            return null;
        }
    }

    async loadVideos() {
        let allVideos = [];

        // 1. Load from videos.json (Base Data)
        try {
            const response = await fetch('/script/videos.json');
            const data = await response.json();
            if (data.videos) allVideos = data.videos;
        } catch (error) {
            console.error('Failed to load videos.json', error);
        }

        // 2. Load from LocalStorage (User Added / Cached Data)
        const localData = JSON.parse(localStorage.getItem('tv_custom_videos') || '[]');
        
        // Merge: Prefer LocalStorage info if ID matches (to support caching of "Loading..." placeholders)
        const mergedMap = new Map();
        
        // Add JSON videos first
        allVideos.forEach(v => mergedMap.set(v.id, v));
        
        // Override/Add LocalStorage videos
        localData.forEach(v => mergedMap.set(v.id, v));

        this.videos = Array.from(mergedMap.values());

        // 3. Background Repair: Check for "Loading..." titles and fetch valid data
        this.repairIncompleteData(this.videos);
    }

    async repairIncompleteData(videoList) {
        let hasUpdates = false;
        for (const video of videoList) {
            if (video.title && video.title.startsWith('Loading')) {
                // It's a placeholder, fetch real data
                const details = await this.fetchVideoDetails(`https://www.youtube.com/watch?v=${video.videoId}`, video.category);
                if (details) {
                    // Update object in place
                    Object.assign(video, details);
                    hasUpdates = true;
                }
            }
        }

        if (hasUpdates) {
            // Save updated data to LocalStorage to act as cache for next reload
            this.saveToLocalStorage();
            // Refresh Grid if currently viewing affected category
            // (Optional: can just let it update on next nav or filter)
            this.renderGrid(this.videos.filter(v => 
                this.dom.categoryTitle.textContent.toLowerCase().includes(v.category) || 
                this.dom.categoryTitle.textContent.includes('All')
            ));
        }
    }

    saveToLocalStorage() {
        // We ideally only save "Diffs" or "User Added", but saving all is easiest for now to cache repairs
        localStorage.setItem('tv_custom_videos', JSON.stringify(this.videos));
    }

    /* renderSidebar removed - HTML is static now */

    filterVideos(category, isInitialLoad = false) {
        this.dom.categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Videos`;
        if (category === 'all') this.dom.categoryTitle.textContent = 'All Videos';
        const filtered = (category === 'all') ? this.videos : this.videos.filter(v => v.category === category);
        this.renderGrid(filtered);
        if (!isInitialLoad) {
            this.gridRow = 0;
            this.gridCol = 0;
        }
    }
    
    renderGrid(videoList) {
        const gridWidth = this.dom.grid.clientWidth;
        // Match CSS: minmax(280px, 1fr) with gap 30px
        const cardWidth = 280 + 30; 
        this.gridCols = Math.max(1, Math.floor((gridWidth + 30) / cardWidth));
        
        this.dom.grid.innerHTML = videoList.map((video, index) => {
            const row = Math.floor(index / this.gridCols);
            const col = index % this.gridCols;
            return `
            <div class="video-card-tv" data-video-id="${video.id}" data-row="${row}" data-col="${col}">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                <div class="title">${video.title}</div>
            </div>`;
        }).join('');
    }
    
    getFocusableSidebarItems() {
        return Array.from(this.dom.sidebar.querySelectorAll('.sidebar-item'));
    }

    setFocus(area, indexOrRow, col) {
        document.querySelector('.focused')?.classList.remove('focused');
        this.focusedArea = area;
        let newFocused;
        
        if (area === 'sidebar') {
            this.dom.sidebar.classList.add('expanded');
            this.sidebarIndex = indexOrRow;
            const items = this.getFocusableSidebarItems();
            newFocused = items[this.sidebarIndex];
        } else { 
            this.dom.sidebar.classList.remove('expanded');
            this.gridRow = indexOrRow;
            this.gridCol = col;
            newFocused = this.dom.grid.querySelector(`[data-row="${this.gridRow}"][data-col="${this.gridCol}"]`);
        }
        
        if (newFocused) {
            newFocused.classList.add('focused');
            newFocused.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    }
    
    handleKeydown(e) {
        if (this.dom.playerOverlay.style.display === 'flex') {
            if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack') {
                e.preventDefault();
                this.closePlayer();
            }
            return;
        }
        // Add Global Back Navigation
        if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack') {
             e.preventDefault();
             window.location.href = 'index.html';
             return;
        }

        e.preventDefault();
        switch (e.key) {
            case 'ArrowUp': this.navigateUp(); break;
            case 'ArrowDown': this.navigateDown(); break;
            case 'ArrowLeft': this.navigateLeft(); break;
            case 'ArrowRight': this.navigateRight(); break;
            case 'Enter': case 'Ok': this.handleEnter(); break;
        }
    }

    navigateUp() {
        if (this.focusedArea === 'sidebar') {
            const newIndex = Math.max(0, this.sidebarIndex - 1);
            this.setFocus('sidebar', newIndex);
        } else {
            const newRow = Math.max(0, this.gridRow - 1);
            if (this.dom.grid.querySelector(`[data-row="${newRow}"][data-col="${this.gridCol}"]`)) {
                this.setFocus('grid', newRow, this.gridCol);
            }
        }
    }
    
    navigateDown() {
        if (this.focusedArea === 'sidebar') {
            const items = this.getFocusableSidebarItems();
            const newIndex = Math.min(items.length - 1, this.sidebarIndex + 1);
            this.setFocus('sidebar', newIndex);
        } else {
            const maxRow = +this.dom.grid.querySelector('[data-col="0"]:last-child')?.dataset.row || 0;
            const newRow = Math.min(maxRow, this.gridRow + 1);
            if (this.dom.grid.querySelector(`[data-row="${newRow}"][data-col="${this.gridCol}"]`)) {
                this.setFocus('grid', newRow, this.gridCol);
            }
        }
    }

    navigateLeft() {
        if (this.focusedArea === 'grid' && this.gridCol > 0) {
            this.setFocus('grid', this.gridRow, this.gridCol - 1);
        } else {
            this.setFocus('sidebar', this.sidebarIndex);
        }
    }

    navigateRight() {
        if (this.focusedArea === 'sidebar') {
            this.setFocus('grid', this.gridRow, 0);
        } else {
            const maxCol = this.gridCols - 1;
            const newCol = Math.min(maxCol, this.gridCol + 1);
            if (this.dom.grid.querySelector(`[data-row="${this.gridRow}"][data-col="${newCol}"]`)) {
                this.setFocus('grid', this.gridRow, newCol);
            }
        }
    }
    
    handleEnter() {
        const focusedEl = document.querySelector('.focused');
        if (focusedEl) this.handleAction(focusedEl);
    }

    handleAction(element) {
        if (this.focusedArea === 'sidebar') {
            const action = element.dataset.action;
            switch(action) {
                case 'filter':
                case 'home':
                    const category = element.dataset.category;
                    this.filterVideos(category);
                    this.setFocus('grid', 0, 0);
                    break;
                case 'toggle-category':
                    this.isCategoryOpen = !this.isCategoryOpen;
                    if(this.dom.categoryDropdown) {
                        this.dom.categoryDropdown.classList.toggle('open', this.isCategoryOpen);
                    }
                    if(this.dom.arrowIcon) {
                        this.dom.arrowIcon.classList.toggle('open', this.isCategoryOpen);
                    }
                    break;
                case 'toggle-theme':
                    this.toggleTheme();
                    this.setFocus('sidebar', this.sidebarIndex);
                    break;
                case 'add-video':
                    this.showAddVideoModal();
                    break;
                case 'search':
                    // Fungsi pencarian belum diimplementasikan
                    break;
            }
        } else {
            const videoId = element.dataset.videoId;
            this.playVideo(videoId);
        }
    }
    
    playVideo(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;
        this.lastFocusedElement = document.querySelector('.focused');
        this.dom.playerOverlay.style.display = 'flex';
        this.player = new YT.Player('player-container', {
            videoId: video.videoId,
            playerVars: { 'autoplay': 1, 'controls': 1, 'rel': 0, 'showinfo': 0 },
            events: { 'onReady': (e) => e.target.playVideo() }
        });
    }
    
    closePlayer() {
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        this.dom.playerOverlay.style.display = 'none';
        if (this.lastFocusedElement) {
            this.lastFocusedElement.classList.add('focused');
            this.lastFocusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function onYouTubeIframeAPIReady() {
    new SmartTVApp();
}
