        // =============================================================================
        // VIDTAPZ - VIDEO PLATFORM WITH EXTERNAL DATA SUPPORT
        // =============================================================================
        
        // Default fallback videos (minimal set)
        const defaultVideosData = [
            {
                id: 1,
                title: "Welcome to VidTapz",
                description: "Your premier video sharing platform. Start by generating your video collection using our Video Generator tool.",
                category: "education",
                platform: "youtube",
                videoId: "dQw4w9WgXcQ",
                duration: "3:32",
                views: "1.4B",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
            }
        ];

        // =============================================================================
        // DATA INITIALIZATION SYSTEM
        // =============================================================================
        
        /**
         * Initialize videos data from multiple sources
         * Priority: 1. External file, 2. localStorage, 3. Default
         */
        function initializeVideosData() {
            console.log('🚀 Initializing VidTapz video data...');
            
            // 1. Check for external videosData (from generator file)
            if (typeof window.videosData !== 'undefined' && Array.isArray(window.videosData) && window.videosData.length > 0) {
                console.log(`✅ Found external video data: ${window.videosData.length} videos`);
                
                // Validate external data structure
                const validatedData = validateVideoData(window.videosData);
                if (validatedData.length > 0) {
                    // Save to localStorage as backup
                    saveVideosToStorage(validatedData, 'external_backup');
                    return validatedData;
                }
            }
            
            // 2. Try localStorage (user-added videos)
            const savedVideos = loadVideosFromStorage('vidtapz_videos');
            if (savedVideos && savedVideos.length > 0) {
                console.log(`📁 Found saved videos: ${savedVideos.length} videos`);
                return savedVideos;
            }
            
            // 3. Try external backup from localStorage
            const backupVideos = loadVideosFromStorage('external_backup');
            if (backupVideos && backupVideos.length > 0) {
                console.log(`🔄 Using backup external data: ${backupVideos.length} videos`);
                return backupVideos;
            }
            
            // 4. Fallback to default
            console.log('📺 Using default video data');
            return [...defaultVideosData];
        }

        /**
         * Validate video data structure
         */
        function validateVideoData(data) {
            if (!Array.isArray(data)) return [];
            
            return data.filter(video => {
                const isValid = video && 
                    typeof video.id !== 'undefined' &&
                    typeof video.title === 'string' &&
                    typeof video.platform === 'string' &&
                    typeof video.videoId === 'string';
                
                if (!isValid) {
                    console.warn('⚠️ Invalid video data found:', video);
                }
                
                return isValid;
            }).map(video => ({
                id: video.id,
                title: video.title || 'Untitled Video',
                description: video.description || 'No description available',
                category: video.category || 'entertainment',
                platform: video.platform,
                videoId: video.videoId,
                duration: video.duration || '0:00',
                views: video.views || '0',
                thumbnail: video.thumbnail || generateFallbackThumbnail(video.videoId, video.platform),
                embedHtml: video.embedHtml || generateEmbedCode(video.videoId, video.platform),
                dateAdded: video.dateAdded || null,
                source: video.source || 'external'
            }));
        }

        /**
         * Generate fallback thumbnail
         */
        function generateFallbackThumbnail(videoId, platform) {
            if (platform === 'youtube') {
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            } else if (platform === 'dailymotion') {
                return `https://s1.dmcdn.net/v/${videoId}/x240`;
            }
            return 'https://via.placeholder.com/480x270?text=Video+Thumbnail';
        }

        /**
         * Generate embed code
         */
        function generateEmbedCode(videoId, platform) {
            if (platform === 'youtube') {
                return `<iframe width="100%" height="500" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else if (platform === 'dailymotion') {
                return `<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/${videoId}?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>`;
            }
            return '<div class="embed-error">Video player not available</div>';
        }

        /**
         * Load videos from localStorage
         */
        function loadVideosFromStorage(key) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    return validateVideoData(parsed);
                }
            } catch (error) {
                console.error(`Error loading videos from ${key}:`, error);
            }
            return null;
        }

        /**
         * Save videos to localStorage
         */
        function saveVideosToStorage(videos, key = 'vidtapz_videos') {
            try {
                const dataToSave = videos.map(video => ({
                    ...video,
                    lastSaved: new Date().toISOString()
                }));
                
                localStorage.setItem(key, JSON.stringify(dataToSave));
                console.log(`💾 Saved ${videos.length} videos to ${key}`);
                return true;
            } catch (error) {
                console.error(`Error saving videos to ${key}:`, error);
                
                if (error.name === 'QuotaExceededError') {
                    showNotification('Storage quota exceeded! Cannot save videos.', 'error');
                }
                return false;
            }
        }

        // =============================================================================
        // MAIN APPLICATION VARIABLES
        // =============================================================================
        
        // Initialize main data
        let videosData = initializeVideosData();
        let currentVideos = [...videosData];
        let currentCategory = 'all';

        // Track data source for UI
        const dataSource = window.videosData ? 'external' : (localStorage.getItem('vidtapz_videos') ? 'saved' : 'default');

        // DOM Elements
        const videoGrid = document.getElementById('videoGrid');
        const modal = document.getElementById('videoModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalCategory = document.getElementById('modalCategory');
        const modalPlatform = document.getElementById('modalPlatform');
        const modalViews = document.getElementById('modalViews');
        const modalDurationTime = document.getElementById('modalDurationTime');
        const videoPlayer = document.getElementById('videoPlayer');
        const closeModal = document.getElementById('closeModal');
        const themeToggle = document.getElementById('themeToggle');
        const searchInput = document.getElementById('searchInput');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNav = document.getElementById('mobileNav');

        // =============================================================================
        // INITIALIZATION
        // =============================================================================
        
        document.addEventListener('DOMContentLoaded', function() {
            initializeTheme();
            renderVideos(currentVideos);
            setupEventListeners();
            showDataSourceInfo();
            initializePerformanceOptimizations();
        });

        /**
         * Show data source information
         */
        function showDataSourceInfo() {
            const sourceInfo = {
                external: `📡 External data loaded (${videosData.length} videos)`,
                saved: `💾 Saved data loaded (${videosData.length} videos)`,
                default: `🎬 Default videos loaded (${videosData.length} videos)`
            };
            
            console.log(sourceInfo[dataSource]);
            
            // Show notification to user
            setTimeout(() => {
                const message = dataSource === 'external' 
                    ? `Loaded ${videosData.length} videos from generator`
                    : dataSource === 'saved'
                    ? `Loaded ${videosData.length} saved videos`
                    : 'Using default videos. Generate your collection!';
                
                showNotification(message, 'info', 3000);
            }, 1000);
        }

        // =============================================================================
        // EVENT LISTENERS SETUP
        // =============================================================================
        
        function setupEventListeners() {
            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', handleFilterClick);
            });

            // Modal controls
            closeModal?.addEventListener('click', closeVideoModal);
            modal?.addEventListener('click', function(e) {
                if (e.target === modal) closeVideoModal();
            });

            // Theme toggle
            themeToggle?.addEventListener('click', toggleTheme);

            // Search functionality
            searchInput?.addEventListener('input', debounce(handleSearch, 300));

            // Mobile menu
            mobileMenuToggle?.addEventListener('click', toggleMobileMenu);

            // Navigation links
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.addEventListener('click', handleNavigation);
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', handleKeyboardShortcuts);

            // Close mobile menu on outside click
            document.addEventListener('click', function(e) {
                if (!mobileMenuToggle?.contains(e.target) && !mobileNav?.contains(e.target)) {
                    mobileNav?.classList.remove('active');
                }
            });

            // Window events
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('online', handleOnlineStatus);
            window.addEventListener('offline', handleOfflineStatus);
        }

        // =============================================================================
        // VIDEO RENDERING SYSTEM
        // =============================================================================
        
        function renderVideos(videos) {
            if (!videoGrid) {
                console.error('Video grid element not found');
                return;
            }

            if (videos.length === 0) {
                renderEmptyState();
                return;
            }

            // Add loading state
            videoGrid.classList.add('loading');

            const videosHTML = videos.map((video, index) => generateVideoCardHTML(video, index)).join('');
            
            setTimeout(() => {
                videoGrid.innerHTML = videosHTML;
                videoGrid.classList.remove('loading');
                initializeVideoCards();
                announceToScreenReader(`${videos.length} videos loaded`);
            }, 100);
        }

        /**
         * Generate HTML for video card
         */
        function generateVideoCardHTML(video, index) {
            const isUserAdded = video.dateAdded || video.source === 'user';
            const animationDelay = Math.min(index * 0.1, 2); // Cap at 2s for performance
            
            return `
                <article class="video-card" 
                         onclick="openVideoModal(${video.id})" 
                         style="animation-delay: ${animationDelay}s"
                         tabindex="0"
                         role="button"
                         aria-label="Play video: ${escapeHtml(video.title)}"
                         data-video-id="${video.id}">
                    
                    ${isUserAdded ? `
                        <button class="delete-video-btn" 
                                onclick="event.stopPropagation(); confirmDeleteVideo(${video.id})" 
                                title="Delete Video"
                                aria-label="Delete video: ${escapeHtml(video.title)}">
                            <i class="fas fa-trash" aria-hidden="true"></i>
                        </button>
                    ` : ''}
                    
                    <div class="video-thumbnail" 
                         style="background-image: url('${video.thumbnail}')"
                         role="img"
                         aria-label="Video thumbnail">
                        
                        <div class="platform-badge platform-${video.platform}" 
                             aria-label="Platform: ${video.platform}">
                            <i class="fab fa-${video.platform === 'youtube' ? 'youtube' : 'dailymotion'}" aria-hidden="true"></i>
                            <span class="sr-only">${video.platform}</span>
                        </div>
                        
                        <button class="play-button" 
                                tabindex="-1"
                                aria-hidden="true">
                            <i class="fas fa-play"></i>
                        </button>
                        
                        <div class="video-duration" aria-label="Duration: ${video.duration}">
                            ${video.duration}
                        </div>
                        
                        ${isUserAdded ? '<div class="user-added-badge" title="Added by user">User Added</div>' : ''}
                        ${video.source === 'external' ? '<div class="external-badge" title="From generator">Generated</div>' : ''}
                    </div>
                    
                    <div class="video-info">
                        <h3 class="video-title" title="${escapeHtml(video.title)}">
                            ${escapeHtml(video.title)}
                        </h3>
                        <p class="video-description" title="${escapeHtml(video.description)}">
                            ${escapeHtml(video.description)}
                        </p>
                        <div class="video-meta">
                            <span class="category-tag" aria-label="Category: ${video.category}">
                                ${video.category}
                            </span>
                            <div class="video-stats" aria-label="Video statistics">
                                <span><i class="fas fa-eye" aria-hidden="true"></i> ${video.views}</span>
                                <span><i class="fas fa-clock" aria-hidden="true"></i> ${video.duration}</span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }

        /**
         * Render empty state
         */
        function renderEmptyState() {
            const emptyStateHTML = `
                <div class="empty-state" role="status" aria-live="polite">
                    <div class="empty-icon">
                        <i class="fas fa-video-slash" aria-hidden="true"></i>
                    </div>
                    <h3>No videos found</h3>
                    <p>Try adjusting your search criteria or browse different categories.</p>
                    <div class="empty-actions">
                        <button onclick="resetFilters()" class="btn btn-primary">
                            <i class="fas fa-refresh"></i>
                            Reset Filters
                        </button>
                        <a href="video-generator.html" class="btn btn-secondary">
                            <i class="fas fa-plus"></i>
                            Generate Videos
                        </a>
                    </div>
                </div>
            `;
            
            videoGrid.innerHTML = emptyStateHTML;
        }

        /**
         * Initialize video cards after rendering
         */
        function initializeVideoCards() {
            const videoCards = document.querySelectorAll('.video-card');
            
            videoCards.forEach((card, index) => {
                // Make cards focusable and add keyboard support
                card.setAttribute('tabindex', '0');
                
                // Focus events
                card.addEventListener('focus', function() {
                    this.classList.add('focused');
                });
                
                card.addEventListener('blur', function() {
                    this.classList.remove('focused');
                });
                
                // Keyboard events
                card.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
                
                // Lazy loading for thumbnails
                const thumbnail = card.querySelector('.video-thumbnail');
                if (thumbnail && 'IntersectionObserver' in window) {
                    lazyLoadObserver.observe(thumbnail);
                }
                
                // Animation trigger
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 50);
            });
        }

        // =============================================================================
        // VIDEO MODAL SYSTEM
        // =============================================================================
        
        function openVideoModal(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (!video || !modal) return;

            // Update modal content
            updateModalContent(video);
            
            // Show modal
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus management
            const closeButton = modal.querySelector('.close');
            closeButton?.focus();
            
            // Load video with delay
            loadVideoInModal(video);
            
            // Track view
            trackVideoView(video.id);
            
            // Announce to screen reader
            announceToScreenReader(`Playing video: ${video.title}`);
        }

        function updateModalContent(video) {
            if (modalTitle) modalTitle.textContent = video.title;
            if (modalDescription) modalDescription.textContent = video.description;
            if (modalCategory) modalCategory.textContent = video.category;
            if (modalPlatform) {
                modalPlatform.innerHTML = `
                    <i class="fab fa-${video.platform === 'youtube' ? 'youtube' : 'dailymotion'}"></i> 
                    ${video.platform}
                `;
            }
            if (modalViews) modalViews.innerHTML = `<i class="fas fa-eye"></i> ${video.views} views`;
            if (modalDurationTime) modalDurationTime.textContent = video.duration;
        }

        function loadVideoInModal(video) {
            if (!videoPlayer) return;
            
            // Show loading state
            videoPlayer.innerHTML = `
                <div class="video-loading" role="status" aria-live="polite">
                    <div class="spinner" aria-hidden="true"></div>
                    <p>Loading video...</p>
                </div>
            `;
            
            // Simulate loading delay and load video
            setTimeout(() => {
                try {
                    videoPlayer.innerHTML = video.embedHtml;
                } catch (error) {
                    console.error('Error loading video:', error);
                    videoPlayer.innerHTML = `
                        <div class="video-error" role="alert">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Unable to load video</p>
                            <button onclick="retryVideoLoad(${video.id})" class="btn btn-primary">
                                <i class="fas fa-retry"></i>
                                Retry
                            </button>
                        </div>
                    `;
                }
            }, 1000);
        }

        function closeVideoModal() {
            if (!modal) return;
            
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            
            // Stop video playback
            if (videoPlayer) videoPlayer.innerHTML = '';
            
            // Return focus to the video card
            const focusedCard = document.querySelector('.video-card.focused');
            if (focusedCard) {
                focusedCard.focus();
            }
        }

        function retryVideoLoad(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (video) loadVideoInModal(video);
        }

        // =============================================================================
        // FILTERING AND SEARCH SYSTEM
        // =============================================================================
        
        function handleFilterClick(e) {
            const category = e.target.dataset.category;
            if (!category) return;
            
            currentCategory = category;

            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Apply filters
            applyFilters();
            
            // Announce change
            announceToScreenReader(`Filtered by ${category === 'all' ? 'all categories' : category}`);
        }

        function handleSearch(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            trackSearch(searchTerm);
            applyFilters(searchTerm);
        }

        function applyFilters(searchTerm = '') {
            let filteredVideos = [...videosData];
            
            // Apply category filter
            if (currentCategory !== 'all') {
                filteredVideos = filteredVideos.filter(video => video.category === currentCategory);
            }
            
            // Apply search filter
            if (searchTerm || searchInput?.value) {
                const term = searchTerm || searchInput.value.toLowerCase().trim();
                filteredVideos = filteredVideos.filter(video => 
                    video.title.toLowerCase().includes(term) ||
                    video.description.toLowerCase().includes(term) ||
                    video.category.toLowerCase().includes(term)
                );
            }
            
            currentVideos = filteredVideos;
            renderVideos(currentVideos);
            
            // Update URL without page reload
            updateURL();
        }

        function resetFilters() {
            currentCategory = 'all';
            if (searchInput) searchInput.value = '';
            
            // Reset active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-category="all"]')?.classList.add('active');
            
            // Reset videos
            currentVideos = [...videosData];
            renderVideos(currentVideos);
            
            announceToScreenReader('Filters reset, showing all videos');
        }

        // =============================================================================
        // VIDEO MANAGEMENT SYSTEM
        // =============================================================================
        
        function confirmDeleteVideo(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (!video) return;
            
            const confirmMessage = `Are you sure you want to delete "${video.title}"?`;
            
            if (confirm(confirmMessage)) {
                deleteVideo(videoId);
            }
        }

        function deleteVideo(videoId) {
            // Remove from main array
            videosData = videosData.filter(video => video.id !== videoId);
            
            // Update current videos
            currentVideos = currentVideos.filter(video => video.id !== videoId);
            
            // Save to localStorage (only user-added videos)
            const userVideos = videosData.filter(v => v.dateAdded || v.source === 'user');
            saveVideosToStorage(userVideos);
            
            // Re-render
            renderVideos(currentVideos);
            
            // Close modal if this video was open
            if (modal && modal.style.display === 'block') {
                const currentVideoId = parseInt(videoPlayer?.dataset.videoId);
                if (currentVideoId === videoId) {
                    closeVideoModal();
                }
            }
            
            showNotification('Video deleted successfully', 'success');
        }

        // =============================================================================
        // THEME MANAGEMENT
        // =============================================================================
        
        function initializeTheme() {
            const savedTheme = localStorage.getItem('vidtapz_theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('vidtapz_theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Smooth transition
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
            
            announceToScreenReader(`Theme changed to ${newTheme} mode`);
        }

        function updateThemeIcon(theme) {
            if (!themeToggle) return;
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        // =============================================================================
        // NAVIGATION SYSTEM
        // =============================================================================
        
        function handleNavigation(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => 
                l.classList.remove('active')
            );
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Find corresponding link in mobile/desktop nav
            const linkText = this.textContent.trim();
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
                if (l.textContent.trim() === linkText) {
                    l.classList.add('active');
                }
            });
            
            // Close mobile menu
            if (mobileNav) mobileNav.classList.remove('active');
            
            // Handle specific navigation
            handleSpecificNavigation(linkText.toLowerCase());
        }

        function handleSpecificNavigation(section) {
            switch(section) {
                case 'home':
                    resetFilters();
                    break;
                case 'vidshortz':
                    // Filter for short videos
                    filterByDuration('short');
                    break;
                case 'vidmuz':
                    // Filter for music videos
                    filterByCategory('music');
                    break;
                case 'trending':
                    sortByViews();
                    break;
                case 'saved':
                    showSavedVideos();
                    break;
            }
        }

        function toggleMobileMenu() {
            if (!mobileNav || !mobileMenuToggle) return;
            
            mobileNav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            
            if (icon) {
                if (mobileNav.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                    mobileMenuToggle.setAttribute('aria-label', 'Close menu');
                } else {
                    icon.className = 'fas fa-bars';
                    mobileMenuToggle.setAttribute('aria-label', 'Open menu');
                }
            }
        }

        // =============================================================================
        // KEYBOARD NAVIGATION SYSTEM
        // =============================================================================
        
        function handleKeyboardShortcuts(e) {
            // Global shortcuts
            switch(e.key) {
                case 'Escape':
                    closeVideoModal();
                    if (mobileNav) mobileNav.classList.remove('active');
                    break;
                    
                case '/':
                    if (!e.ctrlKey && !e.metaKey && searchInput) {
                        e.preventDefault();
                        searchInput.focus();
                    }
                    break;
                    
                case 'h':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        resetFilters();
                    }
                    break;
                    
                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        toggleTheme();
                    }
                    break;
            }

            // Video grid navigation
            if (!modal || modal.style.display === 'none') {
                handleVideoGridNavigation(e);
            }
        }

        function handleVideoGridNavigation(e) {
            const videoCards = document.querySelectorAll('.video-card');
            const focusedElement = document.activeElement;
            const currentIndex = Array.from(videoCards).indexOf(focusedElement);

            if (currentIndex === -1) return;

            let newIndex = currentIndex;
            const columns = getGridColumns();

            switch(e.key) {
                case 'ArrowRight':
                    newIndex = Math.min(currentIndex + 1, videoCards.length - 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    newIndex = Math.max(currentIndex - 1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    newIndex = Math.min(currentIndex + columns, videoCards.length - 1);
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    newIndex = Math.max(currentIndex - columns, 0);
                    e.preventDefault();
                    break;
                case 'Home':
                    newIndex = 0;
                    e.preventDefault();
                    break;
                case 'End':
                    newIndex = videoCards.length - 1;
                    e.preventDefault();
                    break;
            }

            if (newIndex !== currentIndex && videoCards[newIndex]) {
                videoCards[newIndex].focus();
                videoCards[newIndex].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }

        function getGridColumns() {
            const gridStyle = getComputedStyle(videoGrid);
            const columns = gridStyle.gridTemplateColumns.split(' ').length;
            return columns || 1;
        }

        // =============================================================================
        // PERFORMANCE OPTIMIZATIONS
        // =============================================================================
        
        function initializePerformanceOptimizations() {
            // Lazy loading observer
            if ('IntersectionObserver' in window) {
                initializeLazyLoading();
            }
            
            // Virtual scrolling for large datasets
            if (videosData.length > 50) {
                initializeVirtualScrolling();
            }
            
            // Preload critical resources
            preloadCriticalResources();
        }

        function initializeLazyLoading() {
            window.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const thumbnail = entry.target;
                        const src = thumbnail.style.backgroundImage;
                        
                        if (src && !thumbnail.classList.contains('loaded')) {
                            thumbnail.classList.add('loaded');
                            lazyLoadObserver.unobserve(thumbnail);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }

        function initializeVirtualScrolling() {
            let isLoading = false;
            const itemsPerPage = 20;
            let currentPage = 1;

            window.addEventListener('scroll', debounce(() => {
                if (isLoading) return;

                const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
                
                if (scrollTop + clientHeight >= scrollHeight - 1000) {
                    loadMoreVideos();
                }
            }, 100));

            function loadMoreVideos() {
                const startIndex = currentPage * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                
                if (startIndex >= videosData.length) return;
                
                isLoading = true;
                showLoadingIndicator();
                
                setTimeout(() => {
                    const moreVideos = videosData.slice(startIndex, endIndex);
                    currentVideos = [...currentVideos, ...moreVideos];
                    renderVideos(currentVideos);
                    
                    currentPage++;
                    isLoading = false;
                    hideLoadingIndicator();
                }, 500);
            }
        }

        function preloadCriticalResources() {
            // Preload first few video thumbnails
            const firstVideos = videosData.slice(0, 6);
            firstVideos.forEach(video => {
                if (video.thumbnail) {
                    const img = new Image();
                    img.src = video.thumbnail;
                }
            });
        }

        // =============================================================================
        // UTILITY FUNCTIONS
        // =============================================================================
        
        function debounce(func, wait) {
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

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showNotification(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'polite');
            
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            
            notification.innerHTML = `
                <i class="${icons[type] || icons.info}" aria-hidden="true"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.className = 'sr-only';
            announcement.setAttribute('aria-live', 'polite');
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                announcement.remove();
            }, 1000);
        }

        function updateURL() {
            if (!history.pushState) return;
            
            const params = new URLSearchParams();
            
            if (currentCategory !== 'all') {
                params.set('category', currentCategory);
            }
            
            if (searchInput?.value) {
                params.set('search', searchInput.value);
            }
            
            const newURL = params.toString() ? 
                `${window.location.pathname}?${params.toString()}` : 
                window.location.pathname;
            
            history.pushState(null, '', newURL);
        }

        function loadFromURL() {
            const params = new URLSearchParams(window.location.search);
            
            const category = params.get('category');
            if (category) {
                currentCategory = category;
                const filterBtn = document.querySelector(`[data-category="${category}"]`);
                if (filterBtn) {
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    filterBtn.classList.add('active');
                }
            }
            
            const search = params.get('search');
            if (search && searchInput) {
                searchInput.value = search;
            }
            
            applyFilters();
        }

        // =============================================================================
        // EVENT HANDLERS
        // =============================================================================
        
        function handleBeforeUnload(e) {
            // Save any pending user data
            const userVideos = videosData.filter(v => v.dateAdded || v.source === 'user');
            if (userVideos.length > 0) {
                saveVideosToStorage(userVideos);
            }
        }

        function handleOnlineStatus() {
            showNotification('Connection restored', 'success', 3000);
        }

        function handleOfflineStatus() {
            showNotification('You are offline. Some features may not work.', 'warning', 5000);
        }

        // =============================================================================
        // ANALYTICS AND TRACKING
        // =============================================================================
        
        function trackVideoView(videoId) {
            console.log(`📊 Video viewed: ${videoId}`);
            
            // Update view count in localStorage
            try {
                const viewStats = JSON.parse(localStorage.getItem('video_views') || '{}');
                viewStats[videoId] = (viewStats[videoId] || 0) + 1;
                localStorage.setItem('video_views', JSON.stringify(viewStats));
            } catch (error) {
                console.error('Error tracking view:', error);
            }
        }

        function trackSearch(searchTerm) {
            if (!searchTerm) return;
            
            console.log(`🔍 Search performed: ${searchTerm}`);
            
            // Track popular searches
            try {
                const searchStats = JSON.parse(localStorage.getItem('search_stats') || '{}');
                searchStats[searchTerm] = (searchStats[searchTerm] || 0) + 1;
                localStorage.setItem('search_stats', JSON.stringify(searchStats));
            } catch (error) {
                console.error('Error tracking search:', error);
            }
        }

        // =============================================================================
        // ADDITIONAL FEATURES
        // =============================================================================
        
        function filterByDuration(type) {
            let filteredVideos = [...videosData];
            
            if (type === 'short') {
                // Videos under 5 minutes
                filteredVideos = filteredVideos.filter(video => {
                    const duration = video.duration.split(':');
                    const minutes = parseInt(duration[0]) || 0;
                    return minutes < 5;
                });
            } else if (type === 'long') {
                // Videos over 30 minutes
                filteredVideos = filteredVideos.filter(video => {
                    const duration = video.duration.split(':');
                    const minutes = parseInt(duration[0]) || 0;
                    return minutes > 30;
                });
            }
            
            currentVideos = filteredVideos;
            renderVideos(currentVideos);
            
            announceToScreenReader(`Filtered by ${type} duration videos`);
        }

          function filterByCategory(category) {
            currentCategory = category;
            
            // Update filter button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            const filterBtn = document.querySelector(`[data-category="${category}"]`);
            if (filterBtn) filterBtn.classList.add('active');
            
            applyFilters();
        }

        function sortByViews() {
            currentVideos = [...currentVideos].sort((a, b) => {
                const viewsA = parseViews(a.views);
                const viewsB = parseViews(b.views);
                return viewsB - viewsA;
            });
            
            renderVideos(currentVideos);
            announceToScreenReader('Videos sorted by view count');
        }

        function parseViews(viewString) {
            if (!viewString) return 0;
            
            const num = parseFloat(viewString.replace(/[^\d.]/g, ''));
            if (viewString.includes('K')) return num * 1000;
            if (viewString.includes('M')) return num * 1000000;
            if (viewString.includes('B')) return num * 1000000000;
            return num;
        }

        function showSavedVideos() {
            const savedVideos = videosData.filter(v => v.dateAdded || v.source === 'user');
            
            if (savedVideos.length === 0) {
                showNotification('No saved videos found', 'info');
                return;
            }
            
            currentVideos = savedVideos;
            renderVideos(currentVideos);
            announceToScreenReader(`Showing ${savedVideos.length} saved videos`);
        }

        function showLoadingIndicator() {
            const loadingEl = document.createElement('div');
            loadingEl.id = 'scroll-loading';
            loadingEl.className = 'scroll-loading';
            loadingEl.innerHTML = `
                <div class="spinner" aria-hidden="true"></div>
                <p>Loading more videos...</p>
            `;
            
            videoGrid.parentElement.appendChild(loadingEl);
        }

        function hideLoadingIndicator() {
            const loadingEl = document.getElementById('scroll-loading');
            if (loadingEl) loadingEl.remove();
        }

        // =============================================================================
        // DATA SYNCHRONIZATION
        // =============================================================================
        
        function syncWithExternalData() {
            if (typeof window.videosData !== 'undefined' && window.videosData.length > 0) {
                const externalVideos = validateVideoData(window.videosData);
                const userVideos = videosData.filter(v => v.dateAdded || v.source === 'user');
                
                // Merge external and user videos
                const mergedVideos = [...externalVideos, ...userVideos];
                
                // Remove duplicates based on videoId and platform
                const uniqueVideos = mergedVideos.filter((video, index, self) =>
                    index === self.findIndex(v => 
                        v.videoId === video.videoId && v.platform === video.platform
                    )
                );
                
                videosData = uniqueVideos;
                currentVideos = [...videosData];
                renderVideos(currentVideos);
                
                showNotification(`Synchronized with external data: ${externalVideos.length} videos`, 'success');
                
                return true;
            }
            
            return false;
        }

        function exportUserVideos() {
            const userVideos = videosData.filter(v => v.dateAdded || v.source === 'user');
            
            if (userVideos.length === 0) {
                showNotification('No user videos to export', 'warning');
                return;
            }
            
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                videos: userVideos,
                totalCount: userVideos.length
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vidtapz-user-videos-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`Exported ${userVideos.length} user videos`, 'success');
        }

        function importUserVideos(file) {
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (!importData.videos || !Array.isArray(importData.videos)) {
                        throw new Error('Invalid file format');
                    }
                    
                    const validVideos = validateVideoData(importData.videos);
                    
                    if (validVideos.length === 0) {
                        showNotification('No valid videos found in file', 'warning');
                        return;
                    }
                    
                    // Merge with existing videos
                    const existingVideoIds = videosData.map(v => `${v.videoId}-${v.platform}`);
                    const newVideos = validVideos.filter(v => 
                        !existingVideoIds.includes(`${v.videoId}-${v.platform}`)
                    );
                    
                    if (newVideos.length === 0) {
                        showNotification('All videos already exist', 'info');
                        return;
                    }
                    
                    // Add imported videos
                    videosData = [...videosData, ...newVideos];
                    currentVideos = [...videosData];
                    
                    // Save user videos
                    const userVideos = videosData.filter(v => v.dateAdded || v.source === 'user');
                    saveVideosToStorage(userVideos);
                    
                    renderVideos(currentVideos);
                    showNotification(`Imported ${newVideos.length} new videos`, 'success');
                    
                } catch (error) {
                    console.error('Import error:', error);
                    showNotification('Error importing videos: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        }

        // =============================================================================
        // ADVANCED SEARCH FEATURES
        // =============================================================================
        
        function advancedSearch(query) {
            if (!query || query.length < 2) {
                currentVideos = [...videosData];
                renderVideos(currentVideos);
                return;
            }
            
            const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
            
            const results = videosData.filter(video => {
                const searchText = `${video.title} ${video.description} ${video.category}`.toLowerCase();
                
                // All terms must be found
                return searchTerms.every(term => searchText.includes(term));
            }).sort((a, b) => {
                // Sort by relevance (title matches first)
                const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
                const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
                
                if (aTitleMatch && !bTitleMatch) return -1;
                if (!aTitleMatch && bTitleMatch) return 1;
                
                // Then by view count
                return parseViews(b.views) - parseViews(a.views);
            });
            
            currentVideos = results;
            renderVideos(currentVideos);
            
            // Show search results count
            const count = results.length;
            announceToScreenReader(`Found ${count} video${count !== 1 ? 's' : ''} for "${query}"`);
        }

        function getSearchSuggestions(query) {
            if (!query || query.length < 2) return [];
            
            const suggestions = new Set();
            const queryLower = query.toLowerCase();
            
            videosData.forEach(video => {
                // Title suggestions
                if (video.title.toLowerCase().includes(queryLower)) {
                    suggestions.add(video.title);
                }
                
                // Category suggestions
                if (video.category.toLowerCase().includes(queryLower)) {
                    suggestions.add(video.category);
                }
                
                // Extract words from description
                const words = video.description.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3 && word.includes(queryLower)) {
                        suggestions.add(word);
                    }
                });
            });
            
            return Array.from(suggestions).slice(0, 5);
        }

        // =============================================================================
        // VIDEO QUALITY AND ACCESSIBILITY
        // =============================================================================
        
        function updateVideoQuality(quality = 'auto') {
            // This would be implemented for platforms that support quality selection
            console.log(`Setting video quality to: ${quality}`);
            
            const qualitySettings = {
                auto: 'Auto (Recommended)',
                hd1080: '1080p HD',
                hd720: '720p HD',
                medium: '480p',
                small: '360p'
            };
            
            localStorage.setItem('video_quality', quality);
            showNotification(`Video quality set to ${qualitySettings[quality]}`, 'info');
        }

        function toggleCaptions(enable = null) {
            const captionsEnabled = enable !== null ? enable : 
                !JSON.parse(localStorage.getItem('captions_enabled') || 'false');
            
            localStorage.setItem('captions_enabled', JSON.stringify(captionsEnabled));
            
            showNotification(
                captionsEnabled ? 'Captions enabled' : 'Captions disabled', 
                'info'
            );
            
            // Apply to current video if playing
            const currentIframe = videoPlayer?.querySelector('iframe');
            if (currentIframe) {
                const src = currentIframe.src;
                const separator = src.includes('?') ? '&' : '?';
                const ccParam = captionsEnabled ? 'cc_load_policy=1' : 'cc_load_policy=0';
                
                if (!src.includes('cc_load_policy')) {
                    currentIframe.src = `${src}${separator}${ccParam}`;
                }
            }
        }

        function adjustPlaybackSpeed(speed = 1) {
            // This would integrate with video player APIs
            const speeds = {
                0.25: '0.25x',
                0.5: '0.5x',
                0.75: '0.75x',
                1: 'Normal',
                1.25: '1.25x',
                1.5: '1.5x',
                2: '2x'
            };
            
            localStorage.setItem('playback_speed', speed);
            showNotification(`Playback speed set to ${speeds[speed]}`, 'info');
        }

        // =============================================================================
        // ERROR HANDLING AND RECOVERY
        // =============================================================================
        
        function handleVideoLoadError(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (!video) return;
            
            console.error(`Failed to load video: ${video.title}`);
            
            const errorHtml = `
                <div class="video-error" role="alert">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    </div>
                    <h3>Unable to load video</h3>
                    <p>The video "${escapeHtml(video.title)}" could not be loaded.</p>
                    <div class="error-actions">
                        <button onclick="retryVideoLoad(${videoId})" class="btn btn-primary">
                            <i class="fas fa-redo"></i>
                            Retry
                        </button>
                        <button onclick="reportVideoError(${videoId})" class="btn btn-secondary">
                            <i class="fas fa-flag"></i>
                            Report Issue
                        </button>
                        <a href="${getVideoSourceUrl(video)}" target="_blank" class="btn btn-secondary">
                            <i class="fas fa-external-link-alt"></i>
                            Open Original
                        </a>
                    </div>
                </div>
            `;
            
            if (videoPlayer) {
                videoPlayer.innerHTML = errorHtml;
            }
        }

        function getVideoSourceUrl(video) {
            if (video.platform === 'youtube') {
                return `https://www.youtube.com/watch?v=${video.videoId}`;
            } else if (video.platform === 'dailymotion') {
                return `https://www.dailymotion.com/video/${video.videoId}`;
            }
            return '#';
        }

        function reportVideoError(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (!video) return;
            
            const errorReport = {
                videoId: video.videoId,
                platform: video.platform,
                title: video.title,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Store error report locally (in real app, send to server)
            const errorReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
            errorReports.push(errorReport);
            localStorage.setItem('error_reports', JSON.stringify(errorReports));
            
            showNotification('Error reported. Thank you for helping us improve!', 'success');
        }

        function recoverFromError() {
            try {
                // Attempt to reload video data
                const recovered = syncWithExternalData();
                
                if (!recovered) {
                    // Try to reload from localStorage backup
                    const backup = loadVideosFromStorage('external_backup');
                    if (backup && backup.length > 0) {
                        videosData = backup;
                        currentVideos = [...videosData];
                        renderVideos(currentVideos);
                        showNotification('Recovered from backup data', 'success');
                        return true;
                    }
                }
                
                return recovered;
                
            } catch (error) {
                console.error('Recovery failed:', error);
                showNotification('Unable to recover. Please refresh the page.', 'error');
                return false;
            }
        }

        // =============================================================================
        // PERFORMANCE MONITORING
        // =============================================================================
        
        function measurePerformance() {
            if ('performance' in window) {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                const metrics = {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                    videosCount: videosData.length
                };
                
                console.log('📊 Performance Metrics:', metrics);
                
                // Store performance data
                localStorage.setItem('performance_metrics', JSON.stringify(metrics));
                
                return metrics;
            }
        }

        function optimizeForLowEndDevices() {
            const deviceMemory = navigator.deviceMemory || 4; // Default 4GB
            const connection = navigator.connection;
            
            if (deviceMemory < 2 || (connection && connection.effectiveType === 'slow-2g')) {
                // Reduce video grid items
                if (videosData.length > 20) {
                    currentVideos = videosData.slice(0, 20);
                    renderVideos(currentVideos);
                    
                    showNotification('Optimized for your device performance', 'info');
                }
                
                // Disable animations
                document.documentElement.style.setProperty('--animation-duration', '0s');
                
                return true;
            }
            
            return false;
        }

        // =============================================================================
        // SOCIAL FEATURES
        // =============================================================================
        
        function shareVideo(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (!video) return;
            
            const shareData = {
                title: video.title,
                text: video.description,
                url: `${window.location.origin}${window.location.pathname}?video=${videoId}`
            };
            
            if (navigator.share) {
                navigator.share(shareData).catch(err => {
                    console.log('Share cancelled:', err);
                });
            } else {
                // Fallback to clipboard
                copyToClipboard(shareData.url);
                showNotification('Video link copied to clipboard!', 'success');
            }
        }

        function copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        }

        function addToFavorites(videoId) {
            const favorites = JSON.parse(localStorage.getItem('favorite_videos') || '[]');
            
            if (!favorites.includes(videoId)) {
                favorites.push(videoId);
                localStorage.setItem('favorite_videos', JSON.stringify(favorites));
                showNotification('Added to favorites!', 'success');
            } else {
                showNotification('Already in favorites', 'info');
            }
        }

        function removeFromFavorites(videoId) {
            const favorites = JSON.parse(localStorage.getItem('favorite_videos') || '[]');
            const updated = favorites.filter(id => id !== videoId);
            
            localStorage.setItem('favorite_videos', JSON.stringify(updated));
            showNotification('Removed from favorites', 'success');
        }

        function showFavorites() {
            const favorites = JSON.parse(localStorage.getItem('favorite_videos') || '[]');
            const favoriteVideos = videosData.filter(v => favorites.includes(v.id));
            
            if (favoriteVideos.length === 0) {
                showNotification('No favorite videos found', 'info');
                return;
            }
            
            currentVideos = favoriteVideos;
            renderVideos(currentVideos);
            announceToScreenReader(`Showing ${favoriteVideos.length} favorite videos`);
        }

        // =============================================================================
        // INITIALIZATION COMPLETION
        // =============================================================================
        
        // Expose global functions for console/external access
        window.VidtapzApp = {
            // Core functions
            openVideoModal,
            closeVideoModal,
            resetFilters,
            
            // Theme
            toggleTheme,
            
            // Data management
            syncWithExternalData,
            exportUserVideos,
            importUserVideos,
            
            // Search and filter
            advancedSearch,
            filterByCategory,
            filterByDuration,
            sortByViews,
            
            // Social features
            shareVideo,
            addToFavorites,
            removeFromFavorites,
            showFavorites,
            
            // Accessibility
            toggleCaptions,
            updateVideoQuality,
            adjustPlaybackSpeed,
            
            // Utilities
            trackVideoView,
            trackSearch,
            measurePerformance,
            recoverFromError,
            
            // Data access
            getVideosData: () => videosData,
            getCurrentVideos: () => currentVideos,
            getDataSource: () => dataSource
        };

        // Load URL parameters on page load
        window.addEventListener('load', loadFromURL);

        // Handle browser back/forward
        window.addEventListener('popstate', loadFromURL);

        // Performance monitoring
        window.addEventListener('load', () => {
            setTimeout(measurePerformance, 1000);
            optimizeForLowEndDevices();
        });

        // Auto-sync check every 5 minutes
        setInterval(() => {
            if (typeof window.videosData !== 'undefined') {
                syncWithExternalData();
            }
        }, 5 * 60 * 1000);

        // Final initialization log
        console.log(`🎬 VidTapz initialized successfully!
        📊 Data source: ${dataSource}
        📺 Videos loaded: ${videosData.length}
        🎯 Ready for use!`);


